-- E&P Learning gradebook and academic-record foundation.
-- Scores are stored as auditable records; term grades are snapshots/calculations.
-- No existing assessment or runtime tables are altered.

create table if not exists public.learning_gradebook_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  default_weight numeric(7,4) not null default 1
    check (default_weight > 0),
  status text not null default 'active'
    check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code),
  unique (organization_id, id)
);

create table if not exists public.learning_gradebook_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null,
  term_id uuid not null,
  class_group_id uuid not null,
  class_subject_id uuid not null,
  student_user_id uuid not null,
  category_id uuid,
  title text not null,
  description text,
  record_type text not null
    check (record_type in ('assessment','assignment','exam','manual')),
  source_type text not null
    check (source_type in ('assessment_result','assignment','manual')),
  assignment_id uuid,
  assessment_id uuid,
  attempt_id uuid,
  assessment_result_id uuid,
  topic_id uuid,
  objective_id uuid,
  score numeric(10,2) not null check (score >= 0),
  max_score numeric(10,2) not null check (max_score > 0),
  percentage numeric(7,4) generated always as (
    round((score / max_score) * 100, 4)
  ) stored,
  weight numeric(7,4) not null default 1
    check (weight > 0),
  included_in_grade boolean not null default true,
  recorded_at timestamptz not null default now(),
  notes jsonb not null default '{}'::jsonb,
  created_by uuid not null,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gradebook_entry_org_term_fk
    foreign key (organization_id, term_id)
    references public.learning_terms(organization_id, id)
    on delete cascade,
  constraint gradebook_entry_org_class_fk
    foreign key (organization_id, class_group_id)
    references public.learning_class_groups(organization_id, id)
    on delete cascade,
  constraint gradebook_entry_class_subject_fk
    foreign key (organization_id, class_subject_id)
    references public.learning_class_subjects(organization_id, id)
    on delete cascade,
  constraint gradebook_entry_org_category_fk
    foreign key (organization_id, category_id)
    references public.learning_gradebook_categories(organization_id, id)
    on delete set null,
  constraint gradebook_entry_creator_fk
    foreign key (tenant_id, created_by)
    references public.users(tenant_id, id)
    on delete restrict,
  constraint gradebook_entry_updater_fk
    foreign key (tenant_id, updated_by)
    references public.users(tenant_id, id)
    on delete restrict,
  constraint gradebook_entry_score_valid
    check (score <= max_score),
  constraint gradebook_entry_source_valid
    check (
      (source_type = 'assessment_result' and assessment_result_id is not null)
      or
      (source_type = 'assignment' and assignment_id is not null)
      or
      (source_type = 'manual')
    )
);

create unique index if not exists learning_gradebook_entries_result_uq
  on public.learning_gradebook_entries (assessment_result_id)
  where assessment_result_id is not null;

create index if not exists learning_gradebook_entries_student_term_idx
  on public.learning_gradebook_entries (student_user_id, term_id, class_subject_id);

create index if not exists learning_gradebook_entries_class_subject_idx
  on public.learning_gradebook_entries (class_subject_id, term_id, student_user_id);

create index if not exists learning_gradebook_entries_topic_idx
  on public.learning_gradebook_entries (topic_id, student_user_id);

create index if not exists learning_gradebook_entries_objective_idx
  on public.learning_gradebook_entries (objective_id, student_user_id);

create table if not exists public.learning_term_grades (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null,
  term_id uuid not null,
  class_group_id uuid not null,
  class_subject_id uuid not null,
  student_user_id uuid not null,
  score numeric(10,4) not null check (score >= 0 and score <= 100),
  letter_grade text,
  status text not null default 'draft'
    check (status in ('draft','finalized')),
  calculation jsonb not null default '{}'::jsonb,
  finalized_at timestamptz,
  finalized_by uuid,
  notes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint term_grade_org_term_fk
    foreign key (organization_id, term_id)
    references public.learning_terms(organization_id, id)
    on delete cascade,
  constraint term_grade_org_class_fk
    foreign key (organization_id, class_group_id)
    references public.learning_class_groups(organization_id, id)
    on delete cascade,
  constraint term_grade_class_subject_fk
    foreign key (organization_id, class_subject_id)
    references public.learning_class_subjects(organization_id, id)
    on delete cascade,
  constraint term_grade_creator_fk
    foreign key (tenant_id, finalized_by)
    references public.users(tenant_id, id)
    on delete restrict,
  unique (term_id, class_subject_id, student_user_id)
);

