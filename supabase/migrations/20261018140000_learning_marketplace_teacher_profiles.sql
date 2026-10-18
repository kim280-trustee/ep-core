begin;

create table if not exists public.learning_marketplace_teacher_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teacher_user_id uuid not null references public.users(id) on delete cascade,
  headline text not null check (length(trim(headline)) between 5 and 120),
  bio text not null check (length(trim(bio)) between 30 and 3000),
  languages text[] not null default '{}',
  credentials text[] not null default '{}',
  experience_years smallint not null default 0 check (experience_years between 0 and 60),
  review_status text not null default 'pending' check (review_status in ('pending', 'verified', 'rejected')),
  review_note text check (review_note is null or length(review_note) <= 1000),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, teacher_user_id),
  constraint learning_marketplace_profile_languages_limit check (cardinality(languages) <= 10),
  constraint learning_marketplace_profile_credentials_limit check (cardinality(credentials) <= 20)
);

create index if not exists learning_marketplace_profiles_review_idx
  on public.learning_marketplace_teacher_profiles (organization_id, review_status, updated_at desc);

create index if not exists learning_marketplace_profiles_teacher_idx
  on public.learning_marketplace_teacher_profiles (teacher_user_id, organization_id);

alter table public.learning_marketplace_teacher_profiles enable row level security;
revoke all on public.learning_marketplace_teacher_profiles from anon, authenticated;

create or replace function public.list_learning_marketplace_teacher_profiles()
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  headline text,
  bio text,
  languages text[],
  credentials text[],
  experience_years smallint,
  review_status text,
  review_note text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare
  v_user_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  return query
  select profile.id, profile.organization_id, org.name, profile.headline, profile.bio,
    profile.languages, profile.credentials, profile.experience_years,
    profile.review_status, profile.review_note, profile.updated_at
  from public.learning_marketplace_teacher_profiles profile
  join public.organizations org on org.id = profile.organization_id
  where profile.teacher_user_id = v_user_id
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = profile.organization_id
        and cm.user_id = v_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  order by org.name;
end;
$function$;

