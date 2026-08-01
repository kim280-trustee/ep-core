-- ============================================
-- EP CORE AUTHENTICATED INSERT PRIVILEGES
-- ============================================


grant insert on table public.tenants
to authenticated;


grant insert on table public.users
to authenticated;


grant insert on table public.company_settings
to authenticated;


grant insert on table public.roles
to authenticated;


grant insert on table public.user_roles
to authenticated;