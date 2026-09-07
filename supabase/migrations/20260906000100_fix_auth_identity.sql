-- EP Core auth identity deployment
alter table public.users
add column if not exists auth_user_id uuid unique;

create index if not exists idx_users_auth_user_id
on public.users(auth_user_id);

drop policy if exists "Allow authenticated tenant creation" on public.tenants;
drop policy if exists "Allow authenticated user creation" on public.users;

create policy "Allow authenticated tenant creation"
on public.tenants
for insert
to authenticated
with check (true);

create policy "Allow authenticated user creation"
on public.users
for insert
to authenticated
with check (true);
