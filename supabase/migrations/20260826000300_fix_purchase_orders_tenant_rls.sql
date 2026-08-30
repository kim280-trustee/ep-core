-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Fix Purchase Orders Tenant RLS
-- ============================================================

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
