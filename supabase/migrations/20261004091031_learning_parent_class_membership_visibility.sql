drop policy if exists learning_parent_class_memberships_view on public.learning_class_memberships;
create policy learning_parent_class_memberships_view
on public.learning_class_memberships
for select
to authenticated
using (
  user_id in (select private.learning_parent_student_ids())
  or class_group_id in (
    select cm.class_group_id
    from public.learning_class_memberships cm
    where cm.user_id in (select private.learning_parent_student_ids())
      and cm.membership_type = 'student'
      and cm.status = 'active'
  )
);
