-- E&P Learning: M5 Chemistry, additional-study strand 1, outcomes 1-6 (gas laws).
-- Official OBEC revised curriculum B.E. 2560 (2017), Chemistry, p. 117.
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
select s.id,'GAS-LAWS','Gas Laws and Kinetic Molecular Theory','Relationships among gas pressure, volume, temperature and amount; ideal-gas behaviour, partial pressures, diffusion and applications.','active'
from public.learning_subjects s where s.code='CHEMISTRY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-GAS-LAWS-AND-PROPERTIES','Gas Laws and Properties','M5 Chemistry strand 1 outcomes 1-6: Boyle, Charles and Gay-Lussac laws, combined gas law, Avogadro and ideal gas laws, Dalton partial pressures, kinetic molecular theory, Graham diffusion and real-world applications.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='CHEMISTRY' and sk.code='GAS-LAWS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M5-CHEM-GAS-01','Apply Boyle, Charles and Gay-Lussac laws','Explain and calculate relationships among gas volume, pressure and absolute temperature when the other relevant variable is held constant; convert temperatures to kelvin.',1),
('M5-CHEM-GAS-02','Solve problems using the combined gas law','Calculate a gas variable when pressure, volume and temperature change between two states for a fixed amount of gas, stating assumptions and units.',2),
('M5-CHEM-GAS-03','Apply Avogadro and ideal gas laws','Calculate gas volume, pressure, temperature, amount or mass using Avogadro relationships and the ideal gas equation, with consistent units.',3),
('M5-CHEM-GAS-04','Calculate partial pressures in gas mixtures','Use Dalton partial-pressure relationships to calculate component partial pressures, mole fractions or amounts in a gas mixture.',4),
('M5-CHEM-GAS-05','Explain gas diffusion and apply Graham law','Use kinetic molecular theory to explain gas diffusion and calculate or compare diffusion rates using molar masses and Graham law.',5),
('M5-CHEM-GAS-06','Evaluate applications of gas properties and gas laws','Research and explain applications of gas properties and gas laws in everyday phenomena and industry, evaluating evidence and limitations of ideal-gas assumptions.',6)
) as o(code,name,description,seq) on true
where s.code='CHEMISTRY' and tp.code='M5-GAS-LAWS-AND-PROPERTIES'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Chemistry strand 1, M5 learning outcome '||a.seq||'; official source p. 117.'
from (values
('M5-CHEM-GAS-01',1),('M5-CHEM-GAS-02',2),('M5-CHEM-GAS-03',3),
('M5-CHEM-GAS-04',4),('M5-CHEM-GAS-05',5),('M5-CHEM-GAS-06',6)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='CHEMISTRY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
