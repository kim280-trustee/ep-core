-- E&P Learning: Thai Technology knowledge graph for M1-M6.
-- Official scope: Design & Technology ว 4.1 (21 indicators) and Computing Science ว 4.2 (15 indicators).
-- Grade allocations are taken from OBEC 2017 revised indicators, pp. 82-87, and IPST course guidance.
-- No school, class, learner, teacher-content or assessment records are created.

begin;

do $$
begin
  if not exists (
    select 1
    from public.learning_subjects s
    join public.learning_curricula c on c.code = 'TH-TECH-M1-M6'
    join public.learning_education_systems es on es.id = c.education_system_id
    join public.learning_grade_levels g on g.curriculum_id = c.id and g.code = 'M1'
    where s.code = 'TECH' and es.code = 'TH_BASIC'
      and s.status = 'active' and c.status = 'active' and g.status = 'active'
  ) then
    raise exception 'Active TECH subject, TH-TECH-M1-M6 curriculum and M1 grade are required before seeding Technology objectives.';
  end if;
end;
$$;

insert into public.learning_skills (subject_id, code, name, description, status)
select subject.id, skills.code, skills.name, skills.description, 'active'
from public.learning_subjects subject
cross join (
  values
    ('DESIGN', 'Design & Technology', 'Technology concepts, engineering design, problem solving, materials, tools, mechanisms, electrical systems and responsible technology development.'),
    ('COMPUTING', 'Computing Science', 'Computational thinking, algorithms, programming, computer systems, data, digital media, information technology, ethics and law.')
) as skills(code, name, description)
where subject.code = 'TECH'
on conflict (subject_id, code) do update
set name = excluded.name,
    description = excluded.description,
    status = 'active',
    updated_at = now();

insert into public.learning_topics (skill_id, code, name, description, sequence_no, status)
select skill.id, topics.code, topics.name, topics.description, topics.sequence_no, 'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('DESIGN', 'DT-M1', 'Design & Technology — M1', 'Technology concepts, everyday needs, design, testing and safe use of materials and tools.', 1),
    ('DESIGN', 'DT-M2', 'Design & Technology — M2', 'Technology forecasting, community problem definition, constrained design and safe tool use.', 2),
    ('DESIGN', 'DT-M3', 'Design & Technology — M3', 'Technology change, local problem solving, intellectual property and advanced safe making.', 3),
    ('DESIGN', 'DT-M4', 'Design & Technology — M4', 'Complex technology analysis, societal impacts, software-supported design and advanced making.', 4),
    ('DESIGN', 'DT-M5', 'Design & Technology — M5', 'Interdisciplinary project work using knowledge, skills and resources.', 5),
    ('COMPUTING', 'CS-M1', 'Computing Science — M1', 'Abstraction, algorithms, introductory programming, primary data and safe digital practice.', 1),
    ('COMPUTING', 'CS-M2', 'Computing Science — M2', 'Computational thinking, logic, functions, computer systems, communication and responsible publishing.', 2),
    ('COMPUTING', 'CS-M3', 'Computing Science — M3', 'Application development, data workflows, media literacy, misinformation and computer law.', 3),
    ('COMPUTING', 'CS-M4', 'Computing Science — M4', 'Computational thinking applied to integrated real-life projects.', 4),
    ('COMPUTING', 'CS-M5', 'Computing Science — M5', 'Data science and using digital technologies to solve problems and create value.', 5),
    ('COMPUTING', 'CS-M6', 'Computing Science — M6', 'Ethical information sharing and analysis of technology''s impact on life and society.', 6)
) as topics(skill_code, code, name, description, sequence_no)
  on topics.skill_code = skill.code
where subject.code = 'TECH'
on conflict (skill_id, code) do update
set name = excluded.name,
    description = excluded.description,
    sequence_no = excluded.sequence_no,
    status = 'active',
    updated_at = now();

