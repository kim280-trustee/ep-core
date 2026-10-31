-- School-admin profile visibility must use permission in the shared organisation,
-- not a tenant-wide permission that may belong to another organisation.
begin;

create or replace function public.learning_school_admin_can_view_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.users current_user_profile
    join public.organization_memberships current_membership
      on current_membership.user_id = current_user_profile.id
     and current_membership.tenant_id = current_user_profile.tenant_id
     and current_membership.status = 'active'
    join public.organization_memberships target_membership
      on target_membership.organization_id = current_membership.organization_id
     and target_membership.tenant_id = current_membership.tenant_id
     and target_membership.status = 'active'
    join public.users target_profile
      on target_profile.id = target_membership.user_id
     and target_profile.tenant_id = target_membership.tenant_id
    where current_user_profile.auth_user_id = (select auth.uid())
      and target_profile.id = target_user_id
      and public.learning_can_manage_academic_records(current_membership.organization_id)
  );
$function$;

revoke all on function public.learning_school_admin_can_view_user(uuid)
from public, anon;
grant execute on function public.learning_school_admin_can_view_user(uuid)
to authenticated;

commit;
