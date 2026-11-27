begin;

-- Assessment results that have become academic records must not be silently
-- deleted or detached from their source identity. The gradebook has no FK to
-- assessment_results, so these guards prevent orphaned provenance while an
-- explicit archival/reconciliation workflow is designed and approved.
create or replace function private.guard_linked_assessment_result_retention()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_op = 'DELETE' then
    if exists (
      select 1
      from public.learning_gradebook_entries e
      where e.assessment_result_id = old.id
    ) then
      raise exception
        'Assessment result % is linked to a gradebook record and cannot be deleted. Use an approved academic-record archival workflow.',
        old.id
        using errcode = '23503';
    end if;

    return old;
  end if;

  if (
    new.attempt_id is distinct from old.attempt_id
    or new.student_user_id is distinct from old.student_user_id
    or new.organization_id is distinct from old.organization_id
  ) and exists (
    select 1
    from public.learning_gradebook_entries e
    where e.assessment_result_id = old.id
  ) then
    raise exception
      'Assessment result % is linked to a gradebook record; source identity cannot be changed.',
      old.id
      using errcode = '23514';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_linked_assessment_result_retention()
from public, anon, authenticated;

drop trigger if exists learning_assessment_result_retention_guard
on public.learning_assessment_results;

create trigger learning_assessment_result_retention_guard
before delete or update of attempt_id, student_user_id, organization_id
on public.learning_assessment_results
for each row
execute function private.guard_linked_assessment_result_retention();

commit;
