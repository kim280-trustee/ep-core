-- Persist a learner's own daily XP target across devices while keeping preferences self-service only.
begin;

create table public.learning_student_gamification_preferences (
  tenant_id uuid not null,
  student_user_id uuid primary key,
  daily_xp_goal integer not null default 20 check (daily_xp_goal in (20, 40, 60, 80)),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, student_user_id) references public.users(tenant_id, id) on delete cascade
);

alter table public.learning_student_gamification_preferences enable row level security;
revoke all on public.learning_student_gamification_preferences from public, anon, authenticated;

create or replace function public.get_learning_student_daily_xp_goal()
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_goal integer;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to view your daily learning goal.';
  end if;

  select p.daily_xp_goal into v_goal
  from public.learning_student_gamification_preferences p
  where p.student_user_id = v_user;

  return coalesce(v_goal, 20);
end;
$function$;

create or replace function public.set_learning_student_daily_xp_goal(p_daily_xp_goal integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_tenant_id uuid;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to change your daily learning goal.';
  end if;
  if p_daily_xp_goal not in (20, 40, 60, 80) then
    raise exception 'Choose a daily goal of 20, 40, 60, or 80 XP.';
  end if;

  select u.tenant_id into v_tenant_id
  from public.users u
  where u.id = v_user;
  if v_tenant_id is null then
    raise exception 'Your learning profile could not be found.';
  end if;

  insert into public.learning_student_gamification_preferences (
    tenant_id, student_user_id, daily_xp_goal, updated_at
  ) values (
    v_tenant_id, v_user, p_daily_xp_goal, now()
  )
  on conflict (student_user_id) do update
    set daily_xp_goal = excluded.daily_xp_goal,
        updated_at = excluded.updated_at;

  return p_daily_xp_goal;
end;
$function$;

revoke all on function public.get_learning_student_daily_xp_goal() from public, anon;
grant execute on function public.get_learning_student_daily_xp_goal() to authenticated;
revoke all on function public.set_learning_student_daily_xp_goal(integer) from public, anon;
grant execute on function public.set_learning_student_daily_xp_goal(integer) to authenticated;

commit;
