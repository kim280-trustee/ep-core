-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Fix Suppliers Tenant RLS
-- ============================================================

drop policy if exists
"tenant_suppliers_access"
on public.suppliers;


create policy
"tenant_suppliers_access"
on public.suppliers
for all
to authenticated

using (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.suppliers.tenant_id

    )

)

with check (

    exists (

        select 1

        from public.users u

        where u.auth_user_id = auth.uid()

        and u.tenant_id =
            public.suppliers.tenant_id

    )

);


grant select, insert, update, delete
on table public.suppliers
to authenticated;
