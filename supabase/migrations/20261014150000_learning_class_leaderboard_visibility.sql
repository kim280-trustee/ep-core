-- Let teachers explicitly opt a class into showing privacy-limited XP standings to students.
begin;

create table public.learning_class_gamification_settings (
  class_group_id uuid primary key
    references public.learning_class_groups(id) on delete cascade,
  leaderboard_enabled boolean not null default false,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

alter table public.learning_class_gamification_settings enable row level security;
revoke all on public.learning_class_gamification_settings from public, anon, authenticated;

create or replace function public.get_learning_class_leaderboard_setting(p_class_group_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to manage class leaderboard settings.';
  end if;

  if not exists (
    select 1
    from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id
      and cm.user_id = v_user
      and cm.status = 'active'
      and cm.membership_type = 'teacher'
  ) then
    raise exception 'Only an active teacher in this class can view leaderboard settings.';
  end if;

  return coalesce((
    select s.leaderboard_enabled
    from public.learning_class_gamification_settings s
    where s.class_group_id = p_class_group_id
  ), false);
end;
$function$;

create or replace function public.set_learning_class_leaderboard_enabled(
  p_class_group_id uuid,
  p_enabled boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to change class leaderboard settings.';
  end if;

  if not exists (
    select 1
    from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id
      and cm.user_id = v_user
      and cm.status = 'active'
      and cm.membership_type = 'teacher'
  ) then
    raise exception 'Only an active teacher in this class can change leaderboard visibility.';
  end if;

  insert into public.learning_class_gamification_settings (
    class_group_id, leaderboard_enabled, updated_by, updated_at
  )
  values (p_class_group_id, p_enabled, v_user, now())
  on conflict (class_group_id) do update
    set leaderboard_enabled = excluded.leaderboard_enabled,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at;

  return p_enabled;
end;
$function$;

revoke all on function public.get_learning_class_leaderboard_setting(uuid) from public, anon;
grant execute on function public.get_learning_class_leaderboard_setting(uuid) to authenticated;
revoke all on function public.set_learning_class_leaderboard_enabled(uuid, boolean) from public, anon;
grant execute on function public.set_learning_class_leaderboard_enabled(uuid, boolean) to authenticated;

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

  -- Students see standings only when an active teacher has opted this class in.
  if exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id
      and cm.user_id = v_user
      and cm.status = 'active'
      and cm.membership_type = 'student'
  ) and not coalesce((
    select s.leaderboard_enabled
    from public.learning_class_gamification_settings s
    where s.class_group_id = p_class_group_id
  ), false) then
    return;
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
    join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
    left join public.learning_reward_ledger l
      on l.student_user_id = cm.user_id
     and l.organization_id = ci.organization_id
     and l.class_group_id = ci.id
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
  order by r.position, r.name;
end;
$function$;


revoke all on function public.get_learning_class_leaderboard(uuid) from public, anon;
grant execute on function public.get_learning_class_leaderboard(uuid) to authenticated;

commit;
