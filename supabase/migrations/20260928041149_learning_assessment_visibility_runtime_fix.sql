begin;

grant usage on schema private to authenticated;

grant execute on function private.learning_assessment_visible_to_student(uuid)
to authenticated;

grant execute on function private.learning_question_visible_to_student(uuid)
to authenticated;

create or replace function private.learning_assessment_visible_to_student(
  p_assessment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.learning_assessments a
    join public.learning_assignment_items ai
      on ai.assessment_id = a.id
    join public.learning_assignments ass
      on ass.id = ai.assignment_id
    join public.learning_assignment_targets t
      on t.assignment_id = ass.id
    where a.id = p_assessment_id
      and a.status = 'published'
      and ass.status = 'published'
      and t.status = 'active'
      and (
        t.student_user_id = (
          select u.id
          from public.users u
          where u.auth_user_id = (select auth.uid())
        )
        or exists (
          select 1
          from public.learning_class_memberships cm
          where cm.class_group_id = t.class_group_id
            and cm.user_id = (
              select u.id
              from public.users u
              where u.auth_user_id = (select auth.uid())
            )
            and cm.membership_type = 'student'
            and cm.status = 'active'
        )
      )
  );
$$;

revoke execute on function private.learning_assessment_visible_to_student(uuid)
from public, anon;

revoke execute on function private.learning_question_visible_to_student(uuid)
from public, anon;

commit;
