-- src/features/products/database/product.sql

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null,

    store_id uuid null,


    name varchar(150) not null,

    sku varchar(100) not null,

    barcode varchar(100) null,

    description text null,


    category_id uuid null,

    brand_id uuid null,

    unit_id uuid null,

    tax_id uuid null,


    product_type varchar(30)
        not null
        default 'STANDARD',


    status varchar(20)
        not null
        default 'ACTIVE',


    cost_price numeric(12,2)
        not null
        default 0,


    selling_price numeric(12,2)
        not null
        default 0,


    track_inventory boolean
        not null
        default true,


    image_url text null,


    deleted_at timestamptz null,


    created_at timestamptz
        not null
        default now(),


    updated_at timestamptz
        not null
        default now(),


    created_by uuid null,

    updated_by uuid null,


    constraint products_price_check
        check (
            selling_price >= 0
            and cost_price >= 0
        )
);


create unique index if not exists products_tenant_sku_unique
on public.products(
    tenant_id,
    sku
)
where deleted_at is null;


create unique index if not exists products_tenant_barcode_unique
on public.products(
    tenant_id,
    barcode
)
where barcode is not null
and deleted_at is null;


create index if not exists products_tenant_index
on public.products(
    tenant_id
);


create index if not exists products_category_index
on public.products(
    category_id
);


create index if not exists products_brand_index
on public.products(
    brand_id
);


create index if not exists products_status_index
on public.products(
    status
);


create index if not exists products_search_index
on public.products
using gin(
    to_tsvector(
        'simple',
        name || ' ' || sku
    )
);


alter table public.products enable row level security;


create policy "tenant_products_access"
on public.products
for all
using (
    tenant_id = auth.jwt()
        ->>'tenant_id'
);