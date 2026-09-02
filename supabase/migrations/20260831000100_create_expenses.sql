-- ============================================================
-- E&P Technologies
-- E&P Smart POS
-- Expenses
-- Initial Expense Schema
-- ============================================================

create table if not exists public.expenses (
    id uuid primary key,
    tenant_id uuid not null,
    store_id uuid not null,
    category text not null,
    description text not null,
    amount numeric(18,2) not null,
    currency text not null,
    expense_date timestamptz not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,

    constraint expenses_amount_check
        check (amount > 0),

    constraint expenses_category_check
        check (
            category in (
                'RENT',
                'SALARY',
                'ELECTRICITY',
                'WATER',
                'INTERNET',
                'TRANSPORT',
                'MARKETING',
                'OFFICE_SUPPLIES',
                'MAINTENANCE',
                'OTHER'
            )
        )
);

create index if not exists
expenses_tenant_store_index
on public.expenses (
    tenant_id,
    store_id
);

create index if not exists
expenses_date_index
on public.expenses (
    expense_date
);

alter table public.expenses
enable row level security;

drop policy if exists
"tenant_expenses_access"
on public.expenses;

create policy
"tenant_expenses_access"
on public.expenses
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
on table public.expenses
to authenticated;