create or replace function public.list_learning_marketplace_public_teacher_profiles()
returns table (
  organization_id uuid,
  teacher_user_id uuid,
  headline text,
  bio text,
  languages text[],
  credentials text[],
  experience_years smallint,
  school_reviewed boolean
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  return query
  select distinct profile.organization_id, profile.teacher_user_id,
    profile.headline, profile.bio, profile.languages, profile.credentials,
    profile.experience_years, profile.review_status = 'verified'
  from public.learning_marketplace_teacher_profiles profile
  join public.learning_marketplace_offerings offer
    on offer.organization_id = profile.organization_id
   and offer.teacher_user_id = profile.teacher_user_id
   and offer.status = 'published'
  where exists (
    select 1 from public.learning_class_memberships cm
    where cm.organization_id = profile.organization_id
      and cm.user_id = profile.teacher_user_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  );
end;
$function$;

create or replace function public.list_learning_marketplace_profiles_for_review()
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  teacher_user_id uuid,
  teacher_name text,
  headline text,
  bio text,
  languages text[],
  credentials text[],
  experience_years smallint,
  review_status text,
  review_note text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  return query
  select profile.id, profile.organization_id, org.name, profile.teacher_user_id,
    coalesce(teacher.name, 'Teacher'), profile.headline, profile.bio,
    profile.languages, profile.credentials, profile.experience_years,
    profile.review_status, profile.review_note, profile.updated_at
  from public.learning_marketplace_teacher_profiles profile
  join public.organizations org on org.id = profile.organization_id
  join public.users teacher on teacher.id = profile.teacher_user_id
  where profile.review_status = 'pending'
    and public.is_organization_member(profile.organization_id)
    and public.has_permission('learning.academic.manage')
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.organization_id = profile.organization_id
        and cm.user_id = profile.teacher_user_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  order by profile.updated_at asc;
end;
$function$;

create or replace function public.save_learning_marketplace_teacher_profile(
  p_organization_id uuid,
  p_headline text,
  p_bio text,
  p_languages text[],
  p_credentials text[],
  p_experience_years smallint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_profile_id uuid;
begin
  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.organization_id = p_organization_id
      and cm.user_id = v_user_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  ) then
    raise exception 'Only an active teacher in this organization can manage a profile';
  end if;

  if p_headline is null or length(trim(p_headline)) not between 5 and 120
     or p_bio is null or length(trim(p_bio)) not between 30 and 3000
     or p_experience_years is null or p_experience_years not between 0 and 60
     or cardinality(coalesce(p_languages, '{}')) > 10
     or cardinality(coalesce(p_credentials, '{}')) > 20
     or exists (select 1 from unnest(coalesce(p_languages, '{}')) as language_item(value) where length(trim(language_item.value)) not between 2 and 40)
     or exists (select 1 from unnest(coalesce(p_credentials, '{}')) as credential_item(value) where length(trim(credential_item.value)) not between 2 and 160) then
    raise exception 'Invalid teacher profile details';
  end if;

  insert into public.learning_marketplace_teacher_profiles (
    organization_id, teacher_user_id, headline, bio, languages, credentials, experience_years
  ) values (
    p_organization_id, v_user_id, trim(p_headline), trim(p_bio),
    coalesce(p_languages, '{}'), coalesce(p_credentials, '{}'), p_experience_years
  )
  on conflict (organization_id, teacher_user_id) do update
  set headline = excluded.headline,
      bio = excluded.bio,
      languages = excluded.languages,
      credentials = excluded.credentials,
      experience_years = excluded.experience_years,
      review_status = case
        when public.learning_marketplace_teacher_profiles.headline is distinct from excluded.headline
          or public.learning_marketplace_teacher_profiles.bio is distinct from excluded.bio
          or public.learning_marketplace_teacher_profiles.languages is distinct from excluded.languages
          or public.learning_marketplace_teacher_profiles.credentials is distinct from excluded.credentials
          or public.learning_marketplace_teacher_profiles.experience_years is distinct from excluded.experience_years
        then 'pending'
        else public.learning_marketplace_teacher_profiles.review_status
      end,
      review_note = case
        when public.learning_marketplace_teacher_profiles.headline is distinct from excluded.headline
          or public.learning_marketplace_teacher_profiles.bio is distinct from excluded.bio
          or public.learning_marketplace_teacher_profiles.languages is distinct from excluded.languages
          or public.learning_marketplace_teacher_profiles.credentials is distinct from excluded.credentials
          or public.learning_marketplace_teacher_profiles.experience_years is distinct from excluded.experience_years
        then null
        else public.learning_marketplace_teacher_profiles.review_note
      end,
      reviewed_by = case
        when public.learning_marketplace_teacher_profiles.headline is distinct from excluded.headline
          or public.learning_marketplace_teacher_profiles.bio is distinct from excluded.bio
          or public.learning_marketplace_teacher_profiles.languages is distinct from excluded.languages
          or public.learning_marketplace_teacher_profiles.credentials is distinct from excluded.credentials
          or public.learning_marketplace_teacher_profiles.experience_years is distinct from excluded.experience_years
        then null
        else public.learning_marketplace_teacher_profiles.reviewed_by
      end,
      reviewed_at = case
        when public.learning_marketplace_teacher_profiles.headline is distinct from excluded.headline
          or public.learning_marketplace_teacher_profiles.bio is distinct from excluded.bio
          or public.learning_marketplace_teacher_profiles.languages is distinct from excluded.languages
          or public.learning_marketplace_teacher_profiles.credentials is distinct from excluded.credentials
          or public.learning_marketplace_teacher_profiles.experience_years is distinct from excluded.experience_years
        then null
        else public.learning_marketplace_teacher_profiles.reviewed_at
      end,
      updated_at = now()
  returning id into v_profile_id;

  return v_profile_id;
end;
$function$;

create or replace function public.review_learning_marketplace_teacher_profile(
  p_profile_id uuid,
  p_status text,
  p_review_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor_id uuid;
  v_organization_id uuid;
  v_teacher_user_id uuid;
  v_profile_id uuid;
begin
  if p_status not in ('verified', 'rejected') then
    raise exception 'Profile review status must be verified or rejected';
  end if;
  if p_review_note is not null and length(p_review_note) > 1000 then
    raise exception 'Review note is too long';
  end if;

  select u.id into v_actor_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_actor_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select profile.organization_id, profile.teacher_user_id
    into v_organization_id, v_teacher_user_id
  from public.learning_marketplace_teacher_profiles profile
  where profile.id = p_profile_id
  for update;

  if not found then
    raise exception 'Teacher profile was not found';
  end if;

  if v_actor_id = v_teacher_user_id then
    raise exception 'Teachers cannot review their own profile';
  end if;

  if not public.is_organization_member(v_organization_id)
     or not public.has_permission('learning.academic.manage') then
    raise exception 'You do not have permission to review teacher profiles in this school';
  end if;

  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.organization_id = v_organization_id
      and cm.user_id = v_teacher_user_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  ) then
    raise exception 'Only active teachers can have reviewed profiles';
  end if;

  update public.learning_marketplace_teacher_profiles profile
  set review_status = p_status,
      review_note = nullif(trim(coalesce(p_review_note, '')), ''),
      reviewed_by = v_actor_id,
      reviewed_at = now(),
      updated_at = now()
  where profile.id = p_profile_id
    and profile.organization_id = v_organization_id
  returning profile.id into v_profile_id;

  return v_profile_id;
end;
$function$;

revoke all on function public.list_learning_marketplace_teacher_profiles() from public, anon;
revoke all on function public.list_learning_marketplace_public_teacher_profiles() from public, anon;
revoke all on function public.list_learning_marketplace_profiles_for_review() from public, anon;
revoke all on function public.save_learning_marketplace_teacher_profile(uuid, text, text, text[], text[], smallint) from public, anon;
revoke all on function public.review_learning_marketplace_teacher_profile(uuid, text, text) from public, anon;

grant execute on function public.list_learning_marketplace_teacher_profiles() to authenticated;
grant execute on function public.list_learning_marketplace_public_teacher_profiles() to authenticated;
grant execute on function public.list_learning_marketplace_profiles_for_review() to authenticated;
grant execute on function public.save_learning_marketplace_teacher_profile(uuid, text, text, text[], text[], smallint) to authenticated;
grant execute on function public.review_learning_marketplace_teacher_profile(uuid, text, text) to authenticated;

commit;
