-- E&P Learning: enforce curriculum/subject integrity for classes, objectives and assessments.
-- Safe for existing pilot records: subject_id is nullable. Only academic assessments with
-- exactly one derived subject are backfilled; non-academic and ambiguous records stay null.
-- Published assessment question sets become immutable; existing published records remain readable.

begin;

alter table public.learning_assessments
  add column if not exists subject_id uuid;

alter table public.learning_assessments
  add constraint learning_assessments_curriculum_subject_fk
  foreign key (curriculum_id, subject_id)
  references public.learning_curriculum_subjects (curriculum_id, subject_id)
  on update restrict
  on delete restrict;

create index if not exists learning_assessments_subject_id_idx
  on public.learning_assessments (subject_id)
  where subject_id is not null;

-- Backfill only assessments with both academic dimensions and one unambiguous mapped subject.
-- This leaves general/non-academic assessments (including existing gamified quizzes) unchanged.
with assessment_subjects as (
  select
    a.id as assessment_id,
    min(sk.subject_id::text)::uuid as subject_id
  from public.learning_assessments a
  join public.learning_assessment_questions aq on aq.assessment_id = a.id
  join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
  join public.learning_objectives obj on obj.id = qo.objective_id
  join public.learning_topics tp on tp.id = obj.topic_id
  join public.learning_skills sk on sk.id = tp.skill_id
  where a.curriculum_id is not null
    and a.grade_level_id is not null
  group by a.id
  having count(distinct sk.subject_id) = 1
)
update public.learning_assessments a
set subject_id = derived.subject_id
from assessment_subjects derived
where a.id = derived.assessment_id
  and a.subject_id is null
  and exists (
    select 1
    from public.learning_curriculum_subjects cs
    where cs.curriculum_id = a.curriculum_id
      and cs.subject_id = derived.subject_id
      and cs.status = 'active'
  );

-- An active class subject must be part of the class curriculum.
create or replace function private.guard_learning_class_subject_curriculum()
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
    raise exception 'The subject must be active in the class curriculum before it can be assigned';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_class_subject_curriculum() from public, anon, authenticated;

drop trigger if exists learning_class_subject_curriculum_guard on public.learning_class_subjects;
create trigger learning_class_subject_curriculum_guard
before insert or update of class_group_id, subject_id, status
on public.learning_class_subjects
for each row execute function private.guard_learning_class_subject_curriculum();

-- An objective may only be aligned to a curriculum that actively includes its subject.
create or replace function private.guard_learning_objective_alignment_curriculum()
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

  if v_subject_id is null or not exists (
    select 1
    from public.learning_curriculum_subjects cs
    where cs.curriculum_id = new.curriculum_id
      and cs.subject_id = v_subject_id
      and cs.status = 'active'
  ) then
    raise exception 'The objective subject must be active in the aligned curriculum';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_objective_alignment_curriculum() from public, anon, authenticated;

drop trigger if exists learning_objective_alignment_curriculum_guard on public.learning_objective_alignments;
create trigger learning_objective_alignment_curriculum_guard
before insert or update of objective_id, curriculum_id, grade_level_id
on public.learning_objective_alignments
for each row execute function private.guard_learning_objective_alignment_curriculum();

-- Do not deactivate a curriculum-subject mapping while active academic records rely on it.
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
      from public.learning_class_subjects cs
      join public.learning_class_groups cg on cg.id = cs.class_group_id
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
    ) then
      raise exception 'Remove dependent class-subject links and objective alignments before deactivating this curriculum subject';
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_curriculum_subject_deactivation() from public, anon, authenticated;

drop trigger if exists learning_curriculum_subject_deactivation_guard on public.learning_curriculum_subjects;
create trigger learning_curriculum_subject_deactivation_guard
before update of status on public.learning_curriculum_subjects
for each row execute function private.guard_learning_curriculum_subject_deactivation();

-- Assessment metadata must be a complete curriculum/grade pair. If a subject is supplied,
-- it must be an active subject in that curriculum. Subject remains optional for cross-curricular work.
create or replace function private.guard_learning_assessment_academic_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (new.curriculum_id is null) <> (new.grade_level_id is null) then
    raise exception 'Assessment curriculum and grade level must be set together';
  end if;

  if new.subject_id is not null then
    if new.curriculum_id is null then
      raise exception 'An assessment subject requires a curriculum and grade level';
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

  if new.status <> 'published' or new.curriculum_id is null then
    return new;
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
    raise exception 'Every question in an academic assessment must be mapped to at least one learning objective';
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
        not exists (
          select 1
          from public.learning_objective_alignments oa
          where oa.objective_id = qo.objective_id
            and oa.curriculum_id = new.curriculum_id
            and oa.grade_level_id = new.grade_level_id
        )
        or (new.subject_id is not null and sk.subject_id <> new.subject_id)
      )
  ) then
    raise exception 'Every question objective must match the assessment curriculum, grade and selected subject';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assessment_academic_scope() from public, anon, authenticated;

drop trigger if exists learning_assessments_academic_scope_guard on public.learning_assessments;
create trigger learning_assessments_academic_scope_guard
before insert or update of curriculum_id, grade_level_id, subject_id, status
on public.learning_assessments
for each row execute function private.guard_learning_assessment_academic_scope();

-- Preserve published assessment history. Draft assessments remain editable.
create or replace function private.guard_learning_published_assessment_questions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_assessment_id uuid;
begin
  v_assessment_id := case when tg_op = 'DELETE' then old.assessment_id else new.assessment_id end;

  if exists (
    select 1
    from public.learning_assessments a
    where a.id = v_assessment_id
      and a.status = 'published'
  ) then
    raise exception 'Published assessment question sets are immutable; create a new assessment revision';
  end if;

  if tg_op = 'UPDATE' and old.assessment_id is distinct from new.assessment_id and exists (
    select 1
    from public.learning_assessments a
    where a.id = old.assessment_id
      and a.status = 'published'
  ) then
    raise exception 'Questions cannot be moved out of a published assessment';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

revoke all on function private.guard_learning_published_assessment_questions() from public, anon, authenticated;

drop trigger if exists learning_published_assessment_questions_guard on public.learning_assessment_questions;
create trigger learning_published_assessment_questions_guard
before insert or update or delete
on public.learning_assessment_questions
for each row execute function private.guard_learning_published_assessment_questions();

-- Extend the existing publication guard without weakening its automatic-scoring checks.
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

  if (new.curriculum_id is null) <> (new.grade_level_id is null) then
    raise exception 'Assessment curriculum and grade level must be set together';
  end if;

  if new.curriculum_id is not null and exists (
    select 1
    from public.learning_assessment_questions aq
    where aq.assessment_id = new.id
      and not exists (
        select 1
        from public.learning_question_objectives qo
        where qo.question_version_id = aq.question_version_id
      )
  ) then
    raise exception 'Every question in an academic assessment must be mapped to at least one learning objective';
  end if;

  if new.curriculum_id is not null and exists (
    select 1
    from public.learning_assessment_questions aq
    join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
    join public.learning_objectives obj on obj.id = qo.objective_id
    join public.learning_topics tp on tp.id = obj.topic_id
    join public.learning_skills sk on sk.id = tp.skill_id
    where aq.assessment_id = new.id
      and (
        not exists (
          select 1
          from public.learning_objective_alignments oa
          where oa.objective_id = qo.objective_id
            and oa.curriculum_id = new.curriculum_id
            and oa.grade_level_id = new.grade_level_id
        )
        or (new.subject_id is not null and sk.subject_id <> new.subject_id)
      )
  ) then
    raise exception 'Every question objective must match the assessment curriculum, grade and selected subject';
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
