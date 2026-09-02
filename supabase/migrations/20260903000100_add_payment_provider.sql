alter table public.payments
add column if not exists provider varchar(100);

alter table public.payments
drop constraint if exists payments_method_check;

alter table public.payments
add constraint payments_method_check
check (method in ('CASH','CARD','QR','MOBILE_MONEY','BANK_TRANSFER'));

create index if not exists
payments_provider_index
on public.payments (tenant_id, method, provider);
