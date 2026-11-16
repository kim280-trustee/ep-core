-- E&P Learning: M2 and M3 Mathematics knowledge graph.
-- Aligned to Thailand's Basic Education Core Curriculum B.E. 2551 (2008),
-- Mathematics indicators revised B.E. 2560 (2017), Ministry of Education / OBEC.
-- Official reference: https://www.academic.obec.go.th/images/document/1580786277_d_1.pdf
-- This seeds curriculum knowledge only; no school, class, teacher, content or student records.

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
      and g.code in ('M2', 'M3')
      and g.status = 'active'
      and (
        select count(*)
        from public.learning_skills required_skill
        where required_skill.subject_id = s.id
          and required_skill.status = 'active'
          and required_skill.code in ('NUMALG', 'MEASGEO', 'STATPROB')
      ) = 3
    group by s.id, c.id
    having count(distinct g.code) = 2
  ) then
    raise exception 'Active Thai Mathematics curriculum with M2 and M3 grades is required before seeding.';
  end if;
end;
$$;

-- Reuse the three subject strands created by the M1 seed.
insert into public.learning_topics (skill_id, code, name, description, sequence_no, status)
select
  skill.id, topics.code, topics.name, topics.description, topics.sequence_no, 'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('NUMALG', 'INTEGER-EXPONENTS', 'Integer Exponents', 'Apply exponent laws for integer exponents, including zero and negative exponents, in mathematical and real-life problems.', 10),
    ('NUMALG', 'REAL-NUMBERS', 'Real Numbers and Radicals', 'Understand rational and irrational numbers, square roots and cube roots, and use real-number properties to solve problems.', 11),
    ('NUMALG', 'POLYNOMIAL-OPERATIONS', 'Polynomial Operations', 'Understand polynomials and perform addition, subtraction, multiplication and division by a monomial.', 12),
    ('NUMALG', 'QUADRATIC-FACTORIZATION', 'Factorization of Quadratic Polynomials', 'Factor quadratic polynomials using common factors, perfect-square trinomials and difference of squares.', 13),
    ('NUMALG', 'HIGHER-DEGREE-FACTORIZATION', 'Higher-Degree Polynomial Factorization', 'Factor polynomials of degree greater than two, including sums and differences of cubes where appropriate.', 14),
    ('NUMALG', 'QUADRATIC-FUNCTIONS', 'Quadratic Functions', 'Represent, graph and interpret quadratic functions to solve mathematical problems.', 15),
    ('NUMALG', 'LINEAR-INEQUALITIES', 'One-Variable Linear Inequalities', 'Use properties of inequalities to analyse and solve one-variable linear inequalities and related problems.', 16),
    ('NUMALG', 'QUADRATIC-EQUATIONS', 'One-Variable Quadratic Equations', 'Solve one-variable quadratic equations and apply them to mathematical problems.', 17),
    ('NUMALG', 'SYSTEMS-LINEAR-EQUATIONS', 'Systems of Two Linear Equations', 'Represent and solve problems using systems of two linear equations in two variables.', 18),
    ('MEASGEO', 'PRISM-CYLINDER-SURFACE-AREA', 'Surface Area of Prisms and Cylinders', 'Apply surface-area knowledge of prisms and cylinders to mathematical and real-life problems.', 10),
    ('MEASGEO', 'PRISM-CYLINDER-VOLUME', 'Volume of Prisms and Cylinders', 'Apply volume knowledge of prisms and cylinders to mathematical and real-life problems.', 11),
    ('MEASGEO', 'GEOMETRIC-CONSTRUCTIONS-M2', 'Geometric Constructions', 'Use geometric tools and dynamic geometry software to construct figures and solve real-life problems.', 12),
    ('MEASGEO', 'PARALLEL-LINES-TRIANGLES', 'Parallel Lines and Triangles', 'Apply properties of parallel lines and triangles to solve mathematical problems.', 13),
    ('MEASGEO', 'GEOMETRIC-TRANSFORMATIONS', 'Geometric Transformations', 'Use translations, reflections and rotations to solve geometric problems.', 14),
    ('MEASGEO', 'CONGRUENT-TRIANGLES', 'Congruent Triangles', 'Apply properties of congruent triangles to solve mathematical and real-life problems.', 15),
    ('MEASGEO', 'PYTHAGOREAN-THEOREM', 'Pythagorean Theorem', 'Apply the Pythagorean theorem and its converse to solve problems.', 16),
    ('MEASGEO', 'PYRAMID-CONE-SPHERE-SURFACE-AREA', 'Surface Area of Pyramids, Cones and Spheres', 'Apply surface-area knowledge of pyramids, cones and spheres to solve problems.', 17),
    ('MEASGEO', 'PYRAMID-CONE-SPHERE-VOLUME', 'Volume of Pyramids, Cones and Spheres', 'Apply volume knowledge of pyramids, cones and spheres to solve problems.', 18),
    ('MEASGEO', 'SIMILAR-TRIANGLES', 'Similar Triangles', 'Apply properties of similar triangles and proportional sides to solve problems.', 19),
    ('MEASGEO', 'TRIGONOMETRIC-RATIOS', 'Trigonometric Ratios', 'Use trigonometric ratios of acute angles to solve mathematical and real-life problems.', 20),
    ('MEASGEO', 'CIRCLE-THEOREMS', 'Circle Theorems', 'Understand and apply circle theorems to solve mathematical problems.', 21),
    ('STATPROB', 'STATISTICAL-DATA-M2', 'Statistical Data and Measures of Centre', 'Present and analyse data using dot plots, stem-and-leaf plots, histograms and measures of central tendency.', 10),
    ('STATPROB', 'BOX-PLOTS', 'Box Plots and Data Analysis', 'Present and analyse data using box plots, interpret results and use statistics in real-life contexts.', 11),
    ('STATPROB', 'PROBABILITY-EXPERIMENTS', 'Random Experiments and Probability', 'Understand random experiments and use outcomes to determine event probabilities.', 12)
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
    ('INTEGER-EXPONENTS', 'M2-K1_1-01', 'Apply integer exponent properties', 'Understand and apply properties of powers with integer exponents to solve mathematical and real-life problems.', 1),
    ('REAL-NUMBERS', 'M2-K1_1-02', 'Understand and use real numbers', 'Understand real numbers and their relationships, including irrational numbers and square and cube roots, and use their properties to solve problems.', 1),
    ('POLYNOMIAL-OPERATIONS', 'M2-K1_2-01', 'Perform operations on polynomials', 'Understand polynomial operations and use addition, subtraction, multiplication and division by a monomial to solve mathematical problems.', 1),
    ('QUADRATIC-FACTORIZATION', 'M2-K1_2-02', 'Factor quadratic polynomials', 'Understand and apply factorization of quadratic polynomials using common factors, perfect squares and difference of squares.', 1),
    ('PRISM-CYLINDER-SURFACE-AREA', 'M2-K2_1-01', 'Solve surface-area problems for prisms and cylinders', 'Apply surface-area formulas for prisms and cylinders to solve mathematical and real-life problems.', 1),
    ('PRISM-CYLINDER-VOLUME', 'M2-K2_1-02', 'Solve volume problems for prisms and cylinders', 'Apply volume formulas for prisms and cylinders to solve mathematical and real-life problems.', 1),
    ('GEOMETRIC-CONSTRUCTIONS-M2', 'M2-K2_2-01', 'Construct geometric figures', 'Use geometric knowledge and tools, including compass and straightedge or dynamic geometry software, to construct figures and solve real-life problems.', 1),
    ('PARALLEL-LINES-TRIANGLES', 'M2-K2_2-02', 'Apply parallel-line and triangle properties', 'Use properties of parallel lines and triangles to solve mathematical problems.', 1),
    ('GEOMETRIC-TRANSFORMATIONS', 'M2-K2_2-03', 'Apply geometric transformations', 'Understand and use geometric transformations to solve mathematical problems.', 1),
    ('CONGRUENT-TRIANGLES', 'M2-K2_2-04', 'Apply congruent-triangle properties', 'Understand and use properties of congruent triangles to solve mathematical and real-life problems.', 1),
    ('PYTHAGOREAN-THEOREM', 'M2-K2_2-05', 'Apply the Pythagorean theorem', 'Understand and apply the Pythagorean theorem and its converse to solve mathematical and real-life problems.', 1),
    ('STATISTICAL-DATA-M2', 'M2-K3_1-01', 'Present and analyse statistical data', 'Use dot plots, stem-and-leaf plots, histograms and measures of central tendency to present, analyse and interpret data, including with suitable technology.', 1),

    ('HIGHER-DEGREE-FACTORIZATION', 'M3-K1_2-01', 'Factor higher-degree polynomials', 'Understand and apply factorization of polynomials of degree greater than two to solve mathematical problems.', 1),
    ('QUADRATIC-FUNCTIONS', 'M3-K1_2-02', 'Use quadratic functions', 'Understand and apply knowledge of quadratic functions to solve mathematical problems.', 1),
    ('LINEAR-INEQUALITIES', 'M3-K1_3-01', 'Solve one-variable linear inequalities', 'Understand and use properties of inequalities to analyse and solve problems using one-variable linear inequalities.', 1),
    ('QUADRATIC-EQUATIONS', 'M3-K1_3-02', 'Solve one-variable quadratic equations', 'Apply one-variable quadratic equations to solve mathematical problems.', 1),
    ('SYSTEMS-LINEAR-EQUATIONS', 'M3-K1_3-03', 'Solve systems of two linear equations', 'Apply systems of two linear equations in two variables to solve mathematical problems.', 1),
    ('PYRAMID-CONE-SPHERE-SURFACE-AREA', 'M3-K2_1-01', 'Solve surface-area problems for pyramids, cones and spheres', 'Apply surface-area knowledge of pyramids, cones and spheres to solve mathematical and real-life problems.', 1),
    ('PYRAMID-CONE-SPHERE-VOLUME', 'M3-K2_1-02', 'Solve volume problems for pyramids, cones and spheres', 'Apply volume knowledge of pyramids, cones and spheres to solve mathematical and real-life problems.', 1),
    ('SIMILAR-TRIANGLES', 'M3-K2_2-01', 'Apply properties of similar triangles', 'Understand and use properties of similar triangles to solve mathematical and real-life problems.', 1),
    ('TRIGONOMETRIC-RATIOS', 'M3-K2_2-02', 'Apply trigonometric ratios', 'Understand and use trigonometric ratios to solve mathematical and real-life problems.', 1),
    ('CIRCLE-THEOREMS', 'M3-K2_2-03', 'Apply circle theorems', 'Understand and use circle theorems to solve mathematical problems.', 1),
    ('BOX-PLOTS', 'M3-K3_1-01', 'Present and analyse data using box plots', 'Use box plots to present and analyse data, interpret results and apply statistics in real-life situations using suitable technology.', 1),
    ('PROBABILITY-EXPERIMENTS', 'M3-K3_2-01', 'Determine probabilities from random experiments', 'Understand random experiments and use their outcomes to determine the probability of events.', 1)
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
  'Thailand Basic Education Core Curriculum B.E. 2551 (2008), Mathematics indicators revised B.E. 2560 (2017); official indicator ' || alignment.indicator_code || '.'
