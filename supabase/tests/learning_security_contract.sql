-- Read-only contract tests for the Learning authorization migrations.
-- These checks run only against the disposable local Supabase database in CI.
-- They validate deployed policy/function contracts; they do not replace live
-- authenticated role-matrix tests with seeded users.

create or replace function pg_temp.assert_policy_contains(
  p_table text,
  p_policy text,
  p_command text,
  p_fragments text[],
  p_forbidden text[] default array[]::text[]
)
returns void
language plpgsql
as $test$
declare
  v_qual text;
  v_check text;
  v_command text;
  v_expression text;
  v_fragment text;
begin
  select cmd, qual, with_check
    into v_command, v_qual, v_check
  from pg_policies
  where schemaname = 'public'
    and tablename = p_table
    and policyname = p_policy;

  if not found then
    raise exception 'Missing policy %.%', p_table, p_policy;
  end if;

  if upper(v_command) <> upper(p_command) then
    raise exception 'Policy %.% has command %, expected %', p_table, p_policy, v_command, p_command;
  end if;

  v_expression := lower(coalesce(v_qual, '') || ' ' || coalesce(v_check, ''));

  foreach v_fragment in array p_fragments loop
    if position(lower(v_fragment) in v_expression) = 0 then
      raise exception 'Policy %.% is missing required authorization fragment: %', p_table, p_policy, v_fragment;
    end if;
  end loop;

  foreach v_fragment in array p_forbidden loop
    if position(lower(v_fragment) in v_expression) > 0 then
      raise exception 'Policy %.% contains forbidden broad authorization fragment: %', p_table, p_policy, v_fragment;
    end if;
  end loop;
end;
$test$;

do $learning_security_contract$
declare
  v_definition text;
  v_config text[];
  v_has_rls boolean;
