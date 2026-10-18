begin;

create table if not exists public.learning_marketplace_offerings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teacher_user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 5 and 120),
  subject text not null check (length(trim(subject)) between 2 and 80),
  description text not null check (length(trim(description)) between 20 and 3000),
  delivery_mode text not null check (delivery_mode in ('online', 'in_person', 'hybrid')),
  lesson_type text not null check (lesson_type in ('individual', 'group')),
  duration_minutes integer not null check (duration_minutes between 15 and 240),
  price_amount numeric(10,2) not null check (price_amount >= 0),
  currency_code text not null default 'THB' check (currency_code ~ '^[A-Z]{3}$'),
  package_lessons integer not null default 1 check (package_lessons between 1 and 100),
  grade_levels text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_marketplace_offerings_published_idx
  on public.learning_marketplace_offerings (status, subject, organization_id);

create index if not exists learning_marketplace_offerings_teacher_idx
  on public.learning_marketplace_offerings (teacher_user_id, updated_at desc);

create table if not exists public.learning_marketplace_booking_requests (
  id uuid primary key default gen_random_uuid(),
  offering_id uuid not null references public.learning_marketplace_offerings(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  requester_user_id uuid not null references public.users(id) on delete cascade,
  student_user_id uuid not null references public.users(id) on delete cascade,
  message text not null default '' check (length(message) <= 2000),
  preferred_date date,
  preferred_time text check (preferred_time is null or length(preferred_time) <= 100),
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'declined', 'cancelled')),
  response_note text check (response_note is null or length(response_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_marketplace_requests_requester_idx
  on public.learning_marketplace_booking_requests (requester_user_id, created_at desc);

create index if not exists learning_marketplace_requests_student_idx
  on public.learning_marketplace_booking_requests (student_user_id, created_at desc);

create index if not exists learning_marketplace_requests_offering_idx
  on public.learning_marketplace_booking_requests (offering_id, status, created_at desc);

alter table public.learning_marketplace_offerings enable row level security;
alter table public.learning_marketplace_booking_requests enable row level security;

revoke all on public.learning_marketplace_offerings from anon, authenticated;
revoke all on public.learning_marketplace_booking_requests from anon, authenticated;

create or replace function public.list_learning_marketplace_teacher_organizations()
returns table (organization_id uuid, organization_name text)
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
  select distinct o.id, o.name
  from public.learning_class_memberships cm
  join public.organizations o on o.id = cm.organization_id
  where cm.user_id = v_user_id
    and cm.membership_type = 'teacher'
    and cm.status = 'active'
  order by o.name;
end;
$function$;

create or replace function public.list_learning_marketplace_offerings()
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  teacher_user_id uuid,
  teacher_name text,
  title text,
  subject text,
  description text,
  delivery_mode text,
  lesson_type text,
  duration_minutes integer,
  price_amount numeric,
  currency_code text,
  package_lessons integer,
  grade_levels text[],
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  return query
  select
    offer.id,
    offer.organization_id,
    org.name,
    offer.teacher_user_id,
    coalesce(teacher.name, 'Teacher'),
    offer.title,
    offer.subject,
    offer.description,
    offer.delivery_mode,
    offer.lesson_type,
    offer.duration_minutes,
    offer.price_amount,
    offer.currency_code,
    offer.package_lessons,
    offer.grade_levels,
    offer.created_at
  from public.learning_marketplace_offerings offer
  join public.organizations org on org.id = offer.organization_id
  join public.users teacher on teacher.id = offer.teacher_user_id
  where offer.status = 'published'
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = offer.organization_id
        and cm.user_id = offer.teacher_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  order by offer.created_at desc;
end;
$function$;

create or replace function public.save_learning_marketplace_offering(
  p_offering_id uuid,
  p_organization_id uuid,
  p_title text,
  p_subject text,
  p_description text,
  p_delivery_mode text,
  p_lesson_type text,
  p_duration_minutes integer,
  p_price_amount numeric,
  p_currency_code text,
  p_package_lessons integer,
  p_grade_levels text[],
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_offering_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.organization_id = p_organization_id
      and cm.user_id = v_user_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  ) then
    raise exception 'Only an active teacher in this organization can manage offerings';
  end if;

  if p_status not in ('draft', 'published', 'archived')
     or p_delivery_mode not in ('online', 'in_person', 'hybrid')
     or p_lesson_type not in ('individual', 'group')
     or p_currency_code !~ '^[A-Z]{3}$'
     or p_title is null or length(trim(p_title)) not between 5 and 120
     or p_subject is null or length(trim(p_subject)) not between 2 and 80
     or p_description is null or length(trim(p_description)) not between 20 and 3000
     or p_duration_minutes not between 15 and 240
     or p_price_amount is null or p_price_amount < 0
     or p_package_lessons not between 1 and 100 then
    raise exception 'Invalid lesson offering details';
  end if;

  if p_offering_id is null then
    insert into public.learning_marketplace_offerings (
      organization_id, teacher_user_id, title, subject, description,
      delivery_mode, lesson_type, duration_minutes, price_amount,
      currency_code, package_lessons, grade_levels, status
    ) values (
      p_organization_id, v_user_id, trim(p_title), trim(p_subject), trim(p_description),
      p_delivery_mode, p_lesson_type, p_duration_minutes, p_price_amount,
      p_currency_code, p_package_lessons, coalesce(p_grade_levels, '{}'), p_status
    ) returning id into v_offering_id;
  else
    update public.learning_marketplace_offerings offer
    set title = trim(p_title),
        subject = trim(p_subject),
        description = trim(p_description),
        delivery_mode = p_delivery_mode,
        lesson_type = p_lesson_type,
        duration_minutes = p_duration_minutes,
        price_amount = p_price_amount,
        currency_code = p_currency_code,
        package_lessons = p_package_lessons,
        grade_levels = coalesce(p_grade_levels, '{}'),
        status = p_status,
        updated_at = now()
    where offer.id = p_offering_id
      and offer.organization_id = p_organization_id
      and offer.teacher_user_id = v_user_id
    returning offer.id into v_offering_id;

    if v_offering_id is null then
      raise exception 'Offering not found or access denied';
    end if;
  end if;

  return v_offering_id;
end;
$function$;

create or replace function public.list_learning_marketplace_teacher_offerings()
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  title text,
  subject text,
  description text,
  delivery_mode text,
  lesson_type text,
  duration_minutes integer,
  price_amount numeric,
  currency_code text,
  package_lessons integer,
  grade_levels text[],
  status text,
  created_at timestamptz
)
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
  select offer.id, offer.organization_id, org.name, offer.title, offer.subject,
    offer.description, offer.delivery_mode, offer.lesson_type, offer.duration_minutes,
    offer.price_amount, offer.currency_code, offer.package_lessons, offer.grade_levels,
    offer.status, offer.created_at
  from public.learning_marketplace_offerings offer
  join public.organizations org on org.id = offer.organization_id
  where offer.teacher_user_id = v_user_id
  order by offer.updated_at desc;
end;
$function$;

create or replace function public.list_learning_marketplace_eligible_students()
returns table (
  organization_id uuid,
  organization_name text,
  student_user_id uuid,
  student_name text
)
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
  select distinct o.id, o.name, student.id, coalesce(student.name, 'Student')
  from public.learning_class_memberships cm
  join public.organizations o on o.id = cm.organization_id
  join public.users student on student.id = cm.user_id
  where cm.user_id = v_user_id
    and cm.membership_type = 'student'
    and cm.status = 'active'
  union
  select distinct link.organization_id, o.name, student.id, coalesce(student.name, 'Student')
  from public.learning_parent_student_links link
  join public.organizations o on o.id = link.organization_id
  join public.learning_class_memberships cm
    on cm.organization_id = link.organization_id
   and cm.user_id = link.student_user_id
   and cm.membership_type = 'student'
   and cm.status = 'active'
  join public.users student on student.id = link.student_user_id
  where link.parent_user_id = v_user_id
    and link.status = 'active'
  order by 2, 4;
end;
$function$;

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

  if coalesce(length(p_message), 0) > 2000
     or (p_preferred_time is not null and length(p_preferred_time) > 100)
     or (p_preferred_date is not null and p_preferred_date < current_date) then
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

create or replace function public.list_learning_marketplace_booking_requests()
returns table (
  id uuid,
  offering_id uuid,
  organization_id uuid,
  teacher_user_id uuid,
  teacher_name text,
  offering_title text,
  requester_user_id uuid,
  requester_name text,
  student_user_id uuid,
  student_name text,
  message text,
  preferred_date date,
  preferred_time text,
  status text,
  response_note text,
  created_at timestamptz
)
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
  select
    request.id,
    request.offering_id,
    request.organization_id,
    offer.teacher_user_id,
    coalesce(teacher.name, 'Teacher'),
    offer.title,
    request.requester_user_id,
    coalesce(requester.name, 'Account'),
    request.student_user_id,
    coalesce(student.name, 'Student'),
    request.message,
    request.preferred_date,
    request.preferred_time,
    request.status,
    request.response_note,
    request.created_at
  from public.learning_marketplace_booking_requests request
  join public.learning_marketplace_offerings offer on offer.id = request.offering_id
  join public.users teacher on teacher.id = offer.teacher_user_id
  join public.users requester on requester.id = request.requester_user_id
  join public.users student on student.id = request.student_user_id
  where request.requester_user_id = v_user_id
     or offer.teacher_user_id = v_user_id
  order by request.created_at desc;
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
begin
  if p_status not in ('accepted', 'declined') then
    raise exception 'Only accept or decline responses are allowed';
  end if;

  if p_response_note is not null and length(p_response_note) > 1000 then
    raise exception 'Response note is too long';
  end if;

  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  update public.learning_marketplace_booking_requests request
  set status = p_status,
      response_note = nullif(trim(coalesce(p_response_note, '')), ''),
      updated_at = now()
  from public.learning_marketplace_offerings offer
  where request.id = p_request_id
    and request.offering_id = offer.id
    and offer.teacher_user_id = v_user_id
    and request.status = 'requested'
  returning request.id into v_request_id;

  if v_request_id is null then
    raise exception 'Booking request not found or no longer available';
  end if;

  return v_request_id;
end;
$function$;

revoke all on function public.list_learning_marketplace_teacher_organizations() from public, anon;
revoke all on function public.list_learning_marketplace_offerings() from public, anon;
revoke all on function public.list_learning_marketplace_teacher_offerings() from public, anon;
revoke all on function public.list_learning_marketplace_eligible_students() from public, anon;
revoke all on function public.save_learning_marketplace_offering(uuid, uuid, text, text, text, text, text, integer, numeric, text, integer, text[], text) from public, anon;
revoke all on function public.create_learning_marketplace_booking_request(uuid, uuid, text, date, text) from public, anon;
revoke all on function public.list_learning_marketplace_booking_requests() from public, anon;
revoke all on function public.respond_learning_marketplace_booking_request(uuid, text, text) from public, anon;

grant execute on function public.list_learning_marketplace_teacher_organizations() to authenticated;
grant execute on function public.list_learning_marketplace_offerings() to authenticated;
grant execute on function public.list_learning_marketplace_teacher_offerings() to authenticated;
grant execute on function public.list_learning_marketplace_eligible_students() to authenticated;
grant execute on function public.save_learning_marketplace_offering(uuid, uuid, text, text, text, text, text, integer, numeric, text, integer, text[], text) to authenticated;
grant execute on function public.create_learning_marketplace_booking_request(uuid, uuid, text, date, text) to authenticated;
grant execute on function public.list_learning_marketplace_booking_requests() to authenticated;
grant execute on function public.respond_learning_marketplace_booking_request(uuid, text, text) to authenticated;

commit;
