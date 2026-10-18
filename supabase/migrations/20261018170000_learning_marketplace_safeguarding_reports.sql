begin;

-- The notification inbox also alerts school reviewers when a safety report is submitted.
alter table public.learning_notifications
  drop constraint if exists learning_notifications_notification_type_check;
alter table public.learning_notifications
  add constraint learning_notifications_notification_type_check
  check (notification_type in (
    'marketplace.booking_requested',
    'marketplace.booking_confirmed',
    'marketplace.booking_declined',
    'marketplace.booking_cancelled',
    'marketplace.safety_reported'
  ));

create table if not exists public.learning_marketplace_safety_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  booking_request_id uuid not null references public.learning_marketplace_booking_requests(id) on delete restrict,
  reporter_user_id uuid not null references public.users(id) on delete cascade,
  reported_teacher_user_id uuid not null references public.users(id) on delete cascade,
  category text not null check (category in (
    'safeguarding_concern',
    'inappropriate_contact',
    'inappropriate_content',
    'harassment_or_discrimination',
    'fraud_or_misrepresentation',
    'other'
  )),
  description text not null check (length(trim(description)) between 20 and 3000),
  status text not null default 'open' check (status in ('open', 'under_review', 'resolved', 'dismissed')),
  review_note text check (review_note is null or length(review_note) <= 2000),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_marketplace_safety_reports_org_status_idx
  on public.learning_marketplace_safety_reports (organization_id, status, created_at desc);
create index if not exists learning_marketplace_safety_reports_reporter_idx
  on public.learning_marketplace_safety_reports (reporter_user_id, created_at desc);

alter table public.learning_marketplace_safety_reports enable row level security;
revoke all on public.learning_marketplace_safety_reports from anon, authenticated;

