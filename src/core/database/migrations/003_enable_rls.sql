-- ============================================
-- EP CORE RLS SECURITY
-- JWT Tenant Isolation
-- ============================================


alter table tenants enable row level security;

alter table users enable row level security;

alter table roles enable row level security;

alter table company_settings enable row level security;

alter table user_roles enable row level security;

alter table role_permissions enable row level security;



-- ============================================
-- TENANTS
-- ============================================

create policy "Users can access own tenant"

on tenants

for select

using (

    id =
    (
      auth.jwt()
      -> 'app_metadata'
      ->> 'tenant_id'
    )::uuid

);



-- ============================================
-- USERS
-- ============================================

create policy "Tenant user isolation"

on users

for all

using (

    tenant_id =
    (
      auth.jwt()
      -> 'app_metadata'
      ->> 'tenant_id'
    )::uuid

);



-- ============================================
-- ROLES
-- ============================================

create policy "Tenant role isolation"

on roles

for all

using (

    tenant_id =
    (
      auth.jwt()
      -> 'app_metadata'
      ->> 'tenant_id'
    )::uuid

);



-- ============================================
-- COMPANY SETTINGS
-- ============================================

create policy "Tenant settings isolation"

on company_settings

for all

using (

    tenant_id =
    (
      auth.jwt()
      -> 'app_metadata'
      ->> 'tenant_id'
    )::uuid

);



-- ============================================
-- USER ROLES
-- ============================================

create policy "Tenant user role isolation"

on user_roles

for all

using (

    exists (

        select 1

        from users

        where users.id = user_roles.user_id

        and users.tenant_id =
        (
          auth.jwt()
          -> 'app_metadata'
          ->> 'tenant_id'
        )::uuid

    )

);



-- ============================================
-- ROLE PERMISSIONS
-- ============================================

create policy "Tenant role permission isolation"

on role_permissions

for all

using (

    exists (

        select 1

        from roles

        where roles.id = role_permissions.role_id

        and roles.tenant_id =
        (
          auth.jwt()
          -> 'app_metadata'
          ->> 'tenant_id'
        )::uuid

    )

);