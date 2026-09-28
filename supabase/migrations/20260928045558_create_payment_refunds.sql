-- Track each refund separately from the original payment.
-- This preserves the original payment amount and supports partial refunds.

create table if not exists public.payment_refunds (
    id uuid primary key,
    tenant_id uuid not null,
    payment_id uuid not null,
    sales_order_id uuid not null,
    amount numeric(18,2) not null,
    created_at timestamptz not null default now(),
    reference text null,

    constraint payment_refunds_amount_check
        check (amount > 0)
);

create index if not exists payment_refunds_tenant_payment_index
on public.payment_refunds (tenant_id, payment_id, created_at desc);

create index if not exists payment_refunds_tenant_order_index
on public.payment_refunds (tenant_id, sales_order_id, created_at desc);

alter table public.payment_refunds
enable row level security;

drop policy if exists payment_refunds_authenticated
on public.payment_refunds;

create policy payment_refunds_authenticated
on public.payment_refunds
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
on table public.payment_refunds
to authenticated;
