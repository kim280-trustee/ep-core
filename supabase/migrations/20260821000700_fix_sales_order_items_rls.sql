-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Fix Sales Order Items RLS
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

        from public.sales_orders

        where public.sales_orders.id =
              public.sales_order_items.sales_order_id

        and public.sales_orders.tenant_id =
            (auth.jwt()->>'tenant_id')::uuid

    )

)
with check (

    exists (

        select 1

        from public.sales_orders

        where public.sales_orders.id =
              public.sales_order_items.sales_order_id

        and public.sales_orders.tenant_id =
            (auth.jwt()->>'tenant_id')::uuid

    )

);
