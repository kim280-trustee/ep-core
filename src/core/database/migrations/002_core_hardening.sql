-- ============================================
-- EP CORE DATABASE HARDENING
-- Version: 002
-- Purpose:
--   - Improve audit readiness
--   - Fix tenant isolation preparation
--   - Improve role architecture
-- ============================================


-- ============================================
-- TENANTS
-- Add update tracking
-- ============================================

alter table tenants

add column if not exists updated_at
timestamp with time zone
default now();



-- ============================================
-- USERS
-- Add update tracking
-- ============================================

alter table users

add column if not exists updated_at
timestamp with time zone
default now();



-- Remove global email uniqueness

alter table users

drop constraint if exists users_email_key;



-- Add tenant-based email uniqueness

create unique index if not exists users_email_tenant_unique

on users(email, tenant_id);



-- ============================================
-- ROLES
-- Support system and tenant roles
-- ============================================

alter table roles

add column if not exists is_system_role
boolean
default false;



alter table roles

add column if not exists updated_at
timestamp with time zone
default now();



-- ============================================
-- PERMISSIONS
-- Add update tracking
-- ============================================

alter table permissions

add column if not exists updated_at
timestamp with time zone
default now();



-- ============================================
-- COMPANY SETTINGS
-- Already has updated_at
-- ============================================



-- ============================================
-- ROLE PERMISSIONS
-- Prevent duplicates
-- ============================================

create unique index if not exists role_permissions_unique

on role_permissions(role_id, permission_id);



-- ============================================
-- USER ROLES
-- Prevent duplicates
-- ============================================

create unique index if not exists user_roles_unique

on user_roles(user_id, role_id);



-- ============================================
-- PERFORMANCE INDEXES
-- Tenant lookups
-- ============================================

create index if not exists users_tenant_id_index

on users(tenant_id);



create index if not exists roles_tenant_id_index

on roles(tenant_id);



create index if not exists company_settings_tenant_id_index

on company_settings(tenant_id);



-- ============================================
-- ENABLE FUTURE RLS PREPARATION
-- Do not create policies yet
-- Policies require Supabase Auth mapping
-- ============================================

-- RLS will be enabled after authentication
-- and tenant JWT claims are finalized.



-- ============================================
-- END VERSION 002
-- ============================================