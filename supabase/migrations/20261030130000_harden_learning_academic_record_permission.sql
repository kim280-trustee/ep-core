-- Restrict privileged academic-record operations to active organization members
-- whose organization-assigned role has learning.academic.manage.
--
-- Use organization_memberships.role_id rather than the tenant-wide user_roles
-- helper so a STAFF membership cannot inherit OWNER/MANAGER access from another
-- organization in the same tenant. Teacher-specific access remains separate.

create or replace function public.learning_can_manage_academic_records(
  target_organization_id uuid
)
returns boolean
language sql
stable
set search_path = ''
as $function$
  select
    exists (
      select 1
      from public.organization_memberships om
      join public.users u
        on u.id = om.user_id
       and u.tenant_id = om.tenant_id
      join public.roles r
        on r.id = om.role_id
       and r.tenant_id = om.tenant_id
      join public.role_permissions rp
        on rp.role_id = r.id
      join public.permissions p
        on p.id = rp.permission_id
      where om.organization_id = target_organization_id
        and om.status = 'active'
        and u.auth_user_id = (select auth.uid())
        and p.code = 'learning.academic.manage'
    )
    and not exists (
      select 1
      from public.learning_class_memberships cm
      where cm.organization_id = target_organization_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'student'
        and cm.status = 'active'
    );
$function$;

comment on function public.learning_can_manage_academic_records(uuid) is
  'True only for active organization members whose organization-assigned role has learning.academic.manage and who are not active student members in the target organization.';
