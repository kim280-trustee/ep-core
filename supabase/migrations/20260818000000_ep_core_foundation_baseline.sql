-- E&P Core foundation baseline.
-- Reconstructed from src/core/database/migrations/001_core_schema.sql and
-- 002_core_hardening.sql, with the Supabase Auth identity column included.
--
-- This file contains the required Core schema plus deterministic local-only
-- Learning pilot identity fixtures. Legacy permissive registration policies
-- from src/core/database/migrations/003-006 are intentionally not copied.
-- Access remains fail-closed until the versioned Supabase policies/grants apply.

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  currency text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  email text not null,
  auth_user_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_tenant_email_key unique (tenant_id, email)
);

create index if not exists users_tenant_id_index
  on public.users (tenant_id);
create index if not exists idx_users_auth_user_id
  on public.users (auth_user_id);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  is_system_role boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists roles_tenant_id_index
  on public.roles (tenant_id);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  constraint role_permissions_unique unique (role_id, permission_id)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  constraint user_roles_unique unique (user_id, role_id)
);

create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  business_name text not null,
  tax_enabled boolean not null default false,
  tax_rate numeric not null default 0,
  invoice_prefix text default 'INV',
  receipt_prefix text default 'REC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_settings_tenant_id_index
  on public.company_settings (tenant_id);


-- Deterministic local-only fixture rows required by the existing Learning pilot
-- bootstrap migration. These identities are not production credentials; the
-- reserved .invalid email domain prevents accidental email delivery.
insert into public.tenants (id, name, country, currency)
values (
  '2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3',
  'E&P Learning Pilot Tenant',
  'Thailand',
  'THB'
);

insert into public.users (id, tenant_id, name, email, auth_user_id)
values
  (
    '58d39658-65ec-4918-95e1-994ad5bf4f72',
    '2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3',
    'Learning Pilot Staff',
    'learning-pilot-staff@example.invalid',
    null
  ),
  (
    'f368d757-9321-4a69-af31-7bd3cd38b780',
    '2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3',
    'Learning Pilot Student',
    'learning-pilot-student@example.invalid',
    null
  );

insert into public.roles (id, tenant_id, name, is_system_role)
values
  (
    'fa27f858-f0c2-4c15-be0b-e0ed4bdd7e93',
    '2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3',
    'Learning Pilot Staff',
    false
  ),
  (
    '20559f5d-5217-4b94-9dc5-f57774e0875e',
    '2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3',
    'Learning Pilot Student',
    false
  );


-- Authorization helpers required by the organization membership foundation.
-- Definitions mirror the live core authorization contract, with explicit
-- function privileges for the isolated migration test environment.
create or replace function public.get_current_user_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_catalog
as $ep$
  select u.tenant_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;
$ep$;

create or replace function public.has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $ep$
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
$ep$;

revoke all on function public.get_current_user_tenant_id() from public, anon;
revoke all on function public.has_permission(text) from public, anon;
grant execute on function public.get_current_user_tenant_id() to authenticated;
grant execute on function public.has_permission(text) to authenticated;

alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.company_settings enable row level security;