create or replace function public.create_learning_marketplace_safety_report(
  p_booking_request_id uuid,
  p_category text,
  p_description text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_reporter_id uuid;
  v_organization_id uuid;
  v_requester_id uuid;
  v_student_id uuid;
  v_teacher_id uuid;
  v_report_id uuid;
begin
  select u.id into v_reporter_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_reporter_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if p_category is null or p_category not in (
    'safeguarding_concern',
    'inappropriate_contact',
    'inappropriate_content',
    'harassment_or_discrimination',
    'fraud_or_misrepresentation',
    'other'
  ) then
    raise exception 'Choose a valid safety report category';
  end if;

  if p_description is null or length(trim(p_description)) not between 20 and 3000 then
    raise exception 'Describe the concern in 20 to 3000 characters';
  end if;

  select request.organization_id, request.requester_user_id,
         request.student_user_id, offer.teacher_user_id
    into v_organization_id, v_requester_id, v_student_id, v_teacher_id
  from public.learning_marketplace_booking_requests request
  join public.learning_marketplace_offerings offer
    on offer.id = request.offering_id
   and offer.organization_id = request.organization_id
  where request.id = p_booking_request_id;

  if v_organization_id is null then
    raise exception 'Booking request was not found';
  end if;

  if v_reporter_id not in (v_requester_id, v_student_id, v_teacher_id) then
    raise exception 'Only a participant in this booking can report a safety concern';
  end if;

  if v_reporter_id = v_teacher_id then
    raise exception 'The reported teacher cannot submit a report against themselves';
  end if;

  insert into public.learning_marketplace_safety_reports (
    organization_id, booking_request_id, reporter_user_id,
    reported_teacher_user_id, category, description
  ) values (
    v_organization_id, p_booking_request_id, v_reporter_id,
    v_teacher_id, p_category, trim(p_description)
  ) returning id into v_report_id;

  insert into public.learning_notifications (
    organization_id, recipient_user_id, actor_user_id,
    notification_type, title, body, resource_type, resource_id
  )
  select distinct v_organization_id, manager_membership.user_id, v_reporter_id,
    'marketplace.safety_reported',
    'Marketplace safety report needs review',
    'A safety report was submitted for an extra-class booking.',
    'marketplace_booking', p_booking_request_id
  from public.organization_memberships manager_membership
  join public.roles manager_role on manager_role.id = manager_membership.role_id
  where manager_membership.organization_id = v_organization_id
    and manager_membership.status = 'active'
    and upper(manager_role.name) in ('OWNER', 'MANAGER')
    and (manager_role.tenant_id = manager_membership.tenant_id or manager_role.tenant_id is null)
    and manager_membership.user_id <> v_reporter_id
    and manager_membership.user_id <> v_teacher_id;

  return v_report_id;
end;
$function$;

create or replace function public.list_learning_marketplace_safety_reports()
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  booking_request_id uuid,
  offering_title text,
  reporter_user_id uuid,
  reported_teacher_user_id uuid,
  category text,
  description text,
  status text,
  review_note text,
  created_at timestamptz,
  reviewed_at timestamptz,
  can_review boolean
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare
  v_actor_id uuid;
begin
  select u.id into v_actor_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_actor_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  return query
  select report.id, report.organization_id, org.name,
         report.booking_request_id, offer.title,
         report.reporter_user_id, report.reported_teacher_user_id,
         report.category, report.description, report.status,
         case when report.reporter_user_id = v_actor_id then null else report.review_note end,
         report.created_at, report.reviewed_at,
         (
           public.is_organization_member(report.organization_id)
           and public.has_permission('learning.academic.manage')
           and v_actor_id <> report.reporter_user_id
           and v_actor_id <> report.reported_teacher_user_id
           and exists (
             select 1
             from public.organization_memberships manager_membership
             join public.roles manager_role on manager_role.id = manager_membership.role_id
             where manager_membership.organization_id = report.organization_id
               and manager_membership.user_id = v_actor_id
               and manager_membership.status = 'active'
               and upper(manager_role.name) in ('OWNER', 'MANAGER')
               and (manager_role.tenant_id = manager_membership.tenant_id or manager_role.tenant_id is null)
           )
         ) as can_review
  from public.learning_marketplace_safety_reports report
  join public.organizations org on org.id = report.organization_id
  join public.learning_marketplace_booking_requests request on request.id = report.booking_request_id
  join public.learning_marketplace_offerings offer on offer.id = request.offering_id
  where report.reporter_user_id = v_actor_id
     or (
       public.is_organization_member(report.organization_id)
       and public.has_permission('learning.academic.manage')
       and v_actor_id <> report.reporter_user_id
       and v_actor_id <> report.reported_teacher_user_id
       and exists (
         select 1
         from public.organization_memberships manager_membership
         join public.roles manager_role on manager_role.id = manager_membership.role_id
         where manager_membership.organization_id = report.organization_id
           and manager_membership.user_id = v_actor_id
           and manager_membership.status = 'active'
           and upper(manager_role.name) in ('OWNER', 'MANAGER')
           and (manager_role.tenant_id = manager_membership.tenant_id or manager_role.tenant_id is null)
       )
     )
  order by report.created_at desc, report.id desc;
end;
$function$;

create or replace function public.review_learning_marketplace_safety_report(
  p_report_id uuid,
  p_status text,
  p_review_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor_id uuid;
  v_organization_id uuid;
  v_reporter_id uuid;
  v_teacher_id uuid;
  v_report_id uuid;
begin
  if p_status is null or p_status not in ('under_review', 'resolved', 'dismissed') then
    raise exception 'Choose a valid safety report review status';
  end if;
  if p_review_note is not null and length(p_review_note) > 2000 then
    raise exception 'Review note is too long';
  end if;

  select u.id into v_actor_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_actor_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select report.organization_id, report.reporter_user_id, report.reported_teacher_user_id
    into v_organization_id, v_reporter_id, v_teacher_id
  from public.learning_marketplace_safety_reports report
  where report.id = p_report_id
  for update;

  if v_organization_id is null then
    raise exception 'Safety report was not found';
  end if;

  if v_actor_id = v_reporter_id or v_actor_id = v_teacher_id then
    raise exception 'A report participant cannot review this report';
  end if;

  if not public.is_organization_member(v_organization_id)
     or not public.has_permission('learning.academic.manage')
     or not exists (
       select 1
       from public.organization_memberships manager_membership
       join public.roles manager_role on manager_role.id = manager_membership.role_id
       where manager_membership.organization_id = v_organization_id
         and manager_membership.user_id = v_actor_id
         and manager_membership.status = 'active'
         and upper(manager_role.name) in ('OWNER', 'MANAGER')
         and (manager_role.tenant_id = manager_membership.tenant_id or manager_role.tenant_id is null)
     ) then
    raise exception 'Only an authorized school owner or manager can review this report';
  end if;

  update public.learning_marketplace_safety_reports report
  set status = p_status,
      review_note = nullif(trim(coalesce(p_review_note, '')), ''),
      reviewed_by = v_actor_id,
      reviewed_at = now(),
      updated_at = now()
  where report.id = p_report_id
  returning report.id into v_report_id;

  return v_report_id;
end;
$function$;

revoke all on function public.create_learning_marketplace_safety_report(uuid, text, text) from public, anon;
revoke all on function public.list_learning_marketplace_safety_reports() from public, anon;
revoke all on function public.review_learning_marketplace_safety_report(uuid, text, text) from public, anon;

grant execute on function public.create_learning_marketplace_safety_report(uuid, text, text) to authenticated;
grant execute on function public.list_learning_marketplace_safety_reports() to authenticated;
grant execute on function public.review_learning_marketplace_safety_report(uuid, text, text) to authenticated;

commit;
