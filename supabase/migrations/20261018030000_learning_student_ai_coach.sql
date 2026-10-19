begin;

-- Stores only minimal request metadata. Student prompts and generated responses are never persisted.
create table if not exists public.learning_student_ai_coach_usage (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null,
  user_id uuid not null,
  model text not null check (length(model) between 1 and 100),
  created_at timestamptz not null default now(),
  constraint learning_student_ai_coach_usage_tenant_org_fk
    foreign key (tenant_id, organization_id)
    references public.organizations (tenant_id, id) on delete cascade,
  constraint learning_student_ai_coach_usage_tenant_user_fk
    foreign key (tenant_id, user_id)
    references public.users (tenant_id, id) on delete cascade
);

create index if not exists learning_student_ai_coach_usage_user_created_idx
  on public.learning_student_ai_coach_usage (user_id, created_at desc);

alter table public.learning_student_ai_coach_usage enable row level security;
revoke all on public.learning_student_ai_coach_usage from anon, authenticated;

-- Fixed server-side quota; callers cannot supply a higher limit.
create or replace function public.reserve_learning_student_ai_coach(
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
  v_limit constant integer := 5;
  v_model text;
begin
  v_auth_user_id := (select auth.uid());
  if v_auth_user_id is null then
    raise exception 'Authentication required';
  end if;

  select u.id, u.tenant_id
    into v_user_id, v_tenant_id
  from public.users u
  join public.organizations o
    on o.tenant_id = u.tenant_id
   and o.id = p_organization_id
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
      and cm.membership_type = 'student'
      and cm.status = 'active'
      and o.tenant_id = v_tenant_id
  ) then
    raise exception 'An active student enrollment in this organization is required';
  end if;

  v_model := left(trim(coalesce(p_model, 'unknown')), 100);
  if v_model = '' then
    v_model := 'unknown';
  end if;

  -- Prevent parallel requests from exceeding the per-student quota.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 1));

  select count(*)::integer, min(u.created_at)
    into v_count, v_oldest
  from public.learning_student_ai_coach_usage u
  where u.user_id = v_user_id
    and u.created_at >= now() - interval '24 hours';

  if v_count >= v_limit then
    return query select false, v_count, v_limit, coalesce(v_oldest + interval '24 hours', now());
    return;
  end if;

  insert into public.learning_student_ai_coach_usage (
    tenant_id, organization_id, user_id, model
  ) values (
    v_tenant_id, p_organization_id, v_user_id, v_model
  );

  v_count := v_count + 1;
  return query select true, v_count, v_limit, coalesce(v_oldest, now()) + interval '24 hours';
end;
$function$;

revoke all on function public.reserve_learning_student_ai_coach(uuid, text) from public, anon;
grant execute on function public.reserve_learning_student_ai_coach(uuid, text) to authenticated;

commit;
