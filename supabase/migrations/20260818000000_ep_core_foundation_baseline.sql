-- E&P Core foundation baseline.
-- Reconstructed from src/core/database/migrations/001_core_schema.sql and
-- 002_core_hardening.sql, with the Supabase Auth identity column included.
--
-- This file contains schema only. Legacy permissive registration policies
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
  constraint users_tenant_email_key unique (tenant_id, email),
  constraint users_tenant_id_id_key unique (tenant_id, id)
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
  updated_at timestamptz not null default now(),
  constraint roles_tenant_id_id_key unique (tenant_id, id)
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

alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.company_settings enable row level security;
