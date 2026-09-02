-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Payments V1
-- Payment Transactions
-- ============================================================

create table if not exists public.payments (

    id uuid primary key,

    tenant_id uuid not null,

    sales_order_id uuid not null,

    method varchar(30) not null,

    amount numeric(18,2) not null,

    status varchar(30) not null default 'PENDING',

    reference text null,

    created_at timestamptz not null,

    updated_at timestamptz not null,


    constraint payments_method_check

        check (

            method in (

                'CASH',

                'CARD',

                'QR',

                'BANK_TRANSFER'

            )

        ),


    constraint payments_status_check

        check (

            status in (

                'PENDING',

                'COMPLETED',

                'FAILED',

                'REFUNDED'

            )

        ),


    constraint payments_amount_check

        check (

            amount > 0

        )

);


-- ============================================================
-- Tenant + sales order lookup
-- ============================================================

create index if not exists
payments_tenant_order_index

on public.payments (

    tenant_id,

    sales_order_id

);


-- ============================================================
-- Tenant lookup
-- ============================================================

create index if not exists
payments_tenant_index

on public.payments (

    tenant_id

);


-- ============================================================
-- Status lookup
-- ============================================================

create index if not exists
payments_status_index

on public.payments (

    tenant_id,

    status,

    created_at desc

);


-- ============================================================
-- Chronological lookup
-- ============================================================

create index if not exists
payments_created_index

on public.payments (

    tenant_id,

    created_at desc

);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.payments
enable row level security;


drop policy if exists
"tenant_payments_access"

on public.payments;


create policy
"tenant_payments_access"

on public.payments

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


-- ============================================================
-- Grants
-- ============================================================

grant select, insert, update, delete

on table public.payments

to authenticated;
