-- A direct-student assignment target is visible only while the student has
-- an active membership in the assignment's organisation.
begin;

create or replace function private.learning_assignment_visible(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_assignments a
    where a.id = target_assignment_id
      and a.status = 'published'
      and exists (
        select 1
        from public.learning_assignment_targets t
        where t.assignment_id = a.id
          and t.status = 'active'
          and (
            (
              t.student_user_id = public.learning_current_user_id()
              and exists (
                select 1
                from public.learning_class_memberships cm
                where cm.organization_id = a.organization_id
                  and cm.user_id = t.student_user_id
                  and cm.membership_type = 'student'
                  and cm.status = 'active'
              )
            )
            or (
              t.class_group_id is not null
              and exists (
                select 1
                from public.learning_class_memberships cm
                where cm.class_group_id = t.class_group_id
                  and cm.organization_id = a.organization_id
                  and cm.user_id = public.learning_current_user_id()
                  and cm.membership_type = 'student'
                  and cm.status = 'active'
              )
            )
          )
      )
  );
$function$;

revoke all on function private.learning_assignment_visible(uuid) from public, anon;
grant execute on function private.learning_assignment_visible(uuid) to authenticated;

commit;
