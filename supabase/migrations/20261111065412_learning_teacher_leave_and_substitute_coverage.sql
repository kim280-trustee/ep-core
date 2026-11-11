-- Teacher leave requests and per-lesson substitute coverage.
begin;

create table public.learning_teacher_leave_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  teacher_user_id uuid not null references public.users(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  leave_type text not null check (leave_type in ('annual', 'sick', 'personal', 'other')),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  review_note text,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_teacher_leave_date_range check (end_date >= start_date),
  constraint learning_teacher_leave_reason_length check (char_length(trim(reason)) between 3 and 1000),
  constraint learning_teacher_leave_review_note_length check (review_note is null or char_length(review_note) <= 1000),
  constraint learning_teacher_leave_org_fk
    foreign key (tenant_id, organization_id)
    references public.organizations(tenant_id, id) on delete cascade,
  constraint learning_teacher_leave_id_scope_unique
    unique (id, tenant_id, organization_id)
);

create index learning_teacher_leave_org_status_dates_idx
  on public.learning_teacher_leave_requests (organization_id, status, start_date, end_date);
create index learning_teacher_leave_teacher_dates_idx
  on public.learning_teacher_leave_requests (teacher_user_id, start_date, end_date);

create table public.learning_teacher_substitute_coverages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  leave_request_id uuid not null,
  timetable_entry_id uuid not null references public.learning_timetable_entries(id) on delete restrict,
  class_group_id uuid not null references public.learning_class_groups(id) on delete restrict,
  coverage_date date not null,
  absent_teacher_user_id uuid not null references public.users(id) on delete restrict,
  substitute_teacher_user_id uuid not null references public.users(id) on delete restrict,
  status text not null default 'assigned' check (status in ('assigned', 'cancelled')),
  notes text,
  assigned_by uuid not null references public.users(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_teacher_coverage_different_teachers
    check (absent_teacher_user_id <> substitute_teacher_user_id),
  constraint learning_teacher_coverage_notes_length
    check (notes is null or char_length(notes) <= 1000),
  constraint learning_teacher_coverage_org_fk
    foreign key (tenant_id, organization_id)
    references public.organizations(tenant_id, id) on delete cascade,
  constraint learning_teacher_coverage_leave_fk
    foreign key (leave_request_id, tenant_id, organization_id)
    references public.learning_teacher_leave_requests(id, tenant_id, organization_id) on delete cascade,
  constraint learning_teacher_coverage_slot_unique
    unique (leave_request_id, timetable_entry_id, coverage_date)
);

create index learning_teacher_coverage_substitute_date_idx
  on public.learning_teacher_substitute_coverages (substitute_teacher_user_id, coverage_date)
  where status = 'assigned';
create index learning_teacher_coverage_org_date_idx
  on public.learning_teacher_substitute_coverages (organization_id, coverage_date);

alter table public.learning_teacher_leave_requests enable row level security;
alter table public.learning_teacher_substitute_coverages enable row level security;

revoke all on table public.learning_teacher_leave_requests from public, anon, authenticated;
revoke all on table public.learning_teacher_substitute_coverages from public, anon, authenticated;
grant select on table public.learning_teacher_leave_requests to authenticated;
grant select on table public.learning_teacher_substitute_coverages to authenticated;

create policy learning_teacher_leave_requests_select
  on public.learning_teacher_leave_requests for select to authenticated
  using (
    teacher_user_id = (select public.learning_current_user_id())
    or public.learning_can_manage_academic_records(organization_id)
  );

create policy learning_teacher_substitute_coverages_select
  on public.learning_teacher_substitute_coverages for select to authenticated
  using (
    absent_teacher_user_id = (select public.learning_current_user_id())
    or substitute_teacher_user_id = (select public.learning_current_user_id())
    or public.learning_can_manage_academic_records(organization_id)
  );

