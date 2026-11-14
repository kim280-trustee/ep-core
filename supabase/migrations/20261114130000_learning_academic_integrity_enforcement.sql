-- E&P Learning academic integrity enforcement
-- Adds the assessment subject column already consumed by the application,
-- safely backfills it from question objectives, and enforces academic scope
-- in the database. Existing published assessments and question rows are preserved.

begin;

-- Fail closed if the current assessment/question data cannot produce one
-- unambiguous subject per assessment. The 2026-11-14 read-only preflight
-- returned zero rows for this condition.
do $$
begin
  if exists (
    select a.id
    from public.learning_assessments a
    left join public.learning_assessment_questions aq on aq.assessment_id = a.id
    left join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
    left join public.learning_objectives obj on obj.id = qo.objective_id
    left join public.learning_topics tp on tp.id = obj.topic_id
    left join public.learning_skills sk on sk.id = tp.skill_id
    group by a.id
    having count(distinct sk.subject_id) <> 1
  ) then
    raise exception
      'Academic integrity migration stopped: at least one assessment has no single unambiguous subject. Review the 2026-11-14 academic integrity preflight before retrying.';
  end if;
end;
$$;

alter table public.learning_assessments
  add column if not exists subject_id uuid;

-- Backfill each assessment from the subject represented by all of its
-- question objective mappings. This does not alter question or assessment
-- content, status, publication timestamps, or existing attempts.
update public.learning_assessments a
set subject_id = scoped.subject_id
from (
  select
    a2.id as assessment_id,
    (array_agg(distinct sk.subject_id order by sk.subject_id))[1] as subject_id
  from public.learning_assessments a2
  join public.learning_assessment_questions aq on aq.assessment_id = a2.id
  join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
  join public.learning_objectives obj on obj.id = qo.objective_id
  join public.learning_topics tp on tp.id = obj.topic_id
  join public.learning_skills sk on sk.id = tp.skill_id
  group by a2.id
  having count(distinct sk.subject_id) = 1
) scoped
where a.id = scoped.assessment_id
  and a.subject_id is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.learning_assessments'::regclass
      and conname = 'learning_assessments_subject_id_fkey'
  ) then
    alter table public.learning_assessments
      add constraint learning_assessments_subject_id_fkey
      foreign key (subject_id)
      references public.learning_subjects(id)
      on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.learning_assessments'::regclass
      and conname = 'learning_assessments_curriculum_subject_fk'
  ) then
    alter table public.learning_assessments
      add constraint learning_assessments_curriculum_subject_fk
      foreign key (curriculum_id, subject_id)
      references public.learning_curriculum_subjects(curriculum_id, subject_id)
      on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.learning_assessments'::regclass
      and conname = 'learning_assessments_academic_pair_check'
  ) then
    alter table public.learning_assessments
      add constraint learning_assessments_academic_pair_check
      check ((curriculum_id is null) = (grade_level_id is null));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.learning_assessments'::regclass
      and conname = 'learning_assessments_academic_subject_check'
  ) then
    alter table public.learning_assessments
      add constraint learning_assessments_academic_subject_check
      check (curriculum_id is null or subject_id is not null);
  end if;
end;
$$;

-- A class may only actively teach a subject included in its curriculum.
create or replace function private.guard_learning_class_subject_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_curriculum_id uuid;
begin
  if new.status <> 'active' then
    return new;
  end if;

  select cg.curriculum_id
    into v_curriculum_id
  from public.learning_class_groups cg
  where cg.id = new.class_group_id;

  if v_curriculum_id is null or not exists (
    select 1
    from public.learning_curriculum_subjects cs
    where cs.curriculum_id = v_curriculum_id
      and cs.subject_id = new.subject_id
      and cs.status = 'active'
  ) then
    raise exception 'An active class subject must belong to the class curriculum and be active in that curriculum';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_class_subject_scope() from public, anon, authenticated;
drop trigger if exists learning_class_subject_academic_scope_guard on public.learning_class_subjects;
create trigger learning_class_subject_academic_scope_guard
before insert or update of class_group_id, subject_id, status
on public.learning_class_subjects
for each row execute function private.guard_learning_class_subject_scope();

