begin;

-- Reconcile the live notification inbox constraints with the school-notification
-- trigger. This is deliberately additive: existing marketplace and learning
-- notification types remain valid.
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
    'school.student_invitation_accepted',
    'school.announcement_published'
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
    'student_invitation',
    'school_announcement'
  ));

-- Parent attendance and invitation events are idempotent per recipient/event.
create unique index if not exists learning_notifications_school_event_once_idx
  on public.learning_notifications (recipient_user_id, notification_type, resource_type, resource_id)
  where notification_type in (
    'school.parent_attendance_recorded',
    'school.student_invitation_accepted'
  );

-- Keep the parent notification limited to an active parent link and an actively
-- enrolled student in this same organization. Do not expose attendance details.
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
  join public.learning_class_memberships student_membership
    on student_membership.organization_id = attendance.organization_id
   and student_membership.user_id = attendance.student_user_id
   and student_membership.membership_type = 'student'
   and student_membership.status = 'active'
  where attendance.organization_id = new.organization_id
    and attendance.tenant_id = new.tenant_id
    and attendance.attendance_session_id = new.id
    and link.parent_user_id <> new.taken_by
  on conflict do nothing;

  return new;
end;
$function$;

revoke all on function public.notify_learning_parent_attendance_submitted()
  from public, anon, authenticated;

-- Fail the migration if the intended values were not installed.
do $verification$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.learning_notifications'::regclass
      and conname = 'learning_notifications_notification_type_check'
      and pg_get_constraintdef(oid) like '%school.parent_attendance_recorded%'
  ) then
    raise exception 'Attendance notification type is not allowed by the inbox constraint';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.learning_notifications'::regclass
      and conname = 'learning_notifications_resource_type_check'
      and pg_get_constraintdef(oid) like '%attendance_session%'
  ) then
    raise exception 'Attendance session resource is not allowed by the inbox constraint';
  end if;
end;
$verification$;

commit;
