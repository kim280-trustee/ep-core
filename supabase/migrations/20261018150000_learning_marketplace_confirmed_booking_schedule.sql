begin;

-- Accepting a request is a confirmed booking only when the requested local
-- date/time fits the teacher's published weekly availability and does not
-- overlap another confirmed booking. This migration deliberately does not
-- collect payments or create a financial obligation.

create index if not exists learning_marketplace_requests_confirmed_schedule_idx
  on public.learning_marketplace_booking_requests (preferred_date, status)
  where status = 'accepted';

create or replace function public.respond_learning_marketplace_booking_request(
  p_request_id uuid,
  p_status text,
  p_response_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_request_id uuid;
  v_teacher_user_id uuid;
  v_organization_id uuid;
  v_preferred_date date;
  v_preferred_time text;
  v_duration_minutes integer;
  v_start_time time;
begin
  if p_status is null or p_status not in ('accepted', 'declined') then
    raise exception 'Only accept or decline responses are allowed';
  end if;

  if p_response_note is not null and length(p_response_note) > 1000 then
    raise exception 'Response note is too long';
  end if;

  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select request.id, offer.teacher_user_id, request.organization_id,
         request.preferred_date, request.preferred_time, offer.duration_minutes
    into v_request_id, v_teacher_user_id, v_organization_id,
         v_preferred_date, v_preferred_time, v_duration_minutes
  from public.learning_marketplace_booking_requests request
  join public.learning_marketplace_offerings offer
    on offer.id = request.offering_id
  where request.id = p_request_id
    and offer.teacher_user_id = v_user_id
    and request.status = 'requested'
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = request.organization_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  for update of request;

  if v_request_id is null then
    raise exception 'Booking request not found or no longer available';
  end if;

  if p_status = 'accepted' then
    if v_preferred_date is null or v_preferred_time is null
       or v_preferred_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
      raise exception 'To confirm a lesson, the requester must choose a specific date and time';
    end if;

    if v_preferred_date < current_date then
      raise exception 'A past date cannot be confirmed';
    end if;

    v_start_time := v_preferred_time::time;

    -- Serialize confirmation attempts for this teacher and local date. The
    -- lock is acquired before checking accepted requests to avoid double-booking
    -- when two teachers' requests are accepted concurrently.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_teacher_user_id::text || ':' || v_preferred_date::text, 0)
    );

    if not exists (
      select 1
      from public.learning_marketplace_teacher_availability slot
      where slot.organization_id = v_organization_id
        and slot.teacher_user_id = v_teacher_user_id
        and slot.active
        and slot.weekday = extract(dow from v_preferred_date)::smallint
        and v_start_time >= slot.start_time
        and (v_start_time + make_interval(mins => v_duration_minutes)) <= slot.end_time
    ) then
      raise exception 'The requested date/time is outside the teacher’s active availability';
    end if;

    if exists (
      select 1
      from public.learning_marketplace_booking_requests existing_request
      join public.learning_marketplace_offerings existing_offer
        on existing_offer.id = existing_request.offering_id
      where existing_offer.teacher_user_id = v_teacher_user_id
        and existing_request.organization_id = v_organization_id
        and existing_request.status = 'accepted'
        and existing_request.preferred_date = v_preferred_date
        and existing_request.preferred_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        and v_start_time < (
          existing_request.preferred_time::time
          + make_interval(mins => existing_offer.duration_minutes)
        )
        and (v_start_time + make_interval(mins => v_duration_minutes))
          > existing_request.preferred_time::time
    ) then
      raise exception 'This time overlaps another confirmed lesson; choose another available time';
    end if;
  end if;

  update public.learning_marketplace_booking_requests request
  set status = p_status,
      response_note = nullif(trim(coalesce(p_response_note, '')), ''),
      updated_at = now()
  where request.id = v_request_id;

  return v_request_id;
end;
$function$;

revoke all on function public.respond_learning_marketplace_booking_request(uuid, text, text) from public, anon;
grant execute on function public.respond_learning_marketplace_booking_request(uuid, text, text) to authenticated;

commit;
