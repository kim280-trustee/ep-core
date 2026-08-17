-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Inventory Database
-- ============================================================

create table if not exists public.inventory (
    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    product_id uuid not null,

    warehouse_id uuid not null,

    quantity_on_hand numeric(14,3) not null default 0,

    reserved_quantity numeric(14,3) not null default 0,

    available_quantity numeric(14,3)
        generated always as (
            quantity_on_hand - reserved_quantity
        ) stored,

    average_cost numeric(14,4) not null default 0,

    minimum_stock_level numeric(14,3) not null default 0,

    maximum_stock_level numeric(14,3) null,

    last_movement_at timestamptz null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint inventory_quantity_check
        check (quantity_on_hand >= 0),

    constraint inventory_reserved_check
        check (reserved_quantity >= 0),

    constraint inventory_reserved_not_above_stock
        check (reserved_quantity <= quantity_on_hand),

    constraint inventory_average_cost_check
        check (average_cost >= 0),

    constraint inventory_minimum_stock_check
        check (minimum_stock_level >= 0),

    constraint inventory_maximum_stock_check
        check (
            maximum_stock_level is null
            or maximum_stock_level >= minimum_stock_level
        )
);


-- ============================================================
-- One inventory record per product per stock location
-- ============================================================

create unique index if not exists inventory_product_warehouse_unique
on public.inventory (
    tenant_id,
    product_id,
    warehouse_id
);


-- ============================================================
-- Tenant lookup
-- ============================================================

create index if not exists inventory_tenant_index
on public.inventory (
    tenant_id
);


-- ============================================================
-- Product lookup
-- ============================================================

create index if not exists inventory_product_index
on public.inventory (
    tenant_id,
    product_id
);


-- ============================================================
-- Warehouse lookup
-- ============================================================

create index if not exists inventory_warehouse_index
on public.inventory (
    tenant_id,
    warehouse_id
);


-- ============================================================
-- Low-stock queries
-- ============================================================

create index if not exists inventory_low_stock_index
on public.inventory (
    tenant_id,
    quantity_on_hand,
    minimum_stock_level
);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.inventory enable row level security;


create policy "tenant_inventory_access"
on public.inventory
for all
using (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
);