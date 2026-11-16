-- Bind every newly authored question version to one exact academic scope.
-- Legacy versions remain readable; new versions must declare curriculum, grade and subject.

begin;

alter table public.learning_question_versions
  add column if not exists curriculum_id uuid,
  add column if not exists grade_level_id uuid,
  add column if not exists subject_id uuid;

alter table public.learning_question_versions
  add constraint learning_question_versions_academic_scope_complete
  check (
    (curriculum_id is null and grade_level_id is null and subject_id is null)
    or
    (curriculum_id is not null and grade_level_id is not null and subject_id is not null)
  );

alter table public.learning_question_versions
  add constraint learning_question_versions_curriculum_grade_fk
  foreign key (curriculum_id, grade_level_id)
  references public.learning_grade_levels (curriculum_id, id)
  on update restrict on delete restrict;

alter table public.learning_question_versions
  add constraint learning_question_versions_curriculum_subject_fk
  foreign key (curriculum_id, subject_id)
  references public.learning_curriculum_subjects (curriculum_id, subject_id)
  on update restrict on delete restrict;

create index if not exists learning_question_versions_academic_scope_idx
  on public.learning_question_versions (curriculum_id, grade_level_id, subject_id)
  where curriculum_id is not null;

create or replace function private.guard_learning_question_version_academic_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.curriculum_id is null or new.grade_level_id is null or new.subject_id is null then
    raise exception 'A question version must be assigned to a curriculum, grade and subject.';
  end if;

  if not exists (
    select 1
    from public.learning_curricula curriculum
    join public.learning_grade_levels grade
      on grade.curriculum_id = curriculum.id
     and grade.id = new.grade_level_id
     and grade.status = 'active'
    join public.learning_subjects subject
      on subject.id = new.subject_id
     and subject.status = 'active'
    join public.learning_curriculum_subjects curriculum_subject
      on curriculum_subject.curriculum_id = curriculum.id
     and curriculum_subject.subject_id = subject.id
     and curriculum_subject.status = 'active'
    where curriculum.id = new.curriculum_id
      and curriculum.status = 'active'
  ) then
    raise exception 'The question curriculum, grade and subject must all be active and correctly linked.';
  end if;

  if tg_op = 'UPDATE' then
    if old.published_at is not null and (
      old.curriculum_id is distinct from new.curriculum_id
      or old.grade_level_id is distinct from new.grade_level_id
      or old.subject_id is distinct from new.subject_id
      or old.question_id is distinct from new.question_id
    ) then
      raise exception 'Published question versions cannot change their academic scope.';
    end if;

    if old.question_id is distinct from new.question_id then
      raise exception 'A question version cannot be moved to another question.';
    end if;
  end if;

  if exists (
    select 1
    from public.learning_question_versions existing
    where existing.question_id = new.question_id
      and existing.id is distinct from new.id
      and existing.curriculum_id is not null
      and (
        existing.curriculum_id is distinct from new.curriculum_id
        or existing.grade_level_id is distinct from new.grade_level_id
        or existing.subject_id is distinct from new.subject_id
      )
  ) then
    raise exception 'All versions of a question must retain the same curriculum, grade and subject.';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_question_version_academic_scope()
  from public, anon, authenticated;

drop trigger if exists learning_question_version_academic_scope_guard
  on public.learning_question_versions;
create trigger learning_question_version_academic_scope_guard
before insert or update of question_id, curriculum_id, grade_level_id, subject_id
on public.learning_question_versions
for each row
execute function private.guard_learning_question_version_academic_scope();

create or replace function private.guard_learning_question_objective_academic_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_curriculum_id uuid;
  v_grade_level_id uuid;
  v_subject_id uuid;
  v_published_at timestamptz;
  v_objective_subject_id uuid;