-- An objective can only be aligned to a grade/curriculum that actively
-- includes the subject owning that objective.
create or replace function private.guard_learning_objective_alignment_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_subject_id uuid;
begin
  select sk.subject_id
    into v_subject_id
  from public.learning_objectives obj
  join public.learning_topics tp on tp.id = obj.topic_id
  join public.learning_skills sk on sk.id = tp.skill_id
  where obj.id = new.objective_id;

  if v_subject_id is null then
    raise exception 'The objective must resolve to a valid subject before it can be aligned';
  end if;

  if not exists (
    select 1
    from public.learning_grade_levels gl
    where gl.id = new.grade_level_id
      and gl.curriculum_id = new.curriculum_id
  ) then
    raise exception 'The objective alignment grade must belong to the selected curriculum';
  end if;

  if not exists (
    select 1
    from public.learning_curriculum_subjects cs
    where cs.curriculum_id = new.curriculum_id
      and cs.subject_id = v_subject_id
      and cs.status = 'active'
  ) then
    raise exception 'The objective subject must be active in the selected curriculum';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_objective_alignment_scope() from public, anon, authenticated;
drop trigger if exists learning_objective_alignment_academic_scope_guard on public.learning_objective_alignments;
create trigger learning_objective_alignment_academic_scope_guard
before insert or update of objective_id, curriculum_id, grade_level_id
on public.learning_objective_alignments
for each row execute function private.guard_learning_objective_alignment_scope();

-- Do not deactivate a curriculum-subject mapping while class, objective, or
-- assessment records still depend on it.
create or replace function private.guard_learning_curriculum_subject_deactivation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if old.status = 'active' and new.status = 'inactive' then
    if exists (
      select 1
      from public.learning_class_groups cg
      join public.learning_class_subjects cs on cs.class_group_id = cg.id
      where cg.curriculum_id = old.curriculum_id
        and cs.subject_id = old.subject_id
        and cs.status = 'active'
    ) or exists (
      select 1
      from public.learning_objective_alignments oa
      join public.learning_objectives obj on obj.id = oa.objective_id
      join public.learning_topics tp on tp.id = obj.topic_id
      join public.learning_skills sk on sk.id = tp.skill_id
      where oa.curriculum_id = old.curriculum_id
        and sk.subject_id = old.subject_id
    ) or exists (
      select 1
      from public.learning_assessments a
      where a.curriculum_id = old.curriculum_id
        and a.subject_id = old.subject_id
    ) then
      raise exception 'This curriculum subject is still used by class, objective, or assessment records and cannot be deactivated';
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_curriculum_subject_deactivation() from public, anon, authenticated;
drop trigger if exists learning_curriculum_subject_deactivation_guard on public.learning_curriculum_subjects;
create trigger learning_curriculum_subject_deactivation_guard
before update of status
on public.learning_curriculum_subjects
for each row execute function private.guard_learning_curriculum_subject_deactivation();

-- Academic metadata is checked on every assessment write. Published records
-- may still be transitioned by the existing lifecycle, but their academic
-- scope cannot be silently changed while they remain published.
create or replace function private.guard_learning_assessment_academic_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (new.curriculum_id is null) <> (new.grade_level_id is null) then
    raise exception 'Assessment curriculum and grade must either both be set or both be empty';
  end if;

  if new.curriculum_id is not null then
    if new.subject_id is null then
      raise exception 'An academic assessment must specify a subject';
    end if;

    if not exists (
      select 1
      from public.learning_curriculum_subjects cs
      where cs.curriculum_id = new.curriculum_id
        and cs.subject_id = new.subject_id
        and cs.status = 'active'
    ) then
      raise exception 'The assessment subject must be active in its curriculum';
    end if;
  end if;

  if tg_op = 'UPDATE' and old.status = 'published' and new.status = 'published'
    and row(new.curriculum_id, new.grade_level_id, new.subject_id)
      is distinct from row(old.curriculum_id, old.grade_level_id, old.subject_id) then
    raise exception 'The academic scope of a published assessment is immutable; create a new draft for a different scope';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assessment_academic_scope() from public, anon, authenticated;
drop trigger if exists learning_assessment_academic_scope_guard on public.learning_assessments;
create trigger learning_assessment_academic_scope_guard
before insert or update of curriculum_id, grade_level_id, subject_id, status
on public.learning_assessments
for each row execute function private.guard_learning_assessment_academic_scope();

-- Attachments to academic assessments must resolve to objectives aligned to
-- the assessment's curriculum, grade, and subject. The publication guard
-- below repeats this validation at the final publication boundary.
create or replace function private.guard_learning_assessment_question_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_assessment_id uuid;
  v_curriculum_id uuid;
  v_grade_level_id uuid;
  v_subject_id uuid;
begin
  if tg_op = 'DELETE' then
    v_assessment_id := old.assessment_id;
  else
    v_assessment_id := new.assessment_id;
  end if;

  if tg_op = 'UPDATE' and old.assessment_id is distinct from new.assessment_id then
    if exists (select 1 from public.learning_assessments a where a.id = old.assessment_id and a.status = 'published') then
      raise exception 'Questions attached to a published assessment cannot be moved or changed';
    end if;
  end if;

  if exists (
    select 1
    from public.learning_assessments a
    where a.id = v_assessment_id
      and a.status = 'published'
  ) then
    raise exception 'Questions attached to a published assessment are immutable';
  end if;

  if tg_op <> 'DELETE' then
    select a.curriculum_id, a.grade_level_id, a.subject_id
      into v_curriculum_id, v_grade_level_id, v_subject_id
    from public.learning_assessments a
    where a.id = v_assessment_id;

    if v_curriculum_id is not null then
      if not exists (
        select 1
        from public.learning_question_objectives qo
        where qo.question_version_id = new.question_version_id
      ) then
        raise exception 'Every question in an academic assessment must have at least one objective mapping';
      end if;

      if exists (
        select 1
        from public.learning_question_objectives qo
        join public.learning_objectives obj on obj.id = qo.objective_id
        join public.learning_topics tp on tp.id = obj.topic_id
        join public.learning_skills sk on sk.id = tp.skill_id
        where qo.question_version_id = new.question_version_id
          and (
            sk.subject_id is distinct from v_subject_id
            or not exists (
              select 1
              from public.learning_objective_alignments oa
              where oa.objective_id = qo.objective_id
                and oa.curriculum_id = v_curriculum_id
                and oa.grade_level_id = v_grade_level_id
            )
          )
      ) then
        raise exception 'Every question objective must match the assessment curriculum, grade, and subject';
      end if;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

revoke all on function private.guard_learning_assessment_question_scope() from public, anon, authenticated;
drop trigger if exists learning_assessment_question_academic_scope_guard on public.learning_assessment_questions;
create trigger learning_assessment_question_academic_scope_guard
before insert or update or delete
on public.learning_assessment_questions
for each row execute function private.guard_learning_assessment_question_scope();

-- Extend the existing publication guard without weakening its question-type,
-- version, ownership, or automatic-scoring checks.
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
        or (q.organization_id is not null and q.organization_id is distinct from new.organization_id)
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

  if new.curriculum_id is not null then
    if new.subject_id is null then
      raise exception 'An academic assessment must specify a subject';
    end if;

    if exists (
      select 1
      from public.learning_assessment_questions aq
      where aq.assessment_id = new.id
        and not exists (
          select 1
          from public.learning_question_objectives qo
          where qo.question_version_id = aq.question_version_id
        )
    ) then
      raise exception 'Every question in an academic assessment must have at least one objective mapping';
    end if;

    if exists (
      select 1
      from public.learning_assessment_questions aq
      join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
      join public.learning_objectives obj on obj.id = qo.objective_id
      join public.learning_topics tp on tp.id = obj.topic_id
      join public.learning_skills sk on sk.id = tp.skill_id
      where aq.assessment_id = new.id
        and (
          sk.subject_id is distinct from new.subject_id
          or not exists (
            select 1
            from public.learning_objective_alignments oa
            where oa.objective_id = qo.objective_id
              and oa.curriculum_id = new.curriculum_id
              and oa.grade_level_id = new.grade_level_id
          )
        )
    ) then
      raise exception 'Every question objective must match the assessment curriculum, grade, and subject';
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assessment_publication() from public, anon, authenticated;

commit;
