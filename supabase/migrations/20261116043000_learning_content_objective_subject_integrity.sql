-- Enforce subject-aware content objective mappings at the database boundary.
-- A content item belongs to one subject; its objectives must be active and
-- aligned to an active grade in a curriculum that actively offers that subject.

begin;

do $$
begin
  if exists (
    select 1
    from public.learning_content_objectives content_objective
    join public.learning_objectives objective
      on objective.id = content_objective.objective_id
    join public.learning_topics topic
      on topic.id = objective.topic_id
    join public.learning_skills skill
      on skill.id = topic.skill_id
    group by content_objective.content_item_id
    having count(distinct skill.subject_id) > 1
  ) then
    raise exception
      'Content subject integrity migration stopped: at least one content item is linked to objectives from multiple subjects. Review those mappings before retrying.';
  end if;

  if exists (
    select 1
    from public.learning_content_objectives content_objective
    join public.learning_objectives objective
      on objective.id = content_objective.objective_id
    join public.learning_topics topic
      on topic.id = objective.topic_id
    join public.learning_skills skill
      on skill.id = topic.skill_id
    where objective.status <> 'active'
       or topic.status <> 'active'
       or skill.status <> 'active'
       or not exists (
         select 1
         from public.learning_objective_alignments alignment
         join public.learning_grade_levels grade
           on grade.id = alignment.grade_level_id
          and grade.curriculum_id = alignment.curriculum_id
          and grade.status = 'active'
         join public.learning_curriculum_subjects curriculum_subject
           on curriculum_subject.curriculum_id = alignment.curriculum_id
          and curriculum_subject.subject_id = skill.subject_id
          and curriculum_subject.status = 'active'
         join public.learning_subjects subject
           on subject.id = skill.subject_id
          and subject.status = 'active'
         where alignment.objective_id = objective.id
       )
  ) then
    raise exception
      'Content subject integrity migration stopped: at least one linked objective is inactive or lacks an active curriculum/grade alignment. Review those mappings before retrying.';
  end if;
end;
$$;

create or replace function private.guard_learning_content_objective_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_subject_id uuid;
  v_content_status text;
begin
  select objective.status, skill.subject_id
    into v_content_status, v_subject_id
  from public.learning_objectives objective
  join public.learning_topics topic on topic.id = objective.topic_id
  join public.learning_skills skill on skill.id = topic.skill_id
  where objective.id = new.objective_id
    and objective.status = 'active'
    and topic.status = 'active'
    and skill.status = 'active';

  if v_subject_id is null then
    raise exception 'Content must be linked to an active learning objective.';
  end if;

  if not exists (
    select 1
    from public.learning_objective_alignments alignment
    join public.learning_grade_levels grade
      on grade.id = alignment.grade_level_id
     and grade.curriculum_id = alignment.curriculum_id
     and grade.status = 'active'
    join public.learning_curriculum_subjects curriculum_subject
      on curriculum_subject.curriculum_id = alignment.curriculum_id
     and curriculum_subject.subject_id = v_subject_id
     and curriculum_subject.status = 'active'
    join public.learning_subjects subject
      on subject.id = v_subject_id
     and subject.status = 'active'
    where alignment.objective_id = new.objective_id
  ) then
    raise exception 'The learning objective must be aligned to an active grade and subject in at least one active curriculum.';
  end if;

  select content_item.status
    into v_content_status
  from public.learning_content_items content_item
  where content_item.id = new.content_item_id;

  if v_content_status is distinct from 'draft' then
    raise exception 'Only draft content can have its learning-objective mappings changed.';
  end if;

  if exists (
    select 1
    from public.learning_content_objectives existing_mapping
    join public.learning_objectives existing_objective
      on existing_objective.id = existing_mapping.objective_id
    join public.learning_topics existing_topic
      on existing_topic.id = existing_objective.topic_id
    join public.learning_skills existing_skill
      on existing_skill.id = existing_topic.skill_id
    where existing_mapping.content_item_id = new.content_item_id
      and existing_mapping.objective_id <> new.objective_id
      and existing_skill.subject_id is distinct from v_subject_id
  ) then
    raise exception 'All learning objectives linked to one content item must belong to the same subject.';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_content_objective_scope()
  from public, anon, authenticated;

drop trigger if exists learning_content_objective_academic_scope_guard
  on public.learning_content_objectives;
create trigger learning_content_objective_academic_scope_guard
before insert or update
on public.learning_content_objectives
for each row
execute function private.guard_learning_content_objective_scope();

create or replace function private.guard_learning_content_objective_delete_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if exists (
    select 1
    from public.learning_content_items content_item
    where content_item.id = old.content_item_id
      and content_item.status <> 'draft'
  ) then
    raise exception 'Only draft content can have its learning-objective mappings changed.';
  end if;

  return old;
end;
$function$;

revoke all on function private.guard_learning_content_objective_delete_scope()
  from public, anon, authenticated;

drop trigger if exists learning_content_objective_delete_scope_guard
  on public.learning_content_objectives;
create trigger learning_content_objective_delete_scope_guard
before delete
on public.learning_content_objectives
for each row
execute function private.guard_learning_content_objective_delete_scope();

commit;
