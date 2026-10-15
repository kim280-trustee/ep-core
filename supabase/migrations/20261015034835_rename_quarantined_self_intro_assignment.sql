-- Correct the display title of the already-closed malformed pilot duplicate.
-- The original title remains recorded in the assignment lifecycle event metadata.
update public.learning_assignments
set title = 'Introducing Yourself (closed duplicate)',
    updated_at = now()
where code = 'ASG-SELF-INTRO-01'
  and title = 'Introducing Yon Introducing Yourself.ourself'
  and status = 'closed'
  and not exists (select 1 from public.learning_content_responses r where r.assignment_id = learning_assignments.id)
  and not exists (select 1 from public.learning_gradebook_entries g where g.assignment_id = learning_assignments.id);
