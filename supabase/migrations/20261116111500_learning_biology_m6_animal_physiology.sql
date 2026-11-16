-- E&P Learning: M6 Biology, additional-study strand 4, outcomes 1-19.
-- Official OBEC revised curriculum B.E. 2560 (2017), Additional Biology, pp. 113-114.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
 where s.code='BIOLOGY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Biology subject and M6 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ANIMAL-PHYSIOLOGY','Animal Physiology','Comparative animal and human organ systems, nervous coordination, movement, reproduction, hormones, homeostasis and behaviour.','active'
from public.learning_subjects s where s.code='BIOLOGY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M6-ANIMAL-PHYSIOLOGY','Nervous Coordination, Movement, Reproduction and Behaviour','M6 Biology additional-study strand 4: nervous systems, sensory organs, movement, animal and human reproduction, hormones, behaviour and communication.',2,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='BIOLOGY' and sk.code='ANIMAL-PHYSIOLOGY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M6-BIO-ANIMAL-01','Compare nervous systems across animal groups','Compare the organisation and functions of nervous systems in Hydra, Planaria, earthworms, prawns, snails, insects and vertebrates.',1),
('M6-BIO-ANIMAL-02','Explain neuron structure and function','Identify the main parts of a neuron and relate dendrites, cell body, axon and synaptic terminals to signal transmission.',2),
('M6-BIO-ANIMAL-03','Explain membrane potential and nerve impulses','Explain resting potential, action potentials and the transmission of nerve impulses along neurons and across synapses.',3),
('M6-BIO-ANIMAL-04','Describe the central and peripheral nervous systems','Distinguish the central nervous system from the peripheral nervous system and summarise their organisation and roles.',4),
('M6-BIO-ANIMAL-05','Explain brain and spinal cord functions','Identify major regions of the forebrain, midbrain, hindbrain and spinal cord and relate their structures to functions.',5),
('M6-BIO-ANIMAL-06','Compare somatic and autonomic nervous systems','Compare somatic and autonomic control and give examples of voluntary and involuntary responses.',6),
('M6-BIO-ANIMAL-07','Explain human sensory organs and care','Explain the structures and functions of the eye, ear, nose, tongue and skin, identify selected disorders and describe evidence-based care.',7),
('M6-BIO-ANIMAL-08','Investigate blind spots fovea and skin sensitivity','Use safe classroom observations or supplied data to locate the visual blind spot, explain the fovea and compare skin touch sensitivity.',8),
('M6-BIO-ANIMAL-09','Compare movement structures in animals','Compare structures for movement in jellyfish, squid, starfish, earthworms, insects, fish and birds.',9),
('M6-BIO-ANIMAL-10','Explain human bones and muscles in movement','Describe the structure and functions of bones and skeletal muscles and explain how they work together to produce movement.',10),
('M6-BIO-ANIMAL-11','Explain joints and skeletal muscle action','Compare types of joints and explain how opposing skeletal muscles act across joints to produce movement.',11),
('M6-BIO-ANIMAL-12','Compare asexual and sexual reproduction in animals','Explain and give examples of asexual and sexual reproduction in animals and compare their biological consequences.',12),
('M6-BIO-ANIMAL-13','Explain human reproductive system structures','Identify the main organs of the male and female reproductive systems and explain their functions using accurate scientific terminology.',13),
('M6-BIO-ANIMAL-14','Explain human gamete formation and fertilisation','Describe spermatogenesis, oogenesis and fertilisation in humans and compare the processes that form sperm and ova.',14),
('M6-BIO-ANIMAL-15','Compare embryonic and post-embryonic development','Compare major stages of embryonic and post-embryonic development in frogs, chickens and humans using diagrams and timelines.',15),
('M6-BIO-ANIMAL-16','Explain hormones and endocrine tissues','Identify major endocrine glands and hormone-producing tissues, summarise selected hormone functions and represent their roles in a concept map.',16),
('M6-BIO-ANIMAL-17','Compare innate and learned animal behaviour','Compare innate behaviours with learned behaviours and provide accurate examples from different animal groups.',17),
('M6-BIO-ANIMAL-18','Relate behaviour to nervous system evolution','Explain how differences in nervous-system organisation are related to the complexity and evolution of animal behaviours.',18),
('M6-BIO-ANIMAL-19','Explain communication between animals','Describe examples of visual, acoustic, chemical and tactile communication between animals and explain how signals can influence behaviour.',19)
) as o(code,name,description,seq) on true
where s.code='BIOLOGY' and tp.code='M6-ANIMAL-PHYSIOLOGY'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Biology strand 4, M6 learning outcome '||a.seq||'; official source pp. 113-114.'
from (values
('M6-BIO-ANIMAL-01',1),('M6-BIO-ANIMAL-02',2),('M6-BIO-ANIMAL-03',3),('M6-BIO-ANIMAL-04',4),('M6-BIO-ANIMAL-05',5),('M6-BIO-ANIMAL-06',6),('M6-BIO-ANIMAL-07',7),('M6-BIO-ANIMAL-08',8),('M6-BIO-ANIMAL-09',9),('M6-BIO-ANIMAL-10',10),('M6-BIO-ANIMAL-11',11),('M6-BIO-ANIMAL-12',12),('M6-BIO-ANIMAL-13',13),('M6-BIO-ANIMAL-14',14),('M6-BIO-ANIMAL-15',15),('M6-BIO-ANIMAL-16',16),('M6-BIO-ANIMAL-17',17),('M6-BIO-ANIMAL-18',18),('M6-BIO-ANIMAL-19',19)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='BIOLOGY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;