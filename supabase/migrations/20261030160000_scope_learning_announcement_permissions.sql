-- Scope school announcement administration to the active organization role.
begin;

CREATE OR REPLACE FUNCTION public.create_learning_school_announcement(p_organization_id uuid, p_class_group_id uuid, p_title text, p_body text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid;
  v_tenant_id uuid;
  v_announcement_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if length(trim(coalesce(p_title, ''))) not between 1 and 120 then
    raise exception 'Announcement title must contain 1 to 120 characters';
  end if;
  if length(trim(coalesce(p_body, ''))) not between 1 and 3000 then
    raise exception 'Announcement body must contain 1 to 3000 characters';
  end if;

  select o.tenant_id into v_tenant_id
  from public.organizations o
  where o.id = p_organization_id
    and o.status = 'active';

  if v_tenant_id is null then
    raise exception 'The selected school is not available';
  end if;

  if not exists (
    select 1
    from public.organization_memberships om
    join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
    where om.user_id = v_user_id
      and om.organization_id = p_organization_id
      and om.status = 'active'
      and upper(trim(r.name)) in ('OWNER', 'MANAGER')
      and public.learning_can_manage_academic_records(p_organization_id)
  ) then
    raise exception 'Only an active school owner or manager can create school announcements';
  end if;

  if p_class_group_id is not null and not exists (
    select 1 from public.learning_class_groups cg
    where cg.id = p_class_group_id
      and cg.organization_id = p_organization_id
      and cg.status = 'active'
  ) then
    raise exception 'Choose an active class in the selected school';
  end if;

  insert into public.learning_school_announcements (
    tenant_id, organization_id, class_group_id, title, body, status, created_by
  ) values (
    v_tenant_id, p_organization_id, p_class_group_id,
    trim(p_title), trim(p_body), 'draft', v_user_id
  )
  returning id into v_announcement_id;

  return v_announcement_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.list_manageable_learning_school_announcements(p_organization_id uuid)
 RETURNS TABLE(id uuid, organization_id uuid, class_group_id uuid, class_group_name text, title text, body text, status text, created_at timestamp with time zone, updated_at timestamp with time zone, published_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if not exists (
    select 1 from public.organizations o
    where o.id = p_organization_id and o.status = 'active'
  ) then
    raise exception 'The selected school is not available';
  end if;

  if not exists (
    select 1
    from public.organization_memberships om
    join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
    where om.user_id = v_user_id
      and om.organization_id = p_organization_id
      and om.status = 'active'
      and upper(trim(r.name)) in ('OWNER', 'MANAGER')
      and public.learning_can_manage_academic_records(p_organization_id)
  ) then
    raise exception 'Only an active school owner or manager can manage school announcements';
  end if;

  return query
  select a.id, a.organization_id, a.class_group_id, cg.name,
         a.title, a.body, a.status, a.created_at, a.updated_at, a.published_at
  from public.learning_school_announcements a
  left join public.learning_class_groups cg
    on cg.id = a.class_group_id
   and cg.organization_id = a.organization_id
  where a.organization_id = p_organization_id
  order by a.created_at desc, a.id desc
  limit 200;
end;
$function$;

CREATE OR REPLACE FUNCTION public.publish_learning_school_announcement(p_announcement_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_status text;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select a.organization_id, a.status
    into v_organization_id, v_status
  from public.learning_school_announcements a
  where a.id = p_announcement_id
  for update;

  if v_organization_id is null then
    raise exception 'Announcement not found';
  end if;

  if not exists (
    select 1 from public.organizations o
    where o.id = v_organization_id and o.status = 'active'
  ) then
    raise exception 'The selected school is not available';
  end if;

  if not exists (
    select 1
    from public.organization_memberships om
    join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
    where om.user_id = v_user_id
      and om.organization_id = v_organization_id
      and om.status = 'active'
      and upper(trim(r.name)) in ('OWNER', 'MANAGER')
      and public.learning_can_manage_academic_records(v_organization_id)
  ) then
    raise exception 'Only an active school owner or manager can publish school announcements';
  end if;

  if v_status <> 'draft' then
    raise exception 'Only draft announcements can be published';
  end if;

  update public.learning_school_announcements
  set status = 'published',
      published_at = now(),
      updated_at = now()
  where id = p_announcement_id;

  return true;
end;
$function$;

commit;
