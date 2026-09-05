-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Master Data V1
-- Categories, Brands, Units
-- ============================================================


-- ============================================================
-- CATEGORIES
-- ============================================================

create table if not exists public.categories (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid not null,

    name varchar(100) not null,

    description text null,

    parent_id uuid null,

    status varchar(20) not null default 'active',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint categories_status_check
        check (status in ('active', 'inactive')),

    constraint categories_parent_self_check
        check (parent_id is null or parent_id <> id)
);


create index if not exists categories_tenant_store_index
on public.categories (
    tenant_id,
    store_id
);


create index if not exists categories_parent_index
on public.categories (
    tenant_id,
    parent_id
);


create index if not exists categories_status_index
on public.categories (
    tenant_id,
    store_id,
    status
);


create unique index if not exists categories_tenant_store_name_unique
on public.categories (
    tenant_id,
    store_id,
    lower(name)
);


-- ============================================================
-- BRANDS
-- ============================================================

create table if not exists public.brands (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid not null,

    name varchar(100) not null,

    code varchar(50) null,

    description text null,

    logo_url text null,

    status varchar(20) not null default 'active',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint brands_status_check
        check (status in ('active', 'inactive'))
);


create index if not exists brands_tenant_store_index
on public.brands (
    tenant_id,
    store_id
);


create index if not exists brands_status_index
on public.brands (
    tenant_id,
    store_id,
    status
);


create unique index if not exists brands_tenant_store_name_unique
on public.brands (
    tenant_id,
    store_id,
    lower(name)
);


create unique index if not exists brands_tenant_store_code_unique
on public.brands (
    tenant_id,
    store_id,
    lower(code)
)
where code is not null;


-- ============================================================
-- UNITS
-- ============================================================

create table if not exists public.units (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid not null,

    name varchar(100) not null,

    symbol varchar(30) not null,

    description text null,

    status varchar(20) not null default 'active',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint units_status_check
        check (status in ('active', 'inactive'))
);


create index if not exists units_tenant_store_index
on public.units (
    tenant_id,
    store_id
);


create index if not exists units_status_index
on public.units (
    tenant_id,
    store_id,
    status
);


create unique index if not exists units_tenant_store_name_unique
on public.units (
    tenant_id,
    store_id,
    lower(name)
);


create unique index if not exists units_tenant_store_symbol_unique
on public.units (
    tenant_id,
    store_id,
    lower(symbol)
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.units enable row level security;


-- ============================================================
-- CATEGORY RLS
-- ============================================================

drop policy if exists "tenant_categories_access"
on public.categories;


create policy "tenant_categories_access"
on public.categories
for all
to authenticated

using (
    tenant_id = (
        select u.tenant_id
        from public.users u
        where u.auth_user_id = auth.uid()
        limit 1
    )
)

with check (
    tenant_id = (
        select u.tenant_id
        from public.users u
        where u.auth_user_id = auth.uid()
        limit 1
    )
);


-- ============================================================
-- BRAND RLS
-- ============================================================

drop policy if exists "tenant_brands_access"
on public.brands;


create policy "tenant_brands_access"
on public.brands
for all
to authenticated

using (
    tenant_id = (
        select u.tenant_id
        from public.users u
        where u.auth_user_id = auth.uid()
        limit 1
    )
)

with check (
    tenant_id = (
        select u.tenant_id
        from public.users u
        where u.auth_user_id = auth.uid()
        limit 1
    )
);


-- ============================================================
-- UNIT RLS
-- ============================================================

drop policy if exists "tenant_units_access"
on public.units;


create policy "tenant_units_access"
on public.units
for all
to authenticated

using (
    tenant_id = (
        select u.tenant_id
        from public.users u
        where u.auth_user_id = auth.uid()
        limit 1
    )
)

with check (
    tenant_id = (
        select u.tenant_id
        from public.users u
        where u.auth_user_id = auth.uid()
        limit 1
    )
);


-- ============================================================
-- DATA API PRIVILEGES
-- ============================================================

grant select, insert, update, delete
on table public.categories
to authenticated;


grant select, insert, update, delete
on table public.brands
to authenticated;


grant select, insert, update, delete
on table public.units
to authenticated;


-- ============================================================
-- END MASTER DATA V1
-- ============================================================
