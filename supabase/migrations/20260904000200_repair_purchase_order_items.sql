-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Purchasing V1
-- Corrective Purchase Order Items
-- ============================================================

do $$

begin

    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
        and table_name = 'purchase_order_items'
        and column_name = 'quantity_ordered'
    )
    and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
        and table_name = 'purchase_order_items'
        and column_name = 'quantity'
    )
    then

        alter table public.purchase_order_items
        rename column quantity_ordered to quantity;

    end if;


    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
        and table_name = 'purchase_order_items'
        and column_name = 'quantity_received'
    )
    and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
        and table_name = 'purchase_order_items'
        and column_name = 'received_quantity'
    )
    then

        alter table public.purchase_order_items
        rename column quantity_received to received_quantity;

    end if;

end $$;


create table if not exists public.purchase_order_items (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    purchase_order_id uuid not null,

    product_id uuid not null,

    quantity numeric(14,2) not null default 0,

    received_quantity numeric(14,2) not null default 0,

    unit_cost numeric(14,2) not null default 0,

    tax_rate numeric(5,2) not null default 0,

    tax_amount numeric(14,2) not null default 0,

    line_total numeric(14,2) not null default 0,

    notes text null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint purchase_order_items_quantity_check

        check (quantity > 0),

    constraint purchase_order_items_received_check

        check (
            received_quantity >= 0
            and received_quantity <= quantity
        ),

    constraint purchase_order_items_unit_cost_check

        check (unit_cost >= 0),

    constraint purchase_order_items_tax_rate_check

        check (tax_rate >= 0),

    constraint purchase_order_items_amounts_check

        check (
            tax_amount >= 0
            and line_total >= 0
        )

);


create index if not exists
purchase_order_items_tenant_index

on public.purchase_order_items (

    tenant_id

);


create index if not exists
purchase_order_items_purchase_order_index

on public.purchase_order_items (

    tenant_id,

    purchase_order_id

);


create index if not exists
purchase_order_items_product_index

on public.purchase_order_items (

    tenant_id,

    product_id

);


alter table public.purchase_order_items
enable row level security;


drop policy if exists
"tenant_purchase_order_items_access"
on public.purchase_order_items;


create policy
"tenant_purchase_order_items_access"

on public.purchase_order_items

for all

to authenticated

using (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.purchase_order_items.tenant_id

    )

)

with check (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.purchase_order_items.tenant_id

    )

);


grant select, insert, update, delete

on table public.purchase_order_items

to authenticated;

