-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Fix Customers Tenant RLS
-- ============================================================

drop policy if exists
"tenant_customers_access"
on public.customers;

create policy
"tenant_customers_access"
on public.customers
for all
to authenticated

using (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.customers.tenant_id

    )

)

with check (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.customers.tenant_id

    )

);

grant select, insert, update, delete
on table public.customers
to authenticated;
