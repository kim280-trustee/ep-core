-- ============================================
-- EP CORE REGISTRATION POLICIES
-- Version: 005
-- ============================================


-- TENANTS
create policy "Allow authenticated tenant creation"
on tenants
for insert
to authenticated
with check (true);



-- USERS
create policy "Allow authenticated user creation"
on users
for insert
to authenticated
with check (true);



-- COMPANY SETTINGS
create policy "Allow authenticated company settings creation"
on company_settings
for insert
to authenticated
with check (true);



-- ROLES
create policy "Allow authenticated role creation"
on roles
for insert
to authenticated
with check (true);



-- USER ROLES
create policy "Allow authenticated user role creation"
on user_roles
for insert
to authenticated
with check (true);