-- Restrict timetable administration and enforce class/teacher conflict checks in PostgreSQL.
begin;

create schema if not exists private;

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

  if new.created_by is distinct from public.learning_current_user_id() then
    raise exception 'The timetable creator must be the signed-in E&P user'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.learning_class_groups cg
    where cg.id = new.class_group_id
      and cg.organization_id = new.organization_id
      and cg.tenant_id = new.tenant_id
      and cg.status = 'active'
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

revoke all on function private.validate_learning_timetable_entry() from public, anon, authenticated;

drop trigger if exists learning_timetable_validate_entry on public.learning_timetable_entries;
create trigger learning_timetable_validate_entry
before insert or update of tenant_id, organization_id, class_group_id, subject_id,
  teacher_user_id, day_of_week, starts_at, ends_at, status, created_by
on public.learning_timetable_entries
for each row execute function private.validate_learning_timetable_entry();

drop policy if exists learning_timetable_select on public.learning_timetable_entries;
drop policy if exists learning_timetable_insert on public.learning_timetable_entries;
drop policy if exists learning_timetable_update on public.learning_timetable_entries;
drop policy if exists learning_timetable_delete on public.learning_timetable_entries;

create policy learning_timetable_select
  on public.learning_timetable_entries for select to authenticated
  using (public.learning_can_manage_academic_records(organization_id));

create policy learning_timetable_insert
  on public.learning_timetable_entries for insert to authenticated
  with check (
    public.learning_can_manage_academic_records(organization_id)
    and created_by = public.learning_current_user_id()
  );

create policy learning_timetable_update
  on public.learning_timetable_entries for update to authenticated
  using (public.learning_can_manage_academic_records(organization_id))
  with check (
    public.learning_can_manage_academic_records(organization_id)
    and created_by = public.learning_current_user_id()
  );

create policy learning_timetable_delete
  on public.learning_timetable_entries for delete to authenticated
  using (public.learning_can_manage_academic_records(organization_id));

commit;
