-- Do not publish assessments that the current runtime cannot evaluate safely.
begin;

create or replace function private.guard_learning_assessment_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status <> 'published' then
    return new;
  end if;

  if not exists (
    select 1 from public.learning_assessment_questions aq
    where aq.assessment_id = new.id
  ) then
    raise exception 'An assessment needs at least one question before publishing';
  end if;

  if exists (
    select 1
    from public.learning_assessment_questions aq
    join public.learning_question_versions qv on qv.id = aq.question_version_id
    join public.learning_questions q on q.id = qv.question_id
    left join public.learning_question_evaluation_keys ek on ek.question_version_id = qv.id
    where aq.assessment_id = new.id
      and (
        q.status <> 'published'
        or qv.published_at is null
        or q.question_type not in ('single_choice', 'true_false')
        or coalesce(ek.scoring_rules->>'method', '') <> 'exact_option'
        or not (coalesce(ek.evaluation_key, '{}'::jsonb) ? 'correct_option_id')
        or not exists (
          select 1
          from jsonb_array_elements(
            case
              when jsonb_typeof(qv.configuration->'options') = 'array'
                then qv.configuration->'options'
              else '[]'::jsonb
            end
          ) option_row
          where coalesce(option_row->>'key', option_row->>'value') = ek.evaluation_key->>'correct_option_id'
        )
      )
  ) then
    raise exception 'Every assessment question must be a published single-choice or true/false question with a valid automatic scoring key';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assessment_publication() from public, anon, authenticated;

drop trigger if exists learning_assessments_publication_guard on public.learning_assessments;
create trigger learning_assessments_publication_guard
before insert or update of status on public.learning_assessments
for each row execute function private.guard_learning_assessment_publication();

commit;
