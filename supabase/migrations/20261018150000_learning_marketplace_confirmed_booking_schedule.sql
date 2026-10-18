begin;

-- A request is confirmed only when the chosen local date/time fits an active
-- teacher availability window and does not overlap another confirmed lesson.
-- This migration does not collect payment or create a financial obligation.

alter table public.learning_marketplace_booking_requests
  add column if not exists confirmed_start_at timestamptz,
  add column if not exists confirmed_timezone text;

create index if not exists learning_marketplace_requests_confirmed_schedule_idx
  on public.learning_marketplace_booking_requests (confirmed_start_at)
  where status = 'accepted' and confirmed_start_at is not null;

create or replace function public.create_learning_marketplace_booking_request(
  p_offering_id uuid,
  p_student_user_id uuid,
  p_message text,
  p_preferred_date date,
  p_preferred_time text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_requester_user_id uuid;
  v_organization_id uuid;
  v_request_id uuid;
begin
  select u.id into v_requester_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_requester_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if p_preferred_date is null
     or p_preferred_time is null
     or p_preferred_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]
  end if;

  select offer.organization_id into v_organization_id
  from public.learning_marketplace_offerings offer
  where offer.id = p_offering_id
    and offer.status = 'published'
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = offer.organization_id
        and cm.user_id = offer.teacher_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    );

  if v_organization_id is null then
    raise exception 'This lesson offering is not available';
  end if;

  if p_student_user_id = v_requester_user_id then
    if not exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = v_organization_id
        and cm.user_id = p_student_user_id
        and cm.membership_type = 'student'
        and cm.status = 'active'
    ) then
      raise exception 'You must be an active student in this organization to request a lesson for yourself';
    end if;
  elsif not exists (
    select 1
    from public.learning_parent_student_links link
    join public.learning_class_memberships cm
      on cm.organization_id = link.organization_id
     and cm.user_id = link.student_user_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where link.organization_id = v_organization_id
      and link.parent_user_id = v_requester_user_id
      and link.student_user_id = p_student_user_id
      and link.status = 'active'
  ) then
    raise exception 'A parent may request lessons only for an actively linked student in the same organization';
  end if;

  if coalesce(length(p_message), 0) > 2000 then
    raise exception 'Invalid booking request details';
  end if;

  insert into public.learning_marketplace_booking_requests (
    offering_id, organization_id, requester_user_id, student_user_id,
    message, preferred_date, preferred_time
  ) values (
    p_offering_id, v_organization_id, v_requester_user_id, p_student_user_id,
    coalesce(p_message, ''), p_preferred_date, p_preferred_time
  ) returning id into v_request_id;

  return v_request_id;
