-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Purchasing V1
-- Purchase Order Items
-- ============================================================

create table if not exists public.purchase_order_items (

    id uuid primary key default gen_random_uuid(),

    purchase_order_id uuid not null,

    product_id uuid not null,

    quantity_ordered numeric(14,2) not null default 0,

    quantity_received numeric(14,2) not null default 0,

    unit_cost numeric(14,2) not null default 0,

    tax_rate numeric(5,2) not null default 0,

    line_total numeric(14,2) not null default 0,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),


    constraint purchase_order_items_quantity_ordered_check

        check (quantity_ordered > 0),


    constraint purchase_order_items_quantity_received_check

        check (quantity_received >= 0),


    constraint purchase_order_items_unit_cost_check

        check (unit_cost >= 0),


    constraint purchase_order_items_tax_rate_check

        check (tax_rate >= 0),


    constraint purchase_order_items_line_total_check

        check (line_total >= 0),


    constraint purchase_order_items_received_check

        check (quantity_received <= quantity_ordered)

);


create index if not exists
purchase_order_items_purchase_order_index

on public.purchase_order_items (

    purchase_order_id

);


create index if not exists
purchase_order_items_product_index

on public.purchase_order_items (

    product_id

);


alter table public.purchase_order_items
enable row level security;