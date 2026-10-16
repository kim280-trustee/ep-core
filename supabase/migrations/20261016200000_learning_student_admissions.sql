-- Secure school-managed student invitations and class enrollment.
begin;

create table if not exists public.learning_student_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  student_email text not null,
  student_name text not null,
  status text not null default 'pending'
    check (status in ('pending','accepted','revoked','expired')),
  invited_by uuid not null,
  accepted_by uuid,
  invited_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id)
    references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, class_group_id)
    references public.learning_class_groups(organization_id, id) on delete cascade,
  foreign key (tenant_id, invited_by)
    references public.users(tenant_id, id) on delete restrict,
  foreign key (tenant_id, accepted_by)
    references public.users(tenant_id, id) on delete restrict
);

create index if not exists learning_student_invitations_email_status_idx
  on public.learning_student_invitations (lower(student_email), status);
create index if not exists learning_student_invitations_class_status_idx
  on public.learning_student_invitations (organization_id, class_group_id, status);

alter table public.learning_student_invitations enable row level security;
grant select on public.learning_student_invitations to authenticated;

drop policy if exists learning_student_invitations_manager_select
  on public.learning_student_invitations;
create policy learning_student_invitations_manager_select
on public.learning_student_invitations
for select to authenticated
using (public.learning_can_manage_academic_records(organization_id));