insert into public.learning_objectives (topic_id, code, name, description, sequence_no, status)
select topic.id, objectives.code, objectives.name, objectives.description, objectives.sequence_no, 'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('DT-M1', 'M1-W4_1-01', 'Explain technology concepts and factors that change technology', 'Explain the main concepts of technology in everyday life and analyse causes or factors that influence technological change.', 1),
    ('DT-M1', 'M1-W4_1-02', 'Identify everyday problems and gather relevant information', 'Identify a problem or need in everyday life, collect and analyse information, and identify ideas related to the problem.', 2),
    ('DT-M1', 'M1-W4_1-03', 'Design and plan a solution to an everyday problem', 'Design a solution by comparing options and selecting necessary information; communicate the proposed solution, plan the work and carry it out.', 3),
    ('DT-M1', 'M1-W4_1-04', 'Test, evaluate and improve a solution', 'Test and evaluate a solution, identify defects, propose improvements and present the results.', 4),
    ('DT-M1', 'M1-W4_1-05', 'Use materials, tools and mechanisms safely', 'Use knowledge and skills involving materials, equipment, tools, mechanisms, electricity or electronics to solve problems correctly, appropriately and safely.', 5),
    ('DT-M2', 'M2-W4_1-01', 'Predict technology trends and evaluate their impacts', 'Predict future technology trends from the causes and factors that drive change; compare and select technologies while considering impacts on life, society and the environment.', 1),
    ('DT-M2', 'M2-W4_1-02', 'Define community problems and analyse related information', 'Identify a problem or need in a community or locality, define its scope, and collect and analyse relevant information and ideas.', 2),
    ('DT-M2', 'M2-W4_1-03', 'Design solutions within constraints and available resources', 'Compare possible solutions, select necessary information within given conditions and resources, communicate a solution, plan the steps and carry out the work systematically.', 3),
    ('DT-M2', 'M2-W4_1-04', 'Test and improve solutions against defined conditions', 'Test and evaluate a solution, explain problems or defects against the conditions, identify improvements and present the results.', 4),
    ('DT-M2', 'M2-W4_1-05', 'Select and use tools and technologies safely', 'Use knowledge and skills involving materials, equipment, tools, mechanisms, electricity or electronics appropriately for the task and safely.', 5),
    ('DT-M3', 'M3-W4_1-01', 'Analyse technological change and links with other disciplines', 'Analyse causes or factors that influence technological change and relationships between technology and other disciplines, especially science and mathematics, to solve problems or develop work.', 1),
    ('DT-M3', 'M3-W4_1-02', 'Define local problems for work or career development', 'Identify a community or local problem or need for developing work or careers, define the problem, and collect and analyse relevant information and ideas while respecting intellectual property.', 2),
    ('DT-M3', 'M3-W4_1-03', 'Design solutions using varied communication techniques', 'Compare and select necessary information within conditions and available resources, communicate a solution using varied techniques, plan the work and carry it out systematically.', 3),
    ('DT-M3', 'M3-W4_1-04', 'Evaluate, improve and extend a designed solution', 'Test and evaluate a solution, analyse and explain defects within the conditions, improve the solution, present the results and suggest further development.', 4),
    ('DT-M3', 'M3-W4_1-05', 'Use complex tools and technologies safely', 'Use materials, equipment, tools, mechanisms, electricity, electronics and more complex technologies correctly, appropriately and safely to solve problems or develop work.', 5),
    ('DT-M4', 'M4-W4_1-01', 'Analyse core technology concepts and their impacts', 'Analyse core technology concepts and their relationships with other disciplines, especially science and mathematics, and evaluate impacts on people, society, the economy and the environment to guide technology development.', 1),
    ('DT-M4', 'M4-W4_1-02', 'Define complex problems that affect society', 'Identify problems or needs that affect society and collect and analyse complex information and ideas related to the problem.', 2),
    ('DT-M4', 'M4-W4_1-03', 'Design solutions with software and available resources', 'Compare and select information within conditions and available resources, communicate a solution using varied techniques, use software to support design, plan the work and carry it out.', 3),
    ('DT-M4', 'M4-W4_1-04', 'Test, analyse and improve solutions for further development', 'Test and evaluate a solution, analyse and explain defects against the conditions, identify improvements, present results and propose further development.', 4),
    ('DT-M4', 'M4-W4_1-05', 'Use advanced materials, mechanisms and electrical technologies safely', 'Use knowledge and skills involving materials, equipment, tools, mechanisms, electricity, electronics and complex technologies correctly, appropriately and safely to solve problems or develop work.', 5),
    ('DT-M5', 'M5-W4_1-01', 'Apply interdisciplinary knowledge in a technology project', 'Apply knowledge and skills from different disciplines, together with available resources, in a project to solve a problem or develop work.', 1),
    ('CS-M1', 'M1-W4_2-01', 'Design abstract algorithms for real-life problems', 'Design an algorithm using abstraction to solve a problem or explain a process encountered in real life.', 1),
    ('CS-M1', 'M1-W4_2-02', 'Design and write simple programs for mathematics or science', 'Design and write a simple computer program to solve a mathematics or science problem.', 2),
    ('CS-M1', 'M1-W4_2-03', 'Collect, process and present primary data', 'Collect primary data, process and evaluate it, and present information for a stated purpose using varied software or internet services.', 3),
    ('CS-M1', 'M1-W4_2-04', 'Use information technology safely and follow source rules', 'Use information technology safely and follow requirements and agreements governing media and information sources.', 4),
    ('CS-M2', 'M2-W4_2-01', 'Design algorithms using computational thinking', 'Design an algorithm that applies computational thinking to solve a problem or complete a real-life task.', 1),
    ('CS-M2', 'M2-W4_2-02', 'Program with logic and functions', 'Design and write a computer program that uses logic and functions to solve a problem.', 2),
    ('CS-M2', 'M2-W4_2-03', 'Explain computer systems and communication technology', 'Discuss the components and operating principles of computer systems and communication technologies to apply them or solve basic problems.', 3),
    ('CS-M2', 'M2-W4_2-04', 'Use information technology responsibly and respect intellectual property', 'Use information technology safely and responsibly, and create and communicate rights relating to the publication of work.', 4),
    ('CS-M3', 'M3-W4_2-01', 'Develop an integrated application', 'Develop an application that creatively integrates knowledge from other subjects.', 1),
    ('CS-M3', 'M3-W4_2-02', 'Collect, process, evaluate and present data', 'Collect and process data, evaluate and present information for a purpose using varied software or internet services.', 2),
    ('CS-M3', 'M3-W4_2-03', 'Evaluate information reliability and media misinformation', 'Evaluate information reliability, analyse media and the effects of misinformation, and use information critically.', 3),
    ('CS-M3', 'M3-W4_2-04', 'Use technology safely and comply with computer law and copyright', 'Use information technology safely and responsibly, comply with computer-related law and use others'' copyrighted work lawfully.', 4),
    ('CS-M4', 'M4-W4_2-01', 'Apply computational thinking in an integrated project', 'Apply computational thinking to develop a project that creatively integrates other subjects and connects with real life.', 1),
    ('CS-M5', 'M5-W4_2-01', 'Use data science to solve problems and create value', 'Collect and analyse data and use computer science, digital media and information technology to solve problems or add value to real-life services or products.', 1),
    ('CS-M6', 'M6-W4_2-01', 'Share information safely and analyse technology''s social impact', 'Use information technology to present and share information safely and ethically, and analyse changes in information technology that affect life, careers, society and culture.', 1)
) as objectives(topic_code, code, name, description, sequence_no)
  on true
