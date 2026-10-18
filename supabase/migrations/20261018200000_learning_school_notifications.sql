begin;

-- Extend the private notification inbox for school attendance and admissions.
alter table public.learning_notifications
  drop constraint if exists learning_notifications_notification_type_check;
alter table public.learning_notifications
  add constraint learning_notifications_notification_type_check
  check (notification_type in (
    'marketplace.booking_requested',
    'marketplace.booking_confirmed',
    'marketplace.booking_declined',
    'marketplace.booking_cancelled',
    'marketplace.safety_reported',
    'learning.assignment_published',
    'learning.assessment_result_available',
    'learning.parent_assignment_published',
    'learning.parent_assessment_result_available',
    'school.parent_attendance_recorded',
    'school.student_invitation_accepted'
  ));

alter table public.learning_notifications
  drop constraint if exists learning_notifications_resource_type_check;
alter table public.learning_notifications
  add constraint learning_notifications_resource_type_check
  check (resource_type in (
    'marketplace_booking',
    'learning_assignment',
    'assessment_result',
    'attendance_session',
    'student_invitation'
  ));

alter table public.learning_notification_preferences
  drop constraint if exists learning_notification_preferences_notification_type_check;
alter table public.learning_notification_preferences
  add constraint learning_notification_preferences_notification_type_check
  check (notification_type in (
    'marketplace.booking_requested',
    'marketplace.booking_confirmed',
    'marketplace.booking_declined',
    'marketplace.booking_cancelled',
    'learning.assignment_published',
    'learning.assessment_result_available',
    'learning.parent_assignment_published',
    'learning.parent_assessment_result_available',
    'school.parent_attendance_recorded',
    'school.student_invitation_accepted'
  ));

create unique index if not exists learning_notifications_school_event_once_idx
  on public.learning_notifications (recipient_user_id, notification_type, resource_type, resource_id)
  where notification_type in (
    'school.parent_attendance_recorded',
    'school.student_invitation_accepted'
  );

create or replace function public.get_learning_notification_preferences()
returns table (notification_type text, in_app_enabled boolean)
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

  return query
  select allowed.notification_type,
         coalesce(p.in_app_enabled, true) as in_app_enabled
  from unnest(array[
    'marketplace.booking_requested',
    'marketplace.booking_confirmed',
    'marketplace.booking_declined',
    'marketplace.booking_cancelled',
    'learning.assignment_published',
    'learning.assessment_result_available',
    'learning.parent_assignment_published',
    'learning.parent_assessment_result_available',
    'school.parent_attendance_recorded',
    'school.student_invitation_accepted'
  ]::text[]) as allowed(notification_type)
  left join public.learning_notification_preferences p
    on p.user_id = v_user_id
   and p.notification_type = allowed.notification_type
  order by allowed.notification_type;
end;
$function$;

create or replace function public.set_learning_notification_preference(
  p_notification_type text,
  p_in_app_enabled boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
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

  if p_notification_type is null or p_notification_type not in (
    'marketplace.booking_requested',
    'marketplace.booking_confirmed',
    'marketplace.booking_declined',
    'marketplace.booking_cancelled',
    'learning.assignment_published',
    'learning.assessment_result_available',
    'learning.parent_assignment_published',
    'learning.parent_assessment_result_available',
    'school.parent_attendance_recorded',
    'school.student_invitation_accepted'
  ) then
    raise exception 'Unsupported notification preference';
  end if;

  if p_in_app_enabled is null then
    raise exception 'Preference value is required';
  end if;

  insert into public.learning_notification_preferences (
    user_id, notification_type, in_app_enabled, updated_at
  ) values (
    v_user_id, p_notification_type, p_in_app_enabled, now()
  )
  on conflict (user_id, notification_type)
  do update set
    in_app_enabled = excluded.in_app_enabled,
    updated_at = now();

  return true;
end;
$function$;

-- Notify an actively linked parent only when a school attendance session is
-- submitted. The message intentionally omits attendance status and student name.
create or replace function public.notify_learning_parent_attendance_submitted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status is distinct from 'submitted'
     or old.status is not distinct from 'submitted' then
    return new;
  end if;

  insert into public.learning_notifications (
    organization_id,
    recipient_user_id,
    actor_user_id,
    notification_type,
    title,
    body,
    resource_type,
    resource_id
  )
  select distinct
    new.organization_id,
    link.parent_user_id,
    new.taken_by,
    'school.parent_attendance_recorded',
    'Attendance updated for your child',
    'The school has submitted an attendance register for a linked student.',
    'attendance_session',
    new.id
  from public.learning_attendance_records attendance
  join public.learning_parent_student_links link
    on link.organization_id = attendance.organization_id
   and link.student_user_id = attendance.student_user_id
   and link.status = 'active'
  where attendance.organization_id = new.organization_id
    and attendance.tenant_id = new.tenant_id
    and attendance.attendance_session_id = new.id
    and link.parent_user_id <> new.taken_by
  on conflict do nothing;

  return new;
end;
$function$;

drop trigger if exists learning_parent_attendance_submitted_notify
  on public.learning_attendance_sessions;
create trigger learning_parent_attendance_submitted_notify
after update of status on public.learning_attendance_sessions
for each row
when (new.status = 'submitted')
execute function public.notify_learning_parent_attendance_submitted();

-- Notify the staff member who issued an invitation when the invited account
-- accepts it. Never include the student's email or name in the inbox preview.
create or replace function public.notify_learning_student_invitation_accepted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status is distinct from 'accepted'
     or old.status is not distinct from 'accepted'
     or new.accepted_by is null
     or new.invited_by = new.accepted_by then
    return new;
  end if;

  insert into public.learning_notifications (
    organization_id,
    recipient_user_id,
    actor_user_id,
    notification_type,
    title,
    body,
    resource_type,
    resource_id
  ) values (
    new.organization_id,
    new.invited_by,
    new.accepted_by,
    'school.student_invitation_accepted',
    'Student invitation accepted',
    'A student has accepted an invitation to join the school.',
    'student_invitation',
    new.id
  )
  on conflict do nothing;

  return new;
end;
$function$;

drop trigger if exists learning_student_invitation_accepted_notify
  on public.learning_student_invitations;
create trigger learning_student_invitation_accepted_notify
after update of status on public.learning_student_invitations
for each row
when (new.status = 'accepted')
execute function public.notify_learning_student_invitation_accepted();

revoke all on function public.notify_learning_parent_attendance_submitted() from public, anon, authenticated;
revoke all on function public.notify_learning_student_invitation_accepted() from public, anon, authenticated;
grant execute on function public.get_learning_notification_preferences() to authenticated;
grant execute on function public.set_learning_notification_preference(text, boolean) to authenticated;

commit;
