-- E&P Core: organization and membership foundation
-- Additive only. Does not alter existing POS tables, tenant semantics, or user_roles authorization.

alter table public.users add constraint users_tenant_id_id_key unique (tenant_id, id);
alter table public.roles add constraint roles_tenant_id_id_key unique (tenant_id, id);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  code text not null,
  country text not null,
  currency text not null,
  timezone text not null,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_tenant_code_key unique (tenant_id, code),
  constraint organizations_tenant_id_id_key unique (tenant_id, id)
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null,
  user_id uuid not null,
  role_id uuid null,
  status text not null default 'active'
    check (status in ('invited', 'active', 'suspended', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_memberships_org_fk
    foreign key (tenant_id, organization_id)
    references public.organizations(tenant_id, id)
    on delete cascade,
  constraint organization_memberships_user_fk
    foreign key (tenant_id, user_id)
    references public.users(tenant_id, id)
    on delete cascade,
  constraint organization_memberships_role_fk
    foreign key (tenant_id, role_id)
    references public.roles(tenant_id, id)
    on delete set null,
  constraint organization_memberships_user_org_key
    unique (organization_id, user_id)
);

create index if not exists organizations_tenant_id_idx
  on public.organizations (tenant_id);

create index if not exists organizations_status_idx
  on public.organizations (tenant_id, status);

create index if not exists organization_memberships_tenant_id_idx
  on public.organization_memberships (tenant_id);

create index if not exists organization_memberships_user_id_idx
  on public.organization_memberships (user_id);

create index if not exists organization_memberships_organization_id_idx
  on public.organization_memberships (organization_id);

create index if not exists organization_memberships_role_id_idx
  on public.organization_memberships (role_id);

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.organization_memberships om
    join public.users u
      on u.id = om.user_id
     and u.tenant_id = om.tenant_id
    where om.organization_id = target_organization_id
      and om.status = 'active'
      and u.auth_user_id = (select auth.uid())
  );
$$;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;

drop policy if exists organizations_select_authenticated
  on public.organizations;
create policy organizations_select_authenticated
on public.organizations
for select
to authenticated
using (
  public.is_organization_member(id)
  or (
    tenant_id = public.get_current_user_tenant_id()
    and public.has_permission('settings.view')
  )
);

drop policy if exists organizations_insert_authenticated
  on public.organizations;
create policy organizations_insert_authenticated
on public.organizations
for insert
to authenticated
with check (
  tenant_id = public.get_current_user_tenant_id()
  and public.has_permission('settings.manage')
);

drop policy if exists organizations_update_authenticated
  on public.organizations;
create policy organizations_update_authenticated
on public.organizations
for update
to authenticated
using (
  tenant_id = public.get_current_user_tenant_id()
  and public.has_permission('settings.manage')
)
with check (
  tenant_id = public.get_current_user_tenant_id()
  and public.has_permission('settings.manage')
);

drop policy if exists organizations_delete_authenticated
  on public.organizations;
create policy organizations_delete_authenticated
on public.organizations
for delete
to authenticated
using (
  tenant_id = public.get_current_user_tenant_id()
  and public.has_permission('settings.manage')
);

drop policy if exists organization_memberships_select_authenticated
  on public.organization_memberships;
create policy organization_memberships_select_authenticated
on public.organization_memberships
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = organization_memberships.user_id
      and u.auth_user_id = (select auth.uid())
  )
  or (
    tenant_id = public.get_current_user_tenant_id()
    and public.has_permission('settings.view')
  )
);

drop policy if exists organization_memberships_insert_authenticated
  on public.organization_memberships;
create policy organization_memberships_insert_authenticated
on public.organization_memberships
for insert
to authenticated
with check (
  tenant_id = public.get_current_user_tenant_id()
  and public.has_permission('settings.manage')
);

drop policy if exists organization_memberships_update_authenticated
  on public.organization_memberships;
create policy organization_memberships_update_authenticated
on public.organization_memberships
for update
to authenticated
using (
  tenant_id = public.get_current_user_tenant_id()
  and public.has_permission('settings.manage')
)
with check (
  tenant_id = public.get_current_user_tenant_id()
  and public.has_permission('settings.manage')
);

drop policy if exists organization_memberships_delete_authenticated
  on public.organization_memberships;
create policy organization_memberships_delete_authenticated
on public.organization_memberships
for delete
to authenticated
using (
  tenant_id = public.get_current_user_tenant_id()
  and public.has_permission('settings.manage')
);

grant select, insert, update, delete
on public.organizations, public.organization_memberships
to authenticated;

grant execute on function public.is_organization_member(uuid)
to authenticated;
