-- Fix recursive SELECT policy on assignment targets.
-- The previous policy called private.learning_assignment_visible(), which queries
-- learning_assignment_targets itself and causes PostgreSQL 42P17 infinite recursion.
-- Keep teacher, student, and parent visibility without querying this table through
-- its own policy.

drop policy if exists learning_assignment_targets_select
  on public.learning_assignment_targets;

create policy learning_assignment_targets_select
on public.learning_assignment_targets
for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or student_user_id = public.learning_current_user_id()
  or (
    class_group_id is not null
    and exists (
      select 1
      from public.learning_class_memberships cm
      where cm.class_group_id = learning_assignment_targets.class_group_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'student'
        and cm.status = 'active'
    )
  )
  or student_user_id in (
    select private.learning_parent_student_ids()
  )
  or (
    class_group_id is not null
    and exists (
      select 1
      from public.learning_class_memberships cm
      where cm.class_group_id = learning_assignment_targets.class_group_id
        and cm.membership_type = 'student'
        and cm.status = 'active'
        and cm.user_id in (
          select private.learning_parent_student_ids()
        )
    )
  )
);

-- The parent-specific SELECT policy duplicated the parent visibility logic in the
-- main SELECT policy and could participate in RLS recursion through class membership.
drop policy if exists learning_parent_assignment_targets_view
  on public.learning_assignment_targets;
