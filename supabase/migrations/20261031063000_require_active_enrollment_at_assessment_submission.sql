-- Enforce current class enrollment at the trusted assessment-submission boundary.
-- Keep the existing evaluator intact behind a private-to-the-API internal name;
-- expose only this authorization wrapper to authenticated callers.
begin;

do $migration$
begin
  if to_regprocedure('public.submit_learning_attempt_internal(uuid)') is not null then
    raise exception 'submit_learning_attempt_internal(uuid) already exists; refusing to rename over it';
  end if;
  if to_regprocedure('public.submit_learning_attempt(uuid)') is null then
    raise exception 'Expected public.submit_learning_attempt(uuid) to exist';
  end if;
end;
$migration$;

alter function public.submit_learning_attempt(uuid)
  rename to submit_learning_attempt_internal;

revoke all on function public.submit_learning_attempt_internal(uuid)
  from public, anon, authenticated;

create function public.submit_learning_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_student_user_id uuid;
  v_tenant_id uuid;
  v_organization_id uuid;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select u.id, u.tenant_id
    into v_student_user_id, v_tenant_id
  from public.users u
  where u.auth_user_id = v_auth_user_id;

  if v_student_user_id is null then
    raise exception 'Authenticated application user was not found';
  end if;

  select a.student_user_id, a.tenant_id, a.organization_id
    into v_student_user_id, v_tenant_id, v_organization_id
  from public.learning_attempts a
  where a.id = p_attempt_id;

  if not found then
    raise exception 'Assessment attempt was not found';
  end if;

  if v_student_user_id <> (
    select u.id from public.users u where u.auth_user_id = v_auth_user_id
  ) then
    raise exception 'You cannot submit another student''s attempt';
  end if;

  if v_organization_id is not null then
    if not exists (
      select 1
      from public.organizations o
      join public.learning_class_memberships cm
        on cm.organization_id = o.id
       and cm.tenant_id = o.tenant_id
       and cm.user_id = v_student_user_id
       and cm.membership_type = 'student'
       and cm.status = 'active'
      where o.id = v_organization_id
        and o.tenant_id = v_tenant_id
        and o.status = 'active'
    ) then
      raise exception 'An active student enrollment in this organization is required';
    end if;
  else
    if not exists (
      select 1
      from public.organizations o
      join public.learning_class_memberships cm
        on cm.organization_id = o.id
       and cm.tenant_id = o.tenant_id
       and cm.user_id = v_student_user_id
       and cm.membership_type = 'student'
       and cm.status = 'active'
      where o.tenant_id = v_tenant_id
        and o.status = 'active'
    ) then
      raise exception 'An active student enrollment is required';
    end if;
  end if;

  return public.submit_learning_attempt_internal(p_attempt_id);
end;
$function$;

revoke all on function public.submit_learning_attempt(uuid)
  from public, anon;
grant execute on function public.submit_learning_attempt(uuid)
  to authenticated;

commit;
