begin;

create or replace function public.learning_teacher_can_view_student(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_class_memberships student_membership
    join public.learning_class_memberships teacher_membership
      on teacher_membership.class_group_id = student_membership.class_group_id
     and teacher_membership.membership_type = 'teacher'
     and teacher_membership.status = 'active'
    join public.users teacher_user
      on teacher_user.id = teacher_membership.user_id
     and teacher_user.auth_user_id = auth.uid()
    where student_membership.user_id = target_user_id
      and student_membership.membership_type = 'student'
      and student_membership.status = 'active'
  );
$function$;

revoke all on function public.learning_teacher_can_view_student(uuid) from public;
grant execute on function public.learning_teacher_can_view_student(uuid) to authenticated;

drop policy if exists "learning_teacher_student_user_view" on public.users;

create policy "learning_teacher_student_user_view"
on public.users
for select
to authenticated
using (
  public.learning_teacher_can_view_student(users.id)
);

commit;
