-- Final school-administration authorization hardening.
-- Attendance schema and initial timetable policies are introduced earlier in this branch stack.
begin;

-- A register's creator is audit metadata and must not change when another authorized
-- manager submits or corrects the register.
create or replace function public.learning_prevent_attendance_taker_change()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.taken_by is distinct from old.taken_by then
    raise exception 'The attendance register creator cannot be changed';
  end if;
  return new;
end;
$function$;

revoke all on function public.learning_prevent_attendance_taker_change() from public, anon;

drop trigger if exists learning_attendance_taker_immutable
  on public.learning_attendance_sessions;
create trigger learning_attendance_taker_immutable
  before update of taken_by on public.learning_attendance_sessions
  for each row
  execute function public.learning_prevent_attendance_taker_change();

-- Keep the original attendance marker as immutable audit metadata, while allowing
-- an authorized manager or assigned teacher to correct the status.
create or replace function public.learning_prevent_attendance_marker_change()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.marked_by is distinct from old.marked_by then
    raise exception 'The attendance record marker cannot be changed';
  end if;
  return new;
end;
$function$;

revoke all on function public.learning_prevent_attendance_marker_change() from public, anon;

drop trigger if exists learning_attendance_marker_immutable
  on public.learning_attendance_records;
create trigger learning_attendance_marker_immutable
  before update of marked_by on public.learning_attendance_records
  for each row
  execute function public.learning_prevent_attendance_marker_change();

-- Managers and teachers assigned to the class may edit a register. Do not require
-- taken_by = the current actor on UPDATE: that prevented managers from submitting
-- or correcting a register created by another authorized teacher. The trigger above
-- keeps the original creator immutable.
drop policy if exists learning_attendance_sessions_update
  on public.learning_attendance_sessions;
create policy learning_attendance_sessions_update
  on public.learning_attendance_sessions for update to authenticated
  using (
    (
      exists (
        select 1
        from public.get_current_user_permissions() permission
        where permission.permission_code = 'learning.academic.manage'
      )
      and public.is_organization_member(organization_id)
    )
    or exists (
      select 1
      from public.learning_class_memberships cm
      where cm.tenant_id = learning_attendance_sessions.tenant_id
        and cm.organization_id = learning_attendance_sessions.organization_id
        and cm.class_group_id = learning_attendance_sessions.class_group_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  )
  with check (
    (
      exists (
        select 1
        from public.get_current_user_permissions() permission
        where permission.permission_code = 'learning.academic.manage'
      )
      and public.is_organization_member(organization_id)
    )
    or exists (
      select 1
      from public.learning_class_memberships cm
      where cm.tenant_id = learning_attendance_sessions.tenant_id
        and cm.organization_id = learning_attendance_sessions.organization_id
        and cm.class_group_id = learning_attendance_sessions.class_group_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  );

-- Timetable SELECT remains available to organization members so relevant school
-- users can view schedules. Only academic managers may create, change or delete
-- entries; organization membership alone must not confer scheduling privileges.
-- The initial attendance UPDATE policy also required marked_by = the current actor.
-- That blocked an authorized manager from correcting another teacher's mark. Keep
-- the same class/organization authorization and active-student checks, but preserve
-- the original marker with the trigger above instead.
drop policy if exists learning_attendance_records_update
  on public.learning_attendance_records;
create policy learning_attendance_records_update
  on public.learning_attendance_records for update to authenticated
  using (
    exists (
      select 1
      from public.learning_attendance_sessions s
      where s.id = learning_attendance_records.attendance_session_id
        and s.tenant_id = learning_attendance_records.tenant_id
        and s.organization_id = learning_attendance_records.organization_id
        and (
          (exists (
            select 1
            from public.get_current_user_permissions() permission
            where permission.permission_code = 'learning.academic.manage'
          ) and public.is_organization_member(s.organization_id))
          or exists (
            select 1
            from public.learning_class_memberships cm
            where cm.tenant_id = s.tenant_id
              and cm.organization_id = s.organization_id
              and cm.class_group_id = s.class_group_id
              and cm.user_id = public.learning_current_user_id()
              and cm.membership_type = 'teacher'
              and cm.status = 'active'
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.learning_attendance_sessions s
      where s.id = learning_attendance_records.attendance_session_id
        and s.tenant_id = learning_attendance_records.tenant_id
        and s.organization_id = learning_attendance_records.organization_id
        and (
          (exists (
            select 1
            from public.get_current_user_permissions() permission
            where permission.permission_code = 'learning.academic.manage'
          ) and public.is_organization_member(s.organization_id))
          or exists (
            select 1
            from public.learning_class_memberships teacher_cm
            where teacher_cm.tenant_id = s.tenant_id
              and teacher_cm.organization_id = s.organization_id
              and teacher_cm.class_group_id = s.class_group_id
              and teacher_cm.user_id = public.learning_current_user_id()
              and teacher_cm.membership_type = 'teacher'
              and teacher_cm.status = 'active'
          )
        )
        and exists (
          select 1
          from public.learning_class_memberships student_cm
          where student_cm.tenant_id = s.tenant_id
            and student_cm.organization_id = s.organization_id
            and student_cm.class_group_id = s.class_group_id
            and student_cm.user_id = learning_attendance_records.student_user_id
            and student_cm.membership_type = 'student'
            and student_cm.status = 'active'
        )
    )
  );

drop policy if exists learning_timetable_insert
  on public.learning_timetable_entries;
create policy learning_timetable_insert
  on public.learning_timetable_entries for insert to authenticated
  with check (
    created_by = public.learning_current_user_id()
    and exists (
      select 1
      from public.get_current_user_permissions() permission
      where permission.permission_code = 'learning.academic.manage'
    )
    and public.is_organization_member(organization_id)
  );

drop policy if exists learning_timetable_update
  on public.learning_timetable_entries;
create policy learning_timetable_update
  on public.learning_timetable_entries for update to authenticated
  using (
    exists (
      select 1
      from public.get_current_user_permissions() permission
      where permission.permission_code = 'learning.academic.manage'
    )
    and public.is_organization_member(organization_id)
  )
  with check (
    exists (
      select 1
      from public.get_current_user_permissions() permission
      where permission.permission_code = 'learning.academic.manage'
    )
    and public.is_organization_member(organization_id)
  );

drop policy if exists learning_timetable_delete
  on public.learning_timetable_entries;
create policy learning_timetable_delete
  on public.learning_timetable_entries for delete to authenticated
  using (
    exists (
      select 1
      from public.get_current_user_permissions() permission
      where permission.permission_code = 'learning.academic.manage'
    )
    and public.is_organization_member(organization_id)
  );

commit;
