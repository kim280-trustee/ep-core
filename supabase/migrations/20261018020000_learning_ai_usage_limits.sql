begin;

-- Durable, minimal audit of AI generation attempts. No prompt or student data is stored.
create table if not exists public.learning_ai_generation_usage (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  model text not null check (length(model) between 1 and 100),
  created_at timestamptz not null default now()
);

create index if not exists learning_ai_generation_usage_user_created_idx
  on public.learning_ai_generation_usage (user_id, created_at desc);

create index if not exists learning_ai_generation_usage_tenant_created_idx
  on public.learning_ai_generation_usage (tenant_id, created_at desc);

alter table public.learning_ai_generation_usage enable row level security;
revoke all on public.learning_ai_generation_usage from anon, authenticated;

-- The quota is enforced server-side and cannot be increased by passing a client-supplied limit.
-- This reserves one attempt per authenticated teacher and organization before calling the provider.
create or replace function public.reserve_learning_ai_generation(
  p_organization_id uuid,
  p_model text
)
returns table (
  allowed boolean,
  used_last_24_hours integer,
  daily_limit integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid;
  v_user_id uuid;
  v_tenant_id uuid;
  v_count integer := 0;
  v_oldest timestamptz;
  v_limit constant integer := 10;
  v_model text;
begin
  v_auth_user_id := (select auth.uid());
  if v_auth_user_id is null then
    raise exception 'Authentication required';
  end if;

  select u.id, u.tenant_id
    into v_user_id, v_tenant_id
  from public.users u
  where u.auth_user_id = v_auth_user_id
  limit 1;

  if v_user_id is null or v_tenant_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if not exists (
    select 1
    from public.learning_class_memberships cm
    join public.organizations o on o.id = cm.organization_id
    where cm.organization_id = p_organization_id
      and cm.user_id = v_user_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
      and o.tenant_id = v_tenant_id
  ) then
    raise exception 'An active teacher assignment in this organization is required';
  end if;

  v_model := left(trim(coalesce(p_model, 'unknown')), 100);
  if v_model = '' then
    v_model := 'unknown';
  end if;

  -- Serialize concurrent reservations for this user so parallel requests cannot exceed the cap.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select count(*)::integer, min(u.created_at)
    into v_count, v_oldest
  from public.learning_ai_generation_usage u
  where u.user_id = v_user_id
    and u.created_at >= now() - interval '24 hours';

  if v_count >= v_limit then
    return query select false, v_count, v_limit, coalesce(v_oldest + interval '24 hours', now());
    return;
  end if;

  insert into public.learning_ai_generation_usage (
    tenant_id, organization_id, user_id, model
  ) values (
    v_tenant_id, p_organization_id, v_user_id, v_model
  );

  v_count := v_count + 1;
  return query select true, v_count, v_limit, coalesce(v_oldest, now()) + interval '24 hours';
end;
$function$;

revoke all on function public.reserve_learning_ai_generation(uuid, text) from public, anon;
grant execute on function public.reserve_learning_ai_generation(uuid, text) to authenticated;

commit;
