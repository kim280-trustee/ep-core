begin;

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M3-ECOSYSTEMS-AND-ENERGY-FLOW','Ecosystems and Energy Flow — M3',
 'Ecosystem interactions, organism relationships, food webs, ecological roles, toxin accumulation and ecosystem balance.',
 1,'active'
from public.learning_skills sk
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
where sk.code='BIO'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics t
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
cross join (values
('M3-S1_1-01','Explain interactions among ecosystem components','Explain interactions between living components and non-living factors such as light, water, temperature, minerals and gases.',1),
('M3-S1_1-02','Explain relationships among organisms','Explain relationships among organisms sharing a habitat, including mutualism, commensalism, predation and parasitism.',2),
('M3-S1_1-03','Model energy transfer in food webs','Create a model showing how energy moves through producers, consumers and decomposers in a food web.',3),
('M3-S1_1-04','Explain producers, consumers and decomposers','Explain how producers, consumers and decomposers depend on one another in an ecosystem.',4),
('M3-S1_1-05','Explain toxin accumulation in food chains','Explain how some harmful substances can accumulate in organisms and become more concentrated along a food chain.',5),
('M3-S1_1-06','Protect ecosystem balance','Explain how human actions affect ecosystem balance and propose ways to protect organisms and their environment.',6)
) v(code,name,description,seq)
where t.code='M3-ECOSYSTEMS-AND-ENERGY-FLOW' and sk.code='BIO'
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

with seed(code,official_thai,classification,seq) as (values
('M3-S1_1-01','อธิบายปฏิสัมพันธ์ขององค์ประกอบของระบบนิเวศที่ได้จากการสำรวจ','must_know',1),
('M3-S1_1-02','อธิบายรูปแบบความสัมพันธ์ระหว่างสิ่งมีชีวิตกับสิ่งมีชีวิตรูปแบบต่าง ๆ ในแหล่งที่อยู่เดียวกันที่ได้จากการสำรวจ','should_know',2),
('M3-S1_1-03','สร้างแบบจำลองในการอธิบายการถ่ายทอดพลังงานในสายใยอาหาร','must_know',3),
('M3-S1_1-04','อธิบายความสัมพันธ์ของผู้ผลิต ผู้บริโภค และผู้ย่อยสลายสารอินทรีย์ในระบบนิเวศ','should_know',4),
('M3-S1_1-05','อธิบายการสะสมสารพิษในสิ่งมีชีวิตในโซ่อาหาร','should_know',5),
('M3-S1_1-06','ตระหนักถึงความสัมพันธ์ของสิ่งมีชีวิตและสิ่งแวดล้อมในระบบนิเวศ โดยไม่ทำลายสมดุลของระบบนิเวศ','should_know',6)
)
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,s.seq,true,
 'OBEC/IPST 2021 official indicator: '||s.official_thai||' Source: Indicators and Core Learning Content: Must-Know and Should-Know (2021), Science and Technology, M3 page 127.',
 s.classification
from seed s
join public.learning_objectives o on o.code=s.code
join public.learning_topics t on t.id=o.topic_id and t.code='M3-ECOSYSTEMS-AND-ENERGY-FLOW'
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' and c.status='active'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M3' and g.status='active'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();

-- Mirror into the national master curriculum, which intentionally remains draft.
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select source.objective_id,national.id,national_grade.id,source.sequence_no,source.required,source.notes,source.indicator_classification
from public.learning_objective_alignments source
join public.learning_curricula source_curriculum on source_curriculum.id=source.curriculum_id and source_curriculum.code='TH-SCI-M1-M6'
join public.learning_grade_levels source_grade on source_grade.id=source.grade_level_id and source_grade.curriculum_id=source_curriculum.id and source_grade.code='M3'
join public.learning_objectives objective on objective.id=source.objective_id and objective.code like 'M3-S1_1-%'
join public.learning_curricula national on national.code='TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels national_grade on national_grade.curriculum_id=national.id and national_grade.code='M3'
where not exists(select 1 from public.learning_objective_alignments existing
 where existing.objective_id=source.objective_id and existing.curriculum_id=national.id and existing.grade_level_id=national_grade.id)
on conflict(objective_id,curriculum_id,grade_level_id) do nothing;

commit;