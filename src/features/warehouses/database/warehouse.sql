-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Warehouse / Stock Location Database
-- ============================================================

create table if not exists public.warehouses (
    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    name varchar(150) not null,

    code varchar(50) not null,

    description text null,

    is_default boolean not null default false,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- ============================================================
-- Tenant + Code uniqueness
-- ============================================================

create unique index if not exists warehouses_tenant_code_unique
on public.warehouses (
    tenant_id,
    code
);


-- ============================================================
-- Tenant lookup
-- ============================================================

create index if not exists warehouses_tenant_index
on public.warehouses (
    tenant_id
);


-- ============================================================
-- Active locations
-- ============================================================

create index if not exists warehouses_tenant_active_index
on public.warehouses (
    tenant_id,
    is_active
);


-- ============================================================
-- One default stock location per tenant
-- ============================================================

create unique index if not exists warehouses_one_default_per_tenant
on public.warehouses (
    tenant_id
)
where is_default = true;


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.warehouses enable row level security;


create policy "tenant_warehouses_access"
on public.warehouses
for all
using (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
);