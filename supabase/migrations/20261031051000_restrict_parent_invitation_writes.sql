-- Parent invitations are created only through the validated RPC.
-- Require an active student enrollment in the target active organisation.
begin;

revoke insert, update on table public.learning_parent_invitations from authenticated;

drop policy if exists learning_parent_invitations_manager_insert on public.learning_parent_invitations;
drop policy if exists learning_parent_invitations_manager_update on public.learning_parent_invitations;

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
    raise exception 'You do not have permission to invite parents for this organisation';
  end if;

  v_email := lower(trim(coalesce(p_parent_email, '')));
  if v_email = '' or position('@' in v_email) < 2 then
    raise exception 'A valid parent email is required';
  end if;

  select o.tenant_id into v_tenant_id
  from public.organizations o
  where o.id = p_organization_id
    and o.status = 'active';

  if v_tenant_id is null then
    raise exception 'Active organisation not found';
  end if;

  if not exists (
    select 1
    from public.learning_class_memberships cm
    join public.users student
      on student.id = cm.user_id
     and student.tenant_id = cm.tenant_id
    where cm.organization_id = p_organization_id
      and cm.tenant_id = v_tenant_id
      and cm.user_id = p_student_user_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
  ) then
    raise exception 'Student must have an active enrolment in this organisation';
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

revoke all on function public.create_learning_parent_invitation(uuid,text,text,uuid,text)
from public, anon;
grant execute on function public.create_learning_parent_invitation(uuid,text,text,uuid,text)
to authenticated;

commit;
