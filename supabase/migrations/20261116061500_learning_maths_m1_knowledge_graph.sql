-- E&P Learning: starter M1 Mathematics knowledge graph.
-- Aligned to Thailand's Basic Education Core Curriculum B.E. 2551 (2008),
-- Mathematics indicators revised in B.E. 2560 (2017), as published by OBEC.
-- Source: https://academic.obec.go.th/web/images/document/1580786277_d_1.pdf
-- This seeds global curriculum knowledge only; it does not create school classes,
-- academic years, teacher memberships, content, assessments, or student records.

begin;

do $$
begin
  if not exists (
    select 1
    from public.learning_subjects s
    join public.learning_curricula c on c.code = 'TH-MATH-M1-M6'
    join public.learning_education_systems es on es.id = c.education_system_id
    join public.learning_grade_levels g on g.curriculum_id = c.id and g.code = 'M1'
    where s.code = 'MATH'
      and es.code = 'TH_BASIC'
      and s.status = 'active'
      and c.status = 'active'
      and g.status = 'active'
  ) then
    raise exception 'Active MATH subject, TH-MATH-M1-M6 curriculum and M1 grade are required before seeding M1 Mathematics objectives.';
  end if;
end;
$$;

insert into public.learning_skills (subject_id, code, name, description, status)
select
  subject.id,
  skills.code,
  skills.name,
  skills.description,
  'active'
from public.learning_subjects subject
cross join (
  values
    ('NUMALG', 'Number and Algebra', 'Thai Mathematics learning area strand 1: number systems, operations, patterns, expressions and algebraic relationships.'),
    ('MEASGEO', 'Measurement and Geometry', 'Thai Mathematics learning area strand 2: measurement, geometric figures, construction and spatial relationships.'),
    ('STATPROB', 'Statistics and Probability', 'Thai Mathematics learning area strand 3: statistical processes, data interpretation and probability.')
) as skills(code, name, description)
where subject.code = 'MATH'
on conflict (subject_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  status = 'active',
  updated_at = now();

insert into public.learning_topics (skill_id, code, name, description, sequence_no, status)
select
  skill.id,
  topics.code,
  topics.name,
  topics.description,
  topics.sequence_no,
  'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('NUMALG', 'RATIONAL-NUMBERS', 'Rational Numbers', 'Understand rational numbers, their relationships and properties, and use them in mathematical and real-life problem-solving.', 1),
    ('NUMALG', 'POSITIVE-INTEGER-EXPONENTS', 'Positive Integer Exponents', 'Understand and apply properties of exponents with positive integer exponents in mathematical and real-life problem-solving.', 2),
    ('NUMALG', 'RATIO-PROPORTION-PERCENTAGE', 'Ratio, Proportion and Percentage', 'Apply ratio, proportion and percentage to mathematical problems and real-life situations.', 3),
    ('NUMALG', 'LINEAR-EQUATIONS-RELATIONS', 'Linear Equations and Relationships', 'Use one-variable linear equations, graphs and linear relationships to analyse and solve problems.', 4),
    ('MEASGEO', 'GEOMETRIC-CONSTRUCTION', 'Geometric Construction', 'Construct geometric figures using geometric tools or dynamic geometry software and apply constructions to real-life problems.', 1),
    ('MEASGEO', 'TWO-D-THREE-D-RELATIONSHIPS', 'Two-Dimensional and Three-Dimensional Relationships', 'Analyse relationships between two-dimensional and three-dimensional geometric figures.', 2),
    ('STATPROB', 'STATISTICAL-DATA', 'Statistical Data Presentation and Interpretation', 'Present and interpret statistical data and apply statistical knowledge in real-life situations using suitable technology.', 1)
) as topics(skill_code, code, name, description, sequence_no)
  on skill.code = topics.skill_code
