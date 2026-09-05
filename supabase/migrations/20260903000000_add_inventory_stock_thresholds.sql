-- Add inventory stock thresholds
alter table public.inventory
add column if not exists minimum_stock_level numeric not null default 10;

alter table public.inventory
add column if not exists maximum_stock_level numeric;

-- Keep thresholds valid
alter table public.inventory
drop constraint if exists inventory_minimum_stock_level_check;

alter table public.inventory
add constraint inventory_minimum_stock_level_check
check (minimum_stock_level >= 0);

alter table public.inventory
drop constraint if exists inventory_maximum_stock_level_check;

alter table public.inventory
add constraint inventory_maximum_stock_level_check
check (
  maximum_stock_level is null
  or maximum_stock_level >= minimum_stock_level
);
