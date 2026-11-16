-- E&P Learning: M4 Biology, additional-study strand 1, outcomes 1-17.
-- Official OBEC/IPST 2017 revised curriculum, Biology pp. 134-139.
-- Outcomes are not basic-course indicators; align them as M4 learning outcomes.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
 where s.code='BIOLOGY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Biology subject and M4 Science grade are required.'; end if;
end $$;

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'CELL-BIOLOGY','Cell Biology and Scientific Investigation','Nature of life, scientific method, biomolecules, enzymes, microscopy, cell structures, membrane transport, cell division and cellular respiration.','active'
from public.learning_subjects s where s.code='BIOLOGY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-CELLULAR-FOUNDATIONS','Foundations of Life and Cell Biology','M4 Biology additional-study strand 1: nature of life, scientific inquiry, water and elements, biomolecules, metabolism, enzymes, microscopy, cell structure, membrane transport, mitosis, meiosis and cellular respiration.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='BIOLOGY' and sk.code='CELL-BIOLOGY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join (values
 ('M4-BIO-01','Explain characteristics and organisation of living things','Explain key characteristics of living things and how biological organisation from cells to organisms supports life.',1),
 ('M4-BIO-02','Design scientific investigations in biology','Explain the relationships among a research question, hypothesis and test, and design an experiment to test a biological hypothesis.',2),
 ('M4-BIO-03','Explain water properties and essential elements in living things','Describe important properties of water, its role in organisms, and examples of elements essential to living systems.',3),
 ('M4-BIO-04','Describe carbohydrate structure and importance','Describe carbohydrate structure, distinguish monosaccharides, disaccharides and polysaccharides, and explain their importance.',4),
 ('M4-BIO-05','Describe protein structure and importance','Explain that proteins are built from amino acids and describe their biological roles.',5),
 ('M4-BIO-06','Describe lipid structure and importance','Describe major lipid groups, their general properties and their functions in living organisms.',6),
 ('M4-BIO-07','Explain nucleic-acid structure and functions','Describe nucleotide components, distinguish DNA and RNA, and explain their roles in storing and transmitting genetic information.',7),
 ('M4-BIO-08','Explain metabolism in living cells','Explain metabolism as the set of chemical reactions in cells and distinguish energy-releasing and energy-absorbing reactions.',8),
 ('M4-BIO-09','Explain enzyme action and influencing factors','Explain how enzymes catalyse reactions and analyse the effects of temperature, pH and inhibitors on enzyme activity.',9),
 ('M4-BIO-10','Prepare and observe biological specimens with microscopes','Prepare suitable specimens, use a light microscope correctly, estimate specimen size, draw observations and care for the instrument.',10),
 ('M4-BIO-11','Explain cell boundary structure and function','Explain the structure and functions of cell boundaries, including the plasma membrane and cell wall.',11),
 ('M4-BIO-12','Identify organelles and explain their functions','Identify major eukaryotic cell organelles and relate their structures to their functions.',12),
 ('M4-BIO-13','Explain nucleus structure and function','Describe the structure of the nucleus and explain its role in controlling cell activities and containing genetic material.',13),
 ('M4-BIO-14','Compare membrane transport mechanisms','Compare diffusion, osmosis, facilitated diffusion and active transport across cell membranes.',14),
 ('M4-BIO-15','Explain endocytosis and exocytosis','Explain and diagram how cells move large materials into and out of cells by endocytosis and exocytosis.',15),
 ('M4-BIO-16','Observe and compare mitosis and meiosis','Observe, describe and compare mitotic and meiotic nuclear division and explain their biological significance.',16),
 ('M4-BIO-17','Compare aerobic and anaerobic cellular respiration','Explain and compare the stages and products of cellular respiration when oxygen is sufficient and insufficient.',17)
) as o(code,name,description,seq) on true
where s.code='BIOLOGY' and tp.code='M4-CELLULAR-FOUNDATIONS'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,
 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Biology strand 1, M4 learning outcome '||a.seq||'; official source pp. 134-139.'
from (values
 ('M4-BIO-01',1),('M4-BIO-02',2),('M4-BIO-03',3),('M4-BIO-04',4),('M4-BIO-05',5),
 ('M4-BIO-06',6),('M4-BIO-07',7),('M4-BIO-08',8),('M4-BIO-09',9),('M4-BIO-10',10),
 ('M4-BIO-11',11),('M4-BIO-12',12),('M4-BIO-13',13),('M4-BIO-14',14),('M4-BIO-15',15),
 ('M4-BIO-16',16),('M4-BIO-17',17)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='BIOLOGY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id)
do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
