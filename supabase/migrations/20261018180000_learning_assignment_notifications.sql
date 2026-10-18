begin;

-- Extend the recipient-scoped inbox to cover the core learning loop.
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
    'learning.assessment_result_available'
  ));

alter table public.learning_notifications
  drop constraint if exists learning_notifications_resource_type_check;
alter table public.learning_notifications
  add constraint learning_notifications_resource_type_check
  check (resource_type in ('marketplace_booking', 'learning_assignment', 'assessment_result'));

-- Prevent trigger retries from duplicating assignment/result notifications without
-- changing the intentional ability to record multiple safety reports for one booking.
create unique index if not exists learning_notifications_learning_event_once_idx
  on public.learning_notifications (recipient_user_id, notification_type, resource_type, resource_id)
  where notification_type in (
    'learning.assignment_published',
    'learning.assessment_result_available'
  );

create or replace function public.enqueue_learning_assignment_notification(
  p_organization_id uuid,
  p_assignment_id uuid,
  p_actor_user_id uuid,
  p_recipient_user_id uuid,
  p_assignment_title text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if p_recipient_user_id is null
     or p_recipient_user_id = p_actor_user_id
     or p_organization_id is null
     or p_assignment_id is null then
    return;
  end if;

  insert into public.learning_notifications (
    organization_id, recipient_user_id, actor_user_id,
    notification_type, title, body, resource_type, resource_id
  ) values (
    p_organization_id,
    p_recipient_user_id,
    p_actor_user_id,
    'learning.assignment_published',
    'New assignment available',
    'A new assignment is ready: ' || left(coalesce(nullif(trim(p_assignment_title), ''), 'Learning assignment'), 350),
    'learning_assignment',
    p_assignment_id
  )
  on conflict do nothing;
end;
$function$;

create or replace function public.enqueue_learning_assignment_target(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_target public.learning_assignment_targets%rowtype;
  v_assignment record;
  v_member record;
begin
  select t.* into v_target
  from public.learning_assignment_targets t
  where t.id = p_target_id;

  if not found then
    return;
  end if;

  select a.id, a.organization_id, a.tenant_id, a.created_by, a.title, a.status
    into v_assignment
  from public.learning_assignments a
  where a.id = v_target.assignment_id
    and a.organization_id = v_target.organization_id
    and a.tenant_id = v_target.tenant_id;

  if not found or v_assignment.status is distinct from 'published' or v_target.status is distinct from 'active' then
    return;
  end if;

  if v_target.student_user_id is not null then
    perform public.enqueue_learning_assignment_notification(
      v_assignment.organization_id, v_assignment.id, v_assignment.created_by,
      v_target.student_user_id, v_assignment.title
    );
  elsif v_target.class_group_id is not null then
    for v_member in
      select cm.user_id
      from public.learning_class_memberships cm
      where cm.tenant_id = v_assignment.tenant_id
        and cm.organization_id = v_assignment.organization_id
        and cm.class_group_id = v_target.class_group_id
        and cm.membership_type = 'student'
        and cm.status = 'active'
    loop
      perform public.enqueue_learning_assignment_notification(
        v_assignment.organization_id, v_assignment.id, v_assignment.created_by,
        v_member.user_id, v_assignment.title
      );
    end loop;
  end if;
end;
$function$;

create or replace function public.notify_learning_assignment_target()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  perform public.enqueue_learning_assignment_target(new.id);
  return new;
end;
$function$;

create or replace function public.notify_learning_assignment_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_target record;
begin
  if new.status is distinct from 'published' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'published' then
      return new;
    end if;
  end if;

  for v_target in
    select t.id
    from public.learning_assignment_targets t
    where t.assignment_id = new.id
      and t.organization_id = new.organization_id
      and t.tenant_id = new.tenant_id
      and t.status = 'active'
  loop
    perform public.enqueue_learning_assignment_target(v_target.id);
  end loop;

  return new;
end;
$function$;

create or replace function public.notify_learning_assessment_result_available()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_organization_id uuid;
  v_assessment_title text;
begin
  select coalesce(new.organization_id, a.organization_id), a.title
    into v_organization_id, v_assessment_title
  from public.learning_attempts attempt
  join public.learning_assessments a on a.id = attempt.assessment_id
  where attempt.id = new.attempt_id;

  if v_organization_id is null then
    return new;
  end if;

  insert into public.learning_notifications (
    organization_id, recipient_user_id, actor_user_id,
    notification_type, title, body, resource_type, resource_id
  ) values (
    v_organization_id,
    new.student_user_id,
    null,
    'learning.assessment_result_available',
    'Assessment result available',
    'Your assessment result is ready: ' || left(coalesce(nullif(trim(v_assessment_title), ''), 'Assessment'), 350),
    'assessment_result',
    new.id
  )
  on conflict do nothing;

  return new;
end;
$function$;

drop trigger if exists learning_assignment_published_notify
  on public.learning_assignments;
create trigger learning_assignment_published_notify
after insert or update on public.learning_assignments
for each row execute function public.notify_learning_assignment_published();

drop trigger if exists learning_assignment_target_notify
  on public.learning_assignment_targets;
create trigger learning_assignment_target_notify
after insert or update on public.learning_assignment_targets
for each row execute function public.notify_learning_assignment_target();

create or replace function public.notify_published_assignments_to_class_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_target record;
begin
  if new.membership_type is distinct from 'student'
     or new.status is distinct from 'active' then
    return new;
  end if;

  for v_target in
    select t.id
    from public.learning_assignment_targets t
    join public.learning_assignments a
      on a.id = t.assignment_id
     and a.organization_id = t.organization_id
     and a.tenant_id = t.tenant_id
    where t.tenant_id = new.tenant_id
      and t.organization_id = new.organization_id
      and t.class_group_id = new.class_group_id
      and t.status = 'active'
      and a.status = 'published'
  loop
    perform public.enqueue_learning_assignment_target(v_target.id);
  end loop;

  return new;
end;
$function$;

drop trigger if exists learning_class_member_assignment_notify
  on public.learning_class_memberships;
create trigger learning_class_member_assignment_notify
after insert or update on public.learning_class_memberships
for each row execute function public.notify_published_assignments_to_class_member();

drop trigger if exists learning_assessment_result_notify
  on public.learning_assessment_results;
create trigger learning_assessment_result_notify
after insert on public.learning_assessment_results
for each row execute function public.notify_learning_assessment_result_available();

revoke all on function public.enqueue_learning_assignment_notification(uuid, uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.notify_learning_assignment_target() from public, anon, authenticated;
revoke all on function public.notify_learning_assignment_published() from public, anon, authenticated;
revoke all on function public.enqueue_learning_assignment_target(uuid) from public, anon, authenticated;
revoke all on function public.notify_learning_assessment_result_available() from public, anon, authenticated;
revoke all on function public.notify_published_assignments_to_class_member() from public, anon, authenticated;

commit;
