-- Preserve all assessment attempts, but include only the best result in the gradebook.
-- The original assessment-result sync helper retains its boolean return contract;
-- this trigger wrapper applies the best-attempt rule using the current schema.

create or replace function private.sync_learning_assessment_result_gradebook_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_assessment_id uuid;
  v_best_result_id uuid;
begin
  -- Keep the existing trusted result-to-gradebook mapping and upsert behavior.
  perform private.sync_learning_assessment_result_to_gradebook(new.id);

  select a.assessment_id
    into v_assessment_id
  from public.learning_attempts a
  where a.id = new.attempt_id;

  if v_assessment_id is null then
    return new;
  end if;

  -- Rank all evaluated attempts for this student and assessment:
  -- highest percentage, latest evaluation time, then stable result id.
  select ar.id
    into v_best_result_id
  from public.learning_assessment_results ar
  join public.learning_attempts a
    on a.id = ar.attempt_id
  where a.assessment_id = v_assessment_id
    and a.student_user_id = new.student_user_id
  order by
    ar.percentage desc nulls last,
    ar.evaluated_at desc nulls last,
    ar.id desc
  limit 1;

  update public.learning_gradebook_entries gbe
  set
    included_in_grade = (gbe.assessment_result_id = v_best_result_id),
    notes = coalesce(gbe.notes, '{}'::jsonb)
      || jsonb_build_object('attempt_policy', 'best_attempt'),
    updated_at = now()
  where gbe.assessment_id = v_assessment_id
    and gbe.student_user_id = new.student_user_id
    and gbe.record_type = 'assessment';

  return new;
end;
$function$;

revoke all on function private.sync_learning_assessment_result_gradebook_trigger()
from public, anon, authenticated;

-- Recalculate historical gradebook inclusion using the same deterministic
-- ranking rule. Rows remain stored for audit/history; only one is included.
with ranked as (
  select
    gbe.id,
    row_number() over (
      partition by gbe.assessment_id, gbe.student_user_id
      order by
        ar.percentage desc nulls last,
        ar.evaluated_at desc nulls last,
        ar.id desc
    ) as rn
  from public.learning_gradebook_entries gbe
  join public.learning_assessment_results ar
    on ar.id = gbe.assessment_result_id
  where gbe.record_type = 'assessment'
    and gbe.assessment_id is not null
    and gbe.student_user_id is not null
)
update public.learning_gradebook_entries gbe
set
  included_in_grade = (ranked.rn = 1),
  notes = coalesce(gbe.notes, '{}'::jsonb)
    || jsonb_build_object('attempt_policy', 'best_attempt'),
  updated_at = now()
from ranked
where gbe.id = ranked.id;
