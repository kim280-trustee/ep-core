-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Sales V1
-- Sales Order Items
-- ============================================================

create table if not exists public.sales_order_items (

    id uuid primary key default gen_random_uuid(),

    sales_order_id uuid not null,

    product_id uuid not null,

    quantity numeric(14,3) not null,

    unit_price numeric(14,2) not null default 0,

    discount_amount numeric(14,2) not null default 0,

    tax_rate numeric(5,2) not null default 0,

    line_total numeric(14,2) not null default 0,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint sales_order_items_quantity_check
        check (quantity > 0),

    constraint sales_order_items_unit_price_check
        check (unit_price >= 0),

    constraint sales_order_items_discount_check
        check (discount_amount >= 0),

    constraint sales_order_items_tax_rate_check
        check (tax_rate >= 0),

    constraint sales_order_items_line_total_check
        check (line_total >= 0)

);


create index if not exists
sales_order_items_sales_order_index

on public.sales_order_items (
    sales_order_id
);


create index if not exists
sales_order_items_product_index

on public.sales_order_items (
    product_id
);


alter table public.sales_order_items
enable row level security;


drop policy if exists
"tenant_sales_order_items_access"

on public.sales_order_items;


create policy
"tenant_sales_order_items_access"

on public.sales_order_items

for all

using (

    exists (

        select 1

        from public.sales_orders

        where public.sales_orders.id =
              public.sales_order_items.sales_order_id

        and public.sales_orders.tenant_id =
            (auth.jwt()->>'tenant_id')::uuid

    )

);