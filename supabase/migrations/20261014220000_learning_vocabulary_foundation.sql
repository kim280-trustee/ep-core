-- Reusable vocabulary catalog, multilingual variants, curriculum links, examples, and spaced-repetition state.
-- This migration consolidates the vocabulary foundation into a unique timestamp on the current integration branch.
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
  review_count integer not null default 0 check (review_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  incorrect_count integer not null default 0 check (incorrect_count >= 0),
  interval_days integer not null default 0 check (interval_days >= 0),
  ease_factor numeric(3,2) not null default 2.50 check (ease_factor between 1.30 and 3.00),
  next_review_at timestamptz not null default now(),
  last_answer_correct boolean,
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
grant select on public.learning_vocabulary_progress to authenticated;
revoke insert, update, delete on public.learning_vocabulary_progress from authenticated;
drop policy if exists learning_vocabulary_progress_insert_own on public.learning_vocabulary_progress;
drop policy if exists learning_vocabulary_progress_update_own on public.learning_vocabulary_progress;

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


-- Multiple target-language translations per vocabulary entry.
create table public.learning_vocabulary_translations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  vocabulary_entry_id uuid not null,
  language_code text not null check (language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})* ' 
-- Child records cannot be moved between tenants, schools, or vocabulary entries.
create or replace function private.guard_learning_vocabulary_child_identity()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.tenant_id is distinct from old.tenant_id
     or new.organization_id is distinct from old.organization_id
     or new.vocabulary_entry_id is distinct from old.vocabulary_entry_id
     or new.created_by is distinct from old.created_by then
    raise exception 'Vocabulary child-record ownership cannot be changed.'
      using errcode = '23514';
  end if;
  return new;
end;
$function$;

create trigger learning_vocabulary_translations_guard_identity
before update of tenant_id, organization_id, vocabulary_entry_id, created_by
on public.learning_vocabulary_translations
for each row execute function private.guard_learning_vocabulary_child_identity();

create trigger learning_vocabulary_examples_guard_identity
before update of tenant_id, organization_id, vocabulary_entry_id, created_by
on public.learning_vocabulary_examples
for each row execute function private.guard_learning_vocabulary_child_identity();

create trigger learning_vocabulary_objectives_guard_identity
before update of tenant_id, organization_id, vocabulary_entry_id, created_by
on public.learning_vocabulary_objectives
for each row execute function private.guard_learning_vocabulary_child_identity();

),
  translation text not null check (length(trim(translation)) between 1 and 1000),
  pronunciation text,
  transliteration text,
  audio_url text,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_vocabulary_translations_org_fk
    foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  constraint learning_vocabulary_translations_entry_fk
    foreign key (organization_id, vocabulary_entry_id)
    references public.learning_vocabulary_entries(organization_id, id) on delete cascade,
  constraint learning_vocabulary_translations_creator_fk
    foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict,
  constraint learning_vocabulary_translations_updater_fk
    foreign key (tenant_id, updated_by) references public.users(tenant_id, id) on delete restrict,
  constraint learning_vocabulary_translations_language_key
    unique (organization_id, vocabulary_entry_id, language_code)
);
create index learning_vocabulary_translations_entry_idx
  on public.learning_vocabulary_translations(organization_id, vocabulary_entry_id);

-- Multiple example sentences, optionally translated, per vocabulary entry.
create table public.learning_vocabulary_examples (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  vocabulary_entry_id uuid not null,
  language_code text not null default 'en' check (language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})* '),
  sentence text not null check (length(trim(sentence)) between 1 and 2000),
  translation_language_code text check (translation_language_code is null or translation_language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})* '),
  translated_sentence text,
  sequence_no integer not null default 1 check (sequence_no > 0),
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_vocabulary_examples_org_fk
    foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  constraint learning_vocabulary_examples_entry_fk
    foreign key (organization_id, vocabulary_entry_id)
    references public.learning_vocabulary_entries(organization_id, id) on delete cascade,
  constraint learning_vocabulary_examples_creator_fk
    foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict,
  constraint learning_vocabulary_examples_updater_fk
    foreign key (tenant_id, updated_by) references public.users(tenant_id, id) on delete restrict,
  constraint learning_vocabulary_examples_sequence_key
    unique (organization_id, vocabulary_entry_id, sequence_no)
);
create index learning_vocabulary_examples_entry_idx
  on public.learning_vocabulary_examples(organization_id, vocabulary_entry_id, sequence_no);

