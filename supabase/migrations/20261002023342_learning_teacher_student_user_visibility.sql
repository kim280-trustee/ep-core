begin;

create policy "learning_teacher_student_user_view"
on public.users
for select
to authenticated
using (
  exists (
    select 1
    from public.learning_class_memberships target_membership
    join public.learning_class_memberships viewer_membership
      on viewer_membership.class_group_id = target_membership.class_group_id
     and viewer_membership.user_id = public.learning_current_user_id()
     and viewer_membership.membership_type = 'teacher'
     and viewer_membership.status = 'active'
    where target_membership.user_id = users.id
      and target_membership.membership_type = 'student'
      and target_membership.status = 'active'
  )
);

commit;
