-- Complete the attendance register lifecycle and preserve immutable audit metadata.
begin;

-- Upserts used by the school UI include the original creator/marker columns.
-- Preserve the first actor and mark time instead of rejecting legitimate corrections.
create or replace function public.learning_prevent_attendance_taker_change()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.taken_by := old.taken_by;
  return new;
end;
$function$;
revoke all on function public.learning_prevent_attendance_taker_change() from public, anon, authenticated;

create or replace function public.learning_prevent_attendance_marker_change()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.marked_by := old.marked_by;
  new.marked_at := old.marked_at;
  return new;
end;
$function$;
revoke all on function public.learning_prevent_attendance_marker_change() from public, anon, authenticated;

drop trigger if exists learning_attendance_marker_immutable
  on public.learning_attendance_records;
create trigger learning_attendance_marker_immutable
  before update of marked_by, marked_at on public.learning_attendance_records
  for each row
  execute function public.learning_prevent_attendance_marker_change();

-- A register cannot be reassigned to another school/class/date after creation.
-- Once submitted, normal saves cannot silently reopen it. Corrections remain
-- possible, while the original submitted_at timestamp and creator are retained.
create or replace function public.learning_guard_attendance_session_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    if new.status is distinct from 'open' then
      raise exception 'New attendance registers must start open and be submitted through the validated workflow';
    end if;
    new.submitted_at := null;
    return new;
  end if;

  if new.tenant_id is distinct from old.tenant_id
    or new.organization_id is distinct from old.organization_id
    or new.class_group_id is distinct from old.class_group_id
    or new.attendance_date is distinct from old.attendance_date then
    raise exception 'An attendance register cannot be moved to another school, class, or date';
  end if;

  if old.status = 'submitted' then
    new.status := 'submitted';
    new.submitted_at := old.submitted_at;
  elsif new.status = 'submitted' then
    if not (
      (
        exists (
          select 1
          from public.get_current_user_permissions() permission
          where permission.permission_code = 'learning.academic.manage'
        )
        and public.is_organization_member(new.organization_id)
      )
      or exists (
        select 1
        from public.learning_class_memberships cm
        where cm.tenant_id = new.tenant_id
          and cm.organization_id = new.organization_id
          and cm.class_group_id = new.class_group_id
          and cm.user_id = public.learning_current_user_id()
          and cm.membership_type = 'teacher'
          and cm.status = 'active'
      )
    ) then
      raise exception 'You do not have permission to submit this attendance register';
    end if;

    if exists (
      select 1
      from public.learning_class_memberships cm
      where cm.tenant_id = new.tenant_id
        and cm.organization_id = new.organization_id
        and cm.class_group_id = new.class_group_id
        and cm.membership_type = 'student'
        and cm.status = 'active'
        and not exists (
          select 1
          from public.learning_attendance_records r
          where r.tenant_id = new.tenant_id
            and r.organization_id = new.organization_id
            and r.attendance_session_id = new.id
            and r.student_user_id = cm.user_id
        )
    ) then
      raise exception 'Mark every active student before submitting the attendance register';
    end if;

    new.submitted_at := coalesce(new.submitted_at, now());
  else
    new.submitted_at := null;
  end if;

  return new;
end;
$function$;
revoke all on function public.learning_guard_attendance_session_update() from public, anon, authenticated;

drop trigger if exists learning_attendance_session_integrity
  on public.learning_attendance_sessions;
create trigger learning_attendance_session_integrity
  before insert or update
  on public.learning_attendance_sessions
  for each row
  execute function public.learning_guard_attendance_session_update();

-- Attendance rows keep their original student and register. Reassignment must
-- be done by removing/recreating a mark rather than mutating historical identity.
create or replace function public.learning_prevent_attendance_record_identity_change()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.tenant_id is distinct from old.tenant_id
    or new.organization_id is distinct from old.organization_id
    or new.attendance_session_id is distinct from old.attendance_session_id
    or new.student_user_id is distinct from old.student_user_id then
    raise exception 'An attendance mark cannot be moved to another student, register, or school';
  end if;
  return new;
end;
$function$;
revoke all on function public.learning_prevent_attendance_record_identity_change() from public, anon, authenticated;

drop trigger if exists learning_attendance_record_identity_immutable
  on public.learning_attendance_records;
create trigger learning_attendance_record_identity_immutable
  before update of tenant_id, organization_id, attendance_session_id, student_user_id
  on public.learning_attendance_records
  for each row
  execute function public.learning_prevent_attendance_record_identity_change();

-- Submission is a server-side operation; authorization and completeness are also
-- enforced by the session trigger so a direct table update cannot bypass them.
create or replace function public.submit_learning_attendance_register(p_session_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_session public.learning_attendance_sessions%rowtype;
begin
  v_user_id := public.learning_current_user_id();
  if v_user_id is null then
    raise exception 'Sign in before submitting an attendance register';
  end if;

  select s.* into v_session
  from public.learning_attendance_sessions s
  where s.id = p_session_id
  for update;

  if not found then
    raise exception 'Attendance register not found';
  end if;

  if not (
    (
      exists (
        select 1
        from public.get_current_user_permissions() permission
        where permission.permission_code = 'learning.academic.manage'
      )
      and public.is_organization_member(v_session.organization_id)
    )
    or exists (
      select 1
      from public.learning_class_memberships cm
      where cm.tenant_id = v_session.tenant_id
        and cm.organization_id = v_session.organization_id
        and cm.class_group_id = v_session.class_group_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  ) then
    raise exception 'You do not have permission to submit this attendance register';
  end if;

  if v_session.status = 'submitted' then
    return v_session.submitted_at;
  end if;

  update public.learning_attendance_sessions
  set status = 'submitted',
      submitted_at = coalesce(submitted_at, now()),
      updated_at = now()
  where id = v_session.id
  returning submitted_at into v_session.submitted_at;

  return v_session.submitted_at;
end;
$function$;

revoke all on function public.submit_learning_attendance_register(uuid) from public, anon;
grant execute on function public.submit_learning_attendance_register(uuid) to authenticated;

commit;
