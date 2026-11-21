begin;

-- M3's official OBEC 2021 table contains nine technology indicators in
-- standards ว 4.1 (five) and ว 4.2 (four). The nine previously aligned
-- W3.2 records are legacy supplementary outcomes, not substitutes for them.
-- Preserve those objectives and their teacher materials, but stop counting
-- them as required OBEC 2021 M3 core indicators until separately validated.

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.sequence_no,'active'
from (values
 ('M3-DESIGN-TECHNOLOGY','Design and Technology — M3',
  'Analyse technology change, identify local problems, design and evaluate solutions, and use materials and tools safely.',1),
 ('M3-COMPUTATIONAL-THINKING','Computational Thinking — M3',
  'Develop interdisciplinary applications, process and present data, assess information reliability, and use digital technology responsibly.',2)
) v(code,name,description,sequence_no)
join public.learning_skills sk on sk.code='TECH'
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.sequence_no,'active'
from (values
 ('M3-S4_1-01','Analyse technology change and its links to other subjects',
  'Analyse causes and factors that change technology and explain how technology relates to other disciplines, especially science and mathematics, when solving problems or developing work.',1,'M3-DESIGN-TECHNOLOGY'),
 ('M3-S4_1-02','Identify a community problem or need',
  'Identify a community or local need, define the problem, collect and analyse relevant information and ideas, and respect intellectual-property rights.',2,'M3-DESIGN-TECHNOLOGY'),
 ('M3-S4_1-03','Design and plan a step-by-step solution',
  'Compare possible solutions and select necessary information within available conditions and resources; communicate the design and plan and carry out the work step by step.',3,'M3-DESIGN-TECHNOLOGY'),
 ('M3-S4_1-04','Test, evaluate and improve a solution',
  'Test and evaluate a product or process, analyse defects and their causes, improve the solution and present the results.',4,'M3-DESIGN-TECHNOLOGY'),
 ('M3-S4_1-05','Use materials, mechanisms and tools safely',
  'Select and use materials, tools, mechanisms, electrical and electronic components correctly and safely to solve problems or develop work.',5,'M3-DESIGN-TECHNOLOGY'),
 ('M3-S4_2-01','Develop an interdisciplinary application',
  'Develop an application creatively by integrating knowledge and skills from another subject.',1,'M3-COMPUTATIONAL-THINKING'),
 ('M3-S4_2-02','Collect, process and present data',
  'Collect, process and evaluate data, then present information for a clear purpose using a range of software or online services.',2,'M3-COMPUTATIONAL-THINKING'),
 ('M3-S4_2-03','Evaluate information and media reliability',
  'Evaluate the reliability of information, analyse media and explain the effects of misinformation so information can be used critically.',3,'M3-COMPUTATIONAL-THINKING'),
 ('M3-S4_2-04','Use information technology safely and responsibly',
  'Use information technology safely and responsibly, follow computer-related laws and respect other people’s copyright.',4,'M3-COMPUTATIONAL-THINKING')
) v(code,name,description,sequence_no,topic_code)
join public.learning_topics t on t.code=v.topic_code
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

update public.learning_objective_alignments a
set required=false,
    indicator_classification=null,
    notes='Legacy supplementary M3 W3.2 outcome retained for historical/source-pack continuity. Not counted as an OBEC 2021 required M3 core indicator; source-to-current-standard crosswalk remains pending.',
    updated_at=now()
where a.objective_id in (
 select o.id from public.learning_objectives o
 where o.code between 'M3-S3_2-01' and 'M3-S3_2-09'
)
and a.grade_level_id in (select id from public.learning_grade_levels where code='M3')
and a.curriculum_id in (select id from public.learning_curricula where code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017'));

with seed(code,thai_indicator,classification,sequence_no) as (values
 ('M3-S4_1-01','ว 4.1 ม.3/1','must_know',51),
 ('M3-S4_1-02','ว 4.1 ม.3/2','must_know',52),
 ('M3-S4_1-03','ว 4.1 ม.3/3','must_know',53),
 ('M3-S4_1-04','ว 4.1 ม.3/4','must_know',54),
 ('M3-S4_1-05','ว 4.1 ม.3/5','should_know',55),
 ('M3-S4_2-01','ว 4.2 ม.3/1','must_know',56),
 ('M3-S4_2-02','ว 4.2 ม.3/2','must_know',57),
 ('M3-S4_2-03','ว 4.2 ม.3/3','should_know',58),
 ('M3-S4_2-04','ว 4.2 ม.3/4','should_know',59)
)
insert into public.learning_objective_alignments(
 objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification
)
select o.id,c.id,g.id,s.sequence_no,true,
 'OBEC/IPST 2021 official M3 indicator '||s.thai_indicator||'; source table M3 page 127, rows 51–59. Source: https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf',
 s.classification
from seed s
join public.learning_objectives o on o.code=s.code
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M3'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=true,notes=excluded.notes,
 indicator_classification=excluded.indicator_classification,updated_at=now();

commit;