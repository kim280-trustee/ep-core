-- E&P Learning knowledge graph and versioned content foundation
-- Global academic knowledge is reusable across curricula; content is organization-scoped.

create table if not exists public.learning_skills (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.learning_subjects(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(subject_id, code),
  unique(subject_id, id)
);

create table if not exists public.learning_topics (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.learning_skills(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  sequence_no integer not null default 1 check (sequence_no > 0),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(skill_id, code),
  unique(skill_id, id)
);

create table if not exists public.learning_objectives (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.learning_topics(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  sequence_no integer not null default 1 check (sequence_no > 0),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(topic_id, code),
  unique(topic_id, id)
);

create table if not exists public.learning_objective_prerequisites (
  objective_id uuid not null references public.learning_objectives(id) on delete cascade,
  prerequisite_objective_id uuid not null references public.learning_objectives(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key(objective_id, prerequisite_objective_id),
  check(objective_id <> prerequisite_objective_id)
);

create table if not exists public.learning_objective_alignments (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.learning_objectives(id) on delete cascade,
  curriculum_id uuid not null references public.learning_curricula(id) on delete cascade,
  grade_level_id uuid not null,
  sequence_no integer not null default 1 check (sequence_no > 0),
  required boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(objective_id, curriculum_id, grade_level_id),
  unique(curriculum_id, id),
  foreign key(curriculum_id, grade_level_id)
    references public.learning_grade_levels(curriculum_id, id) on delete cascade
);

create table if not exists public.learning_content_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  code text not null,
  title text not null,
  content_type text not null check (content_type in (
    'lesson','explanation','reading','listening','speaking','writing',
    'worksheet','video','audio','interactive','reference','other'
  )),
  language_code text not null default 'en',
  status text not null default 'draft' check (status in ('draft','review','published','retired')),
  created_by uuid not null references public.users(id) on delete restrict,
  updated_by uuid references public.users(id) on delete restrict,
  reviewed_by uuid references public.users(id) on delete restrict,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, code)
);

create table if not exists public.learning_content_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.learning_content_items(id) on delete cascade,
  version_no integer not null check (version_no > 0),
  body jsonb not null default '{}'::jsonb,
  change_summary text,
  status text not null default 'draft' check (status in ('draft','review','published','retired')),
  created_by uuid not null references public.users(id) on delete restrict,
  reviewed_by uuid references public.users(id) on delete restrict,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_item_id, version_no)
);

create table if not exists public.learning_content_objectives (
  content_item_id uuid not null references public.learning_content_items(id) on delete cascade,
  objective_id uuid not null references public.learning_objectives(id) on delete restrict,
  sequence_no integer not null default 1 check (sequence_no > 0),
  created_at timestamptz not null default now(),
  primary key(content_item_id, objective_id)
);

create index if not exists learning_skills_subject_idx on public.learning_skills(subject_id);
create index if not exists learning_topics_skill_idx on public.learning_topics(skill_id);
create index if not exists learning_objectives_topic_idx on public.learning_objectives(topic_id);
create index if not exists learning_objective_prerequisites_prereq_idx on public.learning_objective_prerequisites(prerequisite_objective_id);
create index if not exists learning_objective_alignments_objective_idx on public.learning_objective_alignments(objective_id);
create index if not exists learning_objective_alignments_curriculum_grade_idx on public.learning_objective_alignments(curriculum_id, grade_level_id);
create index if not exists learning_content_items_org_status_idx on public.learning_content_items(organization_id, status);
create index if not exists learning_content_items_created_by_idx on public.learning_content_items(created_by);
create index if not exists learning_content_versions_item_status_idx on public.learning_content_versions(content_item_id, status);
create index if not exists learning_content_versions_created_by_idx on public.learning_content_versions(created_by);
create index if not exists learning_content_objectives_objective_idx on public.learning_content_objectives(objective_id);