from public.learning_objectives objective
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id and subject.code = 'MATH'
join (
  values
    ('M2', 'M2-K1_1-01', 1, 'ค 1.1 ม.2/1'),
    ('M2', 'M2-K1_1-02', 2, 'ค 1.1 ม.2/2'),
    ('M2', 'M2-K1_2-01', 3, 'ค 1.2 ม.2/1'),
    ('M2', 'M2-K1_2-02', 4, 'ค 1.2 ม.2/2'),
    ('M2', 'M2-K2_1-01', 5, 'ค 2.1 ม.2/1'),
    ('M2', 'M2-K2_1-02', 6, 'ค 2.1 ม.2/2'),
    ('M2', 'M2-K2_2-01', 7, 'ค 2.2 ม.2/1'),
    ('M2', 'M2-K2_2-02', 8, 'ค 2.2 ม.2/2'),
    ('M2', 'M2-K2_2-03', 9, 'ค 2.2 ม.2/3'),
    ('M2', 'M2-K2_2-04', 10, 'ค 2.2 ม.2/4'),
    ('M2', 'M2-K2_2-05', 11, 'ค 2.2 ม.2/5'),
    ('M2', 'M2-K3_1-01', 12, 'ค 3.1 ม.2/1'),
    ('M3', 'M3-K1_2-01', 1, 'ค 1.2 ม.3/1'),
    ('M3', 'M3-K1_2-02', 2, 'ค 1.2 ม.3/2'),
    ('M3', 'M3-K1_3-01', 3, 'ค 1.3 ม.3/1'),
    ('M3', 'M3-K1_3-02', 4, 'ค 1.3 ม.3/2'),
    ('M3', 'M3-K1_3-03', 5, 'ค 1.3 ม.3/3'),
    ('M3', 'M3-K2_1-01', 6, 'ค 2.1 ม.3/1'),
    ('M3', 'M3-K2_1-02', 7, 'ค 2.1 ม.3/2'),
    ('M3', 'M3-K2_2-01', 8, 'ค 2.2 ม.3/1'),
    ('M3', 'M3-K2_2-02', 9, 'ค 2.2 ม.3/2'),
    ('M3', 'M3-K2_2-03', 10, 'ค 2.2 ม.3/3'),
    ('M3', 'M3-K3_1-01', 11, 'ค 3.1 ม.3/1'),
    ('M3', 'M3-K3_2-01', 12, 'ค 3.2 ม.3/1')
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
