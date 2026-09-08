-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Purchasing V1
-- Corrective Purchase Orders Foundation
-- ============================================================

create table if not exists public.purchase_orders (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid null,

    supplier_id uuid not null,

    warehouse_id uuid null,

    order_number varchar(50) not null,

    order_date timestamptz not null default now(),

    expected_delivery_date timestamptz null,

    status varchar(30) not null default 'DRAFT',

    currency varchar(10) not null default 'THB',

    subtotal numeric(14,2) not null default 0,

    tax_amount numeric(14,2) not null default 0,

    total_amount numeric(14,2) not null default 0,

    notes text null,

    created_by uuid null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint purchase_orders_status_check

        check (

            status in (

                'DRAFT',

                'SUBMITTED',

                'APPROVED',

                'PARTIALLY_RECEIVED',

                'RECEIVED',

                'CANCELLED'

            )

        ),

    constraint purchase_orders_amounts_check

        check (

            subtotal >= 0

            and tax_amount >= 0

            and total_amount >= 0

        ),

    constraint purchase_orders_currency_check

        check (length(trim(currency)) > 0)

);


create unique index if not exists
purchase_orders_tenant_order_number_unique

on public.purchase_orders (

    tenant_id,

    order_number

);


create index if not exists
purchase_orders_tenant_index

on public.purchase_orders (

    tenant_id

);


create index if not exists
purchase_orders_supplier_index

on public.purchase_orders (

    tenant_id,

    supplier_id

);


create index if not exists
purchase_orders_warehouse_index

on public.purchase_orders (

    tenant_id,

    warehouse_id

);


create index if not exists
purchase_orders_status_index

on public.purchase_orders (

    tenant_id,

    status,

    created_at desc

);


create index if not exists
purchase_orders_created_index

on public.purchase_orders (

    tenant_id,

    created_at desc

);


alter table public.purchase_orders
enable row level security;


drop policy if exists
"tenant_purchase_orders_access"
on public.purchase_orders;


create policy
"tenant_purchase_orders_access"

on public.purchase_orders

for all

to authenticated

using (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.purchase_orders.tenant_id

    )

)

with check (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.purchase_orders.tenant_id

    )

);


grant select, insert, update, delete

on table public.purchase_orders

to authenticated;
