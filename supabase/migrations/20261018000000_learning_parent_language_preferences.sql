begin;

create table if not exists public.learning_parent_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'th')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learning_parent_preferences enable row level security;

drop policy if exists "Users can read their own learning parent preferences"
  on public.learning_parent_preferences;
create policy "Users can read their own learning parent preferences"
  on public.learning_parent_preferences
  for select to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = learning_parent_preferences.user_id
        and u.auth_user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can insert their own learning parent preferences"
  on public.learning_parent_preferences;
create policy "Users can insert their own learning parent preferences"
  on public.learning_parent_preferences
  for insert to authenticated
  with check (
    exists (
      select 1 from public.users u
      where u.id = learning_parent_preferences.user_id
        and u.auth_user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can update their own learning parent preferences"
  on public.learning_parent_preferences;
create policy "Users can update their own learning parent preferences"
  on public.learning_parent_preferences
  for update to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = learning_parent_preferences.user_id
        and u.auth_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = learning_parent_preferences.user_id
        and u.auth_user_id = (select auth.uid())
    )
  );

revoke all on public.learning_parent_preferences from anon, authenticated;
grant select, insert, update on public.learning_parent_preferences to authenticated;

create or replace function public.get_learning_parent_language_preference()
returns text
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare
  v_user_id uuid;
  v_language text;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select p.preferred_language into v_language
  from public.learning_parent_preferences p
  where p.user_id = v_user_id;

  return coalesce(v_language, 'en');
end;
$function$;

create or replace function public.set_learning_parent_language_preference(p_language text)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
begin
  if p_language not in ('en', 'th') or p_language is null then
    raise exception 'Unsupported language preference';
  end if;

  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  insert into public.learning_parent_preferences (user_id, preferred_language)
  values (v_user_id, p_language)
  on conflict (user_id) do update
    set preferred_language = excluded.preferred_language,
        updated_at = now();

  return p_language;
end;
$function$;

revoke all on function public.get_learning_parent_language_preference() from public, anon;
revoke all on function public.set_learning_parent_language_preference(text) from public, anon;
grant execute on function public.get_learning_parent_language_preference() to authenticated;
grant execute on function public.set_learning_parent_language_preference(text) to authenticated;

commit;
