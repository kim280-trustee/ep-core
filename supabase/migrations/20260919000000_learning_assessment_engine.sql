-- E&P Learning assessment engine foundation
-- Versioned reusable questions feed assessments; evaluation keys are never readable by students.

create table if not exists public.learning_questions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  code text not null,
  question_type text not null check (question_type in ('single_choice','multiple_choice','true_false','short_answer','essay','fill_blank','matching','ordering','speaking','listening','other')),
  language_code text not null default 'en',
  status text not null default 'draft' check (status in ('draft','review','published','retired')),
  created_by uuid not null references public.users(id) on delete restrict,
  updated_by uuid references public.users(id) on delete restrict,
  reviewed_by uuid references public.users(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, code),
  constraint learning_questions_published_review_check check (status <> 'published' or reviewed_by is not null)
);

create table if not exists public.learning_question_versions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.learning_questions(id) on delete cascade,
  version_no integer not null check (version_no > 0),
  prompt jsonb not null default '{}'::jsonb,
  configuration jsonb not null default '{}'::jsonb,
  explanation jsonb,
  created_by uuid not null references public.users(id) on delete restrict,
  reviewed_by uuid references public.users(id) on delete restrict,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(question_id, version_no),
  unique(question_id, id),
  constraint learning_question_versions_published_review_check check (published_at is null or reviewed_by is not null)
);

create table if not exists public.learning_question_evaluation_keys (
  question_version_id uuid primary key references public.learning_question_versions(id) on delete cascade,
  evaluation_key jsonb not null default '{}'::jsonb,
  scoring_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_question_objectives (
  question_version_id uuid not null references public.learning_question_versions(id) on delete cascade,
  objective_id uuid not null references public.learning_objectives(id) on delete restrict,
  weight numeric(8,4) not null default 1 check (weight > 0),
  created_at timestamptz not null default now(),
  primary key(question_version_id, objective_id)
);

create table if not exists public.learning_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  assessment_type text not null check (assessment_type in ('diagnostic','practice','assignment','quiz','test','mock_exam','competition','other')),
  language_code text not null default 'en',
  curriculum_id uuid references public.learning_curricula(id) on delete restrict,
  grade_level_id uuid,
  status text not null default 'draft' check (status in ('draft','review','published','retired')),
  created_by uuid not null references public.users(id) on delete restrict,
  updated_by uuid references public.users(id) on delete restrict,
  reviewed_by uuid references public.users(id) on delete restrict,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, code),
  unique(organization_id, id),
  constraint learning_assessments_published_review_check check (status <> 'published' or (reviewed_by is not null and published_at is not null)),
  constraint learning_assessments_grade_curriculum_fk foreign key(curriculum_id, grade_level_id)
    references public.learning_grade_levels(curriculum_id, id) on delete restrict
);

create table if not exists public.learning_assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.learning_assessments(id) on delete cascade,
  question_version_id uuid not null references public.learning_question_versions(id) on delete restrict,
  sequence_no integer not null check (sequence_no > 0),
  points numeric(10,2) not null default 1 check (points > 0),
  required boolean not null default true,
  created_at timestamptz not null default now(),
  unique(assessment_id, sequence_no),
  unique(assessment_id, question_version_id)
);

create table if not exists public.learning_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid,
  assessment_id uuid not null references public.learning_assessments(id) on delete cascade,
  student_user_id uuid not null,
  attempt_number integer not null check (attempt_number > 0),
  previous_attempt_id uuid references public.learning_attempts(id) on delete set null,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','evaluating','evaluated','cancelled')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric(10,2),
  max_score numeric(10,2),
  percentage numeric(7,4) check (percentage is null or (percentage >= 0 and percentage <= 100)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, id),
  unique(student_user_id, assessment_id, attempt_number),
  foreign key(tenant_id, student_user_id) references public.users(tenant_id, id) on delete cascade,
  foreign key(tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade
);

create table if not exists public.learning_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.learning_attempts(id) on delete cascade,
  assessment_question_id uuid not null references public.learning_assessment_questions(id) on delete restrict,
  answer jsonb not null default '{}'::jsonb,
  evaluation_status text not null default 'pending' check (evaluation_status in ('pending','auto_evaluated','manual_reviewed')),
  is_correct boolean,
  awarded_points numeric(10,2),
  feedback jsonb,
  evaluated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(attempt_id, assessment_question_id)
);

create table if not exists public.learning_assessment_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.learning_attempts(id) on delete cascade,
  student_user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  score numeric(10,2),
  max_score numeric(10,2),
  percentage numeric(7,4) check (percentage is null or (percentage >= 0 and percentage <= 100)),
  passed boolean,
  evaluated_at timestamptz not null default now(),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_questions_org_status_idx on public.learning_questions(organization_id,status);
