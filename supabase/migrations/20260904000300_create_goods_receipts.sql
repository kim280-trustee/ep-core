-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Purchase Receiving V1
-- Goods Receipts
-- ============================================================

create table if not exists public.goods_receipts (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid not null,

    purchase_order_id uuid not null,

    supplier_id uuid not null,

    warehouse_id uuid not null,

    received_date timestamptz not null default now(),

    received_by uuid null,

    notes text null,

    created_at timestamptz not null default now()

);


create table if not exists public.goods_receipt_items (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    goods_receipt_id uuid not null,

    purchase_order_item_id uuid not null,

    product_id uuid not null,

    quantity_received numeric(14,2) not null,

    unit_cost numeric(14,2) not null default 0,

    line_total numeric(14,2) not null default 0,

    created_at timestamptz not null default now(),

    constraint goods_receipt_items_quantity_check

        check (quantity_received > 0),

    constraint goods_receipt_items_unit_cost_check

        check (unit_cost >= 0),

    constraint goods_receipt_items_line_total_check

        check (line_total >= 0)

);


create index if not exists
goods_receipts_tenant_index

on public.goods_receipts (

    tenant_id

);


create index if not exists
goods_receipts_purchase_order_index

on public.goods_receipts (

    tenant_id,

    purchase_order_id

);


create index if not exists
goods_receipt_items_tenant_index

on public.goods_receipt_items (

    tenant_id

);


create index if not exists
goods_receipt_items_receipt_index

on public.goods_receipt_items (

    tenant_id,

    goods_receipt_id

);


create index if not exists
goods_receipt_items_purchase_order_item_index

on public.goods_receipt_items (

    tenant_id,

    purchase_order_item_id

);


alter table public.goods_receipts
enable row level security;


alter table public.goods_receipt_items
enable row level security;


drop policy if exists
"tenant_goods_receipts_access"
on public.goods_receipts;


create policy
"tenant_goods_receipts_access"

on public.goods_receipts

for all

to authenticated

using (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.goods_receipts.tenant_id

    )

)

with check (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.goods_receipts.tenant_id

    )

);


drop policy if exists
"tenant_goods_receipt_items_access"
on public.goods_receipt_items;


create policy
"tenant_goods_receipt_items_access"

on public.goods_receipt_items

for all

to authenticated

using (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.goods_receipt_items.tenant_id

    )

)

with check (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.goods_receipt_items.tenant_id

    )

);


grant select, insert, update, delete
on table public.goods_receipts
to authenticated;


grant select, insert, update, delete
on table public.goods_receipt_items
to authenticated;
