-- M4 upper-secondary core Science tranche 2: W1.2 and W1.3 (18 indicators).
-- Source: OBEC 2021 Must-Know / Should-Know, official PDF pages 143–148.
-- Grade-specific M4 alignment only. Does not seed or duplicate M5/M6.
begin;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,v.skill_code,v.skill_name,v.skill_desc,'active'
from public.learning_subjects s
cross join (values
('CELL-BIOLOGY','Cell Biology and Plant Physiology','Cell structures, transport, homeostasis, immunity and plant responses.'),
('GENETICS-EVOLUTION','Genetics, Biotechnology and Evolution','Gene expression, inheritance, mutation, DNA technology and biodiversity.')
) v(skill_code,skill_name,skill_desc)
where s.code='SCI'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.topic_code,v.topic_name,v.topic_desc,v.sequence_no,'active'
from (values
('CELL-BIOLOGY','M4-CELL-AND-HOMEOSTASIS','Cell Membranes, Homeostasis and Immunity','Explain membrane transport and the mechanisms that maintain internal balance and defend the body.',1),
('CELL-BIOLOGY','M4-PLANT-PHYSIOLOGY','Plant Nutrition, Growth and Responses','Investigate plant products, external growth factors, synthetic growth regulators and plant responses to stimuli.',2),
('GENETICS-EVOLUTION','M4-GENETICS-AND-EVOLUTION','Inheritance, Mutation, DNA Technology and Biodiversity','Explain gene-to-trait relationships, inheritance patterns, mutation, DNA technology and evolutionary biodiversity.',1)
) v(skill_code,topic_code,topic_name,topic_desc,sequence_no)
join public.learning_skills sk on sk.code=v.skill_code
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.sequence_no,'active'
from (values
('M4-S1_2-01','Explain cell membrane structure and transport','Explain how the lipid bilayer and membrane proteins control movement of substances, comparing diffusion, facilitated diffusion, active transport, endocytosis and exocytosis.',5,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-02','Explain kidney regulation of water and blood solutes','Explain how the kidneys remove nitrogenous wastes and regulate excess water and dissolved substances in the blood.',6,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-03','Explain blood acid-base balance','Explain how the kidneys regulate hydrogen and bicarbonate ions and how the lungs remove carbon dioxide to help maintain blood pH.',7,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-04','Explain body temperature regulation','Explain how blood circulation, skin and skeletal muscles help regulate internal body temperature.',8,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-05','Compare non-specific and specific immune responses','Explain and diagram non-specific and specific body responses to foreign substances, including phagocytes, B lymphocytes, T lymphocytes and antibodies.',9,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-06','Investigate disorders of the immune system','Research and explain examples of illnesses or symptoms caused by abnormal immune-system responses, including excessive responses or reactions against the body''s own antigens.',10,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-07','Explain HIV-related immune deficiency','Explain how HIV infection can damage T cells and weaken immune defence, using accurate and non-stigmatising scientific language.',11,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-08','Test nutrients synthesised by plants','Carry out appropriate food tests and identify nutrient types that plants synthesise, including carbohydrates, proteins and lipids.',12,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-09','Investigate useful substances produced by plants','Research and discuss examples of substances produced by plants and their uses in medicine, pest control, antimicrobial products and industry.',13,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-10','Investigate external factors affecting plant growth','Design and conduct a fair experiment to explain how external factors such as light, water, mineral nutrients, carbon dioxide and oxygen affect plant growth.',14,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-11','Explain synthetic plant growth regulators','Research synthetic substances modelled on plant hormones and give examples of how they are used to control plant growth or improve agricultural production.',15,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_2-12','Explain plant responses to stimuli','Observe and explain plant responses to stimuli, including directional tropisms and non-directional movements that affect survival.',16,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_3-01','Explain the relationship between genes, proteins and traits','Explain how a gene is a DNA sequence that provides information for protein synthesis and how proteins contribute to inherited characteristics.',17,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_3-02','Explain sex-linked and multiple-allele inheritance','Explain inheritance patterns controlled by genes on sex chromosomes and by multiple alleles, using examples such as colour blindness, haemophilia and ABO blood groups.',18,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_3-03','Explain effects of DNA sequence changes','Explain how changes in DNA nucleotide sequences, chromosome structure or chromosome number may change an organism''s characteristics, with effects that can be harmful, beneficial or neutral.',19,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_3-04','Give examples of useful applications of mutation','Research and give examples of how induced mutations, including those caused by radiation or chemicals, can be used to develop organisms with useful characteristics.',20,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_3-05','Evaluate impacts of DNA technology','Research and discuss applications of DNA technology in medicine, agriculture and forensic science, considering biosafety, bioethics and social impacts.',21,'M4-CELL-AND-HOMEOSTASIS'),
('M4-S1_3-06','Explain biodiversity as a result of evolution','Explain and give examples of biodiversity arising from genetic variation, mutation and natural selection over generations.',22,'M4-CELL-AND-HOMEOSTASIS')
) v(code,name,description,sequence_no,topic_code)
join public.learning_topics t on t.code=v.topic_code
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,v.sequence_no,true,'OBEC 2021 source; exact indicator '||v.indicator_code||'. Grade-specific M4 alignment only.',v.classification
from (values
('M4-S1_2-01','ว 1.2 ม.4/1',5,'must_know'),
('M4-S1_2-02','ว 1.2 ม.4/2',6,'must_know'),
('M4-S1_2-03','ว 1.2 ม.4/3',7,'must_know'),
('M4-S1_2-04','ว 1.2 ม.4/4',8,'must_know'),
('M4-S1_2-05','ว 1.2 ม.4/5',9,'must_know'),
('M4-S1_2-06','ว 1.2 ม.4/6',10,'should_know'),
('M4-S1_2-07','ว 1.2 ม.4/7',11,'should_know'),
('M4-S1_2-08','ว 1.2 ม.4/8',12,'must_know'),
('M4-S1_2-09','ว 1.2 ม.4/9',13,'should_know'),
('M4-S1_2-10','ว 1.2 ม.4/10',14,'must_know'),
('M4-S1_2-11','ว 1.2 ม.4/11',15,'must_know'),
('M4-S1_2-12','ว 1.2 ม.4/12',16,'should_know'),
('M4-S1_3-01','ว 1.3 ม.4/1',17,'must_know'),
('M4-S1_3-02','ว 1.3 ม.4/2',18,'must_know'),
('M4-S1_3-03','ว 1.3 ม.4/3',19,'must_know'),
('M4-S1_3-04','ว 1.3 ม.4/4',20,'should_know'),
('M4-S1_3-05','ว 1.3 ม.4/5',21,'must_know'),
('M4-S1_3-06','ว 1.3 ม.4/6',22,'must_know')
) v(code,indicator_code,sequence_no,classification)
join public.learning_objectives o on o.code=v.code
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=true,notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();
commit;