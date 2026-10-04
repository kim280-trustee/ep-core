create table if not exists public.learning_term_grade_history (
  id uuid primary key default gen_random_uuid(),
  term_grade_id uuid not null,
  organization_id uuid not null,
  term_id uuid not null,
  class_subject_id uuid not null,
  student_user_id uuid not null,
  score numeric not null,
  letter_grade text,
  calculation jsonb not null default '{}'::jsonb,
  status text not null,
  finalized_at timestamptz,
  finalized_by uuid,
  snapshot_reason text,
  captured_at timestamptz not null default now()
);
create index if not exists learning_term_grade_history_student_idx on public.learning_term_grade_history(class_subject_id,term_id,student_user_id,captured_at desc);
alter table public.learning_term_grade_history enable row level security;
drop policy if exists learning_term_grade_history_select on public.learning_term_grade_history;
create policy learning_term_grade_history_select on public.learning_term_grade_history for select to authenticated using (is_organization_member(organization_id) and learning_can_manage_academic_records(organization_id));
-- The finalize function is intentionally replaced by the live migration to create a durable snapshot and audit event.