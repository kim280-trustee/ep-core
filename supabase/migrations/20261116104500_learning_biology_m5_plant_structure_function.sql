-- E&P Learning: M5 Biology, additional-study strand 3, outcomes 1-18.
-- Official OBEC/IPST revised curriculum B.E. 2560 (2017), Additional Biology, pp. 110-111.
-- Strand 3 has no M4 outcomes; these outcomes are assigned to M5.
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
select s.id,'PLANT-BIOLOGY','Plant Structure and Function','Plant tissues and organs, gas exchange and transpiration, transport, mineral nutrition, photosynthesis, flowering-plant reproduction, seed germination, plant hormones and responses to stimuli.','active'
from public.learning_subjects s where s.code='BIOLOGY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PLANT-STRUCTURE-FUNCTION','Plant Structure, Transport, Photosynthesis and Reproduction','M5 Biology additional-study strand 3: plant tissues, roots, stems, leaves, gas exchange, water and food transport, photosynthesis, flowering-plant reproduction, seed development, hormones and responses.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='BIOLOGY' and sk.code='PLANT-BIOLOGY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join (values
 ('M5-BIO-PLANT-01','Classify plant tissues','Explain the types and characteristics of plant tissues and construct a classification map showing their organisation and functions.',1),
 ('M5-BIO-PLANT-02','Compare internal root structures','Observe and compare cross-sections of monocot and dicot roots, identifying the main tissues and vascular arrangements.',2),
 ('M5-BIO-PLANT-03','Compare internal stem structures','Observe and compare cross-sections of monocot and dicot stems, identifying tissue organisation and vascular-bundle arrangements.',3),
 ('M5-BIO-PLANT-04','Explain the internal structure of leaves','Observe leaf cross-sections and relate epidermis, mesophyll, stomata and vascular tissues to leaf functions.',4),
 ('M5-BIO-PLANT-05','Explain plant gas exchange and transpiration','Investigate gas exchange and water loss in plants and explain the roles of stomata and environmental factors.',5),
 ('M5-BIO-PLANT-06','Explain water and mineral transport','Explain the mechanisms by which water and mineral ions move from roots through xylem to other parts of a plant.',6),
 ('M5-BIO-PLANT-07','Explain mineral nutrition in plants','Explain the importance of mineral nutrients and give examples of essential elements and deficiency effects on plant growth.',7),
 ('M5-BIO-PLANT-08','Explain translocation of food in plants','Explain how organic products of photosynthesis are transported through phloem from sources to sinks.',8),
 ('M5-BIO-PLANT-09','Review historical experiments on photosynthesis','Investigate and summarise evidence from historical scientific experiments that established the process and requirements of photosynthesis.',9),
 ('M5-BIO-PLANT-10','Explain photosynthesis in C3 plants','Describe the stages of photosynthesis in C3 plants, including light-dependent reactions and the Calvin cycle.',10),
 ('M5-BIO-PLANT-11','Compare carbon fixation in C3 C4 and CAM plants','Compare the mechanisms of carbon dioxide fixation in C3, C4 and CAM plants and relate adaptations to environmental conditions.',11),
 ('M5-BIO-PLANT-12','Analyse factors affecting photosynthesis','Investigate how light intensity, carbon dioxide concentration and temperature affect the rate of photosynthesis.',12),
 ('M5-BIO-PLANT-13','Explain alternation of generations in flowering plants','Describe the flowering-plant life cycle and explain alternation between gametophyte and sporophyte generations.',13),
 ('M5-BIO-PLANT-14','Compare male and female gamete formation in flowering plants','Explain and compare pollen formation, embryo-sac development, pollination and double fertilisation in flowering plants.',14),
 ('M5-BIO-PLANT-15','Explain seed and fruit development','Explain how seeds and fruits develop in flowering plants, identify their structures and give examples of their uses.',15),
 ('M5-BIO-PLANT-16','Investigate seed germination and dormancy','Investigate factors affecting seed germination, explain seed dormancy and describe methods that can break dormancy.',16),
 ('M5-BIO-PLANT-17','Explain the roles of plant hormones','Explain the functions of auxin, cytokinin, gibberellin, ethylene and abscisic acid and discuss agricultural applications.',17),
 ('M5-BIO-PLANT-18','Investigate plant responses to external stimuli','Investigate and discuss how external stimuli such as light, gravity, touch and water influence plant growth and responses.',18)
) as o(code,name,description,seq) on true
where s.code='BIOLOGY' and tp.code='M5-PLANT-STRUCTURE-FUNCTION'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,
 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Biology strand 3, M5 learning outcome '||a.seq||'; official source pp. 110-111.'
from (values
 ('M5-BIO-PLANT-01',1),('M5-BIO-PLANT-02',2),('M5-BIO-PLANT-03',3),('M5-BIO-PLANT-04',4),('M5-BIO-PLANT-05',5),('M5-BIO-PLANT-06',6),
 ('M5-BIO-PLANT-07',7),('M5-BIO-PLANT-08',8),('M5-BIO-PLANT-09',9),('M5-BIO-PLANT-10',10),('M5-BIO-PLANT-11',11),('M5-BIO-PLANT-12',12),
 ('M5-BIO-PLANT-13',13),('M5-BIO-PLANT-14',14),('M5-BIO-PLANT-15',15),('M5-BIO-PLANT-16',16),('M5-BIO-PLANT-17',17),('M5-BIO-PLANT-18',18)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='BIOLOGY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
on conflict(objective_id,curriculum_id,grade_level_id)
do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
