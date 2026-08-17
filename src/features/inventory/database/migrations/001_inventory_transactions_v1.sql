-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Inventory Transactions V1 Production Migration
-- ============================================================

alter table public.inventory_transactions
    add column if not exists movement_type varchar(30);

alter table public.inventory_transactions
    add column if not exists unit_cost numeric(14,4);

alter table public.inventory_transactions
    add column if not exists reference_type varchar(50);

alter table public.inventory_transactions
    add column if not exists notes text;


-- ============================================================
-- Migrate existing transaction data
-- ============================================================

update public.inventory_transactions
set movement_type =
    case type
        when 'PURCHASE_RECEIPT'
            then 'PURCHASE_RECEIPT'
        when 'SALE'
            then 'SALE'
        when 'RETURN'
            then 'SALE_RETURN'
        when 'TRANSFER'
            then 'TRANSFER_IN'
        when 'ADJUSTMENT'
            then 'ADJUSTMENT_IN'
        else 'ADJUSTMENT_IN'
    end
where movement_type is null;


update public.inventory_transactions
set unit_cost = 0
where unit_cost is null;


-- ============================================================
-- Preserve existing ledger rows while allowing the new
-- application contract to become authoritative.
-- ============================================================

alter table public.inventory_transactions
    alter column movement_type set not null;

alter table public.inventory_transactions
    alter column unit_cost set not null;

alter table public.inventory_transactions
    alter column unit_cost set default 0;


-- ============================================================
-- New V1 movement type constraint
-- ============================================================

alter table public.inventory_transactions
    drop constraint if exists inventory_transactions_type_check;

alter table public.inventory_transactions
    drop constraint if exists inventory_transactions_movement_type_check;

alter table public.inventory_transactions
    add constraint inventory_transactions_movement_type_check
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
    );


-- ============================================================
-- Production indexes
-- ============================================================

create index if not exists
inventory_transactions_movement_type_index
on public.inventory_transactions (
    tenant_id,
    movement_type,
    created_at desc
);


-- ============================================================
-- RLS
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
