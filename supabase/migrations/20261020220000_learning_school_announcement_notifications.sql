begin;

-- Extend the recipient-scoped inbox for school announcements. Notifications are
-- emitted only when a draft transitions to published, and only to parents with
-- an active link to a student actively enrolled in the relevant school/class.
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
    'school.student_invitation_accepted',
    'school.announcement_published'
  ));

create unique index if not exists learning_notifications_school_announcement_once_idx
  on public.learning_notifications (recipient_user_id, notification_type, resource_type, resource_id)
  where notification_type = 'school.announcement_published';

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
    'school.student_invitation_accepted',
    'school.announcement_published'
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
    'school.student_invitation_accepted',
    'school.announcement_published'
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

create or replace function public.notify_learning_school_announcement_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor_user_id uuid;
begin
  if new.status is distinct from 'published'
     or old.status is not distinct from 'published' then
    return new;
  end if;

  select u.id into v_actor_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

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
    a.organization_id,
    link.parent_user_id,
    v_actor_user_id,
    'school.announcement_published',
    'New school announcement',
    'Your school has published a new notice for your school or class.',
    'school_announcement',
    a.id
  from public.learning_school_announcements a
  join public.organizations o
    on o.id = a.organization_id
   and o.status = 'active'
  join public.learning_parent_student_links link
    on link.organization_id = a.organization_id
   and link.status = 'active'
  join public.learning_class_memberships student_membership
    on student_membership.organization_id = a.organization_id
   and student_membership.user_id = link.student_user_id
   and student_membership.membership_type = 'student'
   and student_membership.status = 'active'
  join public.learning_class_groups enrolled_class
    on enrolled_class.id = student_membership.class_group_id
   and enrolled_class.organization_id = a.organization_id
   and enrolled_class.status = 'active'
  where a.id = new.id
    and a.tenant_id = o.tenant_id
    and a.status = 'published'
    and (a.class_group_id is null or a.class_group_id = student_membership.class_group_id)
    and link.parent_user_id is distinct from v_actor_user_id
  on conflict do nothing;

  return new;
end;
$function$;

drop trigger if exists learning_school_announcement_published_notify
  on public.learning_school_announcements;
create trigger learning_school_announcement_published_notify
after update of status on public.learning_school_announcements
for each row
when (new.status = 'published')
execute function public.notify_learning_school_announcement_published();

revoke all on function public.notify_learning_school_announcement_published() from public, anon, authenticated;
grant execute on function public.get_learning_notification_preferences() to authenticated;
grant execute on function public.set_learning_notification_preference(text, boolean) to authenticated;

commit;
