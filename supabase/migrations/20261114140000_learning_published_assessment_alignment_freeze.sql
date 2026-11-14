-- Preserve the academic meaning of question objectives already used by published assessments.
-- This is a follow-up to 20261114062656_learning_academic_integrity_enforcement.sql.
-- It does not alter existing assessment/question data.

create or replace function private.guard_published_assessment_objective_alignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if exists (
    select 1
    from public.learning_question_objectives qo
    join public.learning_assessment_questions aq
      on aq.question_version_id = qo.question_version_id
    join public.learning_assessments a
      on a.id = aq.assessment_id
    where qo.objective_id = old.objective_id
      and a.curriculum_id = old.curriculum_id
      and a.grade_level_id = old.grade_level_id
      and a.status = 'published'
  ) then
    raise exception
      'Objective alignments used by published assessments cannot be changed or deleted';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

create trigger learning_objective_alignment_published_assessment_guard
before update or delete on public.learning_objective_alignments
for each row
execute function private.guard_published_assessment_objective_alignment();


create or replace function private.guard_published_assessment_objective_hierarchy()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_objective_id uuid;
begin
  if tg_table_name = 'learning_objectives' then
    v_objective_id := old.id;

    if exists (
      select 1
      from public.learning_question_objectives qo
      join public.learning_assessment_questions aq
        on aq.question_version_id = qo.question_version_id
      join public.learning_assessments a
        on a.id = aq.assessment_id
      where qo.objective_id = v_objective_id
        and a.status = 'published'
    ) then
      raise exception
        'Objectives used by published assessments cannot be moved or deleted';
    end if;

  elsif tg_table_name = 'learning_topics' then
    if exists (
      select 1
      from public.learning_objectives obj
      join public.learning_question_objectives qo
        on qo.objective_id = obj.id
      join public.learning_assessment_questions aq
        on aq.question_version_id = qo.question_version_id
      join public.learning_assessments a
        on a.id = aq.assessment_id
      where obj.topic_id = old.id
        and a.status = 'published'
    ) then
      raise exception
        'Topics containing objectives used by published assessments cannot be moved or deleted';
    end if;

  elsif tg_table_name = 'learning_skills' then
    if exists (
      select 1
      from public.learning_topics tp
      join public.learning_objectives obj
        on obj.topic_id = tp.id
      join public.learning_question_objectives qo
        on qo.objective_id = obj.id
      join public.learning_assessment_questions aq
        on aq.question_version_id = qo.question_version_id
      join public.learning_assessments a
        on a.id = aq.assessment_id
      where tp.skill_id = old.id
        and a.status = 'published'
    ) then
      raise exception
        'Skills containing objectives used by published assessments cannot be changed or deleted';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

create trigger learning_objective_published_assessment_hierarchy_guard
before update of topic_id or delete on public.learning_objectives
for each row
execute function private.guard_published_assessment_objective_hierarchy();

create trigger learning_topic_published_assessment_hierarchy_guard
before update of skill_id or delete on public.learning_topics
for each row
execute function private.guard_published_assessment_objective_hierarchy();

create trigger learning_skill_published_assessment_hierarchy_guard
before update of subject_id or delete on public.learning_skills
for each row
execute function private.guard_published_assessment_objective_hierarchy();

revoke all on function private.guard_published_assessment_objective_alignment()
  from public, anon, authenticated;
revoke all on function private.guard_published_assessment_objective_hierarchy()
  from public, anon, authenticated;
