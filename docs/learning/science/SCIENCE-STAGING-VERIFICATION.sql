-- Read-only verification for the E&P Learning Science curriculum migrations.
-- Run only AFTER the 45 Science migrations and M2/M3 strand-integrity correction are applied.
-- This script does not insert, update or delete data.

with expected(subject_code, grade_code, expected_objectives) as (
  values
    ('SCI','M1',43), ('SCI','M2',48), ('SCI','M3',51),
    ('BIOLOGY','M4',32), ('BIOLOGY','M5',39), ('BIOLOGY','M6',37),
    ('CHEMISTRY','M4',28), ('CHEMISTRY','M5',38), ('CHEMISTRY','M6',15),
    ('PHYSICS','M4',17), ('PHYSICS','M5',26), ('PHYSICS','M6',24),
    ('EARTH_SPACE','M4',12), ('EARTH_SPACE','M5',13), ('EARTH_SPACE','M6',19)
),
actual as (
  select
    subject.code as subject_code,
    grade.code as grade_code,
    count(distinct objective.id)::integer as actual_objectives
  from public.learning_objectives objective
  join public.learning_topics topic on topic.id = objective.topic_id
  join public.learning_skills skill on skill.id = topic.skill_id
  join public.learning_subjects subject on subject.id = skill.subject_id
  join public.learning_objective_alignments alignment on alignment.objective_id = objective.id
  join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
  join public.learning_grade_levels grade
    on grade.id = alignment.grade_level_id
   and grade.curriculum_id = alignment.curriculum_id
  join public.learning_education_systems education_system
    on education_system.id = curriculum.education_system_id
  where curriculum.code = 'TH-SCI-M1-M6'
    and education_system.code = 'TH_BASIC'
    and subject.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
  group by subject.code, grade.code
)
select
  expected.subject_code,
  expected.grade_code,
  expected.expected_objectives,
  coalesce(actual.actual_objectives, 0) as actual_objectives,
  case when coalesce(actual.actual_objectives, 0) = expected.expected_objectives
    then 'PASS' else 'CHECK' end as result
from expected
left join actual using (subject_code, grade_code)
order by
  case expected.subject_code
    when 'SCI' then 1 when 'BIOLOGY' then 2 when 'CHEMISTRY' then 3
    when 'PHYSICS' then 4 else 5 end,
  expected.grade_code;


-- OBEC 2021 priority-classification coverage for lower-secondary core Science.
-- M1 and M2 are complete. M3 currently has its biology/materials and energy/light subsets classified;
-- the remaining M3 energy and Earth-space indicators are intentionally reported
-- as pending rather than assigned a guessed priority.
with expected(grade_code, expected_must, expected_should, expected_pending) as (
  values ('M1',29,14,0), ('M2',37,11,0), ('M3',30,10,11)
), actual as (
  select
    grade.code as grade_code,
    count(*) filter (where alignment.indicator_classification='must_know')::integer as must_know,
    count(*) filter (where alignment.indicator_classification='should_know')::integer as should_know,
    count(*) filter (where alignment.indicator_classification is null)::integer as pending
  from public.learning_objective_alignments alignment
  join public.learning_curricula curriculum on curriculum.id=alignment.curriculum_id
  join public.learning_grade_levels grade
    on grade.id=alignment.grade_level_id and grade.curriculum_id=alignment.curriculum_id
  join public.learning_objectives objective on objective.id=alignment.objective_id
  join public.learning_topics topic on topic.id=objective.topic_id
  join public.learning_skills skill on skill.id=topic.skill_id
  join public.learning_subjects subject on subject.id=skill.subject_id
  where curriculum.code='TH-SCI-M1-M6' and subject.code='SCI'
    and grade.code in ('M1','M2','M3')
  group by grade.code
)
select
  expected.grade_code,
  expected.expected_must,
  coalesce(actual.must_know,0) as actual_must,
  expected.expected_should,
  coalesce(actual.should_know,0) as actual_should,
  expected.expected_pending,
  coalesce(actual.pending,0) as actual_pending,
  case when coalesce(actual.must_know,0)=expected.expected_must
      and coalesce(actual.should_know,0)=expected.expected_should
      and coalesce(actual.pending,0)=expected.expected_pending
    then 'PASS' else 'CHECK' end as result
from expected left join actual using (grade_code)
order by expected.grade_code;

-- Report any active objective in the five Science tracks with no Thai Science
-- curriculum/grade alignment. Expected result: zero rows.
select
  subject.code as subject_code,
  objective.code as objective_code,
  objective.name as objective_name
from public.learning_objectives objective
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id
where subject.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
  and objective.status = 'active'
  and not exists (
    select 1
    from public.learning_objective_alignments alignment
    join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
    join public.learning_education_systems education_system
      on education_system.id = curriculum.education_system_id
    where alignment.objective_id = objective.id
      and curriculum.code = 'TH-SCI-M1-M6'
      and education_system.code = 'TH_BASIC'
  )
order by subject.code, objective.code;

-- Report subject tracks missing an active curriculum-subject link.
-- Expected result: zero rows.
select subject.code as subject_code
from public.learning_subjects subject
where subject.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
  and not exists (
    select 1
    from public.learning_curriculum_subjects curriculum_subject
    join public.learning_curricula curriculum
      on curriculum.id = curriculum_subject.curriculum_id
    join public.learning_education_systems education_system
      on education_system.id = curriculum.education_system_id
    where curriculum.code = 'TH-SCI-M1-M6'
      and education_system.code = 'TH_BASIC'
      and curriculum.status = 'active'
      and curriculum_subject.subject_id = subject.id
      and curriculum_subject.status = 'active'
  )
order by subject.code;

-- Report duplicate objective codes inside a Science subject.
-- Expected result: zero rows. This catches objectives duplicated across skill
-- strands when a topic insert is not correctly scoped to its declared skill.
select
  subject.code as subject_code,
  objective.code as objective_code,
  count(distinct skill.id)::integer as skill_count,
  array_agg(distinct skill.code order by skill.code) as skill_codes
from public.learning_objectives objective
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id
where subject.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
group by subject.code, objective.code
having count(distinct skill.id) > 1
order by subject.code, objective.code;

-- Content and question records are intentionally not seeded by the curriculum
-- migrations. These counts are informational and can be non-zero if teachers
-- have already authored Science resources in this staging environment.
select
  subject.code as subject_code,
  count(distinct content_item.id)::integer as authored_content_items,
  count(distinct question.id)::integer as authored_questions
from public.learning_subjects subject
left join public.learning_skills skill on skill.subject_id = subject.id
left join public.learning_topics topic on topic.skill_id = skill.id
left join public.learning_objectives objective on objective.topic_id = topic.id
left join public.learning_content_objectives content_mapping
  on content_mapping.objective_id = objective.id
left join public.learning_content_items content_item
  on content_item.id = content_mapping.content_item_id
left join public.learning_question_objectives question_mapping
  on question_mapping.objective_id = objective.id
left join public.learning_question_versions question_version
  on question_version.id = question_mapping.question_version_id
left join public.learning_questions question
  on question.id = question_version.question_id
where subject.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
group by subject.code
order by subject.code;
