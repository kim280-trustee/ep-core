-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Sales
-- Fix Sales Order Items Tenant Isolation
-- ============================================================

alter table public.sales_order_items
add column if not exists tenant_id uuid;

update public.sales_order_items soi
set tenant_id = so.tenant_id
from public.sales_orders so
where so.id = soi.sales_order_id
and soi.tenant_id is null;

alter table public.sales_order_items
alter column tenant_id set not null;

create index if not exists
sales_order_items_tenant_index
on public.sales_order_items (
    tenant_id
);

drop policy if exists
"tenant_sales_order_items_access"
on public.sales_order_items;

create policy
"tenant_sales_order_items_access"
on public.sales_order_items
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

grant select, insert, update, delete
on table public.sales_order_items
to authenticated;
