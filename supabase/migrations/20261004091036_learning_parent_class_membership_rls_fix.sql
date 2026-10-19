create or replace function private.learning_parent_class_group_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select distinct cm.class_group_id
  from public.learning_class_memberships cm
  where cm.user_id in (select private.learning_parent_student_ids())
    and cm.membership_type = 'student'
    and cm.status = 'active'
$$;

revoke execute on function private.learning_parent_class_group_ids() from public;
revoke execute on function private.learning_parent_class_group_ids() from anon;
grant execute on function private.learning_parent_class_group_ids() to authenticated;
grant usage on schema private to authenticated;

drop policy if exists learning_parent_class_memberships_view on public.learning_class_memberships;
create policy learning_parent_class_memberships_view
on public.learning_class_memberships
for select
to authenticated
using (
  user_id in (select private.learning_parent_student_ids())
  or class_group_id in (select private.learning_parent_class_group_ids())
);
