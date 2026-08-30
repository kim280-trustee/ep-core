alter table public.warehouses
  add column if not exists store_id uuid;

alter table public.warehouses
  add column if not exists address varchar(255) not null default '';

alter table public.warehouses
  add column if not exists city varchar(100) not null default '';

alter table public.warehouses
  add column if not exists province varchar(100) not null default '';

alter table public.warehouses
  add column if not exists postal_code varchar(20) not null default '';

alter table public.warehouses
  add column if not exists country varchar(100) not null default 'Thailand';

alter table public.warehouses
  add column if not exists phone varchar(50);

alter table public.warehouses
  add column if not exists manager_name varchar(150);

create index if not exists warehouses_tenant_store_index
on public.warehouses (
  tenant_id,
  store_id
);
