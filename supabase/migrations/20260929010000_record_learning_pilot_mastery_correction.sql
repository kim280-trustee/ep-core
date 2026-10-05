-- Record the pilot-data correction as an explicit mastery event.
-- The original assessment events remain unchanged for auditability.

insert into public.learning_mastery_events (
  tenant_id,
  organization_id,
  student_user_id,
  objective_id,
  attempt_id,
  previous_score,
  new_score,
  evidence,
  created_at
)
select
  m.tenant_id,
  m.organization_id,
  m.student_user_id,
  m.objective_id,
  null,
  33.333,
  100.000,
  jsonb_build_object(
    'type', 'pilot_data_correction',
    'reason', 'Corrected synthetic seed attempt weight in pilot mastery row',
    'corrected_attempts_count', 2,
    'corrected_correct_count', 2
  ),
  now()
from public.learning_student_mastery m
where m.id = 'd941d3e1-5b3c-450b-a6f4-1f463f652cf7'
  and m.student_user_id = 'f368d757-9321-4a69-af31-7bd3cd38b780'
  and m.objective_id = '86fc4407-1216-5477-a7d9-9865d83fd8d9'
  and m.mastery_score = 100.000
  and not exists (
    select 1
    from public.learning_mastery_events e
    where e.student_user_id = m.student_user_id
      and e.objective_id = m.objective_id
      and e.attempt_id is null
      and e.evidence->>'type' = 'pilot_data_correction'
  );