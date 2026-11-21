-- Upper-secondary core Science technology strand: M4 six indicators and M5 two indicators.
-- Official OBEC 2021 source pages 163–167. Each row aligned only to its actual grade.
begin;
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.topic_code,v.topic_name,v.topic_desc,v.sequence_no,'active'
from (values
('TECH','M4-TECHNOLOGY-DESIGN','Technology Systems and Design Process','Analyse technology systems and impacts, define complex problems, design solutions, test prototypes and apply tools safely.',1),
('TECH','M4-COMPUTATIONAL-PROJECTS','Computational Thinking and Interdisciplinary Projects','Use computational thinking to develop creative interdisciplinary projects linked to real-life needs.',2),
('TECH','M5-TECHNOLOGY-PROJECTS','Interdisciplinary Technology Projects','Apply knowledge, skills and resources from multiple disciplines to solve problems and improve products or processes.',1),
('TECH','M5-DATA-AND-COMPUTING-APPLICATIONS','Data, Computing and Real-World Products','Collect and analyse data and use computer science and digital technology to improve real-life services and products.',2)
) v(skill_code,topic_code,topic_name,topic_desc,sequence_no)
join public.learning_skills sk on sk.code=v.skill_code
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.sequence_no,'active'
from (values
('M4-S4_1-09','Evaluate technology concepts and their wider impacts','Analyse the main concepts of a technology, its relationship with other disciplines—especially science and mathematics—and its possible effects on people, society, the economy and the environment.',94,'M4-TECHNOLOGY-DESIGN'),
('M4-S4_1-02','Define complex problems and gather relevant information','Identify a complex problem or need affecting society, collect and analyse relevant information and ideas, and synthesise possible solution methods while respecting intellectual property.',95,'M4-TECHNOLOGY-DESIGN'),
('M4-S4_1-03','Design and communicate a solution under constraints','Design a solution by comparing necessary information and available resources, then communicate the approach using suitable drawings, diagrams, flowcharts or software and plan the work.',96,'M4-TECHNOLOGY-DESIGN'),
('M4-S4_1-04','Test, evaluate and improve a designed solution','Test and evaluate a product or process against requirements, analyse defects, improve the solution and communicate results and possible further development.',97,'M4-TECHNOLOGY-DESIGN'),
('M4-S4_1-05','Select materials, mechanisms and tools safely','Apply knowledge of materials, tools, mechanisms, electrical and electronic components, and more complex technologies to solve problems or develop work appropriately and safely.',88,'M4-TECHNOLOGY-DESIGN'),
('M4-S4_2-01','Develop interdisciplinary projects using computational thinking','Apply computational-thinking concepts to develop a creative project that integrates other subjects and connects with real-life situations.',100,'M4-COMPUTATIONAL-PROJECTS'),
('M5-S4_1-01','Apply interdisciplinary knowledge in a project','Apply knowledge, skills and available resources from different disciplines to plan and carry out a project that solves a problem or improves a product or process.',99,'M5-TECHNOLOGY-PROJECTS'),
('M5-S4_2-01','Use data and computing to improve real products or services','Collect and analyse data and use computer science, digital media and information technology creatively to solve real-life problems or add value to services and products.',101,'M5-DATA-AND-COMPUTING-APPLICATIONS')
) v(code,name,description,sequence_no,topic_code)
join public.learning_topics t on t.code=v.topic_code
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,v.sequence_no,true,'OBEC 2021 source; exact indicator '||v.indicator_code||'. Grade-specific alignment only.',v.classification
from (values
('M4-S4_1-09','ว 4.1 ม.4/9',94,'must_know','M4'),
('M4-S4_1-02','ว 4.1 ม.4/2',95,'must_know','M4'),
('M4-S4_1-03','ว 4.1 ม.4/3',96,'must_know','M4'),
('M4-S4_1-04','ว 4.1 ม.4/4',97,'must_know','M4'),
('M4-S4_1-05','ว 4.1 ม.4/5',88,'should_know','M4'),
('M4-S4_2-01','ว 4.2 ม.4/1',100,'must_know','M4'),
('M5-S4_1-01','ว 4.1 ม.5/1',99,'must_know','M5'),
('M5-S4_2-01','ว 4.2 ม.5/1',101,'must_know','M5')
) v(code,indicator_code,sequence_no,classification,grade_code)
join public.learning_objectives o on o.code=v.code
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=v.grade_code
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=true,notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();
commit;