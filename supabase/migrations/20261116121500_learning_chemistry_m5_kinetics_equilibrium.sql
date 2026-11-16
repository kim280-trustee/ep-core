-- E&P Learning: M5 Chemistry, additional-study strand 2, outcomes 1-13.
-- Official OBEC revised curriculum B.E. 2560 (2017), Chemistry, pp. 118-119.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
 where s.code='CHEMISTRY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Chemistry subject and M5 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'KINETICS-EQUILIBRIUM','Reaction Kinetics and Chemical Equilibrium','Reaction rates, collision theory, reversible reactions, dynamic equilibrium, equilibrium constants and equilibrium applications.','active'
from public.learning_subjects s where s.code='CHEMISTRY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-CHEMICAL-KINETICS-EQUILIBRIUM','Chemical Kinetics and Equilibrium','M5 Chemistry strand 2 outcomes 1-13: reaction progress, rates, collision theory, factors affecting rate, reversible reactions, equilibrium calculations, Le Chatelier principle and applications.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='CHEMISTRY' and sk.code='KINETICS-EQUILIBRIUM'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M5-CHEM-KINETICS-01','Measure and graph reaction progress','Plan or interpret a suitable investigation and graph the measured increase or decrease of a substance as a reaction proceeds.',1),
('M5-CHEM-KINETICS-02','Calculate reaction rates and infer concentration changes','Calculate average reaction rate from measured data and use stoichiometric relationships to graph concentration changes for substances not directly measured.',2),
('M5-CHEM-KINETICS-03','Explain collision orientation and activation energy','Use particle-collision diagrams and energy profiles to explain how collision orientation and activation energy influence reaction rate.',3),
('M5-CHEM-KINETICS-04','Investigate factors affecting reaction rate','Explain evidence from controlled investigations of concentration, reactant surface area, temperature and catalysts on reaction rate.',4),
('M5-CHEM-KINETICS-05','Compare reaction rates under changed conditions','Compare reaction rates when concentration, surface area, temperature or catalyst conditions change, identifying controlled variables.',5),
('M5-CHEM-KINETICS-06','Apply reaction-rate factors to real contexts','Explain examples of factors affecting reaction rate in everyday life and industry using particle-level reasoning.',6),
('M5-CHEM-EQUIL-07','Explain reversible reactions and dynamic equilibrium','Use evidence or models to distinguish reversible reactions from reactions that proceed effectively in one direction and explain dynamic equilibrium.',7),
('M5-CHEM-EQUIL-08','Describe concentration and rate changes toward equilibrium','Explain how reactant and product concentrations and forward and reverse rates change from reaction start until equilibrium is established.',8),
('M5-CHEM-EQUIL-09','Calculate equilibrium constants','Write an equilibrium-constant expression for a reaction and calculate its value from equilibrium concentrations.',9),
('M5-CHEM-EQUIL-10','Calculate equilibrium concentrations','Use initial conditions, stoichiometry and an equilibrium constant to determine unknown equilibrium concentrations.',10),
('M5-CHEM-EQUIL-11','Solve equilibrium problems for multistep reactions','Combine equilibrium relationships for linked reactions and calculate an overall equilibrium constant or unknown equilibrium concentration.',11),
('M5-CHEM-EQUIL-12','Predict equilibrium shifts using Le Chatelier principle','Identify disturbances to an equilibrium system and predict the direction of shift; distinguish effects on equilibrium position from effects on the equilibrium constant.',12),
('M5-CHEM-EQUIL-13','Explain equilibrium in biological natural and industrial systems','Use examples from living systems, natural phenomena and industrial processes to explain the importance of chemical equilibrium.',13)
) as o(code,name,description,seq) on true
where s.code='CHEMISTRY' and tp.code='M5-CHEMICAL-KINETICS-EQUILIBRIUM'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Chemistry strand 2, M5 learning outcome '||a.seq||'; official source pp. 118-119.'
from (values
('M5-CHEM-KINETICS-01',1),
('M5-CHEM-KINETICS-02',2),
('M5-CHEM-KINETICS-03',3),
('M5-CHEM-KINETICS-04',4),
('M5-CHEM-KINETICS-05',5),
('M5-CHEM-KINETICS-06',6),
('M5-CHEM-EQUIL-07',7),
('M5-CHEM-EQUIL-08',8),
('M5-CHEM-EQUIL-09',9),
('M5-CHEM-EQUIL-10',10),
('M5-CHEM-EQUIL-11',11),
('M5-CHEM-EQUIL-12',12),
('M5-CHEM-EQUIL-13',13)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='CHEMISTRY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
