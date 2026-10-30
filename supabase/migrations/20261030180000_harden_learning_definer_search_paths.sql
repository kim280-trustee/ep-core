begin;

create or replace function private.learning_assignment_target_assignment_matches_org(
  p_assignment_id uuid,
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_assignments a
    where a.id = p_assignment_id
      and a.organization_id = p_organization_id
  );
$function$;

create or replace function private.learning_assignment_visible(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1 from public.learning_assignments a
    where a.id = target_assignment_id
      and a.status = 'published'
      and (a.available_from is null or a.available_from <= pg_catalog.now())
      and exists (
        select 1 from public.learning_assignment_targets t
        where t.assignment_id = a.id and t.status = 'active'
          and (
            t.student_user_id in (
              select u.id from public.users u
              where u.auth_user_id = (select auth.uid())
            )
            or exists (
              select 1 from public.learning_class_memberships cm
              where cm.class_group_id = t.class_group_id
                and cm.user_id in (
                  select u.id from public.users u
                  where u.auth_user_id = (select auth.uid())
                )
                and cm.membership_type = 'student'
                and cm.status = 'active'
            )
          )
      )
  );
$function$;

create or replace function private.learning_content_visible(target_content_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_assignment_items ai
    join public.learning_assignments a on a.id = ai.assignment_id
    where ai.content_item_id = target_content_id
      and a.status = 'published'
      and private.learning_assignment_visible(a.id)
  );
$function$;

create or replace function private.learning_student_has_assignment_target(
  p_assignment_id uuid,
  p_student_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_assignment_targets t
    where t.assignment_id = p_assignment_id
      and t.status = 'active'
      and (
        t.student_user_id = p_student_user_id
        or (
          t.class_group_id is not null
          and exists (
            select 1
            from public.learning_class_memberships cm
            where cm.class_group_id = t.class_group_id
              and cm.user_id = p_student_user_id
              and cm.membership_type = 'student'
              and cm.status = 'active'
          )
        )
      )
  );
$function$;

create or replace function public.get_current_user_permissions()
returns table(permission_code text)
language sql
stable
security definer
set search_path = ''
as $function$
  select distinct p.code
  from public.users u
  join public.user_roles ur on ur.user_id = u.id
  join public.roles r on r.id = ur.role_id and r.tenant_id = u.tenant_id
  join public.role_permissions rp on rp.role_id = r.id
  join public.permissions p on p.id = rp.permission_id
  where u.auth_user_id = (select auth.uid());
$function$;

create or replace function public.get_current_user_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $function$
  select u.tenant_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;
$function$;

create or replace function public.has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.users u
    join public.user_roles ur on ur.user_id = u.id
    join public.roles r on r.id = ur.role_id and r.tenant_id = u.tenant_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where u.auth_user_id = (select auth.uid())
      and p.code = permission_code
  );
$function$;

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.organization_memberships om
    join public.users u on u.id = om.user_id and u.tenant_id = om.tenant_id
    where om.organization_id = target_organization_id
      and om.status = 'active'
      and u.auth_user_id = (select auth.uid())
  );
$function$;

commit;
