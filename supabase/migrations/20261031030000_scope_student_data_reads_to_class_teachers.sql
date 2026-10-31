begin;

-- Organisation membership alone is not sufficient to read private student
-- learning records. A teacher must share an active class with the student.
create or replace function public.learning_teacher_can_view_student(
  p_organization_id uuid,
  p_student_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_class_memberships teacher_cm
    join public.learning_class_memberships student_cm
      on student_cm.tenant_id = teacher_cm.tenant_id
     and student_cm.organization_id = teacher_cm.organization_id
     and student_cm.class_group_id = teacher_cm.class_group_id
    join public.organizations o
      on o.id = teacher_cm.organization_id
     and o.tenant_id = teacher_cm.tenant_id
    where teacher_cm.organization_id = p_organization_id
      and teacher_cm.user_id = public.learning_current_user_id()
      and teacher_cm.membership_type = 'teacher'
      and teacher_cm.status = 'active'
      and student_cm.user_id = p_student_user_id
      and student_cm.membership_type = 'student'
      and student_cm.status = 'active'
      and o.status = 'active'
  );
$function$;

revoke all on function public.learning_teacher_can_view_student(uuid, uuid)
from public, anon;
grant execute on function public.learning_teacher_can_view_student(uuid, uuid)
to authenticated;

-- Assessment attempts: student, academic manager, or teacher of the student's class.
drop policy if exists learning_attempts_read on public.learning_attempts;
create policy learning_attempts_read on public.learning_attempts
for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.learning_can_manage_academic_records(organization_id)
  or public.learning_teacher_can_view_student(organization_id, student_user_id)
);

-- Attempt answers inherit the access decision from their owning attempt.
drop policy if exists learning_attempt_answers_read on public.learning_attempt_answers;
create policy learning_attempt_answers_read on public.learning_attempt_answers
for select to authenticated
using (
  exists (
    select 1
    from public.learning_attempts a
    where a.id = learning_attempt_answers.attempt_id
      and (
        a.student_user_id = public.learning_current_user_id()
        or public.learning_can_manage_academic_records(a.organization_id)
        or public.learning_teacher_can_view_student(a.organization_id, a.student_user_id)
      )
  )
);

-- Assessment results
drop policy if exists learning_assessment_results_read on public.learning_assessment_results;
create policy learning_assessment_results_read on public.learning_assessment_results
for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.learning_can_manage_academic_records(organization_id)
  or public.learning_teacher_can_view_student(organization_id, student_user_id)
);

-- Assignment progress
drop policy if exists learning_assignment_progress_select on public.learning_assignment_progress;
create policy learning_assignment_progress_select on public.learning_assignment_progress
for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.learning_can_manage_academic_records(organization_id)
  or public.learning_teacher_can_view_student(organization_id, student_user_id)
);

-- Mastery history and current mastery
drop policy if exists learning_mastery_events_read on public.learning_mastery_events;
create policy learning_mastery_events_read on public.learning_mastery_events
for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.learning_can_manage_academic_records(organization_id)
  or public.learning_teacher_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_student_mastery_read on public.learning_student_mastery;
create policy learning_student_mastery_read on public.learning_student_mastery
for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.learning_can_manage_academic_records(organization_id)
  or public.learning_teacher_can_view_student(organization_id, student_user_id)
);

-- Activity events and learning sessions
drop policy if exists learning_activity_events_select on public.learning_activity_events;
create policy learning_activity_events_select on public.learning_activity_events
for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.learning_can_manage_academic_records(organization_id)
  or public.learning_teacher_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_sessions_select on public.learning_sessions;
create policy learning_sessions_select on public.learning_sessions
for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.learning_can_manage_academic_records(organization_id)
  or public.learning_teacher_can_view_student(organization_id, student_user_id)
);

-- Recommendations
drop policy if exists learning_recommendations_read on public.learning_recommendations;
create policy learning_recommendations_read on public.learning_recommendations
for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.learning_can_manage_academic_records(organization_id)
  or public.learning_teacher_can_view_student(organization_id, student_user_id)
);

commit;
