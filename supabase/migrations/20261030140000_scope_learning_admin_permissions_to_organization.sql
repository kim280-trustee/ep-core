-- Scope calendar, intervention, and attendance manager privileges to the
-- permission assigned to the user's active role in the target organization.
-- Teacher class-membership branches are intentionally preserved.
begin;

CREATE OR REPLACE FUNCTION public.cancel_learning_school_calendar_event(p_event_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid;
  v_organization_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;

  select e.organization_id into v_organization_id
  from public.learning_school_calendar_events e
  where e.id = p_event_id
  for update;
  if v_organization_id is null then raise exception 'Calendar event not found'; end if;

  if not exists (
    select 1 from public.organizations o
    where o.id = v_organization_id and o.status = 'active'
      and exists (
        select 1 from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and public.learning_can_manage_academic_records(o.id)
      )
  ) then raise exception 'Only an active school owner or manager can cancel this calendar event'; end if;

  update public.learning_school_calendar_events
  set status = 'cancelled', updated_at = now()
  where id = p_event_id and status <> 'cancelled';
  return found;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_learning_intervention_case(p_class_group_id uuid, p_student_user_id uuid, p_category text, p_priority text, p_title text, p_notes text, p_evidence_reference text DEFAULT NULL::text, p_review_date date DEFAULT NULL::date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_tenant_id uuid;
  v_case_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if p_category not in ('missing_assignment', 'assessment_result', 'learning_objective', 'teacher_observation', 'other') then
    raise exception 'Choose a valid support reason';
  end if;
  if p_priority not in ('low', 'normal', 'high') then
    raise exception 'Choose a valid priority';
  end if;
  if length(trim(coalesce(p_title, ''))) not between 1 and 120 then
    raise exception 'Title must contain 1 to 120 characters';
  end if;
  if length(trim(coalesce(p_notes, ''))) not between 1 and 3000 then
    raise exception 'Notes must contain 1 to 3000 characters';
  end if;
  if length(trim(coalesce(p_evidence_reference, ''))) > 160 then
    raise exception 'Evidence reference must be 160 characters or fewer';
  end if;

  select cg.organization_id, cg.tenant_id
    into v_organization_id, v_tenant_id
  from public.learning_class_groups cg
  join public.organizations o on o.id = cg.organization_id and o.status = 'active'
  where cg.id = p_class_group_id
    and cg.status = 'active';

  if v_organization_id is null then
    raise exception 'Select an active class';
  end if;

  if not exists (
    select 1
    from public.learning_class_memberships cm
    where cm.organization_id = v_organization_id
      and cm.class_group_id = p_class_group_id
      and cm.user_id = p_student_user_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
  ) then
    raise exception 'Select a student actively enrolled in this class';
  end if;

  if not (
    exists (
      select 1
      from public.learning_class_memberships cm
      where cm.organization_id = v_organization_id
        and cm.class_group_id = p_class_group_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
    or exists (
      select 1
      from public.organization_memberships om
      join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
      where om.user_id = v_user_id
        and om.organization_id = v_organization_id
        and om.status = 'active'
        and upper(trim(r.name)) in ('OWNER', 'MANAGER')
        and public.learning_can_manage_academic_records(v_organization_id)
    )
  ) then
    raise exception 'You are not authorized to record support for this class';
  end if;

  insert into public.learning_intervention_cases (
    tenant_id, organization_id, class_group_id, student_user_id,
    category, priority, status, title, notes, evidence_reference, review_date,
    created_by, updated_by
  ) values (
    v_tenant_id, v_organization_id, p_class_group_id, p_student_user_id,
    p_category, p_priority, 'open', trim(p_title), trim(p_notes),
    nullif(trim(coalesce(p_evidence_reference, '')), ''), p_review_date,
    v_user_id, v_user_id
  )
  returning id into v_case_id;

  return v_case_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_learning_school_calendar_event(p_organization_id uuid, p_academic_year_id uuid, p_term_id uuid, p_class_group_id uuid, p_event_type text, p_title text, p_description text, p_start_date date, p_end_date date, p_is_all_day boolean, p_start_time time without time zone, p_end_time time without time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user_id uuid; v_tenant_id uuid; v_event_id uuid;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  if length(trim(coalesce(p_title, ''))) not between 1 and 120 then raise exception 'Title must contain 1 to 120 characters'; end if;
  if length(trim(coalesce(p_description, ''))) > 3000 then raise exception 'Description must contain 3,000 characters or fewer'; end if;
  if p_event_type not in ('school_event', 'holiday', 'examination', 'assessment_deadline') then raise exception 'Choose a valid event type'; end if;
  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then raise exception 'End date must be on or after start date'; end if;
  if not coalesce(p_is_all_day, true) and (p_start_time is null or p_end_time is null) then raise exception 'Start and end times are required for timed events'; end if;
  if not coalesce(p_is_all_day, true) and p_start_date = p_end_date and p_end_time <= p_start_time then raise exception 'End time must be after start time'; end if;

  select o.tenant_id into v_tenant_id
  from public.organizations o
  where o.id = p_organization_id and o.status = 'active'
    and exists (
      select 1 from public.organization_memberships om
      join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
      where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
        and upper(trim(r.name)) in ('OWNER', 'MANAGER')
        and public.learning_can_manage_academic_records(o.id)
    );
  if v_tenant_id is null then raise exception 'Only an active school owner or manager can manage this calendar'; end if;

  if p_academic_year_id is not null and not exists (
    select 1 from public.learning_academic_years ay where ay.id = p_academic_year_id and ay.organization_id = p_organization_id
  ) then raise exception 'Academic year must belong to the selected school'; end if;
  if p_term_id is not null and not exists (
    select 1 from public.learning_terms t where t.id = p_term_id and t.organization_id = p_organization_id
      and (p_academic_year_id is null or t.academic_year_id = p_academic_year_id)
  ) then raise exception 'Term must belong to the selected school and academic year'; end if;
  if p_class_group_id is not null and not exists (
    select 1 from public.learning_class_groups cg where cg.id = p_class_group_id and cg.organization_id = p_organization_id and cg.status = 'active'
      and (p_academic_year_id is null or cg.academic_year_id = p_academic_year_id)
  ) then raise exception 'Class must be active and belong to the selected school and academic year'; end if;

  insert into public.learning_school_calendar_events (
    tenant_id, organization_id, academic_year_id, term_id, class_group_id,
    event_type, title, description, start_date, end_date, is_all_day,
    start_time, end_time, status, created_by
  ) values (
    v_tenant_id, p_organization_id, p_academic_year_id, p_term_id, p_class_group_id,
    p_event_type, trim(p_title), trim(coalesce(p_description, '')), p_start_date, p_end_date,
    coalesce(p_is_all_day, true), case when coalesce(p_is_all_day, true) then null else p_start_time end,
    case when coalesce(p_is_all_day, true) then null else p_end_time end, 'draft', v_user_id
  ) returning id into v_event_id;
  return v_event_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.learning_guard_attendance_session_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if tg_op = 'INSERT' then
    if new.status is distinct from 'open' then
      raise exception 'New attendance registers must start open and be submitted through the validated workflow';
    end if;
    new.submitted_at := null;
    return new;
  end if;

  if new.tenant_id is distinct from old.tenant_id
    or new.organization_id is distinct from old.organization_id
    or new.class_group_id is distinct from old.class_group_id
    or new.attendance_date is distinct from old.attendance_date then
    raise exception 'An attendance register cannot be moved to another school, class, or date';
  end if;

  if old.status = 'submitted' then
    new.status := 'submitted';
    new.submitted_at := old.submitted_at;
  elsif new.status = 'submitted' then
    if not (
      (
        public.learning_can_manage_academic_records(new.organization_id)
        and public.is_organization_member(new.organization_id)
      )
      or exists (
        select 1
        from public.learning_class_memberships cm
        where cm.tenant_id = new.tenant_id
          and cm.organization_id = new.organization_id
          and cm.class_group_id = new.class_group_id
          and cm.user_id = public.learning_current_user_id()
          and cm.membership_type = 'teacher'
          and cm.status = 'active'
      )
    ) then
      raise exception 'You do not have permission to submit this attendance register';
    end if;

    if exists (
      select 1
      from public.learning_class_memberships cm
      where cm.tenant_id = new.tenant_id
        and cm.organization_id = new.organization_id
        and cm.class_group_id = new.class_group_id
        and cm.membership_type = 'student'
        and cm.status = 'active'
        and not exists (
          select 1
          from public.learning_attendance_records r
          where r.tenant_id = new.tenant_id
            and r.organization_id = new.organization_id
            and r.attendance_session_id = new.id
            and r.student_user_id = cm.user_id
        )
    ) then
      raise exception 'Mark every active student before submitting the attendance register';
    end if;

    new.submitted_at := coalesce(new.submitted_at, now());
  else
    new.submitted_at := null;
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.list_learning_intervention_cases(p_class_group_id uuid DEFAULT NULL::uuid, p_status text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, organization_id uuid, class_group_id uuid, class_name text, class_code text, student_user_id uuid, student_name text, category text, priority text, status text, title text, notes text, evidence_reference text, review_date date, outcome text, created_by uuid, created_by_name text, created_at timestamp with time zone, updated_at timestamp with time zone, resolved_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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

  if p_status is not null and p_status not in ('open', 'in_progress', 'resolved') then
    raise exception 'Invalid intervention status filter';
  end if;

  return query
  select c.id, c.organization_id, c.class_group_id, cg.name, cg.code,
         c.student_user_id, coalesce(student.name, 'Student'),
         c.category, c.priority, c.status, c.title, c.notes,
         c.evidence_reference, c.review_date, c.outcome, c.created_by,
         coalesce(creator.name, 'Teacher'), c.created_at, c.updated_at, c.resolved_at
  from public.learning_intervention_cases c
  join public.learning_class_groups cg
    on cg.id = c.class_group_id
   and cg.organization_id = c.organization_id
  join public.organizations o
    on o.id = c.organization_id
   and o.status = 'active'
  left join public.users student on student.id = c.student_user_id
  left join public.users creator on creator.id = c.created_by
  where (p_class_group_id is null or c.class_group_id = p_class_group_id)
    and (p_status is null or c.status = p_status)
    and (
      exists (
        select 1
        from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id
          and om.organization_id = c.organization_id
          and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and public.learning_can_manage_academic_records(c.organization_id)
      )
      or exists (
        select 1
        from public.learning_class_memberships cm
        where cm.organization_id = c.organization_id
          and cm.class_group_id = c.class_group_id
          and cm.user_id = v_user_id
          and cm.membership_type = 'teacher'
          and cm.status = 'active'
      )
    )
  order by
    case c.status when 'open' then 0 when 'in_progress' then 1 else 2 end,
    c.review_date asc nulls last,
    c.updated_at desc
  limit 500;
end;
$function$;

CREATE OR REPLACE FUNCTION public.list_learning_school_calendar_events(p_start_date date, p_end_date date)
 RETURNS TABLE(id uuid, organization_id uuid, organization_name text, academic_year_name text, term_name text, class_group_id uuid, class_name text, event_type text, title text, description text, start_date date, end_date date, is_all_day boolean, start_time time without time zone, end_time time without time zone, published_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user_id uuid;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  if p_start_date is null or p_end_date is null or p_start_date > p_end_date then raise exception 'Choose a valid calendar date range'; end if;

  return query
  select distinct e.id, e.organization_id, o.name, ay.name, t.name, e.class_group_id, cg.name,
         e.event_type, e.title, e.description, e.start_date, e.end_date, e.is_all_day,
         e.start_time, e.end_time, e.published_at
  from public.learning_school_calendar_events e
  join public.organizations o on o.id = e.organization_id and o.status = 'active'
  left join public.learning_academic_years ay on ay.id = e.academic_year_id and ay.organization_id = e.organization_id
  left join public.learning_terms t on t.id = e.term_id and t.organization_id = e.organization_id
  left join public.learning_class_groups cg on cg.id = e.class_group_id and cg.organization_id = e.organization_id
  where e.status = 'published'
    and e.start_date <= p_end_date and e.end_date >= p_start_date
    and (e.class_group_id is null or cg.status = 'active')
    and (
      exists (
        select 1 from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id and om.organization_id = e.organization_id and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and public.learning_can_manage_academic_records(e.organization_id)
      )
      or (
        e.class_group_id is null
        and (
          exists (
            select 1 from public.learning_class_memberships cm
            where cm.organization_id = e.organization_id and cm.user_id = v_user_id and cm.status = 'active'
          )
          or exists (
            select 1 from public.learning_parent_student_links l
            join public.learning_class_memberships cm on cm.organization_id = l.organization_id and cm.user_id = l.student_user_id and cm.membership_type = 'student' and cm.status = 'active'
            where l.organization_id = e.organization_id and l.parent_user_id = v_user_id and l.status = 'active'
          )
        )
      )
      or (
        e.class_group_id is not null
        and (
          exists (
            select 1 from public.learning_class_memberships cm
            where cm.organization_id = e.organization_id and cm.class_group_id = e.class_group_id and cm.user_id = v_user_id and cm.status = 'active'
          )
          or exists (
            select 1 from public.learning_parent_student_links l
            join public.learning_class_memberships cm on cm.organization_id = l.organization_id and cm.user_id = l.student_user_id and cm.membership_type = 'student' and cm.status = 'active'
            where l.organization_id = e.organization_id and l.parent_user_id = v_user_id and l.status = 'active' and cm.class_group_id = e.class_group_id
          )
        )
      )
    )
  order by e.start_date, e.start_time nulls first, e.title
  limit 1000;
end;
$function$;

CREATE OR REPLACE FUNCTION public.list_manageable_learning_calendar_events(p_organization_id uuid, p_start_date date, p_end_date date)
 RETURNS TABLE(id uuid, organization_id uuid, academic_year_id uuid, academic_year_name text, term_id uuid, term_name text, class_group_id uuid, class_name text, event_type text, title text, description text, start_date date, end_date date, is_all_day boolean, start_time time without time zone, end_time time without time zone, status text, created_at timestamp with time zone, published_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user_id uuid;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  if p_start_date is null or p_end_date is null or p_start_date > p_end_date then
    raise exception 'Choose a valid calendar date range';
  end if;
  if not exists (
    select 1 from public.organizations o
    where o.id = p_organization_id and o.status = 'active'
      and exists (
        select 1 from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and public.learning_can_manage_academic_records(o.id)
      )
  ) then raise exception 'You cannot manage the selected school calendar'; end if;

  return query
  select e.id, e.organization_id, e.academic_year_id, ay.name, e.term_id, t.name,
         e.class_group_id, cg.name, e.event_type, e.title, e.description,
         e.start_date, e.end_date, e.is_all_day, e.start_time, e.end_time,
         e.status, e.created_at, e.published_at
  from public.learning_school_calendar_events e
  left join public.learning_academic_years ay on ay.id = e.academic_year_id and ay.organization_id = e.organization_id
  left join public.learning_terms t on t.id = e.term_id and t.organization_id = e.organization_id
  left join public.learning_class_groups cg on cg.id = e.class_group_id and cg.organization_id = e.organization_id
  where e.organization_id = p_organization_id
    and e.start_date <= p_end_date and e.end_date >= p_start_date
  order by e.start_date, e.start_time nulls first, e.title
  limit 500;
end;
$function$;

CREATE OR REPLACE FUNCTION public.list_manageable_learning_calendar_organizations()
 RETURNS TABLE(id uuid, name text, code text, timezone text, tenant_id uuid)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user_id uuid;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  return query
  select o.id, o.name, o.code, o.timezone, o.tenant_id
  from public.organizations o
  where o.status = 'active'
    and exists (
      select 1
      from public.organization_memberships om
      join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
      where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
        and upper(trim(r.name)) in ('OWNER', 'MANAGER')
        and public.learning_can_manage_academic_records(o.id)
    )
  order by o.name;
end;
$function$;

CREATE OR REPLACE FUNCTION public.publish_learning_school_calendar_event(p_event_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user_id uuid; v_organization_id uuid; v_status text;
begin
  select u.id into v_user_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then raise exception 'Authenticated user profile not found'; end if;
  select e.organization_id, e.status into v_organization_id, v_status
  from public.learning_school_calendar_events e where e.id = p_event_id for update;
  if v_organization_id is null then raise exception 'Calendar event not found'; end if;
  if v_status <> 'draft' then raise exception 'Only draft calendar events can be published'; end if;
  if not exists (
    select 1 from public.organizations o
    where o.id = v_organization_id and o.status = 'active'
      and exists (
        select 1 from public.organization_memberships om
        join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
        where om.user_id = v_user_id and om.organization_id = o.id and om.status = 'active'
          and upper(trim(r.name)) in ('OWNER', 'MANAGER')
          and public.learning_can_manage_academic_records(o.id)
      )
  ) then raise exception 'Only an active school owner or manager can publish this calendar event'; end if;
  update public.learning_school_calendar_events set status = 'published', published_at = now(), updated_at = now() where id = p_event_id;
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.submit_learning_attendance_register(p_session_id uuid)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid;
  v_session public.learning_attendance_sessions%rowtype;
begin
  v_user_id := public.learning_current_user_id();
  if v_user_id is null then
    raise exception 'Sign in before submitting an attendance register';
  end if;

  select s.* into v_session
  from public.learning_attendance_sessions s
  where s.id = p_session_id
  for update;

  if not found then
    raise exception 'Attendance register not found';
  end if;

  if not (
    (
      public.learning_can_manage_academic_records(v_session.organization_id)
      and public.is_organization_member(v_session.organization_id)
    )
    or exists (
      select 1
      from public.learning_class_memberships cm
      where cm.tenant_id = v_session.tenant_id
        and cm.organization_id = v_session.organization_id
        and cm.class_group_id = v_session.class_group_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  ) then
    raise exception 'You do not have permission to submit this attendance register';
  end if;

  if v_session.status = 'submitted' then
    return v_session.submitted_at;
  end if;

  update public.learning_attendance_sessions
  set status = 'submitted',
      submitted_at = coalesce(submitted_at, now()),
      updated_at = now()
  where id = v_session.id
  returning submitted_at into v_session.submitted_at;

  return v_session.submitted_at;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_intervention_case(p_case_id uuid, p_status text, p_priority text, p_notes text, p_evidence_reference text DEFAULT NULL::text, p_review_date date DEFAULT NULL::date, p_outcome text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_class_group_id uuid;
  v_updated integer;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if p_status not in ('open', 'in_progress', 'resolved') then
    raise exception 'Choose a valid intervention status';
  end if;
  if p_priority not in ('low', 'normal', 'high') then
    raise exception 'Choose a valid priority';
  end if;
  if length(trim(coalesce(p_notes, ''))) not between 1 and 3000 then
    raise exception 'Notes must contain 1 to 3000 characters';
  end if;
  if length(trim(coalesce(p_evidence_reference, ''))) > 160 then
    raise exception 'Evidence reference must be 160 characters or fewer';
  end if;
  if length(trim(coalesce(p_outcome, ''))) > 2000 then
    raise exception 'Outcome must be 2,000 characters or fewer';
  end if;

  select c.organization_id, c.class_group_id
    into v_organization_id, v_class_group_id
  from public.learning_intervention_cases c
  where c.id = p_case_id
  for update;

  if v_organization_id is null then
    raise exception 'Intervention case not found';
  end if;

  if not (
    exists (
      select 1
      from public.learning_class_memberships cm
      where cm.organization_id = v_organization_id
        and cm.class_group_id = v_class_group_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
    or exists (
      select 1
      from public.organization_memberships om
      join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
      where om.user_id = v_user_id
        and om.organization_id = v_organization_id
        and om.status = 'active'
        and upper(trim(r.name)) in ('OWNER', 'MANAGER')
        and public.learning_can_manage_academic_records(v_organization_id)
    )
  ) then
    raise exception 'You are not authorized to update this support case';
  end if;

  update public.learning_intervention_cases
  set status = p_status,
      priority = p_priority,
      notes = trim(p_notes),
      evidence_reference = nullif(trim(coalesce(p_evidence_reference, '')), ''),
      review_date = p_review_date,
      outcome = nullif(trim(coalesce(p_outcome, '')), ''),
      updated_by = v_user_id,
      updated_at = now(),
      resolved_at = case when p_status = 'resolved' then coalesce(resolved_at, now()) else null end
  where id = p_case_id;

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$function$;

commit;
