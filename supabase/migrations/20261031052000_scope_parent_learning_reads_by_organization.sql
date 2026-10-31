-- Scope every parent-facing learning record to the organisation in which
-- the parent link and the student's active enrolment both exist.
begin;

create or replace function private.learning_parent_student_ids(p_organization_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $function$
  select distinct l.student_user_id
  from public.learning_parent_student_links l
  join public.users p on p.id = l.parent_user_id
  join public.organizations o on o.id = l.organization_id
  join public.learning_class_memberships cm
    on cm.organization_id = l.organization_id
   and cm.tenant_id = o.tenant_id
   and cm.user_id = l.student_user_id
   and cm.membership_type = 'student'
   and cm.status = 'active'
  where p.auth_user_id = (select auth.uid())
    and l.organization_id = p_organization_id
    and l.status = 'active'
    and o.status = 'active'
$function$;

create or replace function private.learning_parent_class_group_ids(p_organization_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $function$
  select distinct cm.class_group_id
  from public.learning_class_memberships cm
  where cm.organization_id = p_organization_id
    and cm.user_id in (select private.learning_parent_student_ids(p_organization_id))
    and cm.membership_type = 'student'
    and cm.status = 'active'
$function$;

revoke all on function private.learning_parent_student_ids(uuid) from public, anon;
revoke all on function private.learning_parent_class_group_ids(uuid) from public, anon;
grant execute on function private.learning_parent_student_ids(uuid) to authenticated;
grant execute on function private.learning_parent_class_group_ids(uuid) to authenticated;

drop policy if exists learning_parent_class_memberships_view on public.learning_class_memberships;
create policy learning_parent_class_memberships_view
on public.learning_class_memberships for select to authenticated
using (
  user_id in (select private.learning_parent_student_ids(organization_id))
  or class_group_id in (select private.learning_parent_class_group_ids(organization_id))
);

drop policy if exists learning_parent_assignments_view on public.learning_assignments;
create policy learning_parent_assignments_view
on public.learning_assignments for select to authenticated
using (
  exists (
    select 1 from public.learning_assignment_targets t
    where t.assignment_id = learning_assignments.id
      and t.status = 'active'
      and (
        t.student_user_id in (select private.learning_parent_student_ids(learning_assignments.organization_id))
        or (
          t.class_group_id is not null
          and exists (
            select 1 from public.learning_class_memberships cm
            where cm.organization_id = learning_assignments.organization_id
              and cm.class_group_id = t.class_group_id
              and cm.user_id in (select private.learning_parent_student_ids(learning_assignments.organization_id))
              and cm.membership_type = 'student'
              and cm.status = 'active'
          )
        )
      )
  )
);

drop policy if exists learning_parent_assignment_targets_view on public.learning_assignment_targets;
create policy learning_parent_assignment_targets_view
on public.learning_assignment_targets for select to authenticated
using (
  exists (
    select 1 from public.learning_assignments a
    where a.id = learning_assignment_targets.assignment_id
      and a.organization_id is not null
      and (
        learning_assignment_targets.student_user_id in (select private.learning_parent_student_ids(a.organization_id))
        or (
          learning_assignment_targets.class_group_id is not null
          and learning_assignment_targets.class_group_id in (
            select private.learning_parent_class_group_ids(a.organization_id)
          )
        )
      )
  )
);

drop policy if exists learning_parent_assignment_progress_view on public.learning_assignment_progress;
create policy learning_parent_assignment_progress_view
on public.learning_assignment_progress for select to authenticated
using (student_user_id in (select private.learning_parent_student_ids(organization_id)));

drop policy if exists learning_parent_gradebook_view on public.learning_gradebook_entries;
create policy learning_parent_gradebook_view
on public.learning_gradebook_entries for select to authenticated
using (student_user_id in (select private.learning_parent_student_ids(organization_id)));

drop policy if exists learning_parent_term_grade_view on public.learning_term_grades;
create policy learning_parent_term_grade_view
on public.learning_term_grades for select to authenticated
using (student_user_id in (select private.learning_parent_student_ids(organization_id)));

drop policy if exists learning_parent_mastery_view on public.learning_student_mastery;
create policy learning_parent_mastery_view
on public.learning_student_mastery for select to authenticated
using (student_user_id in (select private.learning_parent_student_ids(organization_id)));

drop policy if exists learning_parent_mastery_events_view on public.learning_mastery_events;
create policy learning_parent_mastery_events_view
on public.learning_mastery_events for select to authenticated
using (student_user_id in (select private.learning_parent_student_ids(organization_id)));

drop policy if exists learning_parent_recommendations_view on public.learning_recommendations;
create policy learning_parent_recommendations_view
on public.learning_recommendations for select to authenticated
using (student_user_id in (select private.learning_parent_student_ids(organization_id)));

drop policy if exists learning_parent_activity_view on public.learning_activity_events;
create policy learning_parent_activity_view
on public.learning_activity_events for select to authenticated
using (student_user_id in (select private.learning_parent_student_ids(organization_id)));

drop policy if exists learning_parent_class_subject_view on public.learning_class_subjects;
create policy learning_parent_class_subject_view
on public.learning_class_subjects for select to authenticated
using (
  class_group_id in (select private.learning_parent_class_group_ids(organization_id))
);

drop policy if exists learning_parent_terms_view on public.learning_terms;
create policy learning_parent_terms_view
on public.learning_terms for select to authenticated
using (
  exists (
    select 1 from public.learning_term_grades tg
    where tg.term_id = learning_terms.id
      and tg.organization_id = learning_terms.organization_id
      and tg.student_user_id in (select private.learning_parent_student_ids(learning_terms.organization_id))
  )
);

commit;