alter table public.learning_skills enable row level security;
alter table public.learning_topics enable row level security;
alter table public.learning_objectives enable row level security;
alter table public.learning_objective_prerequisites enable row level security;
alter table public.learning_objective_alignments enable row level security;
alter table public.learning_content_items enable row level security;
alter table public.learning_content_versions enable row level security;
alter table public.learning_content_objectives enable row level security;

grant select on public.learning_skills, public.learning_topics, public.learning_objectives,
  public.learning_objective_prerequisites, public.learning_objective_alignments to authenticated;
grant select, insert, update, delete on public.learning_content_items,
  public.learning_content_versions, public.learning_content_objectives to authenticated;

create policy learning_skills_read on public.learning_skills for select to authenticated using (true);
create policy learning_topics_read on public.learning_topics for select to authenticated using (true);
create policy learning_objectives_read on public.learning_objectives for select to authenticated using (true);
create policy learning_objective_prerequisites_read on public.learning_objective_prerequisites for select to authenticated using (true);
create policy learning_objective_alignments_read on public.learning_objective_alignments for select to authenticated using (true);

create policy learning_content_items_read on public.learning_content_items for select to authenticated using (
  status = 'published'
  or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_content_items_insert on public.learning_content_items for insert to authenticated with check (
  organization_id is not null
  and public.is_organization_member(organization_id)
  and created_by in (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);
create policy learning_content_items_update on public.learning_content_items for update to authenticated
  using (organization_id is not null and public.is_organization_member(organization_id))
  with check (organization_id is not null and public.is_organization_member(organization_id));
create policy learning_content_items_delete on public.learning_content_items for delete to authenticated
  using (organization_id is not null and public.is_organization_member(organization_id));

create policy learning_content_versions_read on public.learning_content_versions for select to authenticated using (
  exists (
    select 1 from public.learning_content_items ci
    where ci.id = content_item_id
      and (ci.status = 'published' or (ci.organization_id is not null and public.is_organization_member(ci.organization_id)))
  )
);
create policy learning_content_versions_insert on public.learning_content_versions for insert to authenticated with check (
  created_by in (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and exists (
    select 1 from public.learning_content_items ci
    where ci.id = content_item_id
      and ci.organization_id is not null and public.is_organization_member(ci.organization_id)
  )
);
create policy learning_content_versions_update on public.learning_content_versions for update to authenticated
  using (
    exists (
      select 1 from public.learning_content_items ci
      where ci.id = content_item_id
        and ci.organization_id is not null and public.is_organization_member(ci.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.learning_content_items ci
      where ci.id = content_item_id
        and ci.organization_id is not null and public.is_organization_member(ci.organization_id)
    )
  );
create policy learning_content_versions_delete on public.learning_content_versions for delete to authenticated using (
  exists (
    select 1 from public.learning_content_items ci
    where ci.id = content_item_id
      and ci.organization_id is not null and public.is_organization_member(ci.organization_id)
  )
);

create policy learning_content_objectives_read on public.learning_content_objectives for select to authenticated using (
  exists (
    select 1 from public.learning_content_items ci
    where ci.id = content_item_id
      and (ci.status = 'published' or (ci.organization_id is not null and public.is_organization_member(ci.organization_id)))
  )
);
create policy learning_content_objectives_insert on public.learning_content_objectives for insert to authenticated with check (
  exists (
    select 1 from public.learning_content_items ci
    where ci.id = content_item_id
      and ci.organization_id is not null and public.is_organization_member(ci.organization_id)
  )
);
create policy learning_content_objectives_update on public.learning_content_objectives for update to authenticated
  using (
    exists (
      select 1 from public.learning_content_items ci
      where ci.id = content_item_id
        and ci.organization_id is not null and public.is_organization_member(ci.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.learning_content_items ci
      where ci.id = content_item_id
        and ci.organization_id is not null and public.is_organization_member(ci.organization_id)
    )
  );
create policy learning_content_objectives_delete on public.learning_content_objectives for delete to authenticated using (
  exists (
    select 1 from public.learning_content_items ci
    where ci.id = content_item_id
      and ci.organization_id is not null and public.is_organization_member(ci.organization_id)
  )
);