begin
  if tg_op = 'DELETE' then
    select curriculum_id, grade_level_id, subject_id, published_at
      into v_curriculum_id, v_grade_level_id, v_subject_id, v_published_at
    from public.learning_question_versions
    where id = old.question_version_id;
  else
    select curriculum_id, grade_level_id, subject_id, published_at
      into v_curriculum_id, v_grade_level_id, v_subject_id, v_published_at
    from public.learning_question_versions
    where id = new.question_version_id;
  end if;

  if tg_op = 'UPDATE' and old.question_version_id is distinct from new.question_version_id then
    if exists (
      select 1
      from public.learning_question_versions previous_version
      where previous_version.id = old.question_version_id
        and previous_version.published_at is not null
    ) then
      raise exception 'Published question objective mappings are immutable; create a new version.';
    end if;
  end if;

  if v_curriculum_id is null or v_grade_level_id is null or v_subject_id is null then
    raise exception 'Question objectives can only be linked to versions with a complete academic scope.';
  end if;

  if v_published_at is not null then
    raise exception 'Published question objective mappings are immutable; create a new version.';
  end if;

  if tg_op <> 'DELETE' then
    select skill.subject_id
      into v_objective_subject_id
    from public.learning_objectives objective
    join public.learning_topics topic on topic.id = objective.topic_id
    join public.learning_skills skill on skill.id = topic.skill_id
    where objective.id = new.objective_id
      and objective.status = 'active'
      and topic.status = 'active'
      and skill.status = 'active';

    if v_objective_subject_id is null or v_objective_subject_id <> v_subject_id then
      raise exception 'The question objective must belong to the question subject.';
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
        and alignment.curriculum_id = v_curriculum_id
        and alignment.grade_level_id = v_grade_level_id
    ) then
      raise exception 'The question objective must be aligned to this exact active curriculum and grade.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

revoke all on function private.guard_learning_question_objective_academic_scope()
  from public, anon, authenticated;

drop trigger if exists learning_question_objective_academic_scope_guard
  on public.learning_question_objectives;
create trigger learning_question_objective_academic_scope_guard
before insert or update or delete
on public.learning_question_objectives
for each row
execute function private.guard_learning_question_objective_academic_scope();

create or replace function private.guard_learning_question_publication_academic_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_version_id uuid;
  v_curriculum_id uuid;
  v_grade_level_id uuid;
  v_subject_id uuid;
begin
  if new.status <> 'published' then
    return new;
  end if;

  select id, curriculum_id, grade_level_id, subject_id
    into v_version_id, v_curriculum_id, v_grade_level_id, v_subject_id
  from public.learning_question_versions
  where question_id = new.id
  order by version_no desc
  limit 1;

  if v_version_id is null or v_curriculum_id is null
    or v_grade_level_id is null or v_subject_id is null then
    raise exception 'A question needs a version with a complete curriculum, grade and subject before publishing.';
  end if;

  if not exists (
    select 1
    from public.learning_question_objectives mapping
    where mapping.question_version_id = v_version_id
  ) then
    raise exception 'A question needs at least one aligned learning objective before publishing.';
  end if;

  if exists (
    select 1
    from public.learning_question_objectives mapping
    join public.learning_objectives objective on objective.id = mapping.objective_id
    join public.learning_topics topic on topic.id = objective.topic_id
    join public.learning_skills skill on skill.id = topic.skill_id
    where mapping.question_version_id = v_version_id
      and (
        objective.status <> 'active'
        or topic.status <> 'active'
        or skill.status <> 'active'
        or skill.subject_id <> v_subject_id
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
           and curriculum_subject.subject_id = v_subject_id
           and curriculum_subject.status = 'active'
          join public.learning_subjects subject
            on subject.id = v_subject_id
           and subject.status = 'active'
          where alignment.objective_id = mapping.objective_id
            and alignment.curriculum_id = v_curriculum_id
            and alignment.grade_level_id = v_grade_level_id
        )
      )
  ) then
    raise exception 'Every question objective must remain active and aligned to its exact curriculum, grade and subject before publishing.';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_question_publication_academic_scope()
  from public, anon, authenticated;

drop trigger if exists learning_question_publication_academic_scope_guard
  on public.learning_questions;
create trigger learning_question_publication_academic_scope_guard
before update of status
on public.learning_questions
for each row
execute function private.guard_learning_question_publication_academic_scope();

commit;
