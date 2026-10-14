-- Add class teams and verified team-based learning challenges with historical membership attribution.
begin;

create table public.learning_class_teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  name text not null check (length(trim(name)) between 2 and 80),
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, class_group_id) references public.learning_class_groups(organization_id, id) on delete cascade,
  foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict
);

create unique index learning_class_teams_name_ci_unique
  on public.learning_class_teams(class_group_id, lower(trim(name)));
create index learning_class_teams_class_status_idx
  on public.learning_class_teams(class_group_id, status, name);

create table public.learning_class_team_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  team_id uuid not null references public.learning_class_teams(id) on delete cascade,
  student_user_id uuid not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  assigned_by uuid not null,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, class_group_id) references public.learning_class_groups(organization_id, id) on delete cascade,
  foreign key (tenant_id, student_user_id) references public.users(tenant_id, id) on delete cascade,
  foreign key (tenant_id, assigned_by) references public.users(tenant_id, id) on delete restrict,
  check ((status = 'active' and left_at is null) or (status = 'inactive' and left_at is not null))
);

create unique index learning_class_team_members_one_active_team
  on public.learning_class_team_members(class_group_id, student_user_id)
  where status = 'active';
create index learning_class_team_members_team_history_idx
  on public.learning_class_team_members(team_id, joined_at, left_at);

create table public.learning_team_challenges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  title text not null check (length(trim(title)) between 3 and 100),
  description text not null default '',
  target_type text not null check (target_type in ('assignments_completed', 'xp_earned')),
  target_value integer not null check (target_value between 1 and 100000),
  bonus_xp integer not null default 25 check (bonus_xp between 5 and 100),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, class_group_id) references public.learning_class_groups(organization_id, id) on delete cascade,
  foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict,
  check (ends_at > starts_at)
);

create index learning_team_challenges_class_status_idx
  on public.learning_team_challenges(class_group_id, status, starts_at, ends_at);

alter table public.learning_class_teams enable row level security;
alter table public.learning_class_team_members enable row level security;
alter table public.learning_team_challenges enable row level security;
revoke all on public.learning_class_teams, public.learning_class_team_members, public.learning_team_challenges from public, anon, authenticated;

create or replace function public.create_learning_class_team(
  p_class_group_id uuid,
  p_name text,
  p_description text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_tenant_id uuid;
  v_organization_id uuid;
  v_team_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in to create a class team.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type = 'teacher'
  ) then raise exception 'Only an active teacher in this class can create teams.'; end if;
  if length(trim(coalesce(p_name, ''))) not between 2 and 80 then
    raise exception 'Team name must contain 2 to 80 characters.';
  end if;

  select cg.organization_id, o.tenant_id into v_organization_id, v_tenant_id
  from public.learning_class_groups cg
  join public.organizations o on o.id = cg.organization_id
  where cg.id = p_class_group_id;
  if v_organization_id is null then raise exception 'Class not found.'; end if;

  insert into public.learning_class_teams(
    tenant_id, organization_id, class_group_id, name, description, created_by
  ) values (
    v_tenant_id, v_organization_id, p_class_group_id, trim(p_name),
    coalesce(trim(p_description), ''), v_user
  ) returning id into v_team_id;

  return v_team_id;
end;
$function$;

create or replace function public.get_learning_class_teams(p_class_group_id uuid)
returns table (
  id uuid,
  name text,
  description text,
  status text,
  member_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in to view class teams.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type in ('student', 'teacher')
  ) then raise exception 'You are not an active member of this class.'; end if;

  return query
  select t.id, t.name, t.description, t.status,
    count(tm.id) filter (where tm.status = 'active')::bigint
  from public.learning_class_teams t
  left join public.learning_class_team_members tm on tm.team_id = t.id
  where t.class_group_id = p_class_group_id
    and (t.status = 'active' or exists (
      select 1 from public.learning_class_memberships cm
      where cm.class_group_id = p_class_group_id and cm.user_id = v_user
        and cm.status = 'active' and cm.membership_type = 'teacher'
    ))
  group by t.id, t.name, t.description, t.status
  order by t.name;
