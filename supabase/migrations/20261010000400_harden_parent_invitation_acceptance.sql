-- Ensure expired invitations persist and existing users cannot cross tenants.
begin;
CREATE OR REPLACE FUNCTION public.accept_learning_parent_invitation(p_invitation_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_auth_user_id uuid;
  v_parent_user_id uuid;
  v_invite public.learning_parent_invitations%rowtype;
  v_tenant_id uuid;
  v_name text;
begin
  v_auth_user_id := (select auth.uid());
  if v_auth_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select * into v_invite
  from public.learning_parent_invitations
  where id = p_invitation_id
  for update;

  if not found then
    raise exception 'Parent invitation not found';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'This parent invitation is no longer active';
  end if;

  if v_invite.expires_at < now() then
    update public.learning_parent_invitations
    set status = 'expired', updated_at = now()
    where id = p_invitation_id;
    return null;
  end if;

  if not exists (
    select 1 from auth.users au
    where au.id = v_auth_user_id
      and lower(au.email) = lower(v_invite.parent_email)
  ) then
    raise exception 'The signed-in email does not match this invitation';
  end if;

  select id, tenant_id into v_parent_user_id, v_tenant_id
  from public.users
  where auth_user_id = v_auth_user_id
  limit 1;

  if v_parent_user_id is null then
    select coalesce(
      nullif((select raw_user_meta_data->>'name' from auth.users where id=v_auth_user_id), ''),
      split_part(v_invite.parent_email, '@', 1)
    ) into v_name;

    insert into public.users(tenant_id, name, email, auth_user_id)
    select o.tenant_id, v_name, v_invite.parent_email, v_auth_user_id
    from public.organizations o
    where o.id = v_invite.organization_id
    returning id, tenant_id into v_parent_user_id, v_tenant_id;
  else
    if lower((select email from public.users where id=v_parent_user_id)) <> lower(v_invite.parent_email) then
      raise exception 'The existing E&P profile email does not match this invitation';
    end if;
    if v_tenant_id is distinct from (
      select o.tenant_id from public.organizations o where o.id = v_invite.organization_id
    ) then
      raise exception 'This account belongs to a different tenant and cannot accept this invitation';
    end if;
  end if;

  insert into public.learning_parent_student_links(
    organization_id, parent_user_id, student_user_id, relationship,
    status, created_by, updated_at
  )
  values (
    v_invite.organization_id, v_parent_user_id, v_invite.student_user_id,
    v_invite.relationship, 'active', v_parent_user_id, now()
  )
  on conflict (organization_id, parent_user_id, student_user_id)
  do update set
    relationship = excluded.relationship,
    status = 'active',
    updated_at = now();

  update public.learning_parent_invitations
  set status = 'accepted',
      accepted_by = v_parent_user_id,
      accepted_at = now(),
      updated_at = now()
  where id = p_invitation_id;

  return v_parent_user_id;
end;
$function$

commit;
