-- Avoid self-referential RLS evaluation when exposing class roster rows to parents.
begin;

create or replace function private.learning_parent_class_group_ids_for_org(
  p_organization_id uuid
)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $function$
  select distinct cm.class_group_id
  from public.learning_parent_student_links l
  join public.users parent_profile on parent_profile.id = l.parent_user_id
  join public.organizations o on o.id = l.organization_id
  join public.learning_class_memberships cm
    on cm.organization_id = o.id
   and cm.tenant_id = o.tenant_id
   and cm.user_id = l.student_user_id
   and cm.membership_type = 'student'
   and cm.status = 'active'
  where l.organization_id = p_organization_id
    and l.status = 'active'
    and parent_profile.auth_user_id = (select auth.uid())
    and o.status = 'active';
$function$;

revoke all on function private.learning_parent_class_group_ids_for_org(uuid)
from public, anon;
grant execute on function private.learning_parent_class_group_ids_for_org(uuid)
to authenticated;

drop policy if exists learning_parent_class_memberships_view
on public.learning_class_memberships;
create policy learning_parent_class_memberships_view
on public.learning_class_memberships
for select to authenticated
using (
  private.learning_parent_can_view_student(organization_id, user_id)
  or class_group_id in (
    select private.learning_parent_class_group_ids_for_org(organization_id)
  )
);

commit;
