-- E&P Learning: M6 Chemistry, additional-study strand 1, outcomes 1-15 (organic compounds and polymers).
-- Official OBEC revised curriculum B.E. 2560 (2017), Chemistry, p. 117.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
 where s.code='CHEMISTRY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Chemistry subject and M6 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ORGANIC-CHEMISTRY-POLYMERS','Organic Chemistry and Polymers','Organic structures, functional groups, nomenclature, isomerism, reactions, polymerisation, material properties, applications and environmental impacts.','active'
from public.learning_subjects s where s.code='CHEMISTRY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M6-ORGANIC-COMPOUNDS-AND-POLYMERS','Organic Compounds and Polymers','M6 Chemistry strand 1 outcomes 1-15: organic structures and representations, functional groups, IUPAC naming, structural isomers, physical properties, hydrocarbon and functional-group reactions, polymerisation, polymer properties, testing, applications and environmental impacts.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='CHEMISTRY' and sk.code='ORGANIC-CHEMISTRY-POLYMERS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M6-CHEM-ORG-01','Identify organic compounds in everyday life','Research and present examples of everyday organic compounds containing single, double or triple carbon-carbon bonds and explain their uses.',1),
('M6-CHEM-ORG-02','Represent organic structures in different formats','Write Lewis, condensed and skeletal structural formulae for representative organic compounds and interpret the information each representation communicates.',2),
('M6-CHEM-ORG-03','Classify organic compounds by functional group','Analyse molecular structures and identify organic compound classes from their characteristic functional groups.',3),
('M6-CHEM-ORG-04','Name organic compounds using IUPAC rules','Draw structural formulae and name representative organic compounds containing no more than one principal functional group using appropriate IUPAC conventions.',4),
('M6-CHEM-ORG-05','Construct structural isomers','Draw and distinguish structural isomers of representative organic compounds and explain how connectivity differs while molecular formula remains the same.',5),
('M6-CHEM-ORG-06','Compare physical properties of organic compounds','Analyse and compare boiling points and water solubility using functional group, molecular size, branching and intermolecular-force evidence.',6),
('M6-CHEM-ORG-07','Predict reactions of hydrocarbons','Classify hydrocarbons and predict products for representative combustion, bromine-addition or oxidation reactions with potassium permanganate.',7),
('M6-CHEM-ORG-08','Explain reactions of organic functional groups','Write equations and explain esterification, amide synthesis, hydrolysis and saponification using appropriate reactants and products.',8),
('M6-CHEM-ORG-09','Investigate selected organic reactions','Interpret or carry out teacher-approved tests for esterification, hydrolysis and saponification and record evidence supporting the reaction interpretation.',9),
('M6-CHEM-ORG-10','Evaluate organic compound applications','Research and present uses of organic compounds in everyday life and industry, considering benefits, hazards and responsible handling.',10),
('M6-CHEM-POLY-11','Classify polymerisation reactions','Identify addition and condensation polymerisation from monomer and polymer structures and explain the structural evidence for each type.',11),
('M6-CHEM-POLY-12','Relate polymer structure to properties and uses','Analyse how polymer chain structure, branching, cross-linking and intermolecular forces influence material properties and applications.',12),
('M6-CHEM-POLY-13','Identify plastics and rubber products','Use appropriate teacher-approved observations or supplied data to distinguish common plastic and rubber types and connect material properties to uses.',13),
('M6-CHEM-POLY-14','Explain how polymer modification changes properties','Explain how changing polymer structure or synthesis conditions can alter properties and evaluate examples of polymer modification.',14),
('M6-CHEM-POLY-15','Evaluate polymer impacts and responsible management','Research environmental and social impacts of polymer use and disposal and propose evidence-based approaches to reduce harm.',15)
) as o(code,name,description,seq) on true
where s.code='CHEMISTRY' and tp.code='M6-ORGANIC-COMPOUNDS-AND-POLYMERS'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Chemistry strand 1, M6 learning outcome '||a.seq||'; official source p. 117.'
from (values
('M6-CHEM-ORG-01',1),('M6-CHEM-ORG-02',2),('M6-CHEM-ORG-03',3),('M6-CHEM-ORG-04',4),('M6-CHEM-ORG-05',5),
('M6-CHEM-ORG-06',6),('M6-CHEM-ORG-07',7),('M6-CHEM-ORG-08',8),('M6-CHEM-ORG-09',9),('M6-CHEM-ORG-10',10),
('M6-CHEM-POLY-11',11),('M6-CHEM-POLY-12',12),('M6-CHEM-POLY-13',13),('M6-CHEM-POLY-14',14),('M6-CHEM-POLY-15',15)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='CHEMISTRY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
