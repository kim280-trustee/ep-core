-- School administrators need profile labels for existing class roster rows.
-- Scope access to users who share an active organization with the current
-- administrator, and require the academic-management permission.
create or replace function public.learning_school_admin_can_view_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $function$
  select
    public.has_permission('learning.academic.manage')
    and exists (
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
        and current_user_profile.tenant_id = target_profile.tenant_id
        and target_profile.id = target_user_id
    );
$function$;

revoke all on function public.learning_school_admin_can_view_user(uuid) from public;
grant execute on function public.learning_school_admin_can_view_user(uuid) to authenticated;

drop policy if exists learning_school_admin_roster_user_view on public.users;
create policy learning_school_admin_roster_user_view
on public.users
for select
to authenticated
using (public.learning_school_admin_can_view_user(id));
