begin;

-- Keep standings visibility aligned with the corresponding list RPCs.
-- Students may view active challenges/competitions; non-active records remain
-- visible only to the same management roles that can list them.

create or replace function public.get_learning_school_competition_standings(
  p_competition_id uuid
)
returns table(
  class_group_id uuid,
  class_name text,
  progress_value bigint,
  target_value integer,
  progress_percent integer,
  rank bigint,
  completed_assignments bigint,
  xp_earned bigint,
  has_met_target boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_org_id uuid;
  v_status text;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to view school competition standings.';
  end if;

  select c.organization_id, c.status
  into v_org_id, v_status
  from public.learning_school_competitions c
  where c.id = p_competition_id;

  if v_org_id is null then
    raise exception 'Competition not found.';
  end if;

  if not public.is_organization_member(v_org_id)
     and not exists (
       select 1
       from public.learning_class_memberships cm
       join public.learning_class_groups cg on cg.id = cm.class_group_id
       where cg.organization_id = v_org_id
         and cm.user_id = v_user
         and cm.status = 'active'
     ) then
    raise exception 'You are not an active member of this school.';
  end if;

  if v_status is distinct from 'active'
     and not public.learning_can_manage_academic_records(v_org_id) then
    raise exception 'You are not authorized to view this competition.';
  end if;

  return query
  with competition as (
    select c.organization_id, c.tenant_id, c.target_type, c.target_value, c.starts_at, c.ends_at
    from public.learning_school_competitions c
    where c.id = p_competition_id
  ), eligible_classes as (
    select cg.id, cg.name
    from public.learning_class_groups cg
    join competition c on c.organization_id = cg.organization_id
    where exists (
      select 1 from public.learning_class_memberships cm
      where cm.class_group_id = cg.id
        and cm.organization_id = cg.organization_id
        and cm.status = 'active'
        and cm.membership_type = 'student'
    )
  ), metrics as (
    select ec.id, ec.name,
      count(distinct l.source_id) filter (where l.event_type = 'assignment_completed')::bigint as completed_assignments,
      coalesce(sum(l.xp_delta) filter (where l.event_type <> 'challenge_completed'), 0)::bigint as xp_earned
    from eligible_classes ec
    cross join competition c
    left join public.learning_reward_ledger l
      on l.class_group_id = ec.id
     and l.organization_id = c.organization_id
     and l.tenant_id = c.tenant_id
     and l.occurred_at between c.starts_at and c.ends_at
    group by ec.id, ec.name
  ), scored as (
    select m.*,
      case when c.target_type = 'assignments_completed' then m.completed_assignments else m.xp_earned end as score,
      c.target_value
    from metrics m cross join competition c
  )
  select s.id, s.name, s.score, s.target_value,
    least(100, round(100.0 * s.score / nullif(s.target_value, 0))::integer),
    dense_rank() over (order by s.score desc),
    s.completed_assignments, s.xp_earned, s.score >= s.target_value
  from scored s
  order by s.score desc, s.name;
end;
$function$;

create or replace function public.get_learning_team_challenge_standings(
  p_challenge_id uuid
)
returns table(
  team_id uuid,
  team_name text,
  progress_value bigint,
  target_value integer,
  progress_percent integer,
  rank bigint,
  completed_assignments bigint,
  xp_earned bigint,
  has_met_target boolean,
  is_current_user_team boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_class_group_id uuid;
  v_status text;
  v_is_teacher boolean;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to view team challenge standings.';
  end if;

  select c.class_group_id, c.status
  into v_class_group_id, v_status
  from public.learning_team_challenges c
  where c.id = p_challenge_id;

  if v_class_group_id is null then
    raise exception 'Team challenge not found.';
  end if;

  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = v_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type in ('student', 'teacher')
  ) then
    raise exception 'You are not an active member of this class.';
  end if;

  select exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = v_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type = 'teacher'
  ) into v_is_teacher;

  if v_status is distinct from 'active' and not v_is_teacher then
    raise exception 'Only an active teacher in this class can view inactive challenge standings.';
  end if;

  return query
  with challenge as (
    select c.tenant_id, c.organization_id, c.class_group_id, c.target_type, c.target_value, c.starts_at, c.ends_at
    from public.learning_team_challenges c
    where c.id = p_challenge_id
  ), team_metrics as (
    select t.id, t.name,
      count(distinct l.source_id) filter (where l.event_type = 'assignment_completed')::bigint as completed_assignments,
      coalesce(sum(l.xp_delta) filter (where l.event_type <> 'challenge_completed'), 0)::bigint as xp_earned,
      coalesce(bool_or(tm.student_user_id = v_user and tm.status = 'active' and tm.left_at is null), false) as is_current_user_team
    from public.learning_class_teams t
    cross join challenge c
    left join public.learning_class_team_members tm
      on tm.team_id = t.id
     and tm.class_group_id = c.class_group_id
     and tm.joined_at <= c.ends_at
     and (tm.left_at is null or tm.left_at > c.starts_at)
    left join public.learning_reward_ledger l
      on l.tenant_id = c.tenant_id
     and l.organization_id = c.organization_id
     and l.class_group_id = c.class_group_id
     and l.student_user_id = tm.student_user_id
     and l.occurred_at >= greatest(c.starts_at, tm.joined_at)
     and l.occurred_at <= c.ends_at
     and (tm.left_at is null or l.occurred_at < tm.left_at)
    where t.class_group_id = c.class_group_id and t.status = 'active'
    group by t.id, t.name, c.target_type
  ), scored as (
    select tm.*,
      case when c.target_type = 'assignments_completed' then tm.completed_assignments else tm.xp_earned end as score,
      c.target_value
    from team_metrics tm cross join challenge c
  )
  select s.id, s.name, s.score, s.target_value,
    least(100, round(100.0 * s.score / nullif(s.target_value, 0))::integer),
    dense_rank() over (order by s.score desc),
    s.completed_assignments, s.xp_earned, s.score >= s.target_value, s.is_current_user_team
  from scored s
  order by s.score desc, s.name;
end;
$function$;

commit;