create or replace function public.create_learning_teacher_leave_request(
  p_organization_id uuid,
  p_start_date date,
  p_end_date date,
  p_leave_type text,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_tenant_id uuid;
  v_request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  v_user_id := public.learning_current_user_id();
  if v_user_id is null then
    raise exception 'User profile not found' using errcode = '28000';
  end if;

  if p_start_date is null or p_end_date is null or p_end_date < p_start_date
     or p_end_date - p_start_date > 90 then
    raise exception 'Choose a valid leave date range of up to 91 days';
  end if;

  if p_leave_type not in ('annual', 'sick', 'personal', 'other') then
    raise exception 'Choose a valid leave type';
  end if;

  if p_reason is null or char_length(trim(p_reason)) not between 3 and 1000 then
    raise exception 'Enter a reason between 3 and 1000 characters';
  end if;

  select org.tenant_id into v_tenant_id
  from public.organizations org
  where org.id = p_organization_id
    and org.status = 'active';

  if v_tenant_id is null then
    raise exception 'Active school organization not found';
  end if;

  if not exists (
    select 1
    from public.learning_class_memberships membership
    join public.learning_class_groups class_group
      on class_group.id = membership.class_group_id
     and class_group.organization_id = membership.organization_id
     and class_group.status = 'active'
    where membership.tenant_id = v_tenant_id
      and membership.organization_id = p_organization_id
      and membership.user_id = v_user_id
      and membership.membership_type = 'teacher'
      and membership.status = 'active'
  ) then
    raise exception 'Only an active teacher in this school can request leave'
      using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(v_user_id::text),
    pg_catalog.hashtext(p_organization_id::text)
  );

  if exists (
    select 1
    from public.learning_teacher_leave_requests request
    where request.organization_id = p_organization_id
      and request.teacher_user_id = v_user_id
      and request.status in ('pending', 'approved')
      and request.start_date <= p_end_date
      and request.end_date >= p_start_date
  ) then
    raise exception 'A pending or approved leave request already overlaps these dates';
  end if;

  insert into public.learning_teacher_leave_requests (
    tenant_id, organization_id, teacher_user_id, start_date, end_date, leave_type, reason
  ) values (
    v_tenant_id, p_organization_id, v_user_id, p_start_date, p_end_date, p_leave_type, trim(p_reason)
  )
  returning id into v_request_id;

  return v_request_id;
end;
$function$;

