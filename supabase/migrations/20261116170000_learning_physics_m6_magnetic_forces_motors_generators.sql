-- E&P Learning: M6 Physics verified outcomes 2, 3 and 6.
-- Official IPST Physics curriculum-use manual, printed pp. 171, 173 and 177.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_education_systems es on es.id=c.education_system_id join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6' where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M6 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ELECTRICITY-MAGNETISM','Electricity and Magnetism','Magnetic forces, electric motors, galvanometers, AC generators and transformers in M6 additional Physics.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M6-PHY-MAGNETIC-FORCES','Magnetic Forces on Charges and Conductors','M6 additional Physics outcome 2: magnetic force on moving charged particles and current-carrying conductors, circular motion in magnetic fields and forces between parallel conductors.',2,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='ELECTRICITY-MAGNETISM'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M6-PHY-MOTORS-GALVANOMETERS','Galvanometers and DC Motors','M6 additional Physics outcome 3: torque on a current-carrying coil and operating principles of galvanometers and DC motors.',3,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='ELECTRICITY-MAGNETISM'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M6-PHY-AC-GENERATORS-TRANSFORMERS','AC Generators and Transformers','M6 additional Physics outcome 6: three-phase AC generators, transformer operation and calculations involving induced emf and turns ratio.',6,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='ELECTRICITY-MAGNETISM'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-MAGNETIC-FORCES-02','Explain and calculate magnetic forces on charges and conductors','Explain and calculate magnetic force on a charged particle moving in a magnetic field and on a current-carrying conductor; determine the radius of circular motion when a charged particle enters perpendicular to a uniform magnetic field; explain the force between parallel current-carrying conductors.',2,'M6-PHY-MAGNETIC-FORCES'),
 ('M6-PHY-MOTORS-GALVANOMETERS-03','Explain galvanometer and DC motor operation','Explain the torque on a current-carrying coil in a magnetic field and use this principle to explain the operation of a moving-coil galvanometer and a direct-current motor; calculate related quantities.',3,'M6-PHY-MOTORS-GALVANOMETERS'),
 ('M6-PHY-AC-GENERATORS-TRANSFORMERS-06','Explain three-phase AC generators and transformers','Explain the operating principle and applications of a three-phase alternating-current generator and explain how transformers increase or decrease emf by electromagnetic induction; calculate related quantities using transformer relationships.',6,'M6-PHY-AC-GENERATORS-TRANSFORMERS')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
case ob.code
 when 'M6-PHY-MAGNETIC-FORCES-02' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 learning outcome 2; IPST Physics curriculum-use manual, printed p. 171.'
 when 'M6-PHY-MOTORS-GALVANOMETERS-03' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 learning outcome 3; IPST Physics curriculum-use manual, printed p. 173.'
 else 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 learning outcome 6; IPST Physics curriculum-use manual, printed p. 177.' end
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
where ob.code in ('M6-PHY-MAGNETIC-FORCES-02','M6-PHY-MOTORS-GALVANOMETERS-03','M6-PHY-AC-GENERATORS-TRANSFORMERS-06')
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
