-- Close pilot assignments that point at the self-introduction lesson despite unrelated or duplicate labels.
-- Keep assignment, target, and progress rows intact; no student work or grading history is deleted.
-- Lifecycle events are written so the correction remains auditable.
with quarantined as (
  update public.learning_assignments a
  set status = 'closed',
      updated_by = a.created_by,
      updated_at = now()
  where a.status = 'published'
    and (
      (a.code = 'ENG' and a.title = 'present simple tense')
      or (a.code = 'ENG-M1-SELF-001' and a.title = 'Introducing Yourself')
      or (a.code = 'ENG-M1-OO4' and a.title = 'GRAMMAR')
      or (a.code = 'ASG-SELF-INTRO-01' and a.title = 'Introducing Yon Introducing Yourself.ourself')
    )
    and not exists (
      select 1 from public.learning_content_responses r where r.assignment_id = a.id
    )
    and not exists (
      select 1 from public.learning_gradebook_entries g where g.assignment_id = a.id
    )
  returning a.id, a.organization_id, a.created_by, a.code, a.title
)
insert into public.learning_assignment_lifecycle_events
  (organization_id, assignment_id, action, actor_user_id, metadata)
select organization_id, id, 'closed', created_by,
       jsonb_build_object(
         'previous_status', 'published',
         'reason', 'pilot assignment points to unrelated or duplicate self-introduction content',
         'code', code,
         'title', title
       )
from quarantined;