end;
$function$;

create or replace function public.get_learning_class_team_members(p_class_group_id uuid)
returns table (
  id uuid,
  team_id uuid,
  student_user_id uuid,
  student_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in to manage class teams.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type = 'teacher'
  ) then raise exception 'Only an active teacher in this class can view team assignments.'; end if;

  return query
  select tm.id, tm.team_id, tm.student_user_id,
    coalesce(nullif(trim(u.name), ''), 'Learner')
  from public.learning_class_team_members tm
  join public.users u on u.id = tm.student_user_id and u.tenant_id = tm.tenant_id
  where tm.class_group_id = p_class_group_id and tm.status = 'active'
  order by u.name;
end;
$function$;

create or replace function public.assign_learning_student_to_team(
  p_class_group_id uuid,
  p_team_id uuid,
  p_student_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_tenant_id uuid;
  v_organization_id uuid;
  v_membership_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in to assign students to teams.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type = 'teacher'
  ) then raise exception 'Only an active teacher in this class can assign teams.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = p_student_user_id
      and cm.status = 'active' and cm.membership_type = 'student'
  ) then raise exception 'The selected learner is not an active student in this class.'; end if;

  select t.tenant_id, t.organization_id into v_tenant_id, v_organization_id
  from public.learning_class_teams t
  where t.id = p_team_id and t.class_group_id = p_class_group_id and t.status = 'active';
  if v_tenant_id is null then raise exception 'Select an active team from this class.'; end if;

  select tm.id into v_membership_id
  from public.learning_class_team_members tm
  where tm.class_group_id = p_class_group_id and tm.student_user_id = p_student_user_id
    and tm.team_id = p_team_id and tm.status = 'active';
  if v_membership_id is not null then return v_membership_id; end if;

  update public.learning_class_team_members tm
  set status = 'inactive', left_at = now(), updated_at = now()
  where tm.class_group_id = p_class_group_id
    and tm.student_user_id = p_student_user_id and tm.status = 'active';

  insert into public.learning_class_team_members(
    tenant_id, organization_id, class_group_id, team_id, student_user_id, assigned_by
  ) values (
    v_tenant_id, v_organization_id, p_class_group_id, p_team_id, p_student_user_id, v_user
  ) returning id into v_membership_id;

  return v_membership_id;
end;
$function$;

create or replace function public.create_learning_team_challenge(
  p_class_group_id uuid,
  p_title text,
  p_description text,
  p_target_type text,
  p_target_value integer,
  p_bonus_xp integer,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_tenant_id uuid;
  v_organization_id uuid;
  v_challenge_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in to create a team challenge.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type = 'teacher'
  ) then raise exception 'Only an active teacher in this class can create team challenges.'; end if;
  if length(trim(coalesce(p_title, ''))) not between 3 and 100
     or p_target_type not in ('assignments_completed', 'xp_earned')
     or p_target_value not between 1 and 100000
     or p_bonus_xp not between 5 and 100
     or p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'Team challenge settings are invalid.';
  end if;

  select cg.organization_id, o.tenant_id into v_organization_id, v_tenant_id
  from public.learning_class_groups cg
  join public.organizations o on o.id = cg.organization_id
  where cg.id = p_class_group_id;
  if v_organization_id is null then raise exception 'Class not found.'; end if;

  insert into public.learning_team_challenges(
    tenant_id, organization_id, class_group_id, title, description, target_type,
    target_value, bonus_xp, starts_at, ends_at, created_by
  ) values (
    v_tenant_id, v_organization_id, p_class_group_id, trim(p_title),
    coalesce(trim(p_description), ''), p_target_type, p_target_value, p_bonus_xp,
    p_starts_at, p_ends_at, v_user
  ) returning id into v_challenge_id;

  return v_challenge_id;
end;
$function$;

create or replace function public.get_learning_team_challenges(p_class_group_id uuid)
returns table (
  id uuid,
  title text,
  description text,
  target_type text,
  target_value integer,
  bonus_xp integer,
  starts_at timestamptz,
  ends_at timestamptz,
  status text
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_is_teacher boolean;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in to view team challenges.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type in ('student', 'teacher')
  ) then raise exception 'You are not an active member of this class.'; end if;
  select exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type = 'teacher'
  ) into v_is_teacher;

  return query
  select c.id, c.title, c.description, c.target_type, c.target_value, c.bonus_xp,
    c.starts_at, c.ends_at, c.status
  from public.learning_team_challenges c
  where c.class_group_id = p_class_group_id
    and (v_is_teacher or c.status = 'active')
  order by c.starts_at desc, c.created_at desc;
end;
$function$;

create or replace function public.set_learning_team_challenge_status(
  p_challenge_id uuid,
  p_status text
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_class_group_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in to update team challenges.'; end if;
  if p_status not in ('active', 'paused', 'ended') then raise exception 'Challenge status is invalid.'; end if;
  select c.class_group_id into v_class_group_id
  from public.learning_team_challenges c where c.id = p_challenge_id;
  if v_class_group_id is null then raise exception 'Team challenge not found.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = v_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type = 'teacher'
  ) then raise exception 'Only an active teacher in this class can update team challenges.'; end if;

  update public.learning_team_challenges
  set status = p_status, updated_at = now()
  where id = p_challenge_id;
  return p_status;
end;
$function$;

create or replace function public.get_learning_team_challenge_standings(p_challenge_id uuid)
returns table (
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
begin
  v_user := public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in to view team challenge standings.'; end if;
  select c.class_group_id into v_class_group_id
  from public.learning_team_challenges c where c.id = p_challenge_id;
  if v_class_group_id is null then raise exception 'Team challenge not found.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = v_class_group_id and cm.user_id = v_user
      and cm.status = 'active' and cm.membership_type in ('student', 'teacher')
  ) then raise exception 'You are not an active member of this class.'; end if;

  return query
  with challenge as (
    select c.tenant_id, c.organization_id, c.class_group_id, c.target_type, c.target_value, c.starts_at, c.ends_at
    from public.learning_team_challenges c where c.id = p_challenge_id
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

create or replace function private.evaluate_learning_team_challenges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_challenge record;
  v_team record;
  v_progress bigint;
begin
  if new.event_type = 'challenge_completed'
     or new.class_group_id is null
     or new.tenant_id is null
     or new.organization_id is null
     or new.student_user_id is null
     or new.occurred_at is null then
    return new;
  end if;

  for v_challenge in
    select c.*
    from public.learning_team_challenges c
    where c.tenant_id = new.tenant_id
      and c.organization_id = new.organization_id
      and c.class_group_id = new.class_group_id
      and c.status = 'active'
      and new.occurred_at between c.starts_at and c.ends_at
  loop
    for v_team in
      select t.id
      from public.learning_class_teams t
      where t.class_group_id = v_challenge.class_group_id and t.status = 'active'
    loop
      if v_challenge.target_type = 'assignments_completed' then
        select count(distinct l.source_id)::bigint into v_progress
        from public.learning_reward_ledger l
        join public.learning_class_team_members tm
          on tm.team_id = v_team.id
         and tm.class_group_id = l.class_group_id
         and tm.student_user_id = l.student_user_id
         and l.occurred_at >= tm.joined_at
         and (tm.left_at is null or l.occurred_at < tm.left_at)
        where l.tenant_id = v_challenge.tenant_id
          and l.organization_id = v_challenge.organization_id
          and l.class_group_id = v_challenge.class_group_id
          and l.event_type = 'assignment_completed'
          and l.occurred_at between v_challenge.starts_at and v_challenge.ends_at;
      else
        select coalesce(sum(l.xp_delta), 0)::bigint into v_progress
        from public.learning_reward_ledger l
        join public.learning_class_team_members tm
          on tm.team_id = v_team.id
         and tm.class_group_id = l.class_group_id
         and tm.student_user_id = l.student_user_id
         and l.occurred_at >= tm.joined_at
         and (tm.left_at is null or l.occurred_at < tm.left_at)
        where l.tenant_id = v_challenge.tenant_id
          and l.organization_id = v_challenge.organization_id
          and l.class_group_id = v_challenge.class_group_id
          and l.event_type <> 'challenge_completed'
          and l.occurred_at between v_challenge.starts_at and v_challenge.ends_at;
      end if;

      if v_progress >= v_challenge.target_value then
        insert into public.learning_reward_ledger(
          tenant_id, organization_id, class_group_id, student_user_id,
          event_type, source_type, source_id, xp_delta, metadata, occurred_at
        )
        select distinct l.tenant_id, l.organization_id, l.class_group_id, l.student_user_id,
          'challenge_completed', 'challenge', v_challenge.id, v_challenge.bonus_xp,
          jsonb_build_object(
            'challenge_title', v_challenge.title,
            'scope', 'team',
            'team_id', v_team.id,
            'target_type', v_challenge.target_type
          ),
          new.occurred_at
        from public.learning_reward_ledger l
        join public.learning_class_team_members tm
          on tm.team_id = v_team.id
         and tm.class_group_id = l.class_group_id
         and tm.student_user_id = l.student_user_id
         and l.occurred_at >= tm.joined_at
         and (tm.left_at is null or l.occurred_at < tm.left_at)
        where l.tenant_id = v_challenge.tenant_id
          and l.organization_id = v_challenge.organization_id
          and l.class_group_id = v_challenge.class_group_id
          and l.event_type <> 'challenge_completed'
          and l.occurred_at between v_challenge.starts_at and v_challenge.ends_at
          and (v_challenge.target_type <> 'assignments_completed' or l.event_type = 'assignment_completed')
        on conflict (student_user_id, event_type, source_type, source_id) do nothing;
      end if;
    end loop;
  end loop;

  return new;
end;
$function$;

revoke all on function public.create_learning_class_team(uuid, text, text) from public, anon;
grant execute on function public.create_learning_class_team(uuid, text, text) to authenticated;
revoke all on function public.get_learning_class_teams(uuid) from public, anon;
grant execute on function public.get_learning_class_teams(uuid) to authenticated;
revoke all on function public.get_learning_class_team_members(uuid) from public, anon;
grant execute on function public.get_learning_class_team_members(uuid) to authenticated;
revoke all on function public.assign_learning_student_to_team(uuid, uuid, uuid) from public, anon;
grant execute on function public.assign_learning_student_to_team(uuid, uuid, uuid) to authenticated;
revoke all on function public.create_learning_team_challenge(uuid, text, text, text, integer, integer, timestamptz, timestamptz) from public, anon;
grant execute on function public.create_learning_team_challenge(uuid, text, text, text, integer, integer, timestamptz, timestamptz) to authenticated;
revoke all on function public.get_learning_team_challenges(uuid) from public, anon;
grant execute on function public.get_learning_team_challenges(uuid) to authenticated;
revoke all on function public.set_learning_team_challenge_status(uuid, text) from public, anon;
grant execute on function public.set_learning_team_challenge_status(uuid, text) to authenticated;
revoke all on function public.get_learning_team_challenge_standings(uuid) from public, anon;
grant execute on function public.get_learning_team_challenge_standings(uuid) to authenticated;
revoke all on function private.evaluate_learning_team_challenges() from public, anon, authenticated;

drop trigger if exists learning_team_challenges_award on public.learning_reward_ledger;
create trigger learning_team_challenges_award
after insert on public.learning_reward_ledger
for each row execute function private.evaluate_learning_team_challenges();

commit;
