-- ============================================
-- EP CORE AUTH IDENTITY MIGRATION
-- Version: 004
-- ============================================

-- Remove legacy password storage

alter table users
drop column if exists password_hash;

-- Link business users to Supabase Auth

alter table users
add column if not exists auth_user_id uuid unique;

-- Helpful index

create index if not exists idx_users_auth_user_id
on users(auth_user_id);

-- One Supabase account belongs to one business user

alter table users
add constraint users_auth_user_id_unique
unique (auth_user_id);