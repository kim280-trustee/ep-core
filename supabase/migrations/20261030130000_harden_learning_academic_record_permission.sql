-- Restrict privileged academic-record operations to active organization members
-- who also hold the tenant-level learning.academic.manage permission.
--
-- Teacher-specific access remains available through the dedicated teacher
-- policies/helpers; this function is for administrative academic operations.

create or replace function public.learning_can_manage_academic_records(
  target_organization_id uuid
)
returns boolean
language sql
stable
set search_path = ''
as $function$
  select
    public.is_organization_member(target_organization_id)
    and public.has_permission('learning.academic.manage')
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
  'True only for active organization members with learning.academic.manage who are not active student members in the target organization.';
