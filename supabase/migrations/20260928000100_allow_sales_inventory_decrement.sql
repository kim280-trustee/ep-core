-- Allow completed sales to reduce inventory without inventory-adjustment access.

insert into public.permissions (code, description)
values ('inventory.sell', 'Reduce available inventory as part of a completed sale.')
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select rp.role_id, sell.id
from public.role_permissions rp
join public.permissions create_perm
  on create_perm.id = rp.permission_id
 and create_perm.code = 'sales.create'
cross join public.permissions sell
where sell.code = 'inventory.sell'
and not exists (
  select 1 from public.role_permissions existing
  where existing.role_id = rp.role_id
    and existing.permission_id = sell.id
);

drop policy if exists inventory_update_authenticated on public.inventory;
create policy inventory_update_authenticated on public.inventory
for update to authenticated
using (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and (select has_permission('inventory.adjust') or has_permission('inventory.sell'))
)
with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and (select has_permission('inventory.adjust') or has_permission('inventory.sell'))
);

drop policy if exists inventory_transactions_insert_authenticated on public.inventory_transactions;
create policy inventory_transactions_insert_authenticated on public.inventory_transactions
for insert to authenticated
with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and (select has_permission('inventory.adjust') or has_permission('inventory.sell'))
);