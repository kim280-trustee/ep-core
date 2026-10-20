begin;

create table if not exists public.learning_school_announcements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  class_group_id uuid references public.learning_class_groups(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  body text not null check (length(trim(body)) between 1 and 3000),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid not null references public.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create index if not exists learning_school_announcements_org_status_published_idx
  on public.learning_school_announcements (organization_id, status, published_at desc);
create index if not exists learning_school_announcements_class_status_published_idx
  on public.learning_school_announcements (class_group_id, status, published_at desc);

create table if not exists public.learning_school_announcement_reads (
  announcement_id uuid not null references public.learning_school_announcements(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

alter table public.learning_school_announcements enable row level security;
alter table public.learning_school_announcement_reads enable row level security;
revoke all on public.learning_school_announcements from public, anon, authenticated;
revoke all on public.learning_school_announcement_reads from public, anon, authenticated;

create or replace function public.list_manageable_learning_school_announcements(p_organization_id uuid)
returns table (
  id uuid,
  organization_id uuid,
  class_group_id uuid,
  class_group_name text,
  title text,
  body text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  published_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
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
    select 1
    from public.organization_memberships om
    join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
    where om.user_id = v_user_id
      and om.organization_id = p_organization_id
      and om.status = 'active'
      and upper(trim(r.name)) in ('OWNER', 'MANAGER')
      and exists (
        select 1
        from public.get_current_user_permissions() permission
        where permission.permission_code = 'learning.academic.manage'
      )
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

create or replace function public.create_learning_school_announcement(
  p_organization_id uuid,
  p_class_group_id uuid,
  p_title text,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
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
      and exists (
        select 1
        from public.get_current_user_permissions() permission
        where permission.permission_code = 'learning.academic.manage'
      )
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

create or replace function public.publish_learning_school_announcement(p_announcement_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
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
    select 1
    from public.organization_memberships om
    join public.roles r on r.id = om.role_id and r.tenant_id = om.tenant_id
    where om.user_id = v_user_id
      and om.organization_id = v_organization_id
      and om.status = 'active'
      and upper(trim(r.name)) in ('OWNER', 'MANAGER')
      and exists (
        select 1
        from public.get_current_user_permissions() permission
        where permission.permission_code = 'learning.academic.manage'
      )
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

create or replace function public.list_learning_parent_school_announcements(p_limit integer default 50)
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  class_group_id uuid,
  class_group_name text,
  title text,
  body text,
  published_at timestamptz,
  created_at timestamptz,
  read_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare
  v_parent_user_id uuid;
begin
  select u.id into v_parent_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_parent_user_id is null then
    raise exception 'Authenticated parent profile not found';
  end if;

  return query
  select distinct a.id, a.organization_id, o.name, a.class_group_id, cg.name,
         a.title, a.body, a.published_at, a.created_at, r.read_at
  from public.learning_school_announcements a
  join public.organizations o
    on o.id = a.organization_id
   and o.status = 'active'
  left join public.learning_class_groups cg
    on cg.id = a.class_group_id
   and cg.organization_id = a.organization_id
  left join public.learning_school_announcement_reads r
    on r.announcement_id = a.id
   and r.user_id = v_parent_user_id
  where a.status = 'published'
    and exists (
      select 1
      from public.learning_parent_student_links l
      join public.learning_class_memberships cm
        on cm.organization_id = l.organization_id
       and cm.user_id = l.student_user_id
       and cm.membership_type = 'student'
       and cm.status = 'active'
      join public.learning_class_groups enrolled_class
        on enrolled_class.id = cm.class_group_id
       and enrolled_class.organization_id = cm.organization_id
       and enrolled_class.status = 'active'
      where l.parent_user_id = v_parent_user_id
        and l.organization_id = a.organization_id
        and l.status = 'active'
        and (a.class_group_id is null or a.class_group_id = cm.class_group_id)
    )
  order by a.published_at desc, a.id desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
end;
$function$;

create or replace function public.mark_learning_parent_school_announcement_read(p_announcement_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_parent_user_id uuid;
  v_marked integer;
begin
  select u.id into v_parent_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_parent_user_id is null then
    raise exception 'Authenticated parent profile not found';
  end if;

  if not exists (
    select 1
    from public.learning_school_announcements a
    where a.id = p_announcement_id
      and a.status = 'published'
      and exists (
        select 1
        from public.learning_parent_student_links l
        join public.learning_class_memberships cm
          on cm.organization_id = l.organization_id
         and cm.user_id = l.student_user_id
         and cm.membership_type = 'student'
         and cm.status = 'active'
        join public.learning_class_groups enrolled_class
          on enrolled_class.id = cm.class_group_id
         and enrolled_class.organization_id = cm.organization_id
         and enrolled_class.status = 'active'
        where l.parent_user_id = v_parent_user_id
          and l.organization_id = a.organization_id
          and l.status = 'active'
          and (a.class_group_id is null or a.class_group_id = cm.class_group_id)
      )
  ) then
    raise exception 'You do not have access to this announcement';
  end if;

  insert into public.learning_school_announcement_reads (announcement_id, user_id, read_at)
  values (p_announcement_id, v_parent_user_id, now())
  on conflict (announcement_id, user_id) do update
    set read_at = coalesce(public.learning_school_announcement_reads.read_at, excluded.read_at);

  get diagnostics v_marked = row_count;
  return v_marked > 0;
end;
$function$;

revoke all on function public.list_manageable_learning_school_announcements(uuid) from public, anon;
revoke all on function public.create_learning_school_announcement(uuid, uuid, text, text) from public, anon;
revoke all on function public.publish_learning_school_announcement(uuid) from public, anon;
revoke all on function public.list_learning_parent_school_announcements(integer) from public, anon;
revoke all on function public.mark_learning_parent_school_announcement_read(uuid) from public, anon;
grant execute on function public.list_manageable_learning_school_announcements(uuid) to authenticated;
grant execute on function public.create_learning_school_announcement(uuid, uuid, text, text) to authenticated;
grant execute on function public.publish_learning_school_announcement(uuid) to authenticated;
grant execute on function public.list_learning_parent_school_announcements(integer) to authenticated;
grant execute on function public.mark_learning_parent_school_announcement_read(uuid) to authenticated;

commit;
