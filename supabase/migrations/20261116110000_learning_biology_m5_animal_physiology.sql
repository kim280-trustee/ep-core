-- E&P Learning: M5 Biology, additional-study strand 4, outcomes 1-21.
-- Official OBEC/IPST revised curriculum B.E. 2560 (2017), Additional Biology, strand 4.
-- The official curriculum lists no M4 outcomes for this strand; all outcomes are aligned to M5.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
 where s.code='BIOLOGY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Biology subject and M5 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ANIMAL-PHYSIOLOGY','Animal Physiology','Comparative digestion, gas exchange, circulation, blood and immunity, excretion and kidney function in animals and humans.','active'
from public.learning_subjects s where s.code='BIOLOGY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-ANIMAL-PHYSIOLOGY','Animal and Human Organ Systems','M5 Biology additional-study strand 4: digestion, gas exchange, circulation, blood, lymph, immunity, excretion and kidney function.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='BIOLOGY' and sk.code='ANIMAL-PHYSIOLOGY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M5-BIO-ANIMAL-01','Compare digestive systems in animals','Compare digestion in animals with no digestive tract, an incomplete digestive tract and a complete digestive tract.',1),
('M5-BIO-ANIMAL-02','Explain feeding in Hydra and Planaria','Use diagrams, prepared images or recorded observations to explain how Hydra and Planaria capture and ingest food.',2),
('M5-BIO-ANIMAL-03','Explain the human digestive system','Identify the organs of the human digestive system and explain mechanical and chemical digestion and nutrient absorption.',3),
('M5-BIO-ANIMAL-04','Compare gas exchange structures in animals','Compare gas exchange structures in sponges, Hydra, Planaria, earthworms, insects, fish, frogs and birds.',4),
('M5-BIO-ANIMAL-05','Explain mammalian lung structure','Identify the main structures of mammalian lungs and relate their features to efficient gas exchange.',5),
('M5-BIO-ANIMAL-06','Explain human gas exchange','Explain ventilation and diffusion of oxygen and carbon dioxide between alveoli, blood and body tissues.',6),
('M5-BIO-ANIMAL-07','Investigate lung function and exhaled air volume','Explain how lung function can be investigated and interpret safe, supervised measurements of exhaled air volume.',7),
('M5-BIO-ANIMAL-08','Compare open and closed circulatory systems','Compare open and closed circulatory systems and explain how each transports substances around an animal.',8),
('M5-BIO-ANIMAL-09','Relate blood vessel size to blood flow','Interpret prepared observations or video of fish-tail blood flow and explain how vessel diameter relates to flow speed.',9),
('M5-BIO-ANIMAL-10','Explain human heart and blood vessel structure','Identify the main structures of the human heart and blood vessels and relate their structure to their functions.',10),
('M5-BIO-ANIMAL-11','Trace blood flow through the mammalian heart','Trace the route of blood through the chambers, valves, lungs and body and represent pulmonary and systemic circulation.',11),
('M5-BIO-ANIMAL-12','Compare blood components','Compare the structures and functions of red blood cells, white blood cells, platelets and plasma.',12),
('M5-BIO-ANIMAL-13','Explain ABO and Rh blood groups','Explain the ABO and Rh blood-group systems and use compatibility charts to assess transfusion compatibility.',13),
('M5-BIO-ANIMAL-14','Explain lymph and the lymphatic system','Describe lymph composition and functions and explain the roles of lymph vessels and lymph nodes.',14),
('M5-BIO-ANIMAL-15','Compare innate and adaptive immunity','Compare non-specific innate defences with specific immune responses, including the roles of immune cells and antibodies.',15),
('M5-BIO-ANIMAL-16','Compare active and passive immunity','Distinguish active from passive immunity and explain natural and medically acquired examples.',16),
('M5-BIO-ANIMAL-17','Explain selected immune system disorders','Explain the biological basis of HIV-related immune deficiency, allergies and autoimmune conditions using accurate, non-stigmatising sources.',17),
('M5-BIO-ANIMAL-18','Compare excretory structures in animals','Compare excretory structures and waste-removal functions in sponges, Hydra, Planaria, earthworms, insects and vertebrates.',18),
('M5-BIO-ANIMAL-19','Explain kidney and urinary tract structure','Identify the kidneys and urinary tract structures and explain their roles in urine formation, storage and elimination.',19),
('M5-BIO-ANIMAL-20','Explain nephron function','Explain filtration, selective reabsorption and secretion in the nephron and construct a process diagram of urine formation.',20),
('M5-BIO-ANIMAL-21','Explain kidney disorders and prevention','Describe selected kidney disorders, their effects on kidney function and evidence-based ways to reduce preventable risks.',21)
) as o(code,name,description,seq) on true
where s.code='BIOLOGY' and tp.code='M5-ANIMAL-PHYSIOLOGY'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Biology strand 4, M5 learning outcome '||a.seq||'.'
from (values
('M5-BIO-ANIMAL-01',1),('M5-BIO-ANIMAL-02',2),('M5-BIO-ANIMAL-03',3),('M5-BIO-ANIMAL-04',4),('M5-BIO-ANIMAL-05',5),('M5-BIO-ANIMAL-06',6),('M5-BIO-ANIMAL-07',7),
('M5-BIO-ANIMAL-08',8),('M5-BIO-ANIMAL-09',9),('M5-BIO-ANIMAL-10',10),('M5-BIO-ANIMAL-11',11),('M5-BIO-ANIMAL-12',12),('M5-BIO-ANIMAL-13',13),('M5-BIO-ANIMAL-14',14),
('M5-BIO-ANIMAL-15',15),('M5-BIO-ANIMAL-16',16),('M5-BIO-ANIMAL-17',17),('M5-BIO-ANIMAL-18',18),('M5-BIO-ANIMAL-19',19),('M5-BIO-ANIMAL-20',20),('M5-BIO-ANIMAL-21',21)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='BIOLOGY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
