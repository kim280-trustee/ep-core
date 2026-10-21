begin;

-- A non-graded record must never contribute to a term-grade calculation.
-- Repair legacy rows first and record each correction in the existing audit log.
with affected as (
  select
    e.id,
    to_jsonb(e) as before_data
  from public.learning_gradebook_entries e
  where e.status <> 'graded'
    and e.included_in_grade = true
),
updated as (
  update public.learning_gradebook_entries e
  set included_in_grade = false,
      updated_by = coalesce(e.updated_by, e.created_by),
      updated_at = now()
  from affected a
  where e.id = a.id
  returning
    e.id,
    e.organization_id,
    e.term_id,
    e.class_subject_id,
    e.student_user_id,
    e.created_by,
    e.updated_by,
    to_jsonb(e) as after_data
)
insert into public.learning_gradebook_audit_log (
  organization_id,
  term_id,
  class_subject_id,
  student_user_id,
  gradebook_entry_id,
  action,
  before_data,
  after_data,
  reason,
  changed_by
)
select
  u.organization_id,
  u.term_id,
  u.class_subject_id,
  u.student_user_id,
  u.id,
  'exclude_non_graded_entry',
  a.before_data,
  u.after_data,
  'Integrity correction: non-graded records cannot contribute to a term grade.',
  coalesce(u.updated_by, u.created_by)
from updated u
join affected a on a.id = u.id;

alter table public.learning_gradebook_entries
  drop constraint if exists learning_gradebook_entries_status_inclusion_check;

alter table public.learning_gradebook_entries
  add constraint learning_gradebook_entries_status_inclusion_check
  check (status = 'graded' or included_in_grade = false);

commit;
