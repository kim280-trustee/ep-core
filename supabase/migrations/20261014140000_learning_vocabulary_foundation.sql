-- Reusable, organization-scoped vocabulary catalog and per-student practice state.
create table public.learning_vocabulary_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  word text not null check (length(trim(word)) between 1 and 120),
  normalized_word text generated always as (lower(trim(word))) stored,
  definition text not null check (length(trim(definition)) between 1 and 3000),
  example_sentence text,
  translation text,
  pronunciation text,
  part_of_speech text,
  topic text,
  language_code text not null default 'en' check (language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
  translation_language_code text check (translation_language_code is null or translation_language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
  difficulty text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_vocabulary_entries_org_fk
    foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  constraint learning_vocabulary_entries_creator_fk
    foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict,
  constraint learning_vocabulary_entries_updater_fk
    foreign key (tenant_id, updated_by) references public.users(tenant_id, id) on delete restrict,
  constraint learning_vocabulary_entries_org_id_key unique (organization_id, id),
  constraint learning_vocabulary_entries_term_key unique (organization_id, language_code, normalized_word)
);

create index learning_vocabulary_entries_org_status_word_idx
  on public.learning_vocabulary_entries(organization_id, status, language_code, word);
create index learning_vocabulary_entries_org_topic_idx
  on public.learning_vocabulary_entries(organization_id, topic) where topic is not null;

create table public.learning_vocabulary_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  user_id uuid not null,
  vocabulary_entry_id uuid not null,
  status text not null default 'learning' check (status in ('learning','known')),
  last_practiced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_vocabulary_progress_org_fk
    foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  constraint learning_vocabulary_progress_user_fk
    foreign key (tenant_id, user_id) references public.users(tenant_id, id) on delete cascade,
  constraint learning_vocabulary_progress_entry_fk
    foreign key (organization_id, vocabulary_entry_id)
    references public.learning_vocabulary_entries(organization_id, id) on delete cascade,
  constraint learning_vocabulary_progress_unique unique (organization_id, user_id, vocabulary_entry_id)
);
create index learning_vocabulary_progress_student_status_idx
  on public.learning_vocabulary_progress(organization_id, user_id, status);

alter table public.learning_vocabulary_entries enable row level security;
alter table public.learning_vocabulary_progress enable row level security;

grant select, insert, update, delete on public.learning_vocabulary_entries to authenticated;
grant select, insert, update on public.learning_vocabulary_progress to authenticated;

-- Published entries are available to active members of the organization/class.
-- Teachers can see drafts in organizations where they teach; school managers can manage the catalog.
create policy learning_vocabulary_entries_select on public.learning_vocabulary_entries
for select to authenticated
using (
  (status = 'published' and (
    public.is_organization_member(organization_id)
    or exists (
      select 1
      from public.learning_class_memberships cm
      join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
      where cm.tenant_id = learning_vocabulary_entries.tenant_id
        and cm.organization_id = learning_vocabulary_entries.organization_id
        and cm.status = 'active'
        and u.auth_user_id = (select auth.uid())
    )
  ))
  or (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
  or exists (
    select 1
    from public.learning_class_memberships cm
    join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
    where cm.tenant_id = learning_vocabulary_entries.tenant_id
      and cm.organization_id = learning_vocabulary_entries.organization_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
      and u.auth_user_id = (select auth.uid())
  )
);

create policy learning_vocabulary_entries_insert on public.learning_vocabulary_entries
for insert to authenticated
with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and created_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and updated_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and (
    (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
    or exists (
      select 1
      from public.learning_class_memberships cm
      join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
      where cm.tenant_id = learning_vocabulary_entries.tenant_id
        and cm.organization_id = learning_vocabulary_entries.organization_id
        and cm.user_id = learning_vocabulary_entries.created_by
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
        and u.auth_user_id = (select auth.uid())
    )
  )
);

create policy learning_vocabulary_entries_update on public.learning_vocabulary_entries
for update to authenticated
using (
  (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
  or exists (
    select 1
    from public.learning_class_memberships cm
    join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
    where cm.tenant_id = learning_vocabulary_entries.tenant_id
      and cm.organization_id = learning_vocabulary_entries.organization_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
      and u.auth_user_id = (select auth.uid())
  )
)
with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and updated_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and (
    (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
    or exists (
      select 1
      from public.learning_class_memberships cm
      join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
      where cm.tenant_id = learning_vocabulary_entries.tenant_id
        and cm.organization_id = learning_vocabulary_entries.organization_id
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
        and u.auth_user_id = (select auth.uid())
    )
  )
);

create policy learning_vocabulary_entries_delete on public.learning_vocabulary_entries
for delete to authenticated
using (
  (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
  or exists (
    select 1
    from public.learning_class_memberships cm
    join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
    where cm.tenant_id = learning_vocabulary_entries.tenant_id
      and cm.organization_id = learning_vocabulary_entries.organization_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
      and u.auth_user_id = (select auth.uid())
  )
);

create policy learning_vocabulary_progress_select_own on public.learning_vocabulary_progress
for select to authenticated
using (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and exists (
    select 1 from public.learning_class_memberships cm
    where cm.tenant_id = learning_vocabulary_progress.tenant_id
      and cm.organization_id = learning_vocabulary_progress.organization_id
      and cm.user_id = learning_vocabulary_progress.user_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
  )
);

create policy learning_vocabulary_progress_insert_own on public.learning_vocabulary_progress
for insert to authenticated
with check (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and exists (
    select 1 from public.learning_class_memberships cm
    where cm.tenant_id = learning_vocabulary_progress.tenant_id
      and cm.organization_id = learning_vocabulary_progress.organization_id
      and cm.user_id = learning_vocabulary_progress.user_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
  )
  and exists (
    select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id
      and e.organization_id = learning_vocabulary_progress.organization_id
      and e.status = 'published'
  )
);

create policy learning_vocabulary_progress_update_own on public.learning_vocabulary_progress
for update to authenticated
using (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and exists (
    select 1 from public.learning_class_memberships cm
    where cm.tenant_id = learning_vocabulary_progress.tenant_id
      and cm.organization_id = learning_vocabulary_progress.organization_id
      and cm.user_id = learning_vocabulary_progress.user_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
  )
)
with check (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and exists (
    select 1 from public.learning_class_memberships cm
    where cm.tenant_id = learning_vocabulary_progress.tenant_id
      and cm.organization_id = learning_vocabulary_progress.organization_id
      and cm.user_id = learning_vocabulary_progress.user_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
  )
  and exists (
    select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id
      and e.organization_id = learning_vocabulary_progress.organization_id
      and e.status = 'published'
  )
);

-- Prevent an entry from being reassigned across schools or having its creator rewritten.
create schema if not exists private;
create or replace function private.guard_learning_vocabulary_entry_identity()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $function$
begin
  if new.tenant_id is distinct from old.tenant_id
     or new.organization_id is distinct from old.organization_id
     or new.created_by is distinct from old.created_by then
    raise exception 'Vocabulary entry ownership and school cannot be changed.'
      using errcode = '23514';
  end if;
  return new;
end;
$function$;

create trigger learning_vocabulary_entries_guard_identity
before update of tenant_id, organization_id, created_by
on public.learning_vocabulary_entries
for each row execute function private.guard_learning_vocabulary_entry_identity();
