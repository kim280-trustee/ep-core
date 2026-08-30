alter table public.warehouses
add column if not exists store_id uuid;

update public.warehouses
set store_id = tenant_id
where store_id is null;

alter table public.warehouses
alter column store_id set not null;

create index if not exists warehouses_tenant_store_index
on public.warehouses (
    tenant_id,
    store_id
);
