-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Suppliers
-- ============================================================

create table if not exists public.suppliers (
    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid not null,

    name varchar(200) not null,

    contact_person varchar(200) null,

    phone varchar(50) null,

    email varchar(255) null,

    address text null,

    tax_id varchar(100) null,

    payment_terms varchar(100) null,

    status varchar(20) not null default 'active',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint suppliers_status_check
        check (status in ('active', 'inactive'))
);


-- ============================================================
-- Indexes
-- ============================================================

create index if not exists suppliers_tenant_index
on public.suppliers (
    tenant_id
);


create index if not exists suppliers_store_index
on public.suppliers (
    tenant_id,
    store_id
);


create index if not exists suppliers_tenant_status_index
on public.suppliers (
    tenant_id,
    status
);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.suppliers enable row level security;


drop policy if exists "tenant_suppliers_access"
on public.suppliers;


create policy "tenant_suppliers_access"
on public.suppliers
for all
using (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
)
with check (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
);


-- ============================================================
-- Data API privileges
-- ============================================================

grant select, insert, update, delete
on public.suppliers
to authenticated;
