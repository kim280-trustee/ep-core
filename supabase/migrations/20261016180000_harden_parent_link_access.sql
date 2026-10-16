-- Limit parent-link discovery to academic managers and the linked parent.
-- Also enforce organization/class membership when links or invitations are created,
-- so UI filtering is not the only protection.
begin;

drop policy if exists learning_parent_links_select on public.learning_parent_student_links;
create policy learning_parent_links_select
on public.learning_parent_student_links
for select
to authenticated
using (
  public.learning_can_manage_academic_records(organization_id)
  or parent_user_id = (
    select u.id from public.users u
    where u.auth_user_id = (select auth.uid())
    limit 1
  )
);

drop policy if exists learning_parent_links_insert on public.learning_parent_student_links;
create policy learning_parent_links_insert
on public.learning_parent_student_links
for insert
to authenticated
with check (
  public.learning_can_manage_academic_records(organization_id)
  and exists (
    select 1
    from public.organizations o
    join public.users p on p.id = parent_user_id and p.tenant_id = o.tenant_id
    where o.id = organization_id
  )
  and exists (
    select 1
    from public.organizations o
    join public.users s on s.id = student_user_id and s.tenant_id = o.tenant_id
    join public.learning_class_memberships cm
      on cm.user_id = s.id
     and cm.tenant_id = s.tenant_id
     and cm.organization_id = o.id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where o.id = organization_id
  )
);

drop policy if exists learning_parent_links_update on public.learning_parent_student_links;
create policy learning_parent_links_update
on public.learning_parent_student_links
for update
to authenticated
using (public.learning_can_manage_academic_records(organization_id))
with check (
  public.learning_can_manage_academic_records(organization_id)
  and exists (
    select 1
    from public.organizations o
    join public.users p on p.id = parent_user_id and p.tenant_id = o.tenant_id
    where o.id = organization_id
  )
  and exists (
    select 1
    from public.organizations o
    join public.users s on s.id = student_user_id and s.tenant_id = o.tenant_id
    join public.learning_class_memberships cm
      on cm.user_id = s.id
     and cm.tenant_id = s.tenant_id
     and cm.organization_id = o.id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where o.id = organization_id
  )
);

create or replace function public.create_learning_parent_invitation(
  p_organization_id uuid,
  p_parent_email text,
  p_parent_name text,
  p_student_user_id uuid,
  p_relationship text default 'parent'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor uuid;
  v_tenant_id uuid;
  v_invitation_id uuid;
  v_email text;
begin
  select u.id into v_actor
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_actor is null then
    raise exception 'Authenticated E&P user profile not found';
  end if;

  if not public.learning_can_manage_academic_records(p_organization_id) then
    raise exception 'You do not have permission to invite parents for this organization';
  end if;

  v_email := lower(trim(p_parent_email));
  if v_email is null or v_email = '' or position('@' in v_email) < 2 then
    raise exception 'A valid parent email is required';
  end if;

  select o.tenant_id into v_tenant_id
  from public.organizations o
  where o.id = p_organization_id;

  if v_tenant_id is null then
    raise exception 'Organization not found';
  end if;

  if not exists (
    select 1
    from public.users u
    join public.learning_class_memberships cm
      on cm.user_id = u.id
     and cm.tenant_id = u.tenant_id
     and cm.organization_id = p_organization_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where u.id = p_student_user_id
      and u.tenant_id = v_tenant_id
  ) then
    raise exception 'Student must have an active student membership in this organization';
  end if;

  if exists (
    select 1
    from public.learning_parent_student_links l
    join public.users p on p.id = l.parent_user_id
    where l.organization_id = p_organization_id
      and l.student_user_id = p_student_user_id
      and l.status = 'active'
      and lower(p.email) = v_email
  ) then
    raise exception 'This parent is already linked to the student';
  end if;

  update public.learning_parent_invitations
  set status = 'expired', updated_at = now()
  where organization_id = p_organization_id
    and lower(parent_email) = v_email
    and student_user_id = p_student_user_id
    and status = 'pending'
    and expires_at < now();

  insert into public.learning_parent_invitations (
    organization_id, parent_email, parent_name, student_user_id,
    relationship, status, invited_by, expires_at, updated_at
  )
  values (
    p_organization_id, v_email, nullif(trim(p_parent_name), ''),
    p_student_user_id, coalesce(nullif(trim(p_relationship), ''), 'parent'),
    'pending', v_actor, now() + interval '7 days', now()
  )
  returning id into v_invitation_id;

  return v_invitation_id;
end;
$function$;

revoke all on function public.create_learning_parent_invitation(uuid,text,text,uuid,text) from public, anon;
grant execute on function public.create_learning_parent_invitation(uuid,text,text,uuid,text) to authenticated;

commit;
