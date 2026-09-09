-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Fix Purchase Order Items Tenant RLS
-- ============================================================

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
        from public.purchase_orders po
        join public.users u
          on u.tenant_id = po.tenant_id
        where po.id = public.purchase_order_items.purchase_order_id
          and u.auth_user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.purchase_orders po
        join public.users u
          on u.tenant_id = po.tenant_id
        where po.id = public.purchase_order_items.purchase_order_id
          and u.auth_user_id = auth.uid()
    )
);

grant select, insert, update, delete
on table public.purchase_order_items
to authenticated;