-- A vocabulary item can support several curriculum objectives.
create table public.learning_vocabulary_objectives (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  vocabulary_entry_id uuid not null,
  objective_id uuid not null references public.learning_objectives(id) on delete cascade,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint learning_vocabulary_objectives_org_fk
    foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  constraint learning_vocabulary_objectives_entry_fk
    foreign key (organization_id, vocabulary_entry_id)
    references public.learning_vocabulary_entries(organization_id, id) on delete cascade,
  constraint learning_vocabulary_objectives_creator_fk
    foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict,
  constraint learning_vocabulary_objectives_unique
    unique (organization_id, vocabulary_entry_id, objective_id)
);
create index learning_vocabulary_objectives_objective_idx
  on public.learning_vocabulary_objectives(objective_id, organization_id);

alter table public.learning_vocabulary_translations enable row level security;
alter table public.learning_vocabulary_examples enable row level security;
alter table public.learning_vocabulary_objectives enable row level security;
grant select, insert, update, delete on public.learning_vocabulary_translations,
  public.learning_vocabulary_examples, public.learning_vocabulary_objectives to authenticated;

-- Reads follow the parent entry's RLS visibility. Only a teacher or academic manager can write.
create policy learning_vocabulary_translations_select on public.learning_vocabulary_translations
for select to authenticated using (
  exists (select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_translations.organization_id)
);
create policy learning_vocabulary_translations_insert on public.learning_vocabulary_translations
for insert to authenticated with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and created_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and updated_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and exists (
    select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_translations.organization_id
      and ((public.has_permission('learning.academic.manage') and public.is_organization_member(e.organization_id))
        or exists (select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
          where cm.tenant_id = e.tenant_id and cm.organization_id = e.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())))
  )
);
create policy learning_vocabulary_translations_update on public.learning_vocabulary_translations
for update to authenticated using (
  exists (select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_translations.organization_id
      and ((public.has_permission('learning.academic.manage') and public.is_organization_member(e.organization_id))
        or exists (select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
          where cm.tenant_id = e.tenant_id and cm.organization_id = e.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())))
) with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and updated_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
);
create policy learning_vocabulary_translations_delete on public.learning_vocabulary_translations
for delete to authenticated using (
  exists (select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_translations.organization_id
      and ((public.has_permission('learning.academic.manage') and public.is_organization_member(e.organization_id))
        or exists (select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
          where cm.tenant_id = e.tenant_id and cm.organization_id = e.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())))
);

create policy learning_vocabulary_examples_select on public.learning_vocabulary_examples
for select to authenticated using (
  exists (select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_examples.organization_id)
);
create policy learning_vocabulary_examples_insert on public.learning_vocabulary_examples
for insert to authenticated with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and created_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and updated_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and exists (
    select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_examples.organization_id
      and ((public.has_permission('learning.academic.manage') and public.is_organization_member(e.organization_id))
        or exists (select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
          where cm.tenant_id = e.tenant_id and cm.organization_id = e.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())))
  )
);
create policy learning_vocabulary_examples_update on public.learning_vocabulary_examples
for update to authenticated using (
  exists (select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_examples.organization_id
      and ((public.has_permission('learning.academic.manage') and public.is_organization_member(e.organization_id))
        or exists (select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
          where cm.tenant_id = e.tenant_id and cm.organization_id = e.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())))
) with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and updated_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
);
create policy learning_vocabulary_examples_delete on public.learning_vocabulary_examples
for delete to authenticated using (
  exists (select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_examples.organization_id
      and ((public.has_permission('learning.academic.manage') and public.is_organization_member(e.organization_id))
        or exists (select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
          where cm.tenant_id = e.tenant_id and cm.organization_id = e.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())))
);