create index if not exists learning_question_versions_question_idx on public.learning_question_versions(question_id,version_no desc);
create index if not exists learning_question_objectives_objective_idx on public.learning_question_objectives(objective_id);
create index if not exists learning_assessments_org_status_idx on public.learning_assessments(organization_id,status);
create index if not exists learning_assessments_curriculum_grade_idx on public.learning_assessments(curriculum_id,grade_level_id);
create index if not exists learning_assessment_questions_question_idx on public.learning_assessment_questions(question_version_id);
create index if not exists learning_attempts_student_idx on public.learning_attempts(tenant_id,student_user_id,created_at desc);
create index if not exists learning_attempts_assessment_idx on public.learning_attempts(assessment_id,created_at desc);
create index if not exists learning_attempt_answers_attempt_idx on public.learning_attempt_answers(attempt_id);
create index if not exists learning_assessment_results_student_idx on public.learning_assessment_results(student_user_id,evaluated_at desc);

alter table public.learning_questions enable row level security;
alter table public.learning_question_versions enable row level security;
alter table public.learning_question_evaluation_keys enable row level security;
alter table public.learning_question_objectives enable row level security;
alter table public.learning_assessments enable row level security;
alter table public.learning_assessment_questions enable row level security;
alter table public.learning_attempts enable row level security;
alter table public.learning_attempt_answers enable row level security;
alter table public.learning_assessment_results enable row level security;

grant select, insert, update, delete on public.learning_questions, public.learning_question_versions,
 public.learning_question_evaluation_keys, public.learning_question_objectives,
 public.learning_assessments, public.learning_assessment_questions,
 public.learning_attempts, public.learning_attempt_answers, public.learning_assessment_results to authenticated;

