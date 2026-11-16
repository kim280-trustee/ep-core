-- E&P Learning: M4-M6 Mathematics core curriculum knowledge graph.
-- Aligned to the grade-level indicators in Thailand's Basic Education Core Curriculum
-- B.E. 2551 (2008), Mathematics indicators revised B.E. 2560 (2017), OBEC.
-- Official reference: https://www.academic.obec.go.th/images/document/1580786277_d_1.pdf
-- Seeds core-curriculum indicators only. Additional/elective upper-secondary mathematics
-- outcomes are not inferred or included by this migration.

begin;

do $$
begin
  if not exists (
    select 1
    from public.learning_subjects s
    join public.learning_curricula c on c.code = 'TH-MATH-M1-M6'
    join public.learning_education_systems es on es.id = c.education_system_id
    join public.learning_grade_levels g on g.curriculum_id = c.id
    where s.code = 'MATH'
      and es.code = 'TH_BASIC'
      and c.status = 'active'
      and g.code in ('M4', 'M5', 'M6')
      and g.status = 'active'
  ) then
    raise exception 'Active Thai Mathematics curriculum with M4, M5 and M6 grades is required before seeding.';
  end if;
end;
$$;

insert into public.learning_topics (skill_id, code, name, description, sequence_no, status)
select
  skill.id, topics.code, topics.name, topics.description, topics.sequence_no, 'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('NUMALG', 'SETS-AND-ELEMENTARY-LOGIC', 'Sets and Elementary Logic', 'Use basic set concepts and elementary logic to communicate and represent mathematical ideas.', 30),
    ('NUMALG', 'REAL-RADICALS-RATIONAL-EXPONENTS', 'Real Numbers, Radicals and Rational Exponents', 'Understand real-number expressions involving radicals and rational exponents and apply their properties.', 31),
    ('NUMALG', 'FUNCTIONS-AND-GRAPHS', 'Functions and Graphs', 'Use functions and their graphs to describe and interpret given situations.', 32),
    ('NUMALG', 'SEQUENCES-AND-SERIES', 'Sequences and Series', 'Understand and apply knowledge of sequences and series to solve problems.', 33),
    ('NUMALG', 'INTEREST-AND-TIME-VALUE', 'Interest and Time Value of Money', 'Apply interest and time-value-of-money concepts to solve practical problems.', 34),
    ('STATPROB', 'COUNTING-PRINCIPLES', 'Counting Principles, Permutations and Combinations', 'Apply addition and multiplication principles, permutations and combinations to solve counting problems.', 30),
    ('STATPROB', 'PROBABILITY-APPLICATIONS', 'Probability and Applications', 'Calculate probabilities and apply probability concepts to solve problems.', 31),
    ('STATPROB', 'STATISTICS-FOR-DECISIONS', 'Statistics for Decision-Making', 'Present data and interpret statistical measures to support informed decisions.', 32)
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
  topic.id, objectives.code, objectives.name, objectives.description, objectives.sequence_no, 'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('SETS-AND-ELEMENTARY-LOGIC', 'M4-K1_1-01', 'Use sets and elementary logic', 'Understand and use basic set concepts and elementary logic to communicate and express mathematical ideas.', 1),
    ('COUNTING-PRINCIPLES', 'M4-K3_2-01', 'Apply counting principles and arrangements', 'Understand and apply addition and multiplication principles, permutations and combinations to solve mathematical problems.', 1),
    ('PROBABILITY-APPLICATIONS', 'M4-K3_2-02', 'Calculate and apply probability', 'Determine probabilities and apply probability knowledge to solve mathematical problems.', 1),
    ('REAL-RADICALS-RATIONAL-EXPONENTS', 'M5-K1_1-01', 'Use real numbers with radicals and rational exponents', 'Understand and apply properties of addition, multiplication, equality and inequality for real numbers expressed with radicals and rational exponents.', 1),
    ('FUNCTIONS-AND-GRAPHS', 'M5-K1_2-01', 'Use functions and graphs to describe situations', 'Use functions and their graphs to explain and represent given situations.', 1),
    ('SEQUENCES-AND-SERIES', 'M5-K1_2-02', 'Apply sequences and series', 'Understand and apply knowledge of sequences and series to solve problems.', 1),
    ('INTEREST-AND-TIME-VALUE', 'M5-K1_3-01', 'Apply interest and time value of money', 'Understand and apply interest and the time value of money to solve problems.', 1),
    ('STATISTICS-FOR-DECISIONS', 'M6-K3_1-01', 'Interpret statistics for decision-making', 'Use statistical knowledge to present data and interpret statistical measures to support decisions.', 1)
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
  objective_id, curriculum_id, grade_level_id, sequence_no, required, notes
)
select
  objective.id,
  curriculum.id,
  grade.id,
  alignment.sequence_no,
  true,
  'Thailand Basic Education Core Curriculum B.E. 2551 (2008), Mathematics indicators revised B.E. 2560 (2017); official indicator ' || alignment.indicator_code || '. Core curriculum indicator only; school pacing and additional-course outcomes are managed separately.'
from public.learning_objectives objective
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id and subject.code = 'MATH'
join (
  values
    ('M4', 'M4-K1_1-01', 1, 'ค 1.1 ม.4/1'),
    ('M4', 'M4-K3_2-01', 2, 'ค 3.2 ม.4/1'),
    ('M4', 'M4-K3_2-02', 3, 'ค 3.2 ม.4/2'),
    ('M5', 'M5-K1_1-01', 1, 'ค 1.1 ม.5/1'),
    ('M5', 'M5-K1_2-01', 2, 'ค 1.2 ม.5/1'),
    ('M5', 'M5-K1_2-02', 3, 'ค 1.2 ม.5/2'),
    ('M5', 'M5-K1_3-01', 4, 'ค 1.3 ม.5/1'),
    ('M6', 'M6-K3_1-01', 1, 'ค 3.1 ม.6/1')
) as alignment(grade_code, objective_code, sequence_no, indicator_code)
  on alignment.objective_code = objective.code
join public.learning_curricula curriculum on curriculum.code = 'TH-MATH-M1-M6'
join public.learning_education_systems es on es.id = curriculum.education_system_id and es.code = 'TH_BASIC'
join public.learning_grade_levels grade
  on grade.curriculum_id = curriculum.id
 and grade.code = alignment.grade_code
where objective.status = 'active'
on conflict (objective_id, curriculum_id, grade_level_id) do update
set
  sequence_no = excluded.sequence_no,
  required = excluded.required,
  notes = excluded.notes,
  updated_at = now();

commit;
