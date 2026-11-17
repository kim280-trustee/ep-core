-- E&P Learning: M6 Physics Group 4 outcomes 1–9 (thermal physics, solids, fluids and gases).
-- Official IPST Physics curriculum-use manual, M6 outcomes table, printed pp. 37–43.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_education_systems es on es.id=c.education_system_id join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6' where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M6 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'THERMAL-FLUIDS','Thermal Physics, Solids, Fluids and Gases','M6 additional Physics outcomes covering heat, elasticity, fluid statics and dynamics, gas laws and thermodynamics.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.seq::integer,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-01','THERMAL-ENERGY','Heat, Temperature Change and Phase Change','M6 additional Physics outcome 1: Explain and calculate heat that changes temperature, heat that changes state, and heat transfer using conservation of energy.',1::integer),
 ('M6-PHY-02','ELASTICITY-YOUNGS-MODULUS','Elasticity, Stress, Strain and Young''s Modulus','M6 additional Physics outcome 2: Explain elastic deformation and calculate longitudinal stress, strain and Young''s modulus; apply material elasticity to everyday contexts.',2),
 ('M6-PHY-03','FLUID-PRESSURE','Gauge, Absolute and Atmospheric Pressure','M6 additional Physics outcome 3: Calculate gauge and absolute pressure and explain manometers, barometers and hydraulic presses.',3),
 ('M6-PHY-04','BUOYANCY-ARCHIMEDES','Buoyancy and Archimedes'' Principle','M6 additional Physics outcome 4: Investigate, explain and calculate buoyant force from a fluid using Archimedes'' principle.',4),
 ('M6-PHY-05','SURFACE-TENSION-VISCOSITY','Surface Tension and Viscosity','M6 additional Physics outcome 5: Investigate and calculate surface tension and explain viscous force in liquids.',5),
 ('M6-PHY-06','IDEAL-FLUID-BERNOULLI','Ideal Fluids, Continuity and Bernoulli''s Equation','M6 additional Physics outcome 6: Explain ideal-fluid properties, apply continuity and Bernoulli equations, and connect them to devices.',6),
 ('M6-PHY-07','IDEAL-GAS-LAWS','Ideal Gas Law','M6 additional Physics outcome 7: Explain the ideal-gas model and calculate pressure, volume, temperature or amount using PV = nRT.',7),
 ('M6-PHY-08','KINETIC-THEORY-GAS','Kinetic Theory and RMS Molecular Speed','M6 additional Physics outcome 8: Explain the ideal-gas molecular model, kinetic theory, and calculate mean kinetic energy and RMS molecular speed.',8),
 ('M6-PHY-09','THERMODYNAMICS-FIRST-LAW','Gas Work and the First Law of Thermodynamics','M6 additional Physics outcome 9: Calculate work by a gas at constant pressure and explain the relationship among heat, internal energy and work; apply internal energy to everyday devices.',9)
) as v(code,name,description,seq)
where s.code='PHYSICS' and sk.code='THERMAL-FLUIDS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq::integer,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-01','Heat, Temperature Change and Phase Change','Explain and calculate heat that changes temperature, heat that changes state, and heat transfer using conservation of energy.',1::integer,'M6-PHY-01'),
 ('M6-PHY-02','Elasticity, Stress, Strain and Young''s Modulus','Explain elastic deformation and calculate longitudinal stress, strain and Young''s modulus; apply material elasticity to everyday contexts.',2,'M6-PHY-02'),
 ('M6-PHY-03','Gauge, Absolute and Atmospheric Pressure','Calculate gauge and absolute pressure and explain manometers, barometers and hydraulic presses.',3,'M6-PHY-03'),
 ('M6-PHY-04','Buoyancy and Archimedes'' Principle','Investigate, explain and calculate buoyant force from a fluid using Archimedes'' principle.',4,'M6-PHY-04'),
 ('M6-PHY-05','Surface Tension and Viscosity','Investigate and calculate surface tension and explain viscous force in liquids.',5,'M6-PHY-05'),
 ('M6-PHY-06','Ideal Fluids, Continuity and Bernoulli''s Equation','Explain ideal-fluid properties, apply continuity and Bernoulli equations, and connect them to devices.',6,'M6-PHY-06'),
 ('M6-PHY-07','Ideal Gas Law','Explain the ideal-gas model and calculate pressure, volume, temperature or amount using PV = nRT.',7,'M6-PHY-07'),
 ('M6-PHY-08','Kinetic Theory and RMS Molecular Speed','Explain the ideal-gas molecular model, kinetic theory, and calculate mean kinetic energy and RMS molecular speed.',8,'M6-PHY-08'),
 ('M6-PHY-09','Gas Work and the First Law of Thermodynamics','Calculate work by a gas at constant pressure and explain the relationship among heat, internal energy and work; apply internal energy to everyday devices.',9,'M6-PHY-09')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 Group 4 outcome '||ob.sequence_no||'; official IPST Physics curriculum-use manual, M6 outcomes table, printed pp. 37–43.'
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
where ob.code in ('M6-PHY-01','M6-PHY-02','M6-PHY-03','M6-PHY-04','M6-PHY-05','M6-PHY-06','M6-PHY-07','M6-PHY-08','M6-PHY-09')
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
