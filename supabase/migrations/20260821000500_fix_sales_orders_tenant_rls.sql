-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Fix Sales Orders Tenant RLS
-- ============================================================

drop policy if exists
"tenant_sales_orders_access"
on public.sales_orders;


create policy
"tenant_sales_orders_access"
on public.sales_orders
for all
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
