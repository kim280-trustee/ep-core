-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Inventory Transaction / Movement Ledger
-- ============================================================

create table if not exists public.inventory_transactions (
    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid null,

    warehouse_id uuid not null,

    product_id uuid not null,

    movement_type varchar(30) not null,

    quantity numeric(14,3) not null,

    unit_cost numeric(14,4) not null default 0,

    reference_type varchar(50) null,

    reference_id uuid null,

    notes text null,

    created_at timestamptz not null default now(),

    constraint inventory_transactions_movement_type_check
        check (
            movement_type in (
                'INITIAL_STOCK',
                'PURCHASE_RECEIPT',
                'SALE',
                'SALE_RETURN',
                'PURCHASE_RETURN',
                'TRANSFER_OUT',
                'TRANSFER_IN',
                'ADJUSTMENT_IN',
                'ADJUSTMENT_OUT',
                'STOCK_COUNT'
            )
        ),

    constraint inventory_transactions_quantity_check
        check (quantity <> 0),

    constraint inventory_transactions_unit_cost_check
        check (unit_cost >= 0)
);


-- ============================================================
-- Tenant + chronological history
-- ============================================================

create index if not exists
inventory_transactions_tenant_created_index
on public.inventory_transactions (
    tenant_id,
    created_at desc
);


-- ============================================================
-- Product history
-- ============================================================

create index if not exists
inventory_transactions_product_index
on public.inventory_transactions (
    tenant_id,
    product_id,
    created_at desc
);


-- ============================================================
-- Warehouse history
-- ============================================================

create index if not exists
inventory_transactions_warehouse_index
on public.inventory_transactions (
    tenant_id,
    warehouse_id,
    created_at desc
);


-- ============================================================
-- Movement type filtering
-- ============================================================

create index if not exists
inventory_transactions_movement_type_index
on public.inventory_transactions (
    tenant_id,
    movement_type,
    created_at desc
);


-- ============================================================
-- Reference lookup
-- ============================================================

create index if not exists
inventory_transactions_reference_index
on public.inventory_transactions (
    tenant_id,
    reference_id
);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.inventory_transactions
enable row level security;


drop policy if exists
"tenant_inventory_transactions_access"
on public.inventory_transactions;


create policy
"tenant_inventory_transactions_access"
on public.inventory_transactions
for all
using (
    tenant_id =
    (auth.jwt()->>'tenant_id')::uuid
);