end;
$function$;

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
  v_start_minute integer;
  v_timezone_name text;
  v_confirmed_start_at timestamptz;
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

    v_start_time := v_preferred_time::time;
    v_start_minute := extract(hour from v_start_time)::integer * 60
      + extract(minute from v_start_time)::integer;

    select slot.timezone_name into v_timezone_name
    from public.learning_marketplace_teacher_availability slot
    where slot.organization_id = v_organization_id
      and slot.teacher_user_id = v_teacher_user_id
      and slot.active
      and slot.weekday = extract(dow from v_preferred_date)::smallint
      and v_start_minute >= (
        extract(hour from slot.start_time)::integer * 60
        + extract(minute from slot.start_time)::integer
      )
      and v_start_minute + v_duration_minutes <= (
        extract(hour from slot.end_time)::integer * 60
        + extract(minute from slot.end_time)::integer
      )
    order by slot.start_time
    limit 1;

    if v_timezone_name is null then
      raise exception 'The requested date/time is outside the teacher''s active availability';
    end if;

    v_confirmed_start_at := (v_preferred_date + v_start_time) at time zone v_timezone_name;
    if v_confirmed_start_at <= now() then
      raise exception 'A lesson date/time in the past cannot be confirmed';
    end if;

    -- Serialize all confirmations for this teacher, including bookings across
    -- organizations/time zones, then compare their absolute timestamps.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_teacher_user_id::text, 0)
    );

    if exists (
      select 1
      from public.learning_marketplace_booking_requests existing_request
      join public.learning_marketplace_offerings existing_offer
        on existing_offer.id = existing_request.offering_id
      where existing_offer.teacher_user_id = v_teacher_user_id
        and existing_request.status = 'accepted'
        and existing_request.confirmed_start_at is not null
        and existing_request.confirmed_start_at < (
          v_confirmed_start_at + make_interval(mins => v_duration_minutes)
        )
        and (
          existing_request.confirmed_start_at
          + make_interval(mins => existing_offer.duration_minutes)
        ) > v_confirmed_start_at
    ) then
      raise exception 'This time overlaps another confirmed lesson; choose another available time';
    end if;

    -- Older accepted requests created before this migration have no normalized
    -- timestamp. Keep a same-school fallback check for those legacy rows.
    if exists (
      select 1
      from public.learning_marketplace_booking_requests existing_request
      join public.learning_marketplace_offerings existing_offer
        on existing_offer.id = existing_request.offering_id
      where existing_offer.teacher_user_id = v_teacher_user_id
        and existing_request.organization_id = v_organization_id
        and existing_request.status = 'accepted'
        and existing_request.confirmed_start_at is null
        and existing_request.preferred_date = v_preferred_date
        and existing_request.preferred_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        and v_start_minute < (
          extract(hour from existing_request.preferred_time::time)::integer * 60
          + extract(minute from existing_request.preferred_time::time)::integer
          + existing_offer.duration_minutes
        )
        and v_start_minute + v_duration_minutes > (
          extract(hour from existing_request.preferred_time::time)::integer * 60
          + extract(minute from existing_request.preferred_time::time)::integer
        )
    ) then
      raise exception 'This time overlaps another confirmed lesson; choose another available time';
    end if;
  end if;

  update public.learning_marketplace_booking_requests request
  set status = p_status,
      response_note = nullif(trim(coalesce(p_response_note, '')), ''),
      confirmed_start_at = case when p_status = 'accepted' then v_confirmed_start_at else null end,
      confirmed_timezone = case when p_status = 'accepted' then v_timezone_name else null end,
      updated_at = now()
  where request.id = v_request_id;

  return v_request_id;
end;
$function$;


