-- Repair timetable validation against the live learning class schema and let
-- academic managers read only the school membership/role metadata needed by
-- timetable teacher selection and the staff directory.

begin;

create or replace function private.validate_learning_timetable_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not public.learning_can_manage_academic_records(new.organization_id) then
    raise exception 'You do not have permission to manage this school timetable'
      using errcode = '42501';
  end if;

  if tg_op = 'INSERT' and new.created_by is distinct from public.learning_current_user_id() then
    raise exception 'The timetable creator must be the signed-in E&P user'
      using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' and new.created_by is distinct from old.created_by then
    raise exception 'The original timetable creator cannot be changed'
      using errcode = '42501';
  end if;

  -- learning_class_groups is organization-scoped and has no tenant_id column.
  -- Resolve the tenant through organizations instead of referencing a missing
  -- class-group column. The existing timetable FK also enforces this pairing.
  if not exists (
    select 1
    from public.learning_class_groups cg
    join public.organizations o
      on o.id = cg.organization_id
     and o.tenant_id = new.tenant_id
    where cg.id = new.class_group_id
      and cg.organization_id = new.organization_id
      and cg.status = 'active'
      and o.status = 'active'
  ) then
    raise exception 'Choose an active class in this school'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
    from public.learning_class_subjects cs
    where cs.organization_id = new.organization_id
      and cs.class_group_id = new.class_group_id
      and cs.subject_id = new.subject_id
  ) then
    raise exception 'The selected subject is not assigned to this class'
      using errcode = '23503';
  end if;

  if new.teacher_user_id is not null and not exists (
    select 1
    from public.learning_class_memberships cm
    where cm.tenant_id = new.tenant_id
      and cm.organization_id = new.organization_id
      and cm.class_group_id = new.class_group_id
      and cm.user_id = new.teacher_user_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  ) then
    raise exception 'The selected teacher must have an active teaching membership in this class'
      using errcode = '23503';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(new.organization_id::text),
    new.day_of_week::integer
  );

  if new.status = 'active' and exists (
    select 1
    from public.learning_timetable_entries existing
    where existing.organization_id = new.organization_id
      and existing.status = 'active'
      and existing.id is distinct from new.id
      and existing.day_of_week = new.day_of_week
      and existing.starts_at < new.ends_at
      and existing.ends_at > new.starts_at
      and (
        existing.class_group_id = new.class_group_id
        or (
          new.teacher_user_id is not null
          and existing.teacher_user_id = new.teacher_user_id
        )
      )
  ) then
    raise exception 'This time overlaps an existing class or teacher timetable entry'
      using errcode = '23P01';
  end if;

  return new;
end;
$function$;

-- School academic managers may read membership rows only for organizations
-- they are authorized to manage. This does not grant membership write access.
drop policy if exists organization_memberships_select_learning_academic_managers
  on public.organization_memberships;
create policy organization_memberships_select_learning_academic_managers
  on public.organization_memberships
  for select to authenticated
  using (public.learning_can_manage_academic_records(organization_id));

-- Role definitions are tenant-scoped metadata. Allow academic managers to read
-- the role catalog needed to render the school staff directory.
drop policy if exists roles_select_learning_academic_managers
  on public.roles;
create policy roles_select_learning_academic_managers
  on public.roles
  for select to authenticated
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.has_permission('learning.academic.manage')
  );

commit;