create or replace function public.review_learning_teacher_leave_request(
  p_request_id uuid,
  p_decision text,
  p_review_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_request public.learning_teacher_leave_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  v_user_id := public.learning_current_user_id();
  if v_user_id is null then
    raise exception 'User profile not found' using errcode = '28000';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  if p_review_note is not null and char_length(p_review_note) > 1000 then
    raise exception 'Review note must be 1000 characters or fewer';
  end if;

  select * into v_request
  from public.learning_teacher_leave_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Leave request not found';
  end if;

  if not public.learning_can_manage_academic_records(v_request.organization_id) then
    raise exception 'You do not have permission to review leave requests'
      using errcode = '42501';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Only pending leave requests can be reviewed';
  end if;

  update public.learning_teacher_leave_requests
  set status = p_decision,
      review_note = nullif(trim(coalesce(p_review_note, '')), ''),
      reviewed_by = v_user_id,
      reviewed_at = now(),
      updated_at = now()
  where id = p_request_id;

  return p_request_id;
end;
$function$;

create or replace function public.assign_learning_teacher_substitute(
  p_leave_request_id uuid,
  p_timetable_entry_id uuid,
  p_coverage_date date,
  p_substitute_teacher_user_id uuid,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_request public.learning_teacher_leave_requests%rowtype;
  v_entry public.learning_timetable_entries%rowtype;
  v_coverage_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  v_user_id := public.learning_current_user_id();
  if v_user_id is null then
    raise exception 'User profile not found' using errcode = '28000';
  end if;

  select * into v_request
  from public.learning_teacher_leave_requests
  where id = p_leave_request_id
  for update;

  if not found then
    raise exception 'Leave request not found';
  end if;

  if not public.learning_can_manage_academic_records(v_request.organization_id) then
    raise exception 'You do not have permission to assign substitute teachers'
      using errcode = '42501';
  end if;

  if v_request.status <> 'approved' then
    raise exception 'A substitute can only be assigned to an approved leave request';
  end if;

  if p_coverage_date < v_request.start_date or p_coverage_date > v_request.end_date then
    raise exception 'Coverage date must be inside the approved leave period';
  end if;

  if p_substitute_teacher_user_id = v_request.teacher_user_id then
    raise exception 'The absent teacher cannot substitute for themselves';
  end if;

  select * into v_entry
  from public.learning_timetable_entries entry
  where entry.id = p_timetable_entry_id
    and entry.tenant_id = v_request.tenant_id
    and entry.organization_id = v_request.organization_id
    and entry.teacher_user_id = v_request.teacher_user_id
    and entry.status = 'active'
  for update;

  if not found then
    raise exception 'Timetable entry is not assigned to the absent teacher in this school';
  end if;

  if extract(isodow from p_coverage_date)::smallint <> v_entry.day_of_week then
    raise exception 'Coverage date does not match this timetable day';
  end if;

  if p_notes is not null and char_length(p_notes) > 1000 then
    raise exception 'Coverage notes must be 1000 characters or fewer';
  end if;

  if not exists (
    select 1
    from public.organization_memberships organization_membership
    where organization_membership.tenant_id = v_request.tenant_id
      and organization_membership.organization_id = v_request.organization_id
      and organization_membership.user_id = p_substitute_teacher_user_id
      and organization_membership.status = 'active'
  ) or not exists (
    select 1
    from public.learning_class_memberships membership
    join public.learning_class_groups class_group
      on class_group.id = membership.class_group_id
     and class_group.organization_id = membership.organization_id
     and class_group.status = 'active'
    where membership.tenant_id = v_request.tenant_id
      and membership.organization_id = v_request.organization_id
      and membership.user_id = p_substitute_teacher_user_id
      and membership.membership_type = 'teacher'
      and membership.status = 'active'
  ) then
    raise exception 'Substitute must be an active school member with a teaching assignment';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(p_substitute_teacher_user_id::text),
    pg_catalog.hashtext(p_coverage_date::text)
  );

  if exists (
    select 1
    from public.learning_timetable_entries existing
    where existing.organization_id = v_request.organization_id
      and existing.teacher_user_id = p_substitute_teacher_user_id
      and existing.status = 'active'
      and existing.day_of_week = v_entry.day_of_week
      and existing.id <> v_entry.id
      and existing.starts_at < v_entry.ends_at
      and existing.ends_at > v_entry.starts_at
  ) then
    raise exception 'Substitute already has a timetable lesson at this time';
  end if;

  if exists (
    select 1
    from public.learning_teacher_substitute_coverages coverage
    join public.learning_timetable_entries covered_entry
      on covered_entry.id = coverage.timetable_entry_id
    where coverage.organization_id = v_request.organization_id
      and coverage.coverage_date = p_coverage_date
      and coverage.substitute_teacher_user_id = p_substitute_teacher_user_id
      and coverage.status = 'assigned'
      and not (
        coverage.leave_request_id = p_leave_request_id
        and coverage.timetable_entry_id = p_timetable_entry_id
        and coverage.coverage_date = p_coverage_date
      )
      and covered_entry.starts_at < v_entry.ends_at
      and covered_entry.ends_at > v_entry.starts_at
  ) then
    raise exception 'Substitute already has another cover lesson at this time';
  end if;

  insert into public.learning_teacher_substitute_coverages (
    tenant_id, organization_id, leave_request_id, timetable_entry_id, class_group_id,
    coverage_date, absent_teacher_user_id, substitute_teacher_user_id, status, notes, assigned_by
  ) values (
    v_request.tenant_id, v_request.organization_id, v_request.id, v_entry.id, v_entry.class_group_id,
    p_coverage_date, v_request.teacher_user_id, p_substitute_teacher_user_id, 'assigned',
    nullif(trim(coalesce(p_notes, '')), ''), v_user_id
  )
  on conflict (leave_request_id, timetable_entry_id, coverage_date)
  do update set
    substitute_teacher_user_id = excluded.substitute_teacher_user_id,
    status = 'assigned',
    notes = excluded.notes,
    assigned_by = excluded.assigned_by,
    assigned_at = now(),
    updated_at = now()
  returning id into v_coverage_id;

  return v_coverage_id;
end;
$function$;

create or replace function public.cancel_learning_teacher_substitute_coverage(
  p_coverage_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_organization_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  v_user_id := public.learning_current_user_id();
  if v_user_id is null then
    raise exception 'User profile not found' using errcode = '28000';
  end if;

  select organization_id into v_organization_id
  from public.learning_teacher_substitute_coverages
  where id = p_coverage_id;

  if v_organization_id is null then
    raise exception 'Substitute coverage not found';
  end if;

  if not public.learning_can_manage_academic_records(v_organization_id) then
    raise exception 'You do not have permission to cancel substitute coverage'
      using errcode = '42501';
  end if;

  update public.learning_teacher_substitute_coverages
  set status = 'cancelled',
      updated_at = now()
  where id = p_coverage_id;

  return p_coverage_id;
end;
$function$;

revoke all on function public.create_learning_teacher_leave_request(uuid, date, date, text, text) from public, anon;
revoke all on function public.review_learning_teacher_leave_request(uuid, text, text) from public, anon;
revoke all on function public.assign_learning_teacher_substitute(uuid, uuid, date, uuid, text) from public, anon;
revoke all on function public.cancel_learning_teacher_substitute_coverage(uuid) from public, anon;

grant execute on function public.create_learning_teacher_leave_request(uuid, date, date, text, text) to authenticated;
grant execute on function public.review_learning_teacher_leave_request(uuid, text, text) to authenticated;
grant execute on function public.assign_learning_teacher_substitute(uuid, uuid, date, uuid, text) to authenticated;
grant execute on function public.cancel_learning_teacher_substitute_coverage(uuid) to authenticated;

commit;
