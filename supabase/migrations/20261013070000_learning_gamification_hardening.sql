-- Harden class XP challenges and expose privacy-limited standings to current class members.
begin;

create or replace function private.evaluate_learning_class_challenges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_student uuid;
  v_tenant uuid;
  v_org uuid;
  v_occurred timestamptz;
  v_challenge record;
  v_progress integer;
begin
  if new.event_type = 'challenge_completed' then
    return new;
  end if;

  v_student := new.student_user_id;
  v_tenant := new.tenant_id;
  v_org := new.organization_id;
  v_occurred := new.occurred_at;

  if v_student is null or v_tenant is null or v_org is null or v_occurred is null then
    return new;
  end if;

  for v_challenge in
    select c.*
    from public.learning_class_challenges c
    where c.tenant_id = v_tenant
      and c.organization_id = v_org
      and c.status = 'active'
      and v_occurred between c.starts_at and c.ends_at
      and exists (
        select 1
        from public.learning_class_memberships cm
        where cm.class_group_id = c.class_group_id
          and cm.user_id = v_student
          and cm.membership_type = 'student'
          and cm.status = 'active'
      )
  loop
    if v_challenge.target_type = 'assignments_completed' then
      select count(distinct l.source_id)::integer
      into v_progress
      from public.learning_reward_ledger l
      where l.student_user_id = v_student
        and l.class_group_id = v_challenge.class_group_id
        and l.event_type = 'assignment_completed'
        and l.occurred_at between v_challenge.starts_at and v_challenge.ends_at;
    else
      select coalesce(sum(l.xp_delta), 0)::integer
      into v_progress
      from public.learning_reward_ledger l
      where l.student_user_id = v_student
        and l.organization_id = v_org
        and l.event_type <> 'challenge_completed'
        and l.occurred_at between v_challenge.starts_at and v_challenge.ends_at;
    end if;

    if v_progress >= v_challenge.target_value then
      insert into public.learning_reward_ledger (
        tenant_id, organization_id, class_group_id, student_user_id,
        event_type, source_type, source_id, xp_delta, metadata, occurred_at
      )
      values (
        v_tenant, v_org, v_challenge.class_group_id, v_student,
        'challenge_completed', 'challenge', v_challenge.id, v_challenge.bonus_xp,
        jsonb_build_object('challenge_title', v_challenge.title, 'target_type', v_challenge.target_type),
        v_occurred
      )
      on conflict (student_user_id, event_type, source_type, source_id) do nothing;
    end if;
  end loop;

  return new;
end;
$function$;

create or replace function public.get_learning_class_leaderboard(p_class_group_id uuid)
returns table (
  class_group_id uuid,
  class_name text,
  display_name text,
  xp_total bigint,
  rank bigint,
  is_current_user boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_organization_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to view class standings.';
  end if;

  select cg.organization_id
  into v_organization_id
  from public.learning_class_groups cg
  where cg.id = p_class_group_id;

  if v_organization_id is null then
    raise exception 'Class not found.';
  end if;

  if not exists (
    select 1
    from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id
      and cm.user_id = v_user
      and cm.status = 'active'
      and cm.membership_type in ('student', 'teacher')
  ) then
    raise exception 'You are not an active member of this class.';
  end if;

  return query
  with class_info as (
    select cg.id, cg.organization_id, cg.name
    from public.learning_class_groups cg
    where cg.id = p_class_group_id
      and cg.organization_id = v_organization_id
  ),
  student_totals as (
    select
      cm.user_id,
      u.name,
      ci.id as class_id,
      ci.name as class_label,
      coalesce(sum(l.xp_delta), 0)::bigint as total_xp
    from class_info ci
    join public.learning_class_memberships cm
      on cm.class_group_id = ci.id
     and cm.organization_id = ci.organization_id
     and cm.status = 'active'
     and cm.membership_type = 'student'
    join public.users u on u.id = cm.user_id
    left join public.learning_reward_ledger l
      on l.student_user_id = cm.user_id
     and l.organization_id = ci.organization_id
    group by cm.user_id, u.name, ci.id, ci.name
  ),
  ranked as (
    select
      st.*,
      dense_rank() over (order by st.total_xp desc) as position
    from student_totals st
  )
  select
    r.class_id,
    r.class_label,
    case
      when nullif(trim(r.name), '') is null then 'Learner'
      when cardinality(string_to_array(trim(r.name), ' ')) > 1
        then split_part(trim(r.name), ' ', 1) || ' ' || left(split_part(trim(r.name), ' ', 2), 1) || '.'
      else split_part(trim(r.name), ' ', 1)
    end,
    r.total_xp,
    r.position,
    r.user_id = v_user
  from ranked r
  order by r.position, r.display_name;
end;
$function$;

revoke all on function public.get_learning_class_leaderboard(uuid) from public, anon;
grant execute on function public.get_learning_class_leaderboard(uuid) to authenticated;

commit;
