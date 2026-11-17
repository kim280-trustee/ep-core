-- Read-only checks for the Thai Technology M1-M6 catalogue.
-- Run only after applying 20261117100000 and 20261117101500 migrations to staging.

-- 1. Catalogue, skill, topic, objective and alignment totals.
select
  curriculum.code as curriculum_code,
  subject.code as subject_code,
  count(distinct grade.id) as grade_levels,
  count(distinct skill.id) as skills,
  count(distinct topic.id) as topics,
  count(distinct objective.id) as objectives,
  count(distinct alignment.id) as objective_alignments
from public.learning_curricula curriculum
join public.learning_education_systems education_system
  on education_system.id = curriculum.education_system_id
join public.learning_curriculum_subjects curriculum_subject
  on curriculum_subject.curriculum_id = curriculum.id
join public.learning_subjects subject
  on subject.id = curriculum_subject.subject_id
left join public.learning_grade_levels grade
  on grade.curriculum_id = curriculum.id
left join public.learning_skills skill
  on skill.subject_id = subject.id
left join public.learning_topics topic
  on topic.skill_id = skill.id
left join public.learning_objectives objective
  on objective.topic_id = topic.id
left join public.learning_objective_alignments alignment
  on alignment.objective_id = objective.id
 and alignment.curriculum_id = curriculum.id
 and alignment.grade_level_id = grade.id
where education_system.code = 'TH_BASIC'
  and curriculum.code = 'TH-TECH-M1-M6'
  and subject.code = 'TECH'
group by curriculum.code, subject.code;

-- 2. Grade and standard coverage. Expected:
-- M1 9 (5 D&T + 4 CS); M2 9; M3 9; M4 6; M5 2; M6 1.
select
  grade.code as grade,
  count(distinct alignment.objective_id) as total_indicators,
  count(distinct alignment.objective_id) filter (
    where alignment.notes like '%indicator ว 4.1%'
  ) as design_and_technology,
  count(distinct alignment.objective_id) filter (
    where alignment.notes like '%indicator ว 4.2%'
  ) as computing_science
from public.learning_objective_alignments alignment
join public.learning_curricula curriculum
  on curriculum.id = alignment.curriculum_id
join public.learning_education_systems education_system
  on education_system.id = curriculum.education_system_id
join public.learning_grade_levels grade
  on grade.id = alignment.grade_level_id
where education_system.code = 'TH_BASIC'
  and curriculum.code = 'TH-TECH-M1-M6'
group by grade.code, grade.sequence_no
order by grade.sequence_no;

-- 3. List any active Technology objectives that have no alignment in this curriculum.
select objective.code, objective.name
from public.learning_objectives objective
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id
join public.learning_curricula curriculum on curriculum.code = 'TH-TECH-M1-M6'
where subject.code = 'TECH'
  and objective.status = 'active'
  and not exists (
    select 1
    from public.learning_objective_alignments alignment
    where alignment.objective_id = objective.id
      and alignment.curriculum_id = curriculum.id
  )
order by objective.code;

-- 4. Check that W 4.1 has no M6 allocation and W 4.2 has exactly one M4, M5 and M6 allocation.
select
  grade.code as grade,
  count(*) filter (where alignment.notes like '%indicator ว 4.1%') as w41_count,
  count(*) filter (where alignment.notes like '%indicator ว 4.2%') as w42_count
from public.learning_objective_alignments alignment
join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
join public.learning_grade_levels grade on grade.id = alignment.grade_level_id
where curriculum.code = 'TH-TECH-M1-M6'
  and grade.code in ('M4', 'M5', 'M6')
group by grade.code, grade.sequence_no
order by grade.sequence_no;
