-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Sales V1
-- Sales Orders
-- ============================================================

create table if not exists public.sales_orders (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid null,

    warehouse_id uuid not null,

    customer_id uuid null,

    order_number varchar(50) not null,

    status varchar(30) not null default 'DRAFT',

    subtotal numeric(14,2) not null default 0,

    discount_amount numeric(14,2) not null default 0,

    tax_amount numeric(14,2) not null default 0,

    total_amount numeric(14,2) not null default 0,

    payment_status varchar(30) not null default 'UNPAID',

    notes text null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),


    constraint sales_orders_status_check

        check (

            status in (

                'DRAFT',

                'CONFIRMED',

                'PROCESSING',

                'COMPLETED',

                'CANCELLED',

                'REFUNDED'

            )

        ),


    constraint sales_orders_payment_status_check

        check (

            payment_status in (

                'UNPAID',

                'PARTIALLY_PAID',

                'PAID'

            )

        ),


    constraint sales_orders_amounts_check

        check (

            subtotal >= 0

            and discount_amount >= 0

            and tax_amount >= 0

            and total_amount >= 0

        )

);


-- ============================================================
-- Tenant + order number
-- ============================================================

create unique index if not exists
sales_orders_tenant_order_number_unique

on public.sales_orders (

    tenant_id,

    order_number

);


-- ============================================================
-- Tenant lookup
-- ============================================================

create index if not exists
sales_orders_tenant_index

on public.sales_orders (

    tenant_id

);


-- ============================================================
-- Customer lookup
-- ============================================================

create index if not exists
sales_orders_customer_index

on public.sales_orders (

    tenant_id,

    customer_id

);


-- ============================================================
-- Warehouse lookup
-- ============================================================

create index if not exists
sales_orders_warehouse_index

on public.sales_orders (

    tenant_id,

    warehouse_id

);


-- ============================================================
-- Status lookup
-- ============================================================

create index if not exists
sales_orders_status_index

on public.sales_orders (

    tenant_id,

    status,

    created_at desc

);


-- ============================================================
-- Date / chronological lookup
-- ============================================================

create index if not exists
sales_orders_created_index

on public.sales_orders (

    tenant_id,

    created_at desc

);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.sales_orders
enable row level security;


drop policy if exists
"tenant_sales_orders_access"

on public.sales_orders;


create policy
"tenant_sales_orders_access"

on public.sales_orders

for all

using (

    tenant_id =
    (auth.jwt()->>'tenant_id')::uuid

);
