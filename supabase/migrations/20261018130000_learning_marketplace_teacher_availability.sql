begin;

create table if not exists public.learning_marketplace_teacher_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teacher_user_id uuid not null references public.users(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone_name text not null default 'Asia/Bangkok'
    check (length(trim(timezone_name)) between 1 and 64),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_marketplace_availability_valid_window check (start_time < end_time),
  constraint learning_marketplace_availability_unique_slot
    unique (organization_id, teacher_user_id, weekday, start_time, end_time)
);

create index if not exists learning_marketplace_availability_public_idx
  on public.learning_marketplace_teacher_availability
    (organization_id, teacher_user_id, weekday, start_time)
  where active;

alter table public.learning_marketplace_teacher_availability enable row level security;
revoke all on public.learning_marketplace_teacher_availability from anon, authenticated;

create or replace function public.list_learning_marketplace_teacher_availability()
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  weekday smallint,
  start_time text,
  end_time text,
  timezone_name text,
  active boolean
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
  select slot.id, slot.organization_id, org.name, slot.weekday,
    to_char(slot.start_time, 'HH24:MI'), to_char(slot.end_time, 'HH24:MI'),
    slot.timezone_name, slot.active
  from public.learning_marketplace_teacher_availability slot
  join public.organizations org on org.id = slot.organization_id
  where slot.teacher_user_id = v_user_id
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = slot.organization_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  order by org.name, slot.weekday, slot.start_time;
end;
$function$;

create or replace function public.list_learning_marketplace_public_availability()
returns table (
  organization_id uuid,
  teacher_user_id uuid,
  weekday smallint,
  start_time text,
  end_time text,
  timezone_name text
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
  select distinct slot.organization_id, slot.teacher_user_id, slot.weekday,
    to_char(slot.start_time, 'HH24:MI'), to_char(slot.end_time, 'HH24:MI'),
    slot.timezone_name
  from public.learning_marketplace_teacher_availability slot
  join public.learning_marketplace_offerings offer
    on offer.organization_id = slot.organization_id
   and offer.teacher_user_id = slot.teacher_user_id
   and offer.status = 'published'
  where slot.active
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = slot.organization_id
        and cm.user_id = slot.teacher_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  order by slot.organization_id, slot.teacher_user_id, slot.weekday, to_char(slot.start_time, 'HH24:MI');
end;
$function$;

create or replace function public.save_learning_marketplace_teacher_availability(
  p_slot_id uuid,
  p_organization_id uuid,
  p_weekday smallint,
  p_start_time time,
  p_end_time time,
  p_timezone_name text,
  p_active boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_slot_id uuid;
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
    raise exception 'Only an active teacher in this organization can manage availability';
  end if;

  if p_weekday not between 0 and 6
     or p_start_time is null or p_end_time is null
     or p_start_time >= p_end_time
     or p_timezone_name is null
     or length(trim(p_timezone_name)) not between 1 and 64 then
    raise exception 'Invalid availability window';
  end if;

  if exists (
    select 1 from public.learning_marketplace_teacher_availability slot
    where slot.organization_id = p_organization_id
      and slot.teacher_user_id = v_user_id
      and slot.weekday = p_weekday
      and slot.active
      and coalesce(slot.id <> p_slot_id, true)
      and p_start_time < slot.end_time
      and p_end_time > slot.start_time
      and coalesce(p_active, true)
  ) then
    raise exception 'Availability windows for the same day cannot overlap';
  end if;

  if p_slot_id is null then
    insert into public.learning_marketplace_teacher_availability (
      organization_id, teacher_user_id, weekday, start_time, end_time, timezone_name, active
    ) values (
      p_organization_id, v_user_id, p_weekday, p_start_time, p_end_time,
      trim(p_timezone_name), coalesce(p_active, true)
    ) returning id into v_slot_id;
  else
    update public.learning_marketplace_teacher_availability slot
    set weekday = p_weekday,
        start_time = p_start_time,
        end_time = p_end_time,
        timezone_name = trim(p_timezone_name),
        active = coalesce(p_active, true),
        updated_at = now()
    where slot.id = p_slot_id
      and slot.organization_id = p_organization_id
      and slot.teacher_user_id = v_user_id
    returning slot.id into v_slot_id;

    if v_slot_id is null then
      raise exception 'Availability slot not found or access denied';
    end if;
  end if;

  return v_slot_id;
end;
$function$;

create or replace function public.delete_learning_marketplace_teacher_availability(p_slot_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_deleted_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  delete from public.learning_marketplace_teacher_availability slot
  where slot.id = p_slot_id
    and slot.teacher_user_id = v_user_id
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = slot.organization_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  returning slot.id into v_deleted_id;

  if v_deleted_id is null then
    raise exception 'Availability slot not found or access denied';
  end if;

  return v_deleted_id;
end;
$function$;

revoke all on function public.list_learning_marketplace_teacher_availability() from public, anon;
revoke all on function public.list_learning_marketplace_public_availability() from public, anon;
revoke all on function public.save_learning_marketplace_teacher_availability(uuid, uuid, smallint, time, time, text, boolean) from public, anon;
revoke all on function public.delete_learning_marketplace_teacher_availability(uuid) from public, anon;

grant execute on function public.list_learning_marketplace_teacher_availability() to authenticated;
grant execute on function public.list_learning_marketplace_public_availability() to authenticated;
grant execute on function public.save_learning_marketplace_teacher_availability(uuid, uuid, smallint, time, time, text, boolean) to authenticated;
grant execute on function public.delete_learning_marketplace_teacher_availability(uuid) to authenticated;

commit;
