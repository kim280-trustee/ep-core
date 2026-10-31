-- Scope every parent-facing student-data policy to the organisation in
-- which the active parent/student relationship exists. The old helper returned
-- all linked student IDs across all organisations and was not row-scope aware.
begin;

create or replace function private.learning_parent_can_view_student(
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
    from public.learning_parent_student_links l
    join public.users parent_profile
      on parent_profile.id = l.parent_user_id
    join public.organizations o
      on o.id = l.organization_id
    join public.learning_class_memberships student_membership
      on student_membership.organization_id = o.id
     and student_membership.tenant_id = o.tenant_id
     and student_membership.user_id = l.student_user_id
     and student_membership.membership_type = 'student'
     and student_membership.status = 'active'
    where l.organization_id = p_organization_id
      and l.student_user_id = p_student_user_id
      and l.status = 'active'
      and parent_profile.auth_user_id = (select auth.uid())
      and o.status = 'active'
  );
$function$;

revoke all on function private.learning_parent_can_view_student(uuid,uuid)
from public, anon;
grant execute on function private.learning_parent_can_view_student(uuid,uuid)
to authenticated;

drop policy if exists learning_parent_assignments_view on public.learning_assignments;
create policy learning_parent_assignments_view
on public.learning_assignments
for select to authenticated
using (
  exists (
    select 1
    from public.learning_assignment_targets t
    where t.organization_id = learning_assignments.organization_id
      and t.assignment_id = learning_assignments.id
      and t.status = 'active'
      and (
        (
          t.student_user_id is not null
          and private.learning_parent_can_view_student(
            learning_assignments.organization_id, t.student_user_id
          )
        )
        or exists (
          select 1
          from public.learning_class_memberships cm
          where cm.organization_id = learning_assignments.organization_id
            and cm.class_group_id = t.class_group_id
            and cm.membership_type = 'student'
            and cm.status = 'active'
            and private.learning_parent_can_view_student(
              learning_assignments.organization_id, cm.user_id
            )
        )
      )
  )
);

drop policy if exists learning_parent_assignment_targets_view on public.learning_assignment_targets;
create policy learning_parent_assignment_targets_view
on public.learning_assignment_targets
for select to authenticated
using (
  (
    student_user_id is not null
    and private.learning_parent_can_view_student(organization_id, student_user_id)
  )
  or exists (
    select 1
    from public.learning_class_memberships cm
    where cm.organization_id = learning_assignment_targets.organization_id
      and cm.class_group_id = learning_assignment_targets.class_group_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
      and private.learning_parent_can_view_student(organization_id, cm.user_id)
  )
);

drop policy if exists learning_parent_assignment_progress_view on public.learning_assignment_progress;
create policy learning_parent_assignment_progress_view
on public.learning_assignment_progress
for select to authenticated
using (
  private.learning_parent_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_parent_gradebook_view on public.learning_gradebook_entries;
create policy learning_parent_gradebook_view
on public.learning_gradebook_entries
for select to authenticated
using (
  private.learning_parent_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_parent_term_grade_view on public.learning_term_grades;
create policy learning_parent_term_grade_view
on public.learning_term_grades
for select to authenticated
using (
  private.learning_parent_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_parent_mastery_view on public.learning_student_mastery;
create policy learning_parent_mastery_view
on public.learning_student_mastery
for select to authenticated
using (
  private.learning_parent_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_parent_mastery_events_view on public.learning_mastery_events;
create policy learning_parent_mastery_events_view
on public.learning_mastery_events
for select to authenticated
using (
  private.learning_parent_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_parent_recommendations_view on public.learning_recommendations;
create policy learning_parent_recommendations_view
on public.learning_recommendations
for select to authenticated
using (
  private.learning_parent_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_parent_activity_view on public.learning_activity_events;
create policy learning_parent_activity_view
on public.learning_activity_events
for select to authenticated
using (
  organization_id is not null
  and private.learning_parent_can_view_student(organization_id, student_user_id)
);

drop policy if exists learning_parent_class_memberships_view on public.learning_class_memberships;
create policy learning_parent_class_memberships_view
on public.learning_class_memberships
for select to authenticated
using (
  private.learning_parent_can_view_student(organization_id, user_id)
  or exists (
    select 1
    from public.learning_class_memberships student_cm
    where student_cm.organization_id = learning_class_memberships.organization_id
      and student_cm.class_group_id = learning_class_memberships.class_group_id
      and student_cm.membership_type = 'student'
      and student_cm.status = 'active'
      and private.learning_parent_can_view_student(
        learning_class_memberships.organization_id, student_cm.user_id
      )
  )
);

drop policy if exists learning_parent_class_subject_view on public.learning_class_subjects;
create policy learning_parent_class_subject_view
on public.learning_class_subjects
for select to authenticated
using (
  exists (
    select 1
    from public.learning_class_memberships cm
    where cm.organization_id = learning_class_subjects.organization_id
      and cm.class_group_id = learning_class_subjects.class_group_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
      and private.learning_parent_can_view_student(
        learning_class_subjects.organization_id, cm.user_id
      )
  )
);

drop policy if exists learning_parent_terms_view on public.learning_terms;
create policy learning_parent_terms_view
on public.learning_terms
for select to authenticated
using (
  exists (
    select 1
    from public.learning_term_grades tg
    where tg.organization_id = learning_terms.organization_id
      and tg.term_id = learning_terms.id
      and private.learning_parent_can_view_student(
        tg.organization_id, tg.student_user_id
      )
  )
);

commit;