create or replace function public.create_learning_student_invitation(
  p_organization_id uuid,
  p_class_group_id uuid,
  p_student_email text,
  p_student_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor uuid;
  v_tenant_id uuid;
  v_email text;
  v_name text;
  v_invitation_id uuid;
begin
  select u.id into v_actor
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_actor is null then
    raise exception 'Authenticated E&P user profile not found';
  end if;
  if not public.learning_can_manage_academic_records(p_organization_id) then
    raise exception 'You do not have permission to admit students to this school';
  end if;

  v_email := lower(trim(p_student_email));
  v_name := trim(p_student_name);
  if v_email is null or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
    raise exception 'Enter a valid student email address';
  end if;
  if v_name is null or v_name = '' or length(v_name) > 120 then
    raise exception 'Student name is required and must be 120 characters or fewer';
  end if;

  select o.tenant_id into v_tenant_id
  from public.organizations o
  where o.id = p_organization_id and o.status = 'active';
  if v_tenant_id is null then
    raise exception 'School not found or inactive';
  end if;

  if not exists (
    select 1 from public.learning_class_groups cg
    where cg.id = p_class_group_id
      and cg.organization_id = p_organization_id
      and cg.status = 'active'
  ) then
    raise exception 'Choose an active class in this school';
  end if;

  if exists (
    select 1 from public.users u
    where lower(u.email) = v_email
      and (u.auth_user_id is not null or u.tenant_id <> v_tenant_id)
  ) then
    raise exception 'An E&P account already exists for this email. Add the existing account to the class roster instead.';
  end if;

  update public.learning_student_invitations
  set status = 'revoked', updated_at = now()
  where organization_id = p_organization_id
    and class_group_id = p_class_group_id
    and lower(student_email) = v_email
    and status = 'pending';

  insert into public.learning_student_invitations (
    tenant_id, organization_id, class_group_id, student_email,
    student_name, status, invited_by, expires_at, updated_at
  ) values (
    v_tenant_id, p_organization_id, p_class_group_id, v_email,
    v_name, 'pending', v_actor, now() + interval '7 days', now()
  )
  returning id into v_invitation_id;

  return v_invitation_id;
end;
$function$;

create or replace function public.revoke_learning_student_invitation(
  p_invitation_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_organization_id uuid;
begin
  select i.organization_id into v_organization_id
  from public.learning_student_invitations i
  where i.id = p_invitation_id
    and i.status = 'pending'
  for update;

  if v_organization_id is null then
    return false;
  end if;
  if not public.learning_can_manage_academic_records(v_organization_id) then
    raise exception 'You do not have permission to revoke this invitation';
  end if;

  update public.learning_student_invitations
  set status = 'revoked', updated_at = now()
  where id = p_invitation_id and status = 'pending';
  return found;
end;
$function$;

create or replace function public.accept_learning_student_invitation(
  p_invitation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid;
  v_auth_email text;
  v_org_tenant_id uuid;
  v_profile_id uuid;
  v_profile_tenant_id uuid;
  v_profile_auth_id uuid;
  v_profile_email text;
  v_profile_count integer;
  v_invite public.learning_student_invitations%rowtype;
begin
  v_auth_user_id := (select auth.uid());
  if v_auth_user_id is null then
    raise exception 'Sign in with the invited email address to accept this invitation';
  end if;

  select lower(au.email) into v_auth_email
  from auth.users au where au.id = v_auth_user_id;
  if v_auth_email is null then
    raise exception 'Authenticated email could not be verified';
  end if;

  select * into v_invite
  from public.learning_student_invitations
  where id = p_invitation_id
  for update;
  if not found then
    raise exception 'Student invitation was not found';
  end if;
  if v_auth_email <> lower(v_invite.student_email) then
    raise exception 'The signed-in email does not match this student invitation';
  end if;
  -- Idempotent acceptance: React StrictMode, refreshes, and network retries must
  -- not turn a successfully accepted invitation into a misleading failure.
  if v_invite.status = 'accepted' then
    if exists (
      select 1 from public.users u
      where u.id = v_invite.accepted_by
        and u.auth_user_id = v_auth_user_id
        and lower(u.email) = v_auth_email
    ) then
      return v_invite.accepted_by;
    end if;
    raise exception 'This student invitation is no longer active';
  end if;
  if v_invite.status <> 'pending' then
    raise exception 'This student invitation is no longer active';
  end if;
  if v_invite.expires_at < now() then
    update public.learning_student_invitations
    set status = 'expired', updated_at = now()
    where id = p_invitation_id;
    return null;
  end if;

  select o.tenant_id into v_org_tenant_id
  from public.organizations o
  join public.learning_class_groups cg
    on cg.organization_id = o.id
   and cg.id = v_invite.class_group_id
   and cg.status = 'active'
  where o.id = v_invite.organization_id
    and o.tenant_id = v_invite.tenant_id
    and o.status = 'active';
  if v_org_tenant_id is null then
    raise exception 'The invited school or class is no longer active';
  end if;

  select u.id, u.tenant_id, u.auth_user_id, lower(u.email)
    into v_profile_id, v_profile_tenant_id, v_profile_auth_id, v_profile_email
  from public.users u
  where u.auth_user_id = v_auth_user_id
  limit 1;

  if v_profile_id is not null then
    if v_profile_email <> v_auth_email then
      raise exception 'The existing E&P profile email does not match the invitation';
    end if;
    if v_profile_tenant_id is distinct from v_org_tenant_id then
      raise exception 'This account belongs to another tenant and cannot accept this invitation';
    end if;
  else
    select count(*) into v_profile_count
    from public.users u
    where lower(u.email) = v_auth_email;

    if v_profile_count > 1 then
      raise exception 'Multiple E&P profiles use this email. Contact your school administrator.';
    end if;

    select u.id, u.tenant_id, u.auth_user_id
      into v_profile_id, v_profile_tenant_id, v_profile_auth_id
    from public.users u
    where lower(u.email) = v_auth_email
    limit 1;

    if v_profile_id is not null then
      if v_profile_tenant_id is distinct from v_org_tenant_id then
        raise exception 'An existing profile belongs to another tenant and cannot accept this invitation';
      end if;
      if v_profile_auth_id is not null and v_profile_auth_id <> v_auth_user_id then
        raise exception 'This email is already linked to another authentication account';
      end if;
      update public.users
      set auth_user_id = v_auth_user_id, name = v_invite.student_name
      where id = v_profile_id and auth_user_id is null;
    else
      insert into public.users (tenant_id, name, email, auth_user_id)
      values (v_org_tenant_id, v_invite.student_name, v_invite.student_email, v_auth_user_id)
      returning id into v_profile_id;
    end if;
  end if;

  if exists (
    select 1 from public.organization_memberships om
    where om.organization_id = v_invite.organization_id
      and om.user_id = v_profile_id
      and om.status in ('suspended', 'inactive')
  ) then
    raise exception 'This school account is inactive or suspended. Contact the school administrator.';
  end if;

  insert into public.organization_memberships (
    tenant_id, organization_id, user_id, status, updated_at
  ) values (
    v_org_tenant_id, v_invite.organization_id, v_profile_id, 'active', now()
  )
  on conflict (organization_id, user_id)
  do update set status = 'active', updated_at = now();

  insert into public.learning_class_memberships (
    tenant_id, organization_id, class_group_id, user_id,
    membership_type, status, joined_at, updated_at
  ) values (
    v_org_tenant_id, v_invite.organization_id, v_invite.class_group_id,
    v_profile_id, 'student', 'active', now(), now()
  )
  on conflict (class_group_id, user_id, membership_type)
  do update set status = 'active', joined_at = coalesce(learning_class_memberships.joined_at, now()), updated_at = now();

  update public.learning_student_invitations
  set status = 'accepted', accepted_by = v_profile_id,
      accepted_at = now(), updated_at = now()
  where id = p_invitation_id and status = 'pending';

  return v_profile_id;
end;
$function$;

revoke all on function public.create_learning_student_invitation(uuid,uuid,text,text) from public, anon;
grant execute on function public.create_learning_student_invitation(uuid,uuid,text,text) to authenticated;
revoke all on function public.revoke_learning_student_invitation(uuid) from public, anon;
grant execute on function public.revoke_learning_student_invitation(uuid) to authenticated;
revoke all on function public.accept_learning_student_invitation(uuid) from public, anon;
grant execute on function public.accept_learning_student_invitation(uuid) to authenticated;

commit;
