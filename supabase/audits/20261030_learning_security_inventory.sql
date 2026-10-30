-- E&P Learning production security inventory (read-only).
-- Run with a database role allowed to inspect catalogs. This script does not
-- alter data, grants, policies, functions, or migration history.

-- 1. SECURITY DEFINER functions exposed through Supabase API schemas and
--    executable by anon/authenticated. Review each body before changing it.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_userbyid(p.proowner) as owner_name,
  p.prosecdef as security_definer,
  p.proconfig as function_settings,
  coalesce(array_agg(distinct grantee.rolname) filter (where grantee.rolname is not null), '{}') as executable_roles,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
left join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl on true
left join pg_roles grantee on grantee.oid = acl.grantee
where n.nspname in ('public', 'graphql_public')
  and p.prosecdef
  and (acl.grantee = 0 or grantee.rolname in ('anon', 'authenticated'))
group by n.nspname, p.oid
order by n.nspname, p.proname;

-- 2. RLS-enabled tables without policies. Some are intentionally RPC-only;
--    do not create permissive policies automatically.
select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls,
       coalesce(array_agg(p.polname) filter (where p.polname is not null), '{}') as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where c.relkind in ('r','p')
  and n.nspname in ('public','storage')
  and c.relrowsecurity
group by n.nspname, c.oid
having count(p.oid) = 0
order by n.nspname, c.relname;

-- 3. Policies and their predicates, to find broad membership checks and
--    permissive OR combinations requiring explicit role/class scoping.
select schemaname, tablename, policyname, permissive, roles,
       cmd, qual, with_check
from pg_policies
where schemaname in ('public','storage')
order by schemaname, tablename, policyname;

-- 4. Views in exposed schemas. Review owner/RLS behavior; on PostgreSQL 15+
--    consider security_invoker=true where caller RLS must apply.
select schemaname, viewname, viewowner, definition
from pg_views
where schemaname in ('public','graphql_public')
order by schemaname, viewname;

-- 5. Migration history inventory. Compare these versions with repository
--    supabase/migrations filenames; never rewrite history to hide drift.
select version, name
from supabase_migrations.schema_migrations
order by version;