create or replace function public.cancel_learning_marketplace_booking_request(
  p_request_id uuid,
  p_cancel_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_request_id uuid;
  v_requester_user_id uuid;
  v_teacher_user_id uuid;
  v_organization_id uuid;
  v_status text;
  v_confirmed_start_at timestamptz;
begin
  if p_cancel_reason is not null and length(p_cancel_reason) > 1000 then
    raise exception 'Cancellation note is too long';
  end if;

  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select request.id, request.requester_user_id, offer.teacher_user_id,
         request.organization_id, request.status, request.confirmed_start_at
    into v_request_id, v_requester_user_id, v_teacher_user_id,
         v_organization_id, v_status, v_confirmed_start_at
  from public.learning_marketplace_booking_requests request
  join public.learning_marketplace_offerings offer
    on offer.id = request.offering_id
  where request.id = p_request_id
    and (
      request.requester_user_id = v_user_id
      or (
        offer.teacher_user_id = v_user_id
        and exists (
          select 1 from public.learning_class_memberships cm
          where cm.organization_id = request.organization_id
            and cm.user_id = v_user_id
            and cm.membership_type = 'teacher'
            and cm.status = 'active'
        )
      )
    )
  for update of request;

  if v_request_id is null then
    raise exception 'Booking request not found or access denied';
  end if;

  if v_status not in ('requested', 'accepted') then
    raise exception 'Only requested or confirmed lessons can be cancelled';
  end if;

  if v_status = 'requested' and v_requester_user_id <> v_user_id then
    raise exception 'Only the requester can cancel a pending request';
  end if;

  if v_status = 'accepted' and v_confirmed_start_at is not null
     and v_confirmed_start_at <= now() then
    raise exception 'A lesson that has started or passed cannot be cancelled here';
  end if;

  -- Lock against a concurrent confirmation of this same request. Updating the
  -- status to cancelled releases the time slot for future requests.
  update public.learning_marketplace_booking_requests request
  set status = 'cancelled',
      response_note = nullif(trim(coalesce(p_cancel_reason, '')), ''),
      updated_at = now()
  where request.id = v_request_id;

  return v_request_id;
end;
$function$;

revoke all on function public.cancel_learning_marketplace_booking_request(uuid, text) from public, anon;
grant execute on function public.cancel_learning_marketplace_booking_request(uuid, text) to authenticated;

revoke all on function public.create_learning_marketplace_booking_request(uuid, uuid, text, date, text) from public, anon;
revoke all on function public.respond_learning_marketplace_booking_request(uuid, text, text) from public, anon;
grant execute on function public.create_learning_marketplace_booking_request(uuid, uuid, text, date, text) to authenticated;
grant execute on function public.respond_learning_marketplace_booking_request(uuid, text, text) to authenticated;

commit;
 then
    raise exception 'Choose a specific date and valid time for the lesson';
  end if;

  select offer.organization_id into v_organization_id
  from public.learning_marketplace_offerings offer
  where offer.id = p_offering_id
    and offer.status = 'published'
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = offer.organization_id
        and cm.user_id = offer.teacher_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    );

  if v_organization_id is null then
    raise exception 'This lesson offering is not available';
  end if;

  if p_student_user_id = v_requester_user_id then
    if not exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = v_organization_id
        and cm.user_id = p_student_user_id
        and cm.membership_type = 'student'
        and cm.status = 'active'
    ) then
      raise exception 'You must be an active student in this organization to request a lesson for yourself';
    end if;
  elsif not exists (
    select 1
    from public.learning_parent_student_links link
    join public.learning_class_memberships cm
      on cm.organization_id = link.organization_id
     and cm.user_id = link.student_user_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where link.organization_id = v_organization_id
      and link.parent_user_id = v_requester_user_id
      and link.student_user_id = p_student_user_id
      and link.status = 'active'
  ) then
    raise exception 'A parent may request lessons only for an actively linked student in the same organization';
  end if;

  if coalesce(length(p_message), 0) > 2000 then
    raise exception 'Invalid booking request details';
  end if;

  insert into public.learning_marketplace_booking_requests (
    offering_id, organization_id, requester_user_id, student_user_id,
    message, preferred_date, preferred_time
  ) values (
    p_offering_id, v_organization_id, v_requester_user_id, p_student_user_id,
    coalesce(p_message, ''), p_preferred_date, p_preferred_time
  ) returning id into v_request_id;

  return v_request_id;
end;
$function$;

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
  v_start_minute integer;
  v_timezone_name text;
  v_confirmed_start_at timestamptz;
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
    v_start_minute := extract(hour from v_start_time)::integer * 60
      + extract(minute from v_start_time)::integer;

    select slot.timezone_name into v_timezone_name
    from public.learning_marketplace_teacher_availability slot
    where slot.organization_id = v_organization_id
      and slot.teacher_user_id = v_teacher_user_id
      and slot.active
      and slot.weekday = extract(dow from v_preferred_date)::smallint
      and v_start_minute >= (
        extract(hour from slot.start_time)::integer * 60
        + extract(minute from slot.start_time)::integer
      )
      and v_start_minute + v_duration_minutes <= (
        extract(hour from slot.end_time)::integer * 60
        + extract(minute from slot.end_time)::integer
      )
    order by slot.start_time
    limit 1;

    if v_timezone_name is null then
      raise exception 'The requested date/time is outside the teacher''s active availability';
    end if;

    v_confirmed_start_at := (v_preferred_date + v_start_time) at time zone v_timezone_name;

    -- Serialize all confirmations for this teacher, including bookings across
    -- organizations/time zones, then compare their absolute timestamps.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_teacher_user_id::text, 0)
    );

    if exists (
      select 1
      from public.learning_marketplace_booking_requests existing_request
      join public.learning_marketplace_offerings existing_offer
        on existing_offer.id = existing_request.offering_id
      where existing_offer.teacher_user_id = v_teacher_user_id
        and existing_request.status = 'accepted'
        and existing_request.confirmed_start_at is not null
        and existing_request.confirmed_start_at < (
          v_confirmed_start_at + make_interval(mins => v_duration_minutes)
        )
        and (
          existing_request.confirmed_start_at
          + make_interval(mins => existing_offer.duration_minutes)
        ) > v_confirmed_start_at
    ) then
      raise exception 'This time overlaps another confirmed lesson; choose another available time';
    end if;

    -- Older accepted requests created before this migration have no normalized
    -- timestamp. Keep a same-school fallback check for those legacy rows.
    if exists (
      select 1
      from public.learning_marketplace_booking_requests existing_request
      join public.learning_marketplace_offerings existing_offer
        on existing_offer.id = existing_request.offering_id
      where existing_offer.teacher_user_id = v_teacher_user_id
        and existing_request.organization_id = v_organization_id
        and existing_request.status = 'accepted'
        and existing_request.confirmed_start_at is null
        and existing_request.preferred_date = v_preferred_date
        and existing_request.preferred_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        and v_start_minute < (
          extract(hour from existing_request.preferred_time::time)::integer * 60
          + extract(minute from existing_request.preferred_time::time)::integer
          + existing_offer.duration_minutes
        )
        and v_start_minute + v_duration_minutes > (
          extract(hour from existing_request.preferred_time::time)::integer * 60
          + extract(minute from existing_request.preferred_time::time)::integer
        )
    ) then
      raise exception 'This time overlaps another confirmed lesson; choose another available time';
    end if;
  end if;

  update public.learning_marketplace_booking_requests request
  set status = p_status,
      response_note = nullif(trim(coalesce(p_response_note, '')), ''),
      confirmed_start_at = case when p_status = 'accepted' then v_confirmed_start_at else null end,
      confirmed_timezone = case when p_status = 'accepted' then v_timezone_name else null end,
      updated_at = now()
  where request.id = v_request_id;

  return v_request_id;
