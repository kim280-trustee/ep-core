-- Allow school managers to activate/deactivate STAFF organization memberships safely.
begin;

create or replace function public.set_learning_staff_membership_status(
  p_membership_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor uuid;
  v_organization_id uuid;
  v_user_id uuid;
  v_role_id uuid;
  v_current_status text;
  v_role_name text;
  v_tenant_id uuid;
begin
  if p_status is null or p_status not in ('active', 'inactive') then
    raise exception 'Staff status must be active or inactive';
  end if;

  select u.id into v_actor
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;
  if v_actor is null then
    raise exception 'Authenticated E&P user profile not found';
  end if;

  select om.organization_id, om.user_id, om.role_id, om.status, om.tenant_id
    into v_organization_id, v_user_id, v_role_id, v_current_status, v_tenant_id
  from public.organization_memberships om
  where om.id = p_membership_id
  for update;
  if not found then
    raise exception 'Staff membership was not found';
  end if;
  if not public.is_organization_member(v_organization_id)
     or not public.has_permission('learning.academic.manage') then
    raise exception 'You do not have permission to manage staff in this school';
  end if;
  if v_user_id = v_actor then
    raise exception 'You cannot change your own school membership status';
  end if;

  select upper(r.name) into v_role_name
  from public.roles r
  where r.id = v_role_id
    and (r.tenant_id = v_tenant_id or r.tenant_id is null);

  if v_role_name is distinct from 'STAFF' then
    raise exception 'Only STAFF memberships can be changed here. Owner and manager access is protected.';
  end if;

  if v_current_status = p_status then
    return true;
  end if;

  update public.organization_memberships
  set status = p_status, updated_at = now()
  where id = p_membership_id;

  return found;
end;
$function$;

revoke all on function public.set_learning_staff_membership_status(uuid,text) from public, anon;
grant execute on function public.set_learning_staff_membership_status(uuid,text) to authenticated;

commit;