create policy learning_vocabulary_objectives_select on public.learning_vocabulary_objectives
for select to authenticated using (
  exists (select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_objectives.organization_id)
);
create policy learning_vocabulary_objectives_insert on public.learning_vocabulary_objectives
for insert to authenticated with check (
  tenant_id = (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and created_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and exists (
    select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_objectives.organization_id
      and ((public.has_permission('learning.academic.manage') and public.is_organization_member(e.organization_id))
        or exists (select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
          where cm.tenant_id = e.tenant_id and cm.organization_id = e.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())))
  )
);
create policy learning_vocabulary_objectives_delete on public.learning_vocabulary_objectives
for delete to authenticated using (
  exists (select 1 from public.learning_vocabulary_entries e
    where e.id = vocabulary_entry_id and e.organization_id = learning_vocabulary_objectives.organization_id
      and ((public.has_permission('learning.academic.manage') and public.is_organization_member(e.organization_id))
        or exists (select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id and u.tenant_id = cm.tenant_id
          where cm.tenant_id = e.tenant_id and cm.organization_id = e.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())))
);

-- Only the trusted database function may change review counters and scheduling state.
create or replace function public.record_learning_vocabulary_review(
  p_organization_id uuid,
  p_vocabulary_entry_id uuid,
  p_is_correct boolean
)
returns public.learning_vocabulary_progress
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_tenant_id uuid;
  v_progress public.learning_vocabulary_progress%rowtype;
  v_interval_days integer;
  v_review_count integer;
  v_correct_count integer;
  v_incorrect_count integer;
  v_ease_factor numeric(3,2);
  v_status text;
begin
  if p_is_correct is null then
    raise exception 'A review result is required.' using errcode = '22004';
  end if;

  select u.id, u.tenant_id into v_user_id, v_tenant_id
  from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_user_id is null then
    raise exception 'The authenticated user could not be resolved.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.tenant_id = v_tenant_id and cm.organization_id = p_organization_id
      and cm.user_id = v_user_id and cm.membership_type = 'student' and cm.status = 'active'
  ) then
    raise exception 'Active student membership is required to record vocabulary practice.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.learning_vocabulary_entries e
    where e.id = p_vocabulary_entry_id and e.organization_id = p_organization_id and e.tenant_id = v_tenant_id
      and e.status = 'published'
  ) then
    raise exception 'Published vocabulary entry was not found in this school.' using errcode = 'P0002';
  end if;

  insert into public.learning_vocabulary_progress (
    tenant_id, organization_id, user_id, vocabulary_entry_id
  ) values (v_tenant_id, p_organization_id, v_user_id, p_vocabulary_entry_id)
  on conflict (organization_id, user_id, vocabulary_entry_id) do nothing;

  select * into v_progress
  from public.learning_vocabulary_progress p
  where p.organization_id = p_organization_id and p.user_id = v_user_id
    and p.vocabulary_entry_id = p_vocabulary_entry_id
  for update;

  v_review_count := v_progress.review_count + 1;
  v_correct_count := v_progress.correct_count + case when p_is_correct then 1 else 0 end;
  v_incorrect_count := v_progress.incorrect_count + case when p_is_correct then 0 else 1 end;
  v_ease_factor := greatest(1.30, least(3.00,
    v_progress.ease_factor + case when p_is_correct then 0.05 else -0.20 end
  ));

  if p_is_correct then
    v_interval_days := case
      when v_progress.interval_days <= 0 then 1
      when v_progress.interval_days = 1 then 3
      else greatest(1, round(v_progress.interval_days * v_ease_factor)::integer)
    end;
    v_status := case when v_correct_count >= 3 and v_interval_days >= 7 then 'known' else 'learning' end;
  else
    v_interval_days := 0;
    v_status := 'learning';
  end if;

  update public.learning_vocabulary_progress p
  set status = v_status,
      review_count = v_review_count,
      correct_count = v_correct_count,
      incorrect_count = v_incorrect_count,
      interval_days = v_interval_days,
      ease_factor = v_ease_factor,
      next_review_at = case when p_is_correct
        then now() + make_interval(days => v_interval_days)
        else now() + interval '10 minutes' end,
      last_answer_correct = p_is_correct,
      last_practiced_at = now(),
      updated_at = now()
  where p.id = v_progress.id
  returning * into v_progress;

  return v_progress;
end;
$function$;

revoke all on function public.record_learning_vocabulary_review(uuid, uuid, boolean) from public, anon;
grant execute on function public.record_learning_vocabulary_review(uuid, uuid, boolean) to authenticated;

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