create index if not exists learning_term_grades_student_idx
  on public.learning_term_grades (student_user_id, term_id, class_subject_id);

create index if not exists learning_term_grades_class_subject_idx
  on public.learning_term_grades (class_group_id, class_subject_id, term_id);

create or replace function public.learning_current_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1
$$;

create or replace function public.learning_can_manage_academic_records(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_organization_member(target_organization_id)
    and not exists (
      select 1
      from public.learning_class_memberships cm
      where cm.organization_id = target_organization_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'student'
        and cm.status = 'active'
    )
$$;

alter table public.learning_gradebook_categories enable row level security;
alter table public.learning_gradebook_entries enable row level security;
alter table public.learning_term_grades enable row level security;

drop policy if exists learning_gradebook_categories_select on public.learning_gradebook_categories;
create policy learning_gradebook_categories_select
on public.learning_gradebook_categories
for select to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists learning_gradebook_categories_insert on public.learning_gradebook_categories;
create policy learning_gradebook_categories_insert
on public.learning_gradebook_categories
for insert to authenticated
with check (public.learning_can_manage_academic_records(organization_id));

drop policy if exists learning_gradebook_categories_update on public.learning_gradebook_categories;
create policy learning_gradebook_categories_update
on public.learning_gradebook_categories
for update to authenticated
using (public.learning_can_manage_academic_records(organization_id))
with check (public.learning_can_manage_academic_records(organization_id));

drop policy if exists learning_gradebook_categories_delete on public.learning_gradebook_categories;
create policy learning_gradebook_categories_delete
on public.learning_gradebook_categories
for delete to authenticated
using (public.learning_can_manage_academic_records(organization_id));

drop policy if exists learning_gradebook_entries_select on public.learning_gradebook_entries;
create policy learning_gradebook_entries_select
on public.learning_gradebook_entries
for select to authenticated
using (
  public.is_organization_member(organization_id)
  and (
    student_user_id = public.learning_current_user_id()
    or public.learning_can_manage_academic_records(organization_id)
  )
);

drop policy if exists learning_gradebook_entries_insert on public.learning_gradebook_entries;
create policy learning_gradebook_entries_insert
on public.learning_gradebook_entries
for insert to authenticated
with check (
  public.learning_can_manage_academic_records(organization_id)
  and created_by = public.learning_current_user_id()
);

drop policy if exists learning_gradebook_entries_update on public.learning_gradebook_entries;
create policy learning_gradebook_entries_update
on public.learning_gradebook_entries
for update to authenticated
using (public.learning_can_manage_academic_records(organization_id))
with check (
  public.learning_can_manage_academic_records(organization_id)
  and student_user_id is not null
);

drop policy if exists learning_gradebook_entries_delete on public.learning_gradebook_entries;
create policy learning_gradebook_entries_delete
on public.learning_gradebook_entries
for delete to authenticated
using (public.learning_can_manage_academic_records(organization_id));

drop policy if exists learning_term_grades_select on public.learning_term_grades;
create policy learning_term_grades_select
on public.learning_term_grades
for select to authenticated
using (
  public.is_organization_member(organization_id)
  and (
    student_user_id = public.learning_current_user_id()
    or public.learning_can_manage_academic_records(organization_id)
  )
);

drop policy if exists learning_term_grades_insert on public.learning_term_grades;
create policy learning_term_grades_insert
on public.learning_term_grades
for insert to authenticated
with check (
  public.learning_can_manage_academic_records(organization_id)
);

drop policy if exists learning_term_grades_update on public.learning_term_grades;
create policy learning_term_grades_update
on public.learning_term_grades
for update to authenticated
using (public.learning_can_manage_academic_records(organization_id))
with check (public.learning_can_manage_academic_records(organization_id));

drop policy if exists learning_term_grades_delete on public.learning_term_grades;
create policy learning_term_grades_delete
on public.learning_term_grades
for delete to authenticated
using (public.learning_can_manage_academic_records(organization_id));

revoke all on table public.learning_gradebook_categories,
  public.learning_gradebook_entries,
  public.learning_term_grades from anon;

grant select, insert, update, delete
on public.learning_gradebook_categories,
   public.learning_gradebook_entries,
   public.learning_term_grades
to authenticated;

revoke execute on function public.learning_current_user_id() from public;
revoke execute on function public.learning_can_manage_academic_records(uuid) from public;
grant execute on function public.learning_current_user_id()
  to authenticated;
grant execute on function public.learning_can_manage_academic_records(uuid)
  to authenticated;