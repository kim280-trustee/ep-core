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
         join public.learning_curricula curriculum
           on curriculum.id = alignment.curriculum_id
          and curriculum.status = 'active'
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
  select skill.subject_id
    into v_subject_id
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
    join public.learning_curricula curriculum
      on curriculum.id = alignment.curriculum_id
     and curriculum.status = 'active'
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

  if tg_op = 'UPDATE' and old.content_item_id is distinct from new.content_item_id
    and exists (
      select 1
      from public.learning_content_items old_content
      where old_content.id = old.content_item_id
        and old_content.status <> 'draft'
    ) then
    raise exception 'Objective mappings cannot be moved out of non-draft content.';
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

create or replace function private.guard_learning_content_knowledge_deactivation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_has_content_mapping boolean := false;
begin
  if old.status = 'active' and new.status = 'inactive' then
    if tg_table_name = 'learning_objectives' then
      select exists (
        select 1 from public.learning_content_objectives mapping
        where mapping.objective_id = old.id
      ) into v_has_content_mapping;
    elsif tg_table_name = 'learning_topics' then
      select exists (
        select 1
        from public.learning_content_objectives mapping
        join public.learning_objectives objective on objective.id = mapping.objective_id
        where objective.topic_id = old.id
      ) into v_has_content_mapping;
    elsif tg_table_name = 'learning_skills' then
      select exists (
        select 1
        from public.learning_content_objectives mapping
        join public.learning_objectives objective on objective.id = mapping.objective_id
        join public.learning_topics topic on topic.id = objective.topic_id
        where topic.skill_id = old.id
      ) into v_has_content_mapping;
    elsif tg_table_name = 'learning_subjects' then
      select exists (
        select 1
        from public.learning_content_objectives mapping
        join public.learning_objectives objective on objective.id = mapping.objective_id
        join public.learning_topics topic on topic.id = objective.topic_id
        join public.learning_skills skill on skill.id = topic.skill_id
        where skill.subject_id = old.id
      ) into v_has_content_mapping;
    elsif tg_table_name = 'learning_curricula' then
      select exists (
        select 1
        from public.learning_content_objectives mapping
        join public.learning_objective_alignments alignment
          on alignment.objective_id = mapping.objective_id
        where alignment.curriculum_id = old.id
      ) into v_has_content_mapping;
    end if;

    if v_has_content_mapping then
      raise exception 'This academic record is still used by learning content and cannot be deactivated.';
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_content_knowledge_deactivation()
  from public, anon, authenticated;

drop trigger if exists learning_objective_content_deactivation_guard
  on public.learning_objectives;
create trigger learning_objective_content_deactivation_guard
before update of status on public.learning_objectives
for each row execute function private.guard_learning_content_knowledge_deactivation();

drop trigger if exists learning_topic_content_deactivation_guard
  on public.learning_topics;
create trigger learning_topic_content_deactivation_guard
before update of status on public.learning_topics
for each row execute function private.guard_learning_content_knowledge_deactivation();

drop trigger if exists learning_skill_content_deactivation_guard
  on public.learning_skills;
create trigger learning_skill_content_deactivation_guard
before update of status on public.learning_skills
for each row execute function private.guard_learning_content_knowledge_deactivation();

drop trigger if exists learning_subject_content_deactivation_guard
  on public.learning_subjects;
create trigger learning_subject_content_deactivation_guard
before update of status on public.learning_subjects
for each row execute function private.guard_learning_content_knowledge_deactivation();

drop trigger if exists learning_curriculum_content_deactivation_guard
  on public.learning_curricula;
create trigger learning_curriculum_content_deactivation_guard
before update of status on public.learning_curricula
for each row execute function private.guard_learning_content_knowledge_deactivation();

create or replace function private.guard_learning_content_knowledge_reassignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_has_content_mapping boolean := false;
begin
  if tg_table_name = 'learning_objectives' and new.topic_id is distinct from old.topic_id then
    select exists (
      select 1 from public.learning_content_objectives mapping
      where mapping.objective_id = old.id
    ) into v_has_content_mapping;
  elsif tg_table_name = 'learning_topics' and new.skill_id is distinct from old.skill_id then
    select exists (
      select 1
      from public.learning_content_objectives mapping
      join public.learning_objectives objective on objective.id = mapping.objective_id
      where objective.topic_id = old.id
    ) into v_has_content_mapping;
  elsif tg_table_name = 'learning_skills' and new.subject_id is distinct from old.subject_id then
    select exists (
      select 1
      from public.learning_content_objectives mapping
      join public.learning_objectives objective on objective.id = mapping.objective_id
      join public.learning_topics topic on topic.id = objective.topic_id
      where topic.skill_id = old.id
    ) into v_has_content_mapping;
  end if;

  if v_has_content_mapping then
    raise exception 'This academic hierarchy is used by learning content and cannot be reassigned.';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_content_knowledge_reassignment()
  from public, anon, authenticated;

drop trigger if exists learning_objective_content_reassignment_guard
  on public.learning_objectives;
create trigger learning_objective_content_reassignment_guard
before update of topic_id on public.learning_objectives
for each row execute function private.guard_learning_content_knowledge_reassignment();

drop trigger if exists learning_topic_content_reassignment_guard
  on public.learning_topics;
create trigger learning_topic_content_reassignment_guard
before update of skill_id on public.learning_topics
for each row execute function private.guard_learning_content_knowledge_reassignment();

drop trigger if exists learning_skill_content_reassignment_guard
  on public.learning_skills;
create trigger learning_skill_content_reassignment_guard
before update of subject_id on public.learning_skills
for each row execute function private.guard_learning_content_knowledge_reassignment();

commit;
