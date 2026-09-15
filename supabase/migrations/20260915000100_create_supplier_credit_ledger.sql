-- E&P Smart POS
-- Supplier credit ledger

create table if not exists public.supplier_credit_ledger (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    store_id uuid not null,
    supplier_id uuid not null references public.suppliers(id),
    entry_type varchar(30) not null,
    reference_type varchar(40) null,
    reference_id uuid null,
    reference_number varchar(100) null,
    description text null,
    debit numeric(14,2) not null default 0,
    credit numeric(14,2) not null default 0,
    created_at timestamptz not null default now(),
    constraint supplier_credit_ledger_type_check
        check (entry_type in ('PURCHASE','PAYMENT','PURCHASE_RETURN','ADJUSTMENT')),
    constraint supplier_credit_ledger_amount_check
        check ((debit >= 0) and (credit >= 0) and not (debit > 0 and credit > 0)),
    constraint supplier_credit_ledger_reference_unique
        unique (tenant_id, store_id, reference_type, reference_id)
);

create index if not exists supplier_credit_ledger_supplier_index
on public.supplier_credit_ledger (tenant_id, store_id, supplier_id, created_at);

alter table public.supplier_credit_ledger enable row level security;

drop policy if exists "tenant_supplier_credit_ledger_access"
on public.supplier_credit_ledger;

create policy "tenant_supplier_credit_ledger_access"
on public.supplier_credit_ledger
for all to authenticated
using (
    exists (
        select 1
        from public.users u
        where u.auth_user_id = auth.uid()
          and u.tenant_id = public.supplier_credit_ledger.tenant_id
    )
)
with check (
    exists (
        select 1
        from public.users u
        where u.auth_user_id = auth.uid()
          and u.tenant_id = public.supplier_credit_ledger.tenant_id
    )
);

grant select, insert, update, delete
on table public.supplier_credit_ledger
to authenticated;