create policy learning_questions_read on public.learning_questions for select to authenticated using (
 (organization_id is null and status='published') or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_questions_insert on public.learning_questions for insert to authenticated with check (
 organization_id is not null and public.is_organization_member(organization_id)
 and created_by in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
);
create policy learning_questions_update on public.learning_questions for update to authenticated
 using (organization_id is not null and public.is_organization_member(organization_id))
 with check (organization_id is not null and public.is_organization_member(organization_id));
create policy learning_questions_delete on public.learning_questions for delete to authenticated using (
 organization_id is not null and public.is_organization_member(organization_id)
);

create policy learning_question_versions_read on public.learning_question_versions for select to authenticated using (
 exists(select 1 from public.learning_questions q where q.id=question_id and
  ((q.organization_id is null and q.status='published') or (q.organization_id is not null and public.is_organization_member(q.organization_id))))
);
create policy learning_question_versions_insert on public.learning_question_versions for insert to authenticated with check (
 created_by in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
 and exists(select 1 from public.learning_questions q where q.id=question_id and q.organization_id is not null and public.is_organization_member(q.organization_id))
);
create policy learning_question_versions_update on public.learning_question_versions for update to authenticated
 using (exists(select 1 from public.learning_questions q where q.id=question_id and q.organization_id is not null and public.is_organization_member(q.organization_id)))
 with check (exists(select 1 from public.learning_questions q where q.id=question_id and q.organization_id is not null and public.is_organization_member(q.organization_id)));
create policy learning_question_versions_delete on public.learning_question_versions for delete to authenticated using (
 exists(select 1 from public.learning_questions q where q.id=question_id and q.organization_id is not null and public.is_organization_member(q.organization_id))
);

create policy learning_question_evaluation_keys_insert on public.learning_question_evaluation_keys for insert to authenticated with check (
 exists(select 1 from public.learning_question_versions v join public.learning_questions q on q.id=v.question_id
  where v.id=question_version_id and q.organization_id is not null and public.is_organization_member(q.organization_id))
);
create policy learning_question_evaluation_keys_read on public.learning_question_evaluation_keys for select to authenticated using (false);
create policy learning_question_evaluation_keys_update on public.learning_question_evaluation_keys for update to authenticated using (false) with check (false);
create policy learning_question_evaluation_keys_delete on public.learning_question_evaluation_keys for delete to authenticated using (false);

create policy learning_question_objectives_read on public.learning_question_objectives for select to authenticated using (
 exists(select 1 from public.learning_question_versions v join public.learning_questions q on q.id=v.question_id
  where v.id=question_version_id and ((q.organization_id is null and q.status='published') or (q.organization_id is not null and public.is_organization_member(q.organization_id))))
);
create policy learning_question_objectives_insert on public.learning_question_objectives for insert to authenticated with check (
 exists(select 1 from public.learning_question_versions v join public.learning_questions q on q.id=v.question_id
  where v.id=question_version_id and q.organization_id is not null and public.is_organization_member(q.organization_id))
);
create policy learning_question_objectives_update on public.learning_question_objectives for update to authenticated
 using (exists(select 1 from public.learning_question_versions v join public.learning_questions q on q.id=v.question_id where v.id=question_version_id and q.organization_id is not null and public.is_organization_member(q.organization_id)))
 with check (exists(select 1 from public.learning_question_versions v join public.learning_questions q on q.id=v.question_id where v.id=question_version_id and q.organization_id is not null and public.is_organization_member(q.organization_id)));
create policy learning_question_objectives_delete on public.learning_question_objectives for delete to authenticated using (
 exists(select 1 from public.learning_question_versions v join public.learning_questions q on q.id=v.question_id where v.id=question_version_id and q.organization_id is not null and public.is_organization_member(q.organization_id))
);

create policy learning_assessments_read on public.learning_assessments for select to authenticated using (
 (organization_id is null and status='published') or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_assessments_insert on public.learning_assessments for insert to authenticated with check (
 organization_id is not null and public.is_organization_member(organization_id)
 and created_by in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
);
create policy learning_assessments_update on public.learning_assessments for update to authenticated
 using (organization_id is not null and public.is_organization_member(organization_id))
 with check (organization_id is not null and public.is_organization_member(organization_id));
create policy learning_assessments_delete on public.learning_assessments for delete to authenticated using (
 organization_id is not null and public.is_organization_member(organization_id)
);

create policy learning_assessment_questions_read on public.learning_assessment_questions for select to authenticated using (
 exists(select 1 from public.learning_assessments a where a.id=assessment_id and
  ((a.organization_id is null and a.status='published') or (a.organization_id is not null and public.is_organization_member(a.organization_id))))
);
create policy learning_assessment_questions_insert on public.learning_assessment_questions for insert to authenticated with check (
 exists(select 1 from public.learning_assessments a where a.id=assessment_id and a.organization_id is not null and public.is_organization_member(a.organization_id))
);
create policy learning_assessment_questions_update on public.learning_assessment_questions for update to authenticated
 using (exists(select 1 from public.learning_assessments a where a.id=assessment_id and a.organization_id is not null and public.is_organization_member(a.organization_id)))
 with check (exists(select 1 from public.learning_assessments a where a.id=assessment_id and a.organization_id is not null and public.is_organization_member(a.organization_id)));
create policy learning_assessment_questions_delete on public.learning_assessment_questions for delete to authenticated using (
 exists(select 1 from public.learning_assessments a where a.id=assessment_id and a.organization_id is not null and public.is_organization_member(a.organization_id))
);

create policy learning_attempts_read on public.learning_attempts for select to authenticated using (
 student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
 or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_attempts_insert on public.learning_attempts for insert to authenticated with check (
 student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
 and tenant_id in (select u.tenant_id from public.users u where u.auth_user_id=(select auth.uid()))
 and (
  (organization_id is null and exists(select 1 from public.learning_assessments a where a.id=assessment_id and a.organization_id is null and a.status='published'))
  or
  (organization_id is not null and public.is_organization_member(organization_id)
   and exists(select 1 from public.learning_assessments a where a.id=assessment_id and a.organization_id=organization_id and a.status='published'))
 )
);
create policy learning_attempts_update on public.learning_attempts for update to authenticated
 using (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())) and status in ('in_progress','submitted'))
 with check (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  and tenant_id in (select u.tenant_id from public.users u where u.auth_user_id=(select auth.uid()))
  and (
   (organization_id is null and exists(select 1 from public.learning_assessments a where a.id=assessment_id and a.organization_id is null and a.status='published'))
   or
   (organization_id is not null and public.is_organization_member(organization_id)
    and exists(select 1 from public.learning_assessments a where a.id=assessment_id and a.organization_id=organization_id))
  )
 );

create policy learning_attempt_answers_read on public.learning_attempt_answers for select to authenticated using (
 exists(select 1 from public.learning_attempts a where a.id=attempt_id and
  (a.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
   or (a.organization_id is not null and public.is_organization_member(a.organization_id))))
);
create policy learning_attempt_answers_insert on public.learning_attempt_answers for insert to authenticated with check (
 exists(select 1 from public.learning_attempts a where a.id=attempt_id and a.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())) and a.status='in_progress')
);
create policy learning_attempt_answers_update on public.learning_attempt_answers for update to authenticated
 using (exists(select 1 from public.learning_attempts a where a.id=attempt_id and a.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())) and a.status='in_progress'))
 with check (exists(select 1 from public.learning_attempts a where a.id=attempt_id and a.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())) and a.status='in_progress'));
create policy learning_attempt_answers_delete on public.learning_attempt_answers for delete to authenticated using (
 exists(select 1 from public.learning_attempts a where a.id=attempt_id and a.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())) and a.status='in_progress')
);

create policy learning_assessment_results_read on public.learning_assessment_results for select to authenticated using (
 student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
 or (organization_id is not null and public.is_organization_member(organization_id))
);