join public.learning_topics topic on topic.skill_id = skill.id and topic.code = objectives.topic_code
where subject.code = 'TECH'
on conflict (topic_id, code) do update
set name = excluded.name,
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
  'Thailand Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017); official indicator ' || alignment.indicator_code || '.'
from public.learning_objectives objective
join public.learning_topics objective_topic on objective_topic.id = objective.topic_id
join public.learning_skills objective_skill on objective_skill.id = objective_topic.skill_id
join public.learning_subjects objective_subject on objective_subject.id = objective_skill.subject_id and objective_subject.code = 'TECH'
join (
  values
    ('M1-W4_1-01', 1, 'ว 4.1 ม.1/1', 'M1'),
    ('M1-W4_1-02', 2, 'ว 4.1 ม.1/2', 'M1'),
    ('M1-W4_1-03', 3, 'ว 4.1 ม.1/3', 'M1'),
    ('M1-W4_1-04', 4, 'ว 4.1 ม.1/4', 'M1'),
    ('M1-W4_1-05', 5, 'ว 4.1 ม.1/5', 'M1'),
    ('M2-W4_1-01', 1, 'ว 4.1 ม.2/1', 'M2'),
    ('M2-W4_1-02', 2, 'ว 4.1 ม.2/2', 'M2'),
    ('M2-W4_1-03', 3, 'ว 4.1 ม.2/3', 'M2'),
    ('M2-W4_1-04', 4, 'ว 4.1 ม.2/4', 'M2'),
    ('M2-W4_1-05', 5, 'ว 4.1 ม.2/5', 'M2'),
    ('M3-W4_1-01', 1, 'ว 4.1 ม.3/1', 'M3'),
    ('M3-W4_1-02', 2, 'ว 4.1 ม.3/2', 'M3'),
    ('M3-W4_1-03', 3, 'ว 4.1 ม.3/3', 'M3'),
    ('M3-W4_1-04', 4, 'ว 4.1 ม.3/4', 'M3'),
    ('M3-W4_1-05', 5, 'ว 4.1 ม.3/5', 'M3'),
    ('M4-W4_1-01', 1, 'ว 4.1 ม.4/1', 'M4'),
    ('M4-W4_1-02', 2, 'ว 4.1 ม.4/2', 'M4'),
    ('M4-W4_1-03', 3, 'ว 4.1 ม.4/3', 'M4'),
    ('M4-W4_1-04', 4, 'ว 4.1 ม.4/4', 'M4'),
    ('M4-W4_1-05', 5, 'ว 4.1 ม.4/5', 'M4'),
    ('M5-W4_1-01', 1, 'ว 4.1 ม.5/1', 'M5'),
    ('M1-W4_2-01', 1, 'ว 4.2 ม.1/1', 'M1'),
    ('M1-W4_2-02', 2, 'ว 4.2 ม.1/2', 'M1'),
    ('M1-W4_2-03', 3, 'ว 4.2 ม.1/3', 'M1'),
    ('M1-W4_2-04', 4, 'ว 4.2 ม.1/4', 'M1'),
    ('M2-W4_2-01', 1, 'ว 4.2 ม.2/1', 'M2'),
    ('M2-W4_2-02', 2, 'ว 4.2 ม.2/2', 'M2'),
    ('M2-W4_2-03', 3, 'ว 4.2 ม.2/3', 'M2'),
    ('M2-W4_2-04', 4, 'ว 4.2 ม.2/4', 'M2'),
    ('M3-W4_2-01', 1, 'ว 4.2 ม.3/1', 'M3'),
    ('M3-W4_2-02', 2, 'ว 4.2 ม.3/2', 'M3'),
    ('M3-W4_2-03', 3, 'ว 4.2 ม.3/3', 'M3'),
    ('M3-W4_2-04', 4, 'ว 4.2 ม.3/4', 'M3'),
    ('M4-W4_2-01', 1, 'ว 4.2 ม.4/1', 'M4'),
    ('M5-W4_2-01', 1, 'ว 4.2 ม.5/1', 'M5'),
    ('M6-W4_2-01', 1, 'ว 4.2 ม.6/1', 'M6')
) as alignment(objective_code, sequence_no, indicator_code, grade_code)
  on alignment.objective_code = objective.code
join public.learning_curricula curriculum on curriculum.code = 'TH-TECH-M1-M6'
join public.learning_education_systems es on es.id = curriculum.education_system_id and es.code = 'TH_BASIC'
join public.learning_grade_levels grade on grade.curriculum_id = curriculum.id and grade.code = alignment.grade_code
where objective.status = 'active'
on conflict (objective_id, curriculum_id, grade_level_id) do update
set sequence_no = excluded.sequence_no,
    required = excluded.required,
    notes = excluded.notes,
    updated_at = now();

commit;
