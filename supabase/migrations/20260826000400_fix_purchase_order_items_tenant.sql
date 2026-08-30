-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Purchasing
-- Fix Purchase Order Items Tenant Isolation
-- ============================================================

alter table public.purchase_order_items
add column if not exists tenant_id uuid;

update public.purchase_order_items poi
set tenant_id = po.tenant_id
from public.purchase_orders po
where po.id = poi.purchase_order_id
and poi.tenant_id is null;

alter table public.purchase_order_items
alter column tenant_id set not null;

create index if not exists
purchase_order_items_tenant_index
on public.purchase_order_items (
    tenant_id
);

drop policy if exists
"tenant_purchase_order_items_access"
on public.purchase_order_items;

create policy
"tenant_purchase_order_items_access"
on public.purchase_order_items
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
on table public.purchase_order_items
to authenticated;
