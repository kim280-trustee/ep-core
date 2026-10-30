-- Replace tenant-wide academic-management permission checks with the
-- permission granted to the actor's active role in the target organization.
-- Existing teacher and marketplace participant protections remain intact.
begin;

CREATE OR REPLACE FUNCTION public.create_learning_school_competition(p_organization_id uuid, p_title text, p_description text, p_target_type text, p_target_value integer, p_bonus_xp integer, p_starts_at timestamp with time zone, p_ends_at timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid;
  v_tenant_id uuid;
  v_competition_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to create a school-wide competition.';
  end if;
  if not public.learning_can_manage_academic_records(p_organization_id) then
    raise exception 'Only school administrators can create school-wide competitions.';
  end if;
  if length(trim(coalesce(p_title, ''))) not between 3 and 100 then
    raise exception 'Competition title must contain 3 to 100 characters.';
  end if;
  if p_target_type not in ('assignments_completed', 'xp_earned')
     or p_target_value not between 1 and 100000
     or p_bonus_xp not between 5 and 100
     or p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'Competition settings are invalid.';
  end if;

  select o.tenant_id into v_tenant_id
  from public.organizations o where o.id = p_organization_id;
  if v_tenant_id is null then
    raise exception 'School organization not found.';
  end if;

  insert into public.learning_school_competitions(
    tenant_id, organization_id, title, description, target_type, target_value,
    bonus_xp, starts_at, ends_at, created_by
  )
  values(
    v_tenant_id, p_organization_id, trim(p_title), coalesce(trim(p_description), ''),
    p_target_type, p_target_value, p_bonus_xp, p_starts_at, p_ends_at, v_user
  )
  returning id into v_competition_id;

  return v_competition_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_learning_vocabulary_analytics(p_organization_id uuid)
 RETURNS TABLE(vocabulary_entry_id uuid, word text, topic text, students_practiced bigint, students_known bigint, students_due bigint, review_count bigint, correct_count bigint, incorrect_count bigint, accuracy_percent numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;
  v_tenant_id uuid;
  v_can_manage boolean := false;
  v_is_teacher boolean := false;
begin
  if p_organization_id is null then
    raise exception 'A school organization is required.' using errcode = '22004';
  end if;

  select u.id, u.tenant_id
    into v_actor_id, v_tenant_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_actor_id is null then
    raise exception 'The authenticated user could not be resolved.' using errcode = '42501';
  end if;

  select public.learning_can_manage_academic_records(p_organization_id)
    into v_can_manage;

  select exists (
    select 1
    from public.learning_class_memberships cm
    where cm.tenant_id = v_tenant_id
      and cm.organization_id = p_organization_id
      and cm.user_id = v_actor_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  )
  into v_is_teacher;

  if not coalesce(v_can_manage, false) and not coalesce(v_is_teacher, false) then
    raise exception 'An active teacher membership or school academic-management permission is required.' using errcode = '42501';
  end if;

  return query
  select
    e.id,
    e.word,
    e.topic,
    count(distinct p.user_id) filter (where p.review_count > 0),
    count(distinct p.user_id) filter (where p.status = 'known'),
    count(distinct p.user_id) filter (where p.next_review_at <= now()),
    coalesce(sum(p.review_count), 0)::bigint,
    coalesce(sum(p.correct_count), 0)::bigint,
    coalesce(sum(p.incorrect_count), 0)::bigint,
    coalesce(
      round(
        sum(p.correct_count)::numeric * 100
        / nullif(sum(p.correct_count + p.incorrect_count), 0),
        2
      ),
      0
    )::numeric
  from public.learning_vocabulary_entries e
  left join public.learning_vocabulary_progress p
    on p.tenant_id = e.tenant_id
   and p.organization_id = e.organization_id
   and p.vocabulary_entry_id = e.id
   and (
     v_can_manage
     or exists (
       select 1
       from public.learning_class_memberships teacher_membership
       join public.learning_class_memberships student_membership
         on student_membership.tenant_id = teacher_membership.tenant_id
        and student_membership.organization_id = teacher_membership.organization_id
        and student_membership.class_group_id = teacher_membership.class_group_id
        and student_membership.membership_type = 'student'
        and student_membership.status = 'active'
       where teacher_membership.tenant_id = e.tenant_id
         and teacher_membership.organization_id = e.organization_id
         and teacher_membership.user_id = v_actor_id
         and teacher_membership.membership_type = 'teacher'
         and teacher_membership.status = 'active'
         and student_membership.user_id = p.user_id
     )
   )
  where e.tenant_id = v_tenant_id
    and e.organization_id = p_organization_id
  group by e.id, e.word, e.topic
  order by e.word;
end;
$function$;

CREATE OR REPLACE FUNCTION public.learning_school_admin_can_view_user(target_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.users current_user_profile
    join public.organization_memberships current_membership
      on current_membership.user_id = current_user_profile.id
     and current_membership.tenant_id = current_user_profile.tenant_id
     and current_membership.status = 'active'
    join public.organization_memberships target_membership
      on target_membership.organization_id = current_membership.organization_id
     and target_membership.tenant_id = current_membership.tenant_id
     and target_membership.status = 'active'
    join public.users target_profile
      on target_profile.id = target_membership.user_id
     and target_profile.tenant_id = target_membership.tenant_id
    where current_user_profile.auth_user_id = (select auth.uid())
      and target_profile.id = target_user_id
      and public.learning_can_manage_academic_records(current_membership.organization_id)
  );
$function$;

CREATE OR REPLACE FUNCTION public.list_learning_marketplace_profiles_for_review()
 RETURNS TABLE(id uuid, organization_id uuid, organization_name text, teacher_user_id uuid, teacher_name text, headline text, bio text, languages text[], credentials text[], experience_years smallint, review_status text, review_note text, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  return query
  select profile.id, profile.organization_id, org.name, profile.teacher_user_id,
    coalesce(teacher.name, 'Teacher'), profile.headline, profile.bio,
    profile.languages, profile.credentials, profile.experience_years,
    profile.review_status, profile.review_note, profile.updated_at
  from public.learning_marketplace_teacher_profiles profile
  join public.organizations org on org.id = profile.organization_id
  join public.users teacher on teacher.id = profile.teacher_user_id
  where profile.review_status = 'pending'
    and public.learning_can_manage_academic_records(profile.organization_id)
    and exists (
      select 1
      from public.organization_memberships manager_membership
      join public.roles manager_role on manager_role.id = manager_membership.role_id
      where manager_membership.organization_id = profile.organization_id
        and manager_membership.user_id = (
          select actor.id from public.users actor
          where actor.auth_user_id = (select auth.uid())
          limit 1
        )
        and manager_membership.status = 'active'
        and upper(manager_role.name) in ('OWNER', 'MANAGER')
        and (manager_role.tenant_id = manager_membership.tenant_id or manager_role.tenant_id is null)
    )
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = profile.organization_id
        and cm.user_id = profile.teacher_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  order by profile.updated_at asc;
end;
$function$;

CREATE OR REPLACE FUNCTION public.list_learning_marketplace_safety_reports()
 RETURNS TABLE(id uuid, organization_id uuid, organization_name text, booking_request_id uuid, offering_title text, reporter_user_id uuid, reported_teacher_user_id uuid, category text, description text, status text, review_note text, created_at timestamp with time zone, reviewed_at timestamp with time zone, can_review boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
           public.learning_can_manage_academic_records(report.organization_id)
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
       public.learning_can_manage_academic_records(report.organization_id)
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

CREATE OR REPLACE FUNCTION public.review_learning_marketplace_safety_report(p_report_id uuid, p_status text, p_review_note text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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

  if not public.learning_can_manage_academic_records(v_organization_id)
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

CREATE OR REPLACE FUNCTION public.review_learning_marketplace_teacher_profile(p_profile_id uuid, p_status text, p_review_note text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;
  v_organization_id uuid;
  v_teacher_user_id uuid;
  v_profile_id uuid;
begin
  if p_status is null or p_status not in ('verified', 'rejected') then
    raise exception 'Profile review status must be verified or rejected';
  end if;
  if p_review_note is not null and length(p_review_note) > 1000 then
    raise exception 'Review note is too long';
  end if;

  select u.id into v_actor_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_actor_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select profile.organization_id, profile.teacher_user_id
    into v_organization_id, v_teacher_user_id
  from public.learning_marketplace_teacher_profiles profile
  where profile.id = p_profile_id
  for update;

  if not found then
    raise exception 'Teacher profile was not found';
  end if;

  if v_actor_id = v_teacher_user_id then
    raise exception 'Teachers cannot review their own profile';
  end if;

  if not public.learning_can_manage_academic_records(v_organization_id)
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
    raise exception 'You do not have permission to review teacher profiles in this school';
  end if;

  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.organization_id = v_organization_id
      and cm.user_id = v_teacher_user_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  ) then
    raise exception 'Only active teachers can have reviewed profiles';
  end if;

  update public.learning_marketplace_teacher_profiles profile
  set review_status = p_status,
      review_note = nullif(trim(coalesce(p_review_note, '')), ''),
      reviewed_by = v_actor_id,
      reviewed_at = now(),
      updated_at = now()
  where profile.id = p_profile_id
    and profile.organization_id = v_organization_id
  returning profile.id into v_profile_id;

  return v_profile_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_learning_school_competition_status(p_competition_id uuid, p_status text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid;
  v_org_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to update a school-wide competition.';
  end if;
  if p_status not in ('active', 'paused', 'ended') then
    raise exception 'Competition status is invalid.';
  end if;

  select c.organization_id into v_org_id
  from public.learning_school_competitions c
  where c.id = p_competition_id;
  if v_org_id is null then
    raise exception 'Competition not found.';
  end if;
  if not public.learning_can_manage_academic_records(v_org_id) then
    raise exception 'Only school administrators can update school-wide competitions.';
  end if;

  update public.learning_school_competitions
  set status = p_status, updated_at = now()
  where id = p_competition_id;

  return p_status;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_learning_staff_membership_status(p_membership_id uuid, p_status text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor uuid;
  v_organization_id uuid;
  v_user_id uuid;
  v_role_id uuid;
  v_current_status text;
  v_role_name text;
  v_tenant_id uuid;
begin
  if p_status is null or p_status not in ('active', 'inactive') then
    raise exception 'Staff status must be active or inactive';
  end if;

  select u.id into v_actor
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;
  if v_actor is null then
    raise exception 'Authenticated E&P user profile not found';
  end if;

  select om.organization_id, om.user_id, om.role_id, om.status, om.tenant_id
    into v_organization_id, v_user_id, v_role_id, v_current_status, v_tenant_id
  from public.organization_memberships om
  where om.id = p_membership_id
  for update;
  if not found then
    raise exception 'Staff membership was not found';
  end if;
  if not public.learning_can_manage_academic_records(v_organization_id) then
    raise exception 'You do not have permission to manage staff in this school';
  end if;
  if v_user_id = v_actor then
    raise exception 'You cannot change your own school membership status';
  end if;

  select upper(r.name) into v_role_name
  from public.roles r
  where r.id = v_role_id
    and (r.tenant_id = v_tenant_id or r.tenant_id is null);

  if v_role_name is distinct from 'STAFF' then
    raise exception 'Only STAFF memberships can be changed here. Owner and manager access is protected.';
  end if;

  if v_current_status = p_status then
    return true;
  end if;

  update public.organization_memberships
  set status = p_status, updated_at = now()
  where id = p_membership_id;

  return found;
end;
$function$;

commit;
