-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Fix Sales Order Items Tenant RLS
-- ============================================================

drop policy if exists
"tenant_sales_order_items_access"
on public.sales_order_items;


create policy
"tenant_sales_order_items_access"
on public.sales_order_items
for all
to authenticated

using (

    exists (

        select 1

        from public.sales_orders so

        join public.users u
          on u.tenant_id = so.tenant_id

        where so.id =
              public.sales_order_items.sales_order_id

        and u.auth_user_id =
            auth.uid()

    )

)

with check (

    exists (

        select 1

        from public.sales_orders so

        join public.users u
          on u.tenant_id = so.tenant_id

        where so.id =
              public.sales_order_items.sales_order_id

        and u.auth_user_id =
            auth.uid()

    )

);
