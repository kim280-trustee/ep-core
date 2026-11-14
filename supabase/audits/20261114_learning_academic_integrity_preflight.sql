-- E&P Learning academic integrity preflight
-- READ ONLY. Run against the target Supabase database before applying academic-integrity
-- constraints. Each query returns rows that require review; zero rows is the expected result
-- for integrity violations. This script does not modify data.

-- 1. Active class-subject links whose subject is not actively included in the class curriculum.
select
  cg.id as class_group_id,
  cg.code as class_code,
  cg.curriculum_id,
  cs.id as class_subject_id,
  cs.subject_id,
  cs.status as class_subject_status
from public.learning_class_subjects cs
join public.learning_class_groups cg on cg.id = cs.class_group_id
where cs.status = 'active'
  and not exists (
    select 1
    from public.learning_curriculum_subjects csub
    where csub.curriculum_id = cg.curriculum_id
      and csub.subject_id = cs.subject_id
      and csub.status = 'active'
  )
order by cg.code, cs.subject_id;

-- 2. Objective alignments whose objective's subject is not actively included in that curriculum.
select
  oa.id as alignment_id,
  oa.objective_id,
  oa.curriculum_id,
  oa.grade_level_id,
  sk.subject_id
from public.learning_objective_alignments oa
join public.learning_objectives obj on obj.id = oa.objective_id
join public.learning_topics tp on tp.id = obj.topic_id
join public.learning_skills sk on sk.id = tp.skill_id
where not exists (
  select 1
  from public.learning_curriculum_subjects csub
  where csub.curriculum_id = oa.curriculum_id
    and csub.subject_id = sk.subject_id
    and csub.status = 'active'
)
order by oa.curriculum_id, oa.grade_level_id, sk.subject_id;

-- 3. Academic assessment questions with no objective mapping.
-- The current publication guard checks question type/scoring, but not academic mapping.
select
  a.id as assessment_id,
  a.code as assessment_code,
  a.curriculum_id,
  a.grade_level_id,
  aq.question_version_id
from public.learning_assessments a
join public.learning_assessment_questions aq on aq.assessment_id = a.id
where a.status = 'published'
  and a.curriculum_id is not null
  and a.grade_level_id is not null
  and not exists (
    select 1
    from public.learning_question_objectives qo
    where qo.question_version_id = aq.question_version_id
  )
order by a.code, aq.question_version_id;

-- 4. Academic assessment question objectives not aligned to that assessment's curriculum/grade.
select
  a.id as assessment_id,
  a.code as assessment_code,
  a.curriculum_id,
  a.grade_level_id,
  aq.question_version_id,
  qo.objective_id
from public.learning_assessments a
join public.learning_assessment_questions aq on aq.assessment_id = a.id
join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
where a.status = 'published'
  and a.curriculum_id is not null
  and a.grade_level_id is not null
  and not exists (
    select 1
    from public.learning_objective_alignments oa
    where oa.objective_id = qo.objective_id
      and oa.curriculum_id = a.curriculum_id
      and oa.grade_level_id = a.grade_level_id
  )
order by a.code, aq.question_version_id, qo.objective_id;

-- 5. Assessments with only one half of the curriculum/grade pair populated.
-- The database composite FK already makes invalid non-null pairs impossible, but a partial
-- pair should be reviewed before tightening publication rules.
select id, code, status, curriculum_id, grade_level_id
from public.learning_assessments
where (curriculum_id is null) <> (grade_level_id is null)
order by code;

-- 6. Subject composition of each assessment's question set.
-- This is the evidence needed to backfill an optional assessment subject_id safely:
-- one distinct subject = candidate; multiple subjects = cross-curricular; zero = unmapped.
select
  a.id as assessment_id,
  a.code as assessment_code,
  a.status,
  a.curriculum_id,
  a.grade_level_id,
  count(distinct sk.subject_id) as distinct_subject_count,
  array_agg(distinct sk.subject_id) filter (where sk.subject_id is not null) as subject_ids
from public.learning_assessments a
left join public.learning_assessment_questions aq on aq.assessment_id = a.id
left join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
left join public.learning_objectives obj on obj.id = qo.objective_id
left join public.learning_topics tp on tp.id = obj.topic_id
left join public.learning_skills sk on sk.id = tp.skill_id
group by a.id, a.code, a.status, a.curriculum_id, a.grade_level_id
having count(distinct sk.subject_id) <> 1
order by a.code;

-- 7. Curriculum-subject mappings marked inactive while active classes or objective
-- alignments still depend on them.
select
  csub.id as curriculum_subject_id,
  csub.curriculum_id,
  csub.subject_id,
  csub.status,
  count(distinct cs.id) as active_class_subject_links,
  count(distinct oa.id) filter (where sk.subject_id = csub.subject_id) as objective_alignments
from public.learning_curriculum_subjects csub
left join public.learning_class_groups cg
  on cg.curriculum_id = csub.curriculum_id
left join public.learning_class_subjects cs
  on cs.class_group_id = cg.id
 and cs.subject_id = csub.subject_id
 and cs.status = 'active'
left join public.learning_objective_alignments oa
  on oa.curriculum_id = csub.curriculum_id
left join public.learning_objectives obj on obj.id = oa.objective_id
left join public.learning_topics tp on tp.id = obj.topic_id
left join public.learning_skills sk
  on sk.id = tp.skill_id
 and sk.subject_id = csub.subject_id
where csub.status = 'inactive'
group by csub.id, csub.curriculum_id, csub.subject_id, csub.status
having count(distinct cs.id) > 0
    or count(distinct oa.id) filter (where sk.subject_id = csub.subject_id) > 0
order by csub.curriculum_id, csub.subject_id;

-- 8. Existing assessment question rows attached to published assessments.
-- This identifies records affected by a proposed published-assessment immutability guard.
select
  a.id as assessment_id,
  a.code as assessment_code,
  a.status,
  count(aq.id) as question_count
from public.learning_assessments a
join public.learning_assessment_questions aq on aq.assessment_id = a.id
where a.status = 'published'
group by a.id, a.code, a.status
order by a.code;
