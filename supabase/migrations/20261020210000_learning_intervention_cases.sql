begin;

create table if not exists public.learning_intervention_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  class_group_id uuid not null references public.learning_class_groups(id) on delete restrict,
  student_user_id uuid not null references public.users(id) on delete restrict,
  category text not null check (category in ('missing_assignment', 'assessment_result', 'learning_objective', 'teacher_observation', 'other')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  title text not null check (length(trim(title)) between 1 and 120),
  notes text not null check (length(trim(notes)) between 1 and 3000),
  evidence_reference text check (evidence_reference is null or length(trim(evidence_reference)) <= 160),
  review_date date,
  outcome text check (outcome is null or length(trim(outcome)) <= 2000),
  created_by uuid not null references public.users(id) on delete restrict,
  updated_by uuid not null references public.users(id) on delete restrict,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_intervention_cases_org_class_status_idx
  on public.learning_intervention_cases (organization_id, class_group_id, status, review_date);
create index if not exists learning_intervention_cases_student_created_idx
  on public.learning_intervention_cases (student_user_id, created_at desc);

alter table public.learning_intervention_cases enable row level security;
revoke all on public.learning_intervention_cases from public, anon, authenticated;

create or replace function public.list_learning_intervention_cases(
  p_class_group_id uuid default null,
  p_status text default null
)
returns table (
  id uuid,
  organization_id uuid,
  class_group_id uuid,
  class_name text,
  class_code text,
  student_user_id uuid,
  student_name text,
  category text,
  priority text,
  status text,
  title text,
  notes text,
  evidence_reference text,
  review_date date,
  outcome text,
  created_by uuid,
  created_by_name text,
  created_at timestamptz,
  updated_at timestamptz,
  resolved_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare
  v_user_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if p_status is not null and p_status not in ('open', 'in_progress', 'resolved') then
    raise exception 'Invalid intervention status filter';
  end if;

  return query
  select c.id, c.organization_id, c.class_group_id, cg.name, cg.code,
         c.student_user_id, coalesce(student.name, 'Student'),
         c.category, c.priority, c.status, c.title, c.notes,
         c.evidence_reference, c.review_date, c.outcome, c.created_by,
         coalesce(creator.name, 'Teacher'), c.created_at, c.updated_at, c.resolved_at
  from public.learning_intervention_cases c
  join public.learning_class_groups cg
    on cg.id = c.class_group_id
   and cg.organization_id = c.organization_id
  join public.organizations o
    on o.id = c.organization_id
   and o.status = 'active'
  left join public.users student on student.id = c.student_user_id
  left join public.users creator on creator.id = c.created_by
  where (p_class_group_id is null or c.class_group_id = p_class_group_id)
    and (p_status is null or c.status = p_status)
    and (
      exists (
        select 1
        from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id
          and om.organization_id = c.organization_id
          and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and exists (
            select 1 from public.get_current_user_permissions() permission
            where permission.permission_code = 'learning.academic.manage'
          )
      )
      or exists (
        select 1
        from public.learning_class_memberships cm
        where cm.organization_id = c.organization_id
          and cm.class_group_id = c.class_group_id
          and cm.user_id = v_user_id
          and cm.membership_type = 'teacher'
          and cm.status = 'active'
      )
    )
  order by
    case c.status when 'open' then 0 when 'in_progress' then 1 else 2 end,
    c.review_date asc nulls last,
    c.updated_at desc
  limit 500;
end;
$function$;

create or replace function public.create_learning_intervention_case(
  p_class_group_id uuid,
  p_student_user_id uuid,
  p_category text,
  p_priority text,
  p_title text,
  p_notes text,
  p_evidence_reference text default null,
  p_review_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_tenant_id uuid;
  v_case_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if p_category not in ('missing_assignment', 'assessment_result', 'learning_objective', 'teacher_observation', 'other') then
    raise exception 'Choose a valid support reason';
  end if;
  if p_priority not in ('low', 'normal', 'high') then
    raise exception 'Choose a valid priority';
  end if;
  if length(trim(coalesce(p_title, ''))) not between 1 and 120 then
    raise exception 'Title must contain 1 to 120 characters';
  end if;
  if length(trim(coalesce(p_notes, ''))) not between 1 and 3000 then
    raise exception 'Notes must contain 1 to 3000 characters';
  end if;
  if length(trim(coalesce(p_evidence_reference, ''))) > 160 then
    raise exception 'Evidence reference must be 160 characters or fewer';
  end if;

  select cg.organization_id, cg.tenant_id
    into v_organization_id, v_tenant_id
  from public.learning_class_groups cg
  join public.organizations o on o.id = cg.organization_id and o.status = 'active'
  where cg.id = p_class_group_id
    and cg.status = 'active';

  if v_organization_id is null then
    raise exception 'Select an active class';
  end if;

  if not exists (
    select 1
    from public.learning_class_memberships cm
    where cm.organization_id = v_organization_id
      and cm.class_group_id = p_class_group_id
      and cm.user_id = p_student_user_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
  ) then
    raise exception 'Select a student actively enrolled in this class';
  end if;

  if not (
    exists (
      select 1
      from public.learning_class_memberships cm
      where cm.organization_id = v_organization_id
        and cm.class_group_id = p_class_group_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
    or exists (
      select 1
      from public.organization_memberships om
      join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
      where om.user_id = v_user_id
        and om.organization_id = v_organization_id
        and om.status = 'active'
        and upper(trim(r.name)) in ('OWNER', 'MANAGER')
        and exists (
          select 1 from public.get_current_user_permissions() permission
          where permission.permission_code = 'learning.academic.manage'
        )
    )
  ) then
    raise exception 'You are not authorized to record support for this class';
  end if;

  insert into public.learning_intervention_cases (
    tenant_id, organization_id, class_group_id, student_user_id,
    category, priority, status, title, notes, evidence_reference, review_date,
    created_by, updated_by
  ) values (
    v_tenant_id, v_organization_id, p_class_group_id, p_student_user_id,
    p_category, p_priority, 'open', trim(p_title), trim(p_notes),
    nullif(trim(coalesce(p_evidence_reference, '')), ''), p_review_date,
    v_user_id, v_user_id
  )
  returning id into v_case_id;

  return v_case_id;
end;
$function$;

create or replace function public.update_learning_intervention_case(
  p_case_id uuid,
  p_status text,
  p_priority text,
  p_notes text,
  p_evidence_reference text default null,
  p_review_date date default null,
  p_outcome text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_class_group_id uuid;
  v_updated integer;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if p_status not in ('open', 'in_progress', 'resolved') then
    raise exception 'Choose a valid intervention status';
  end if;
  if p_priority not in ('low', 'normal', 'high') then
    raise exception 'Choose a valid priority';
  end if;
  if length(trim(coalesce(p_notes, ''))) not between 1 and 3000 then
    raise exception 'Notes must contain 1 to 3000 characters';
  end if;
  if length(trim(coalesce(p_evidence_reference, ''))) > 160 then
    raise exception 'Evidence reference must be 160 characters or fewer';
  end if;
  if length(trim(coalesce(p_outcome, ''))) > 2000 then
    raise exception 'Outcome must be 2,000 characters or fewer';
  end if;

  select c.organization_id, c.class_group_id
    into v_organization_id, v_class_group_id
  from public.learning_intervention_cases c
  where c.id = p_case_id
  for update;

  if v_organization_id is null then
    raise exception 'Intervention case not found';
  end if;

  if not (
    exists (
      select 1
      from public.learning_class_memberships cm
      where cm.organization_id = v_organization_id
        and cm.class_group_id = v_class_group_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
    or exists (
      select 1
      from public.organization_memberships om
      join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
      where om.user_id = v_user_id
        and om.organization_id = v_organization_id
        and om.status = 'active'
        and upper(trim(r.name)) in ('OWNER', 'MANAGER')
        and exists (
          select 1 from public.get_current_user_permissions() permission
          where permission.permission_code = 'learning.academic.manage'
        )
    )
  ) then
    raise exception 'You are not authorized to update this support case';
  end if;

  update public.learning_intervention_cases
  set status = p_status,
      priority = p_priority,
      notes = trim(p_notes),
      evidence_reference = nullif(trim(coalesce(p_evidence_reference, '')), ''),
      review_date = p_review_date,
      outcome = nullif(trim(coalesce(p_outcome, '')), ''),
      updated_by = v_user_id,
      updated_at = now(),
      resolved_at = case when p_status = 'resolved' then coalesce(resolved_at, now()) else null end
  where id = p_case_id;

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$function$;

revoke all on function public.list_learning_intervention_cases(uuid, text) from public, anon;
revoke all on function public.create_learning_intervention_case(uuid, uuid, text, text, text, text, text, date) from public, anon;
revoke all on function public.update_learning_intervention_case(uuid, text, text, text, text, date, text) from public, anon;
grant execute on function public.list_learning_intervention_cases(uuid, text) to authenticated;
grant execute on function public.create_learning_intervention_case(uuid, uuid, text, text, text, text, text, date) to authenticated;
grant execute on function public.update_learning_intervention_case(uuid, text, text, text, text, date, text) to authenticated;

commit;