end;
$function$;


create or replace function public.cancel_learning_marketplace_booking_request(
  p_request_id uuid,
  p_cancel_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_request_id uuid;
  v_requester_user_id uuid;
  v_teacher_user_id uuid;
  v_organization_id uuid;
  v_status text;
  v_confirmed_start_at timestamptz;
begin
  if p_cancel_reason is not null and length(p_cancel_reason) > 1000 then
    raise exception 'Cancellation note is too long';
  end if;

  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select request.id, request.requester_user_id, offer.teacher_user_id,
         request.organization_id, request.status, request.confirmed_start_at
    into v_request_id, v_requester_user_id, v_teacher_user_id,
         v_organization_id, v_status, v_confirmed_start_at
  from public.learning_marketplace_booking_requests request
  join public.learning_marketplace_offerings offer
    on offer.id = request.offering_id
  where request.id = p_request_id
    and (
      request.requester_user_id = v_user_id
      or (
        offer.teacher_user_id = v_user_id
        and exists (
          select 1 from public.learning_class_memberships cm
          where cm.organization_id = request.organization_id
            and cm.user_id = v_user_id
            and cm.membership_type = 'teacher'
            and cm.status = 'active'
        )
      )
    )
  for update of request;

  if v_request_id is null then
    raise exception 'Booking request not found or access denied';
  end if;

  if v_status not in ('requested', 'accepted') then
    raise exception 'Only requested or confirmed lessons can be cancelled';
  end if;

  if v_status = 'requested' and v_requester_user_id <> v_user_id then
    raise exception 'Only the requester can cancel a pending request';
  end if;

  if v_status = 'accepted' and v_confirmed_start_at is not null
     and v_confirmed_start_at <= now() then
    raise exception 'A lesson that has started or passed cannot be cancelled here';
  end if;

  -- Lock against a concurrent confirmation of this same request. Updating the
  -- status to cancelled releases the time slot for future requests.
  update public.learning_marketplace_booking_requests request
  set status = 'cancelled',
      response_note = nullif(trim(coalesce(p_cancel_reason, '')), ''),
      updated_at = now()
  where request.id = v_request_id;

  return v_request_id;
end;
$function$;

revoke all on function public.cancel_learning_marketplace_booking_request(uuid, text) from public, anon;
grant execute on function public.cancel_learning_marketplace_booking_request(uuid, text) to authenticated;

revoke all on function public.create_learning_marketplace_booking_request(uuid, uuid, text, date, text) from public, anon;
revoke all on function public.respond_learning_marketplace_booking_request(uuid, text, text) from public, anon;
grant execute on function public.create_learning_marketplace_booking_request(uuid, uuid, text, date, text) to authenticated;
grant execute on function public.respond_learning_marketplace_booking_request(uuid, text, text) to authenticated;

commit;
