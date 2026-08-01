-- ============================================
-- EP CORE FOUNDATION DATABASE SCHEMA
-- Version: 001
-- ============================================


-- ============================================
-- TENANTS
-- Every company/business using EP Core
-- ============================================

create table if not exists tenants (

    id uuid primary key default gen_random_uuid(),

    name text not null,

    country text not null,

    currency text not null,

    created_at timestamp with time zone
        default now()

);



-- ============================================
-- USERS
-- System users belonging to tenants
-- ============================================

create table if not exists users (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null
        references tenants(id)
        on delete cascade,

    name text not null,

    email text not null unique,

    password_hash text,

    created_at timestamp with time zone
        default now()

);



-- ============================================
-- ROLES
-- User permission groups
-- ============================================

create table if not exists roles (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid
        references tenants(id)
        on delete cascade,

    name text not null,

    created_at timestamp with time zone
        default now()

);



-- ============================================
-- PERMISSIONS
-- Available system actions
-- ============================================

create table if not exists permissions (

    id uuid primary key default gen_random_uuid(),

    code text not null unique,

    description text,

    created_at timestamp with time zone
        default now()

);



-- ============================================
-- ROLE PERMISSIONS
-- Many-to-many relationship
-- ============================================

create table if not exists role_permissions (

    id uuid primary key default gen_random_uuid(),

    role_id uuid not null
        references roles(id)
        on delete cascade,

    permission_id uuid not null
        references permissions(id)
        on delete cascade

);



-- ============================================
-- USER ROLES
-- User can have multiple roles
-- ============================================

create table if not exists user_roles (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references users(id)
        on delete cascade,

    role_id uuid not null
        references roles(id)
        on delete cascade

);



-- ============================================
-- COMPANY SETTINGS
-- Business configuration
-- ============================================

create table if not exists company_settings (

    id uuid primary key default gen_random_uuid(),

    tenant_id uuid not null
        references tenants(id)
        on delete cascade,

    business_name text not null,

    tax_enabled boolean default false,

    tax_rate numeric default 0,

    invoice_prefix text default 'INV',

    receipt_prefix text default 'REC',

    created_at timestamp with time zone
        default now(),

    updated_at timestamp with time zone
        default now()

);