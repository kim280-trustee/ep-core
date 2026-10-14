-- School-wide competitions let classes compete on verified learning activity without exposing student-level data.
begin;

create table public.learning_school_competitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
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
  foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict,
  check (ends_at > starts_at)
);

create index learning_school_competitions_org_status_idx
  on public.learning_school_competitions(organization_id, status, starts_at, ends_at);

alter table public.learning_school_competitions enable row level security;
revoke all on public.learning_school_competitions from public, anon, authenticated;

create or replace function public.create_learning_school_competition(
  p_organization_id uuid,
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
  v_competition_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to create a school-wide competition.';
  end if;
  if not public.is_organization_member(p_organization_id)
     or not public.has_permission('learning.academic.manage') then
    raise exception 'Only school administrators can create school-wide competitions.';
  end if;
  if length(trim(coalesce(p_title, ''))) not between 3 and 100 then
    raise exception 'Competition title must contain 3 to 100 characters.';
  end if;
  if p_target_type not in ('assignments_completed', 'xp_earned')
     or p_target_value not between 1 and 100000
     or p_bonus_xp not between 5 and 100
     or p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'Competition settings are invalid.';
  end if;

  select o.tenant_id into v_tenant_id
  from public.organizations o where o.id = p_organization_id;
  if v_tenant_id is null then
    raise exception 'School organization not found.';
  end if;

  insert into public.learning_school_competitions(
    tenant_id, organization_id, title, description, target_type, target_value,
    bonus_xp, starts_at, ends_at, created_by
  )
  values(
    v_tenant_id, p_organization_id, trim(p_title), coalesce(trim(p_description), ''),
    p_target_type, p_target_value, p_bonus_xp, p_starts_at, p_ends_at, v_user
  )
  returning id into v_competition_id;

  return v_competition_id;
end;
$function$;

create or replace function public.get_learning_school_competitions(p_organization_id uuid)
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
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to view school competitions.';
  end if;

  if not public.is_organization_member(p_organization_id)
     and not exists (
       select 1
       from public.learning_class_memberships cm
       join public.learning_class_groups cg on cg.id = cm.class_group_id
       where cg.organization_id = p_organization_id
         and cm.user_id = v_user
         and cm.status = 'active'
     ) then
    raise exception 'You are not an active member of this school.';
  end if;

  return query
  select c.id, c.title, c.description, c.target_type, c.target_value, c.bonus_xp,
         c.starts_at, c.ends_at, c.status
  from public.learning_school_competitions c
  where c.organization_id = p_organization_id
    and (c.status = 'active' or public.has_permission('learning.academic.manage'))
  order by c.starts_at desc, c.created_at desc;
end;
$function$;

create or replace function public.set_learning_school_competition_status(
  p_competition_id uuid,
  p_status text
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_org_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to update a school-wide competition.';
  end if;
  if p_status not in ('active', 'paused', 'ended') then
    raise exception 'Competition status is invalid.';
  end if;

  select c.organization_id into v_org_id
  from public.learning_school_competitions c
  where c.id = p_competition_id;
  if v_org_id is null then
    raise exception 'Competition not found.';
  end if;
  if not public.is_organization_member(v_org_id)
     or not public.has_permission('learning.academic.manage') then
    raise exception 'Only school administrators can update school-wide competitions.';
  end if;

  update public.learning_school_competitions
  set status = p_status, updated_at = now()
  where id = p_competition_id;

  return p_status;
end;
$function$;

create or replace function public.get_learning_school_competition_standings(p_competition_id uuid)
returns table (
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
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to view school competition standings.';
  end if;

  select c.organization_id into v_org_id
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

create or replace function private.evaluate_learning_school_competitions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_competition record;
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

  for v_competition in
    select c.*
    from public.learning_school_competitions c
    where c.tenant_id = new.tenant_id
      and c.organization_id = new.organization_id
      and c.status = 'active'
      and new.occurred_at between c.starts_at and c.ends_at
  loop
    if v_competition.target_type = 'assignments_completed' then
      select count(distinct l.source_id)::bigint into v_progress
      from public.learning_reward_ledger l
      where l.tenant_id = new.tenant_id
        and l.organization_id = new.organization_id
        and l.class_group_id = new.class_group_id
        and l.event_type = 'assignment_completed'
        and l.occurred_at between v_competition.starts_at and v_competition.ends_at;
    else
      select coalesce(sum(l.xp_delta), 0)::bigint into v_progress
      from public.learning_reward_ledger l
      where l.tenant_id = new.tenant_id
        and l.organization_id = new.organization_id
        and l.class_group_id = new.class_group_id
        and l.event_type <> 'challenge_completed'
        and l.occurred_at between v_competition.starts_at and v_competition.ends_at;
    end if;

    if v_progress >= v_competition.target_value then
      insert into public.learning_reward_ledger (
        tenant_id, organization_id, class_group_id, student_user_id,
        event_type, source_type, source_id, xp_delta, metadata, occurred_at
      )
      select distinct l.tenant_id, l.organization_id, l.class_group_id, l.student_user_id,
        'challenge_completed', 'challenge', v_competition.id, v_competition.bonus_xp,
        jsonb_build_object(
          'challenge_title', v_competition.title,
          'scope', 'school',
          'target_type', v_competition.target_type,
          'class_group_id', l.class_group_id
        ),
        new.occurred_at
      from public.learning_reward_ledger l
      where l.tenant_id = new.tenant_id
        and l.organization_id = new.organization_id
        and l.class_group_id = new.class_group_id
        and l.event_type <> 'challenge_completed'
        and l.occurred_at between v_competition.starts_at and v_competition.ends_at
        and (v_competition.target_type <> 'assignments_completed' or l.event_type = 'assignment_completed')
      on conflict (student_user_id, event_type, source_type, source_id) do nothing;
    end if;
  end loop;

  return new;
end;
$function$;

revoke all on function private.evaluate_learning_school_competitions() from public, anon, authenticated;
revoke all on function public.create_learning_school_competition(uuid, text, text, text, integer, integer, timestamptz, timestamptz) from public, anon;
grant execute on function public.create_learning_school_competition(uuid, text, text, text, integer, integer, timestamptz, timestamptz) to authenticated;
revoke all on function public.get_learning_school_competitions(uuid) from public, anon;
grant execute on function public.get_learning_school_competitions(uuid) to authenticated;
revoke all on function public.set_learning_school_competition_status(uuid, text) from public, anon;
grant execute on function public.set_learning_school_competition_status(uuid, text) to authenticated;
revoke all on function public.get_learning_school_competition_standings(uuid) from public, anon;
grant execute on function public.get_learning_school_competition_standings(uuid) to authenticated;

drop trigger if exists learning_school_competitions_award on public.learning_reward_ledger;
create trigger learning_school_competitions_award
after insert on public.learning_reward_ledger
for each row execute function private.evaluate_learning_school_competitions();

commit;