begin
  -- Staff must not gain academic-management authority from organization
  -- membership alone. The permission helper must explicitly require the
  -- academic-management permission.
  select lower(pg_get_functiondef('public.learning_can_manage_academic_records(uuid)'::regprocedure))
    into v_definition;
  if position('learning.academic.manage' in v_definition) = 0 then
    raise exception 'Academic management helper does not check learning.academic.manage';
  end if;
  if position('auth.uid()' in v_definition) = 0 then
    raise exception 'Academic management helper does not bind authorization to auth.uid()';
  end if;

  -- Teacher access to private student records must be based on active shared
  -- class membership, not broad organization membership.
  perform pg_temp.assert_policy_contains(
    'learning_attempts', 'learning_attempts_read', 'SELECT',
    array['learning_teacher_can_view_student', 'learning_can_manage_academic_records', 'learning_current_user_id'],
    array['is_organization_member']
  );
  perform pg_temp.assert_policy_contains(
    'learning_attempt_answers', 'learning_attempt_answers_read', 'SELECT',
    array['learning_attempts', 'learning_teacher_can_view_student', 'learning_can_manage_academic_records']
  );
  perform pg_temp.assert_policy_contains(
    'learning_assessment_results', 'learning_assessment_results_read', 'SELECT',
    array['learning_teacher_can_view_student', 'learning_can_manage_academic_records', 'learning_current_user_id'],
    array['is_organization_member']
  );
  perform pg_temp.assert_policy_contains(
    'learning_assignment_progress', 'learning_assignment_progress_select', 'SELECT',
    array['learning_teacher_can_view_student', 'learning_can_manage_academic_records']
  );

  select lower(pg_get_functiondef('public.learning_teacher_can_view_student(uuid,uuid)'::regprocedure))
    into v_definition;
  if position('membership_type' in v_definition) = 0
     or position('teacher' in v_definition) = 0
     or position('student' in v_definition) = 0
     or position('active' in v_definition) = 0
     or position('organization_id' in v_definition) = 0 then
    raise exception 'Teacher student-visibility helper is missing active class/organization scope';
  end if;

  -- Parent access must match the parent, organization, tenant and an active
  -- student enrollment. Global tenant-wide records use the two-argument helper.
  select lower(pg_get_functiondef('private.learning_parent_can_view_student(uuid,uuid)'::regprocedure))
    into v_definition;
  if position('auth.uid()' in v_definition) = 0
     or position('p_organization_id' in v_definition) = 0
     or position('status' in v_definition) = 0
     or position('active' in v_definition) = 0
     or position('tenant_id' in v_definition) = 0 then
    raise exception 'Parent/student visibility helper lacks authenticated, organization, tenant or active-enrollment checks';
  end if;

  select lower(pg_get_functiondef('private.learning_parent_student_ids(uuid,uuid)'::regprocedure))
    into v_definition;
  if position('auth.uid()' in v_definition) = 0
     or position('p_organization_id' in v_definition) = 0
     or position('p_tenant_id' in v_definition) = 0
     or position('membership_type' in v_definition) = 0
     or position('active' in v_definition) = 0 then
    raise exception 'Tenant-aware parent student helper lacks required scope checks';
  end if;

  perform pg_temp.assert_policy_contains(
    'learning_student_mastery', 'learning_parent_mastery_view', 'SELECT',
    array['learning_parent_student_ids']
  );
  perform pg_temp.assert_policy_contains(
    'learning_mastery_events', 'learning_parent_mastery_events_view', 'SELECT',
    array['learning_parent_student_ids']
  );
  perform pg_temp.assert_policy_contains(
    'learning_recommendations', 'learning_parent_recommendations_view', 'SELECT',
    array['learning_parent_student_ids']
  );
  perform pg_temp.assert_policy_contains(
    'users', 'learning_parent_student_user_view', 'SELECT',
    array['learning_parent_student_ids', 'tenant_id']
  );

  -- Parent invitation writes must use the validated RPC, never direct table
  -- INSERT/UPDATE privileges. The RPC must verify active enrollment and role.
  if has_table_privilege('authenticated', 'public.learning_parent_invitations', 'INSERT')
     or has_table_privilege('authenticated', 'public.learning_parent_invitations', 'UPDATE') then
    raise exception 'Authenticated role can directly insert/update parent invitations';
  end if;

  select lower(pg_get_functiondef('public.create_learning_parent_invitation(uuid,text,text,uuid,text)'::regprocedure))
    into v_definition;
  if position('learning_can_manage_academic_records' in v_definition) = 0
     or position('membership_type' in v_definition) = 0
     or position('active' in v_definition) = 0 then
    raise exception 'Parent invitation creation RPC lacks manager and active-enrollment checks';
  end if;

  select lower(pg_get_functiondef('public.accept_learning_parent_invitation(uuid)'::regprocedure))
    into v_definition;
  if position('auth.uid()' in v_definition) = 0
     or position('parent_email' in v_definition) = 0
     or position('membership_type' in v_definition) = 0
     or position('active' in v_definition) = 0 then
    raise exception 'Parent invitation acceptance RPC lacks identity/email/enrollment checks';
  end if;

  -- Students may create only clean in-progress attempts for a published
  -- assessment while actively enrolled; evaluation fields remain server-owned.
  perform pg_temp.assert_policy_contains(
    'learning_attempts', 'learning_attempts_insert', 'INSERT',
    array['auth.uid', 'in_progress', 'submitted_at', 'score', 'previous_attempt_id',
          'learning_class_memberships', 'membership_type', 'active', 'published']
  );

  select lower(pg_get_functiondef('public.submit_learning_attempt(uuid)'::regprocedure))
    into v_definition;
  if position('auth.uid()' in v_definition) = 0
     or position('learning_class_memberships' in v_definition) = 0
     or position('membership_type' in v_definition) = 0
     or position('active' in v_definition) = 0
     or position('submit_learning_attempt_internal' in v_definition) = 0 then
    raise exception 'Assessment submission RPC lacks authenticated active-enrollment revalidation';
  end if;

  if has_function_privilege('authenticated', 'public.submit_learning_attempt_internal(uuid)', 'EXECUTE')
     or has_function_privilege('anon', 'public.submit_learning_attempt_internal(uuid)', 'EXECUTE') then
    raise exception 'Internal assessment evaluator is executable by API roles';
  end if;

  -- Staff/teachers may author only within their own active class or as the
  -- owner of a draft. School-wide authority is permission-gated.
  perform pg_temp.assert_policy_contains(
    'learning_assignments', 'learning_assignments_insert', 'INSERT',
    array['learning_can_create_assignment', 'learning_organization_tenant_matches']
  );
  perform pg_temp.assert_policy_contains(
    'learning_assignments', 'learning_assignments_update', 'UPDATE',
    array['learning_can_manage_assignment', 'learning_can_manage_assignment_fields']
  );
  perform pg_temp.assert_policy_contains(
    'learning_assignments', 'learning_assignments_delete', 'DELETE',
    array['learning_can_manage_assignment']
  );
  perform pg_temp.assert_policy_contains(
    'learning_assessments', 'learning_assessments_insert', 'INSERT',
    array['learning_can_manage_academic_records', 'learning_is_active_teacher', 'created_by']
  );
  perform pg_temp.assert_policy_contains(
    'learning_questions', 'learning_questions_insert', 'INSERT',
    array['learning_can_manage_academic_records', 'learning_is_active_teacher', 'created_by']
  );

  -- Unpublished assessment content must not be exposed to ordinary members.
  perform pg_temp.assert_policy_contains(
    'learning_assessments', 'learning_assessments_read', 'SELECT',
    array['published', 'learning_can_manage_academic_records', 'learning_is_active_teacher']
  );
  perform pg_temp.assert_policy_contains(
    'learning_questions', 'learning_questions_read', 'SELECT',
    array['published', 'learning_can_manage_academic_records', 'learning_is_active_teacher']
  );

  -- Sensitive API functions must never be executable by anonymous callers.
  if has_function_privilege('anon', 'public.accept_learning_parent_invitation(uuid)', 'EXECUTE')
     or has_function_privilege('anon', 'public.create_learning_parent_invitation(uuid,text,text,uuid,text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.submit_learning_attempt(uuid)', 'EXECUTE') then
    raise exception 'Anonymous role can execute a sensitive Learning RPC';
  end if;

  select lower(pg_get_functiondef('private.validate_learning_timetable_entry()'::regprocedure))
    into v_definition;
  if position('cg.tenant_id' in v_definition) > 0
     or position('public.organizations' in v_definition) = 0
     or position('org.tenant_id = new.tenant_id' in v_definition) = 0 then
    raise exception 'Timetable trigger must validate tenant ownership through the organization';
  end if;

  select lower(pg_get_functiondef('public.list_learning_teacher_timetable()'::regprocedure))
    into v_definition;
  if position('class_group.tenant_id' in v_definition) > 0
     or position('org.tenant_id = entry.tenant_id' in v_definition) = 0
     or position('membership_type' in v_definition) = 0 then
    raise exception 'Teacher timetable RPC must validate tenant through organizations and active class membership';
  end if;

  if has_function_privilege('anon', 'public.list_learning_teacher_timetable()', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.list_learning_teacher_timetable()', 'EXECUTE') then
    raise exception 'Teacher timetable RPC must be executable only by authenticated callers';
  end if;

  select lower(pg_get_functiondef('public.list_learning_teacher_timetable()'::regprocedure))
    into v_definition;
  if position('auth.uid()' in v_definition) = 0
     or position('learning_current_user_id()' in v_definition) = 0
     or position('teacher_user_id' in v_definition) = 0
     or position('membership_type' in v_definition) = 0
     or position('active' in v_definition) = 0 then
    raise exception 'Teacher timetable RPC lacks authenticated active-teacher scoping';
  end if;

  perform pg_temp.assert_policy_contains(
    'learning_teacher_leave_requests', 'learning_teacher_leave_requests_select', 'SELECT',
    array['teacher_user_id', 'learning_current_user_id', 'learning_can_manage_academic_records']
  );
  perform pg_temp.assert_policy_contains(
    'learning_teacher_substitute_coverages', 'learning_teacher_substitute_coverages_select', 'SELECT',
    array['absent_teacher_user_id', 'substitute_teacher_user_id', 'learning_current_user_id', 'learning_can_manage_academic_records']
  );

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'learning_teacher_leave_requests' and c.relrowsecurity
  ) or not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'learning_teacher_substitute_coverages' and c.relrowsecurity
  ) then
    raise exception 'Teacher leave and substitute tables must have RLS enabled';
  end if;

  if not has_table_privilege('authenticated', 'public.learning_teacher_leave_requests', 'SELECT')
     or has_table_privilege('authenticated', 'public.learning_teacher_leave_requests', 'INSERT')
     or has_table_privilege('authenticated', 'public.learning_teacher_leave_requests', 'UPDATE')
     or has_table_privilege('authenticated', 'public.learning_teacher_leave_requests', 'DELETE')
     or not has_table_privilege('authenticated', 'public.learning_teacher_substitute_coverages', 'SELECT')
     or has_table_privilege('authenticated', 'public.learning_teacher_substitute_coverages', 'INSERT')
     or has_table_privilege('authenticated', 'public.learning_teacher_substitute_coverages', 'UPDATE')
     or has_table_privilege('authenticated', 'public.learning_teacher_substitute_coverages', 'DELETE') then
    raise exception 'Authenticated users must have read-only table grants for teacher leave and coverage';
  end if;

  if has_function_privilege('anon', 'public.create_learning_teacher_leave_request(uuid,date,date,text,text)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.create_learning_teacher_leave_request(uuid,date,date,text,text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.review_learning_teacher_leave_request(uuid,text,text)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.review_learning_teacher_leave_request(uuid,text,text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.assign_learning_teacher_substitute(uuid,uuid,date,uuid,text)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.assign_learning_teacher_substitute(uuid,uuid,date,uuid,text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.cancel_learning_teacher_substitute_coverage(uuid)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.cancel_learning_teacher_substitute_coverage(uuid)', 'EXECUTE') then
    raise exception 'Teacher leave RPCs must be executable only by authenticated callers';
  end if;

  select lower(pg_get_functiondef('public.create_learning_teacher_leave_request(uuid,date,date,text,text)'::regprocedure))
    into v_definition;
  if position('auth.uid()' in v_definition) = 0
     or position('learning_current_user_id()' in v_definition) = 0
     or position('membership_type' in v_definition) = 0
     or position('teacher' in v_definition) = 0 then
    raise exception 'Teacher leave creation must verify an authenticated active teacher membership';
  end if;

  select lower(pg_get_functiondef('public.review_learning_teacher_leave_request(uuid,text,text)'::regprocedure))
    into v_definition;
  if position('learning_can_manage_academic_records' in v_definition) = 0
     or position('pending' in v_definition) = 0
     or position('auth.uid()' in v_definition) = 0 then
    raise exception 'Teacher leave review must be restricted to managers and pending requests';
  end if;

  select lower(pg_get_functiondef('public.assign_learning_teacher_substitute(uuid,uuid,date,uuid,text)'::regprocedure))
    into v_definition;
  if position('learning_can_manage_academic_records' in v_definition) = 0
     or position('membership_type' in v_definition) = 0
     or position('teacher' in v_definition) = 0
     or position('extract(isodow' in v_definition) = 0
     or position('starts_at' in v_definition) = 0
     or position('ends_at' in v_definition) = 0 then
    raise exception 'Substitute assignment must enforce manager, class, date and timetable-conflict checks';
  end if;

  -- All inspected SECURITY DEFINER authorization helpers must pin search_path.
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private')
      and p.prosecdef
      and p.proname in (
        'learning_can_manage_academic_records',
        'learning_teacher_can_view_student',
        'accept_learning_parent_invitation',
        'create_learning_parent_invitation',
        'submit_learning_attempt',
        'learning_parent_can_view_student',
        'learning_parent_student_ids',
        'list_learning_teacher_timetable',
        'create_learning_teacher_leave_request',
        'review_learning_teacher_leave_request',
        'assign_learning_teacher_substitute',
        'cancel_learning_teacher_substitute_coverage'
      )
      and not coalesce(p.proconfig, array[]::text[]) @> array['search_path=""']
  ) then
    raise exception 'A critical SECURITY DEFINER function does not pin search_path';
  end if;
end;
$learning_security_contract$;
