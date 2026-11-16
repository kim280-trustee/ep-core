-- Keep objective prerequisite relationships inside one academic subject.
-- Existing cross-subject links are checked before the stricter trigger is installed.

begin;

do $$
begin
  if exists (
    select 1
    from public.learning_objective_prerequisites prerequisite
    join public.learning_objectives objective
      on objective.id = prerequisite.objective_id
    join public.learning_topics objective_topic
      on objective_topic.id = objective.topic_id
    join public.learning_skills objective_skill
      on objective_skill.id = objective_topic.skill_id
    join public.learning_objectives required_objective
      on required_objective.id = prerequisite.prerequisite_objective_id
    join public.learning_topics required_topic
      on required_topic.id = required_objective.topic_id
    join public.learning_skills required_skill
      on required_skill.id = required_topic.skill_id
    where objective_skill.subject_id is distinct from required_skill.subject_id
  ) then
    raise exception
      'Subject integrity migration stopped: cross-subject prerequisite links already exist. Review those links before retrying.';
  end if;
end;
$$;

create or replace function public.prevent_learning_objective_prerequisite_cycles()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_objective_subject_id uuid;
  v_prerequisite_subject_id uuid;
begin
  select skill.subject_id
    into v_objective_subject_id
  from public.learning_objectives objective
  join public.learning_topics topic on topic.id = objective.topic_id
  join public.learning_skills skill on skill.id = topic.skill_id
  where objective.id = new.objective_id;

  select skill.subject_id
    into v_prerequisite_subject_id
  from public.learning_objectives objective
  join public.learning_topics topic on topic.id = objective.topic_id
  join public.learning_skills skill on skill.id = topic.skill_id
  where objective.id = new.prerequisite_objective_id;

  if v_objective_subject_id is null
    or v_prerequisite_subject_id is null
    or v_objective_subject_id is distinct from v_prerequisite_subject_id then
    raise exception 'A learning objective prerequisite must belong to the same subject.'
      using errcode = '23514';
  end if;

  if exists (
    with recursive prerequisite_chain(objective_id) as (
      select new.prerequisite_objective_id
      union
      select prerequisite.prerequisite_objective_id
      from public.learning_objective_prerequisites prerequisite
      join prerequisite_chain chain
        on prerequisite.objective_id = chain.objective_id
    )
    select 1
    from prerequisite_chain
    where objective_id = new.objective_id
  ) then
    raise exception 'This prerequisite would create a circular learning-objective dependency.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_learning_objective_prerequisite_cycles()
  from public, anon, authenticated;

commit;