where subject.code = 'MATH'
on conflict (skill_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  sequence_no = excluded.sequence_no,
  status = 'active',
  updated_at = now();

insert into public.learning_objectives (topic_id, code, name, description, sequence_no, status)
select
  topic.id,
  objectives.code,
  objectives.name,
  objectives.description,
  objectives.sequence_no,
  'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('RATIONAL-NUMBERS', 'M1-K1_1-01', 'Use rational numbers to solve problems', 'Understand rational numbers and their relationships, and use their properties to solve mathematical and real-life problems.', 1),
    ('POSITIVE-INTEGER-EXPONENTS', 'M1-K1_1-02', 'Apply positive integer exponent properties', 'Understand and apply properties of exponents with positive integer exponents to solve mathematical and real-life problems.', 1),
    ('RATIO-PROPORTION-PERCENTAGE', 'M1-K1_1-03', 'Apply ratios, proportions and percentages', 'Understand and apply ratio, proportion and percentage to solve mathematical and real-life problems.', 1),
    ('LINEAR-EQUATIONS-RELATIONS', 'M1-K1_3-01', 'Solve one-variable linear equations', 'Use equality properties and number properties to analyse and solve problems using linear equations in one variable.', 1),
    ('LINEAR-EQUATIONS-RELATIONS', 'M1-K1_3-02', 'Use graphs to solve problems', 'Understand and use graphs to solve mathematical problems and problems in real-life situations.', 2),
    ('LINEAR-EQUATIONS-RELATIONS', 'M1-K1_3-03', 'Use linear relationships to solve problems', 'Understand and use linear relationships to solve mathematical problems and problems in real-life situations.', 3),
    ('GEOMETRIC-CONSTRUCTION', 'M1-K2_2-01', 'Construct geometric figures', 'Use geometric knowledge and tools, including compass and straightedge or dynamic geometry software, to construct figures and apply constructions to real-life problems.', 1),
    ('TWO-D-THREE-D-RELATIONSHIPS', 'M1-K2_2-02', 'Analyse two-dimensional and three-dimensional figures', 'Understand and use geometric knowledge to analyse relationships between two-dimensional and three-dimensional figures.', 1),
    ('STATISTICAL-DATA', 'M1-K3_1-01', 'Present and interpret statistical data', 'Use statistical knowledge to present data, interpret information and apply statistics in real-life situations with suitable technology.', 1)
) as objectives(topic_code, code, name, description, sequence_no)
  on true
join public.learning_topics topic
  on topic.skill_id = skill.id
 and topic.code = objectives.topic_code
where subject.code = 'MATH'
on conflict (topic_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  sequence_no = excluded.sequence_no,
  status = 'active',
  updated_at = now();

insert into public.learning_objective_alignments (
  objective_id,
  curriculum_id,
  grade_level_id,
  sequence_no,
  required,
  notes
)
select
  objective.id,
  curriculum.id,
  grade.id,
  alignment.sequence_no,
  true,
  'Thailand Basic Education Core Curriculum B.E. 2551 (2008), Mathematics indicators revised B.E. 2560 (2017); indicator ' || alignment.indicator_code || '.'
from public.learning_objectives objective
join public.learning_topics objective_topic
  on objective_topic.id = objective.topic_id
join public.learning_skills objective_skill
  on objective_skill.id = objective_topic.skill_id
join public.learning_subjects objective_subject
  on objective_subject.id = objective_skill.subject_id
 and objective_subject.code = 'MATH'
join (
  values
    ('M1-K1_1-01', 1, 'ค 1.1 ม.1/1'),
    ('M1-K1_1-02', 2, 'ค 1.1 ม.1/2'),
    ('M1-K1_1-03', 3, 'ค 1.1 ม.1/3'),
    ('M1-K1_3-01', 4, 'ค 1.3 ม.1/1'),
    ('M1-K1_3-02', 5, 'ค 1.3 ม.1/2'),
    ('M1-K1_3-03', 6, 'ค 1.3 ม.1/3'),
    ('M1-K2_2-01', 7, 'ค 2.2 ม.1/1'),
    ('M1-K2_2-02', 8, 'ค 2.2 ม.1/2'),
    ('M1-K3_1-01', 9, 'ค 3.1 ม.1/1')
) as alignment(objective_code, sequence_no, indicator_code)
  on alignment.objective_code = objective.code
join public.learning_curricula curriculum
  on curriculum.code = 'TH-MATH-M1-M6'
join public.learning_education_systems es
  on es.id = curriculum.education_system_id
 and es.code = 'TH_BASIC'
join public.learning_grade_levels grade
  on grade.curriculum_id = curriculum.id
 and grade.code = 'M1'
where objective.status = 'active'
on conflict (objective_id, curriculum_id, grade_level_id) do update
set
  sequence_no = excluded.sequence_no,
  required = excluded.required,
  notes = excluded.notes,
  updated_at = now();

commit;
