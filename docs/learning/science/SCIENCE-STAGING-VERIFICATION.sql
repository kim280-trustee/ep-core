-- Read-only verification for the E&P Learning Science curriculum migrations.
-- Run only AFTER the 45 Science migrations, M2/M3 strand-integrity correction,
-- M3 greenhouse-effect addition and four OBEC priority-classification migrations are applied.
-- This script does not insert, update or delete data.

with expected(subject_code, grade_code, expected_objectives) as (
  values
    ('SCI','M1',43), ('SCI','M2',48), ('SCI','M3',53),
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
-- M1 and M2 are complete. M3 has 44 indicators classified across biology/materials, energy/light and astronomy;
-- the nine M3 W3.2 Earth-system indicators are absent from the OBEC 2021 priority
-- table and are intentionally left unclassified rather than assigned guessed labels.
with expected(grade_code, expected_must, expected_should, expected_not_in_priority_table) as (
  values ('M1',29,14,0), ('M2',37,11,0), ('M3',33,11,9)
), actual as (
  select
    grade.code as grade_code,
    count(*) filter (where alignment.indicator_classification='must_know')::integer as must_know,
    count(*) filter (where alignment.indicator_classification='should_know')::integer as should_know,
    count(*) filter (where alignment.indicator_classification is null)::integer as not_in_priority_table
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
  expected.expected_not_in_priority_table,
  coalesce(actual.not_in_priority_table,0) as actual_not_in_priority_table,
  case when coalesce(actual.must_know,0)=expected.expected_must
      and coalesce(actual.should_know,0)=expected.expected_should
      and coalesce(actual.not_in_priority_table,0)=expected.expected_not_in_priority_table
    then 'PASS' else 'CHECK' end as result
from expected left join actual using (grade_code)
order by expected.grade_code;


-- National Basic Education Core Curriculum Science cross-check.
-- M1-M3 must mirror the complete 144-indicator SCI track exactly. This catches
-- any future omission when an indicator is added to the subject-specific track.
with expected(grade_code,expected_total,expected_must,expected_should,expected_not_in_priority_table) as (
 values ('M1',43,29,14,0),('M2',48,37,11,0),('M3',53,33,11,9)
), actual as (
 select grade.code grade_code,
        count(*)::integer total,
        count(*) filter(where alignment.indicator_classification='must_know')::integer must_know,
        count(*) filter(where alignment.indicator_classification='should_know')::integer should_know,
        count(*) filter(where alignment.indicator_classification is null)::integer not_in_priority_table
 from public.learning_objective_alignments alignment
 join public.learning_curricula curriculum on curriculum.id=alignment.curriculum_id
 join public.learning_grade_levels grade on grade.id=alignment.grade_level_id and grade.curriculum_id=curriculum.id
 join public.learning_objectives objective on objective.id=alignment.objective_id
 join public.learning_topics topic on topic.id=objective.topic_id
 join public.learning_skills skill on skill.id=topic.skill_id
 join public.learning_subjects subject on subject.id=skill.subject_id
 where curriculum.code='TH-BASIC-CORE-2008-2017' and subject.code='SCI'
   and grade.code in ('M1','M2','M3')
 group by grade.code
)
select expected.grade_code,expected.expected_total,coalesce(actual.total,0) actual_total,
       expected.expected_must,coalesce(actual.must_know,0) actual_must,
       expected.expected_should,coalesce(actual.should_know,0) actual_should,
       expected.expected_not_in_priority_table,coalesce(actual.not_in_priority_table,0) actual_not_in_priority_table,
       case when coalesce(actual.total,0)=expected.expected_total
          and coalesce(actual.must_know,0)=expected.expected_must
          and coalesce(actual.should_know,0)=expected.expected_should
          and coalesce(actual.not_in_priority_table,0)=expected.expected_not_in_priority_table
         then 'PASS' else 'CHECK' end result
from expected left join actual using(grade_code)
order by expected.grade_code;

-- Current national-core gap check against OBEC's 2021 Science and Technology
-- grade totals. CHECK is expected until all W1-W4 indicators are seeded.
with expected(grade_code,expected_indicators) as (
 values ('P1',15),('P2',16),('P3',25),('P4',21),('P5',32),('P6',30),
        ('M1',52),('M2',63),('M3',59),('M4',102),('M5',102),('M6',102)
), actual as (
 select g.code grade_code,count(distinct o.id)::integer actual_indicators
 from public.learning_objective_alignments a
 join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills s on s.id=t.skill_id
 join public.learning_subjects sub on sub.id=s.subject_id
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SCI'
 group by g.code
)
select e.grade_code,e.expected_indicators,coalesce(a.actual_indicators,0) actual_indicators,
       case when coalesce(a.actual_indicators,0)=e.expected_indicators then 'PASS' else 'GAP' end result
from expected e left join actual a using(grade_code)
order by case e.grade_code
 when 'P1' then 1 when 'P2' then 2 when 'P3' then 3 when 'P4' then 4
 when 'P5' then 5 when 'P6' then 6 when 'M1' then 7 when 'M2' then 8
 when 'M3' then 9 when 'M4' then 10 when 'M5' then 11 else 12 end;

-- Completed primary W4.2 batch: all 28 indicators should be classified.
with expected(grade_code,total,must_know,should_know) as (
 values ('P1',5,4,1),('P2',4,2,2),('P3',5,4,1),
        ('P4',5,4,1),('P5',5,2,3),('P6',4,2,2)
), actual as (
 select g.code grade_code,count(distinct o.id)::integer total,
        count(*) filter(where a.indicator_classification='must_know')::integer must_know,
        count(*) filter(where a.indicator_classification='should_know')::integer should_know,
        count(*) filter(where a.indicator_classification is null)::integer unclassified
 from public.learning_objective_alignments a
 join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills s on s.id=t.skill_id
 join public.learning_subjects sub on sub.id=s.subject_id
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SCI'
   and o.code like 'P%-S4_2-%'
 group by g.code
)
select e.grade_code,e.total expected_total,coalesce(a.total,0) actual_total,
       e.must_know expected_must,coalesce(a.must_know,0) actual_must,
       e.should_know expected_should,coalesce(a.should_know,0) actual_should,
       coalesce(a.unclassified,0) unclassified,
       case when coalesce(a.total,0)=e.total and coalesce(a.must_know,0)=e.must_know
          and coalesce(a.should_know,0)=e.should_know and coalesce(a.unclassified,0)=0
         then 'PASS' else 'CHECK' end result
from expected e left join actual a using(grade_code)
order by e.grade_code;

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
