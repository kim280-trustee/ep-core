begin;

-- Per-account in-app preferences. Missing rows mean enabled so existing users
-- retain current behavior when this migration is introduced.
create table if not exists public.learning_notification_preferences (
  user_id uuid not null references public.users(id) on delete cascade,
  notification_type text not null check (notification_type in (
    'marketplace.booking_requested',
    'marketplace.booking_confirmed',
    'marketplace.booking_declined',
    'marketplace.booking_cancelled',
    'learning.assignment_published',
    'learning.assessment_result_available',
    'learning.parent_assignment_published',
    'learning.parent_assessment_result_available'
  )),
  in_app_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, notification_type)
);

alter table public.learning_notification_preferences enable row level security;
revoke all on public.learning_notification_preferences from anon, authenticated;

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
    'learning.parent_assessment_result_available'
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
    'learning.parent_assessment_result_available'
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

-- Filter at the database boundary so disabled events are not inserted and do
-- not inflate unread counts. Safeguarding reports are intentionally immutable
-- to preference settings and always remain deliverable to authorized reviewers.
create or replace function public.apply_learning_notification_preference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_enabled boolean;
begin
  if new.notification_type = 'marketplace.safety_reported' then
    return new;
  end if;

  select p.in_app_enabled into v_enabled
  from public.learning_notification_preferences p
  where p.user_id = new.recipient_user_id
    and p.notification_type = new.notification_type;

  if coalesce(v_enabled, true) = false then
    return null;
  end if;

  return new;
end;
$function$;

drop trigger if exists learning_notification_preference_filter
  on public.learning_notifications;
create trigger learning_notification_preference_filter
before insert on public.learning_notifications
for each row execute function public.apply_learning_notification_preference();

revoke all on function public.get_learning_notification_preferences() from public, anon;
revoke all on function public.set_learning_notification_preference(text, boolean) from public, anon;
revoke all on function public.apply_learning_notification_preference() from public, anon, authenticated;

grant execute on function public.get_learning_notification_preferences() to authenticated;
grant execute on function public.set_learning_notification_preference(text, boolean) to authenticated;

commit;
