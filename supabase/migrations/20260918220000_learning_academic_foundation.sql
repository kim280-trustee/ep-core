-- E&P Learning academic foundation
-- Global academic catalog + organization-scoped school structure.

create table if not exists public.learning_countries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  native_name text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_education_systems (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.learning_countries(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(country_id, code),
  unique(country_id, id)
);

create table if not exists public.learning_curricula (
  id uuid primary key default gen_random_uuid(),
  education_system_id uuid not null references public.learning_education_systems(id) on delete restrict,
  code text not null,
  name text not null,
  version text,
  description text,
  status text not null default 'draft' check (status in ('draft','active','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(education_system_id, code),
  unique(education_system_id, id)
);

create table if not exists public.learning_subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_curriculum_subjects (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references public.learning_curricula(id) on delete cascade,
  subject_id uuid not null references public.learning_subjects(id) on delete restrict,
  code text,
  name text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(curriculum_id, subject_id),
  unique(curriculum_id, id)
);

create table if not exists public.learning_grade_levels (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references public.learning_curricula(id) on delete cascade,
  code text not null,
  name text not null,
  sequence_no integer not null check (sequence_no > 0),
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(curriculum_id, code),
  unique(curriculum_id, sequence_no),
  unique(curriculum_id, id)
);

create table if not exists public.learning_academic_years (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  curriculum_id uuid not null references public.learning_curricula(id) on delete restrict,
  name text not null,
  code text not null,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'planned' check (status in ('planned','active','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_year_dates_valid check (ends_on >= starts_on),
  unique(organization_id, code),
  unique(organization_id, id),
  unique(id, curriculum_id)
);

create table if not exists public.learning_terms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  academic_year_id uuid not null,
  name text not null,
  code text not null,
  sequence_no integer not null check (sequence_no > 0),
  starts_on date not null,
  ends_on date not null,
  status text not null default 'planned' check (status in ('planned','active','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint term_dates_valid check (ends_on >= starts_on),
  constraint term_org_year_fk foreign key (organization_id, academic_year_id)
    references public.learning_academic_years(organization_id, id) on delete cascade,
  unique(academic_year_id, code),
  unique(academic_year_id, sequence_no),
  unique(organization_id, id)
);

create table if not exists public.learning_class_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  academic_year_id uuid not null,
  curriculum_id uuid not null,
  grade_level_id uuid not null,
  code text not null,
  name text not null,
  status text not null default 'active' check (status in ('planned','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_year_org_fk foreign key (organization_id, academic_year_id)
    references public.learning_academic_years(organization_id, id) on delete cascade,
  constraint class_year_curriculum_fk foreign key (academic_year_id, curriculum_id)
    references public.learning_academic_years(id, curriculum_id) on delete restrict,
  constraint class_grade_fk foreign key (curriculum_id, grade_level_id)
    references public.learning_grade_levels(curriculum_id, id) on delete restrict,
  unique(organization_id, academic_year_id, code),
  unique(organization_id, id)
);

create table if not exists public.learning_class_subjects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  class_group_id uuid not null,
  subject_id uuid not null references public.learning_subjects(id) on delete restrict,
  status text not null default 'active' check (status in ('planned','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_subject_org_fk foreign key (organization_id, class_group_id)
    references public.learning_class_groups(organization_id, id) on delete cascade,
  unique(class_group_id, subject_id),
  unique(organization_id, id)
);

create index if not exists idx_learning_education_systems_country on public.learning_education_systems(country_id);
create index if not exists idx_learning_curricula_system on public.learning_curricula(education_system_id);
create index if not exists idx_learning_curriculum_subjects_subject on public.learning_curriculum_subjects(subject_id);
create index if not exists idx_learning_grade_levels_curriculum on public.learning_grade_levels(curriculum_id, sequence_no);
create index if not exists idx_learning_academic_years_org on public.learning_academic_years(organization_id, status);
create index if not exists idx_learning_academic_years_curriculum on public.learning_academic_years(curriculum_id);
create index if not exists idx_learning_terms_year on public.learning_terms(academic_year_id, sequence_no);
create index if not exists idx_learning_class_groups_org_year on public.learning_class_groups(organization_id, academic_year_id);
create index if not exists idx_learning_class_groups_curriculum on public.learning_class_groups(curriculum_id);
create index if not exists idx_learning_class_groups_grade on public.learning_class_groups(grade_level_id);
create index if not exists idx_learning_class_subjects_class on public.learning_class_subjects(class_group_id);

alter table public.learning_countries enable row level security;
alter table public.learning_education_systems enable row level security;
alter table public.learning_curricula enable row level security;
alter table public.learning_subjects enable row level security;
alter table public.learning_curriculum_subjects enable row level security;
alter table public.learning_grade_levels enable row level security;
alter table public.learning_academic_years enable row level security;
alter table public.learning_terms enable row level security;
alter table public.learning_class_groups enable row level security;
alter table public.learning_class_subjects enable row level security;

create policy learning_countries_read on public.learning_countries for select to authenticated using (true);
create policy learning_education_systems_read on public.learning_education_systems for select to authenticated using (true);
create policy learning_curricula_read on public.learning_curricula for select to authenticated using (true);
create policy learning_subjects_read on public.learning_subjects for select to authenticated using (true);
create policy learning_curriculum_subjects_read on public.learning_curriculum_subjects for select to authenticated using (true);
create policy learning_grade_levels_read on public.learning_grade_levels for select to authenticated using (true);

create policy learning_academic_years_member_read on public.learning_academic_years for select to authenticated
using (public.is_organization_member(organization_id));
create policy learning_academic_years_manage on public.learning_academic_years for all to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy learning_terms_member_read on public.learning_terms for select to authenticated
using (public.is_organization_member(organization_id));
create policy learning_terms_manage on public.learning_terms for all to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy learning_class_groups_member_read on public.learning_class_groups for select to authenticated
using (public.is_organization_member(organization_id));
create policy learning_class_groups_manage on public.learning_class_groups for all to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy learning_class_subjects_member_read on public.learning_class_subjects for select to authenticated
using (public.is_organization_member(organization_id));
create policy learning_class_subjects_manage on public.learning_class_subjects for all to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

grant select on public.learning_countries, public.learning_education_systems,
  public.learning_curricula, public.learning_subjects,
  public.learning_curriculum_subjects, public.learning_grade_levels to authenticated;
grant select, insert, update, delete on public.learning_academic_years,
  public.learning_terms, public.learning_class_groups, public.learning_class_subjects to authenticated;
