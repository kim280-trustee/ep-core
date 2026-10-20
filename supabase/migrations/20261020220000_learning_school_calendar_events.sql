begin;

create table if not exists public.learning_school_calendar_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  academic_year_id uuid references public.learning_academic_years(id) on delete set null,
  term_id uuid references public.learning_terms(id) on delete set null,
  class_group_id uuid references public.learning_class_groups(id) on delete cascade,
  event_type text not null check (event_type in ('school_event', 'holiday', 'examination', 'assessment_deadline')),
  title text not null check (length(trim(title)) between 1 and 120),
  description text not null default '' check (length(trim(description)) <= 3000),
  start_date date not null,
  end_date date not null,
  is_all_day boolean not null default true,
  start_time time,
  end_time time,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  created_by uuid not null references public.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (is_all_day or (start_time is not null and end_time is not null)),
  check (is_all_day or start_date < end_date or end_time > start_time),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create index if not exists learning_school_calendar_org_dates_idx
  on public.learning_school_calendar_events (organization_id, start_date, end_date, status);
create index if not exists learning_school_calendar_class_dates_idx
  on public.learning_school_calendar_events (class_group_id, start_date, end_date, status);
create unique index if not exists learning_school_calendar_no_duplicate_active_event_idx
  on public.learning_school_calendar_events (
    organization_id,
    coalesce(class_group_id, '00000000-0000-0000-0000-000000000000'::uuid),
    event_type,
    lower(trim(title)),
    start_date,
    end_date
  ) where status <> 'cancelled';

alter table public.learning_school_calendar_events enable row level security;
revoke all on public.learning_school_calendar_events from public, anon, authenticated;

create or replace function public.list_manageable_learning_calendar_organizations()
returns table (id uuid, name text, code text, timezone text, tenant_id uuid)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare v_user_id uuid;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  return query
  select o.id, o.name, o.code, o.timezone, o.tenant_id
  from public.organizations o
  where o.status = 'active'
    and exists (
      select 1
      from public.organization_memberships om
      join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
      where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
        and upper(trim(r.name)) in ('OWNER', 'MANAGER')
        and exists (select 1 from public.get_current_user_permissions() permission where permission.permission_code = 'learning.academic.manage')
    )
  order by o.name;
end;
$function$;

