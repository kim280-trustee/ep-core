-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Customers
-- ============================================================

create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid not null,

    name varchar(200) not null,

    customer_type varchar(20) not null default 'regular',

    phone varchar(50) null,

    email varchar(255) null,

    address text null,

    tax_number varchar(100) null,

    credit_limit numeric(14,2) null,

    status varchar(20) not null default 'active',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint customers_customer_type_check
        check (customer_type in ('regular', 'wholesale', 'retail')),

    constraint customers_status_check
        check (status in ('active', 'inactive')),

    constraint customers_credit_limit_check
        check (credit_limit is null or credit_limit >= 0)
);


-- ============================================================
-- Indexes
-- ============================================================

create index if not exists customers_tenant_index
on public.customers (
    tenant_id
);


create index if not exists customers_store_index
on public.customers (
    tenant_id,
    store_id
);


create index if not exists customers_tenant_status_index
on public.customers (
    tenant_id,
    status
);


create index if not exists customers_tenant_type_index
on public.customers (
    tenant_id,
    customer_type
);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.customers enable row level security;


drop policy if exists "tenant_customers_access"
on public.customers;


create policy "tenant_customers_access"
on public.customers
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
on public.customers
to authenticated;
