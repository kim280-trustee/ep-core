-- Read-only verification for the E&P Learning Thai Mathematics M1-M6 rollout.
-- Run after the Maths curriculum and knowledge-graph migrations are applied.
-- Expected grade objective counts: M1=9, M2=12, M3=12, M4=3, M5=4, M6=1.

with expected(grade_code, expected_objectives) as (
  values ('M1',9),('M2',12),('M3',12),('M4',3),('M5',4),('M6',1)
), actual as (
  select grade.code as grade_code,
         count(distinct alignment.objective_id)::integer as actual_objectives
  from public.learning_subjects subject
  join public.learning_curriculum_subjects curriculum_subject
    on curriculum_subject.subject_id = subject.id
  join public.learning_curricula curriculum
    on curriculum.id = curriculum_subject.curriculum_id
  join public.learning_grade_levels grade
    on grade.curriculum_id = curriculum.id
  join public.learning_objective_alignments alignment
    on alignment.curriculum_id = curriculum.id
   and alignment.grade_level_id = grade.id
  join public.learning_objectives objective
    on objective.id = alignment.objective_id
  join public.learning_topics topic on topic.id = objective.topic_id
  join public.learning_skills skill
    on skill.id = topic.skill_id and skill.subject_id = subject.id
  where subject.code = 'MATH'
    and curriculum.code = 'TH-MATH-M1-M6'
  group by grade.code
)
select expected.grade_code, expected.expected_objectives,
       coalesce(actual.actual_objectives,0) as actual_objectives,
       case when coalesce(actual.actual_objectives,0)=expected.expected_objectives
         then 'PASS' else 'CHECK' end as result
from expected left join actual using (grade_code)
order by expected.grade_code;

-- Expected result: zero rows. Each Mathematics objective code must be unique.
select objective.code as objective_code, count(*)::integer as duplicate_count
from public.learning_objectives objective
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id
where subject.code = 'MATH'
group by objective.code
having count(*) > 1
order by objective.code;

-- Expected result: zero rows. Every active Mathematics objective needs an active Thai curriculum alignment.
select objective.code as objective_code, objective.name as objective_name
from public.learning_objectives objective
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id
where subject.code = 'MATH' and objective.status = 'active'
  and not exists (
    select 1
    from public.learning_objective_alignments alignment
    join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
    join public.learning_education_systems education_system
      on education_system.id = curriculum.education_system_id
    where alignment.objective_id = objective.id
      and curriculum.code = 'TH-MATH-M1-M6'
      and education_system.code = 'TH_BASIC'
  )
order by objective.code;

-- Informational only: content and question drafts are imported by an authorized teacher.
select
  (select count(distinct content_item.id)
   from public.learning_content_items content_item
   join public.learning_content_objectives mapping on mapping.content_item_id=content_item.id
   join public.learning_objectives objective on objective.id=mapping.objective_id
   join public.learning_topics topic on topic.id=objective.topic_id
   join public.learning_skills skill on skill.id=topic.skill_id
   join public.learning_subjects subject on subject.id=skill.subject_id
   where subject.code='MATH') as maths_lesson_drafts,
  (select count(distinct question.id)
   from public.learning_questions question
   join public.learning_question_versions version on version.question_id=question.id
   join public.learning_question_objectives mapping on mapping.question_version_id=version.id
   join public.learning_objectives objective on objective.id=mapping.objective_id
   join public.learning_topics topic on topic.id=objective.topic_id
   join public.learning_skills skill on skill.id=topic.skill_id
   join public.learning_subjects subject on subject.id=skill.subject_id
   where subject.code='MATH') as maths_question_drafts;