create or replace function public.list_manageable_learning_calendar_events(
  p_organization_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  id uuid, organization_id uuid, academic_year_id uuid, academic_year_name text,
  term_id uuid, term_name text, class_group_id uuid, class_name text,
  event_type text, title text, description text, start_date date, end_date date,
  is_all_day boolean, start_time time, end_time time, status text,
  created_at timestamptz, published_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare v_user_id uuid;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  if p_start_date is null or p_end_date is null or p_start_date > p_end_date then
    raise exception 'Choose a valid calendar date range';
  end if;
  if not exists (
    select 1 from public.organizations o
    where o.id = p_organization_id and o.status = 'active'
      and exists (
        select 1 from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and exists (select 1 from public.get_current_user_permissions() permission where permission.permission_code = 'learning.academic.manage')
      )
  ) then raise exception 'You cannot manage the selected school calendar'; end if;

  return query
  select e.id, e.organization_id, e.academic_year_id, ay.name, e.term_id, t.name,
         e.class_group_id, cg.name, e.event_type, e.title, e.description,
         e.start_date, e.end_date, e.is_all_day, e.start_time, e.end_time,
         e.status, e.created_at, e.published_at
  from public.learning_school_calendar_events e
  left join public.learning_academic_years ay on ay.id = e.academic_year_id and ay.organization_id = e.organization_id
  left join public.learning_terms t on t.id = e.term_id and t.organization_id = e.organization_id
  left join public.learning_class_groups cg on cg.id = e.class_group_id and cg.organization_id = e.organization_id
  where e.organization_id = p_organization_id
    and e.start_date <= p_end_date and e.end_date >= p_start_date
  order by e.start_date, e.start_time nulls first, e.title
  limit 500;
end;
$function$;

create or replace function public.create_learning_school_calendar_event(
  p_organization_id uuid,
  p_academic_year_id uuid,
  p_term_id uuid,
  p_class_group_id uuid,
  p_event_type text,
  p_title text,
  p_description text,
  p_start_date date,
  p_end_date date,
  p_is_all_day boolean,
  p_start_time time,
  p_end_time time
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare v_user_id uuid; v_tenant_id uuid; v_event_id uuid;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  if length(trim(coalesce(p_title, ''))) not between 1 and 120 then raise exception 'Title must contain 1 to 120 characters'; end if;
  if length(trim(coalesce(p_description, ''))) > 3000 then raise exception 'Description must contain 3,000 characters or fewer'; end if;
  if p_event_type not in ('school_event', 'holiday', 'examination', 'assessment_deadline') then raise exception 'Choose a valid event type'; end if;
  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then raise exception 'End date must be on or after start date'; end if;
  if not coalesce(p_is_all_day, true) and (p_start_time is null or p_end_time is null) then raise exception 'Start and end times are required for timed events'; end if;
  if not coalesce(p_is_all_day, true) and p_start_date = p_end_date and p_end_time <= p_start_time then raise exception 'End time must be after start time'; end if;

  select o.tenant_id into v_tenant_id
  from public.organizations o
  where o.id = p_organization_id and o.status = 'active'
    and exists (
      select 1 from public.organization_memberships om
      join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
      where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
        and upper(trim(r.name)) in ('OWNER', 'MANAGER')
        and exists (select 1 from public.get_current_user_permissions() permission where permission.permission_code = 'learning.academic.manage')
    );
  if v_tenant_id is null then raise exception 'Only an active school owner or manager can manage this calendar'; end if;

  if p_academic_year_id is not null and not exists (
    select 1 from public.learning_academic_years ay where ay.id = p_academic_year_id and ay.organization_id = p_organization_id
  ) then raise exception 'Academic year must belong to the selected school'; end if;
  if p_term_id is not null and not exists (
    select 1 from public.learning_terms t where t.id = p_term_id and t.organization_id = p_organization_id
      and (p_academic_year_id is null or t.academic_year_id = p_academic_year_id)
  ) then raise exception 'Term must belong to the selected school and academic year'; end if;
  if p_class_group_id is not null and not exists (
    select 1 from public.learning_class_groups cg where cg.id = p_class_group_id and cg.organization_id = p_organization_id and cg.status = 'active'
      and (p_academic_year_id is null or cg.academic_year_id = p_academic_year_id)
  ) then raise exception 'Class must be active and belong to the selected school and academic year'; end if;

  insert into public.learning_school_calendar_events (
    tenant_id, organization_id, academic_year_id, term_id, class_group_id,
    event_type, title, description, start_date, end_date, is_all_day,
    start_time, end_time, status, created_by
  ) values (
    v_tenant_id, p_organization_id, p_academic_year_id, p_term_id, p_class_group_id,
    p_event_type, trim(p_title), trim(coalesce(p_description, '')), p_start_date, p_end_date,
    coalesce(p_is_all_day, true), case when coalesce(p_is_all_day, true) then null else p_start_time end,
    case when coalesce(p_is_all_day, true) then null else p_end_time end, 'draft', v_user_id
  ) returning id into v_event_id;
  return v_event_id;
end;
$function$;

create or replace function public.publish_learning_school_calendar_event(p_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare v_user_id uuid; v_organization_id uuid; v_status text;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  select e.organization_id, e.status into v_organization_id, v_status
  from public.learning_school_calendar_events e where e.id = p_event_id for update;
  if v_organization_id is null then raise exception 'Calendar event not found'; end if;
  if v_status <> 'draft' then raise exception 'Only draft calendar events can be published'; end if;
  if not exists (
    select 1 from public.organizations o
    where o.id = v_organization_id and o.status = 'active'
      and exists (
        select 1 from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and exists (select 1 from public.get_current_user_permissions() permission where permission.permission_code = 'learning.academic.manage')
      )
  ) then raise exception 'Only an active school owner or manager can publish this calendar event'; end if;
  update public.learning_school_calendar_events set status = 'published', published_at = now(), updated_at = now() where id = p_event_id;
  return true;
end;
$function$;

create or replace function public.cancel_learning_school_calendar_event(p_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_organization_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;

  select e.organization_id into v_organization_id
  from public.learning_school_calendar_events e
  where e.id = p_event_id
  for update;
  if v_organization_id is null then raise exception 'Calendar event not found'; end if;

  if not exists (
    select 1 from public.organizations o
    where o.id = v_organization_id and o.status = 'active'
      and exists (
        select 1 from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and exists (select 1 from public.get_current_user_permissions() permission where permission.permission_code = 'learning.academic.manage')
      )
  ) then raise exception 'Only an active school owner or manager can cancel this calendar event'; end if;

  update public.learning_school_calendar_events
  set status = 'cancelled', updated_at = now()
  where id = p_event_id and status <> 'cancelled';
  return found;
end;
$function$;

create or replace function public.list_learning_school_calendar_events(p_start_date date, p_end_date date)
returns table (
  id uuid, organization_id uuid, organization_name text, academic_year_name text,
  term_name text, class_group_id uuid, class_name text, event_type text,
  title text, description text, start_date date, end_date date, is_all_day boolean,
  start_time time, end_time time, published_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare v_user_id uuid;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  if p_start_date is null or p_end_date is null or p_start_date > p_end_date then raise exception 'Choose a valid calendar date range'; end if;

  return query
  select distinct e.id, e.organization_id, o.name, ay.name, t.name, e.class_group_id, cg.name,
         e.event_type, e.title, e.description, e.start_date, e.end_date, e.is_all_day,
         e.start_time, e.end_time, e.published_at
  from public.learning_school_calendar_events e
  join public.organizations o on o.id = e.organization_id and o.status = 'active'
  left join public.learning_academic_years ay on ay.id = e.academic_year_id and ay.organization_id = e.organization_id
  left join public.learning_terms t on t.id = e.term_id and t.organization_id = e.organization_id
  left join public.learning_class_groups cg on cg.id = e.class_group_id and cg.organization_id = e.organization_id
  where e.status = 'published'
    and e.start_date <= p_end_date and e.end_date >= p_start_date
    and (e.class_group_id is null or cg.status = 'active')
    and (
      exists (
        select 1 from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id and om.organization_id = e.organization_id and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and exists (select 1 from public.get_current_user_permissions() permission where permission.permission_code = 'learning.academic.manage')
      )
      or (
        e.class_group_id is null
        and (
          exists (
            select 1 from public.learning_class_memberships cm
            where cm.organization_id = e.organization_id and cm.user_id = v_user_id and cm.status = 'active'
          )
          or exists (
            select 1 from public.learning_parent_student_links l
            join public.learning_class_memberships cm on cm.organization_id = l.organization_id and cm.user_id = l.student_user_id and cm.membership_type = 'student' and cm.status = 'active'
            where l.organization_id = e.organization_id and l.parent_user_id = v_user_id and l.status = 'active'
          )
        )
      )
      or (
        e.class_group_id is not null
        and (
          exists (
            select 1 from public.learning_class_memberships cm
            where cm.organization_id = e.organization_id and cm.class_group_id = e.class_group_id and cm.user_id = v_user_id and cm.status = 'active'
          )
          or exists (
            select 1 from public.learning_parent_student_links l
            join public.learning_class_memberships cm on cm.organization_id = l.organization_id and cm.user_id = l.student_user_id and cm.membership_type = 'student' and cm.status = 'active'
            where l.organization_id = e.organization_id and l.parent_user_id = v_user_id and l.status = 'active' and cm.class_group_id = e.class_group_id
          )
        )
      )
    )
  order by e.start_date, e.start_time nulls first, e.title
  limit 1000;
end;
$function$;

revoke all on function public.list_manageable_learning_calendar_organizations() from public, anon;
revoke all on function public.list_manageable_learning_calendar_events(uuid, date, date) from public, anon;
revoke all on function public.create_learning_school_calendar_event(uuid, uuid, uuid, uuid, text, text, text, date, date, boolean, time, time) from public, anon;
revoke all on function public.publish_learning_school_calendar_event(uuid) from public, anon;
revoke all on function public.cancel_learning_school_calendar_event(uuid) from public, anon;
revoke all on function public.list_learning_school_calendar_events(date, date) from public, anon;
grant execute on function public.list_manageable_learning_calendar_organizations() to authenticated;
grant execute on function public.list_manageable_learning_calendar_events(uuid, date, date) to authenticated;
grant execute on function public.create_learning_school_calendar_event(uuid, uuid, uuid, uuid, text, text, text, date, date, boolean, time, time) to authenticated;
grant execute on function public.publish_learning_school_calendar_event(uuid) to authenticated;
grant execute on function public.cancel_learning_school_calendar_event(uuid) to authenticated;
grant execute on function public.list_learning_school_calendar_events(date, date) to authenticated;

commit;
