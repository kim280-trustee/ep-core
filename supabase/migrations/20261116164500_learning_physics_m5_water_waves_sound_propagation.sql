-- E&P Learning: M5 Physics additional-learning outcomes 4–5 (water waves and sound).
-- Official IPST Physics curriculum-use manual outcome register; M5 outcomes 4 and 5.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_education_systems es on es.id=c.education_system_id join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5' where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M5 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'OSCILLATIONS-WAVES','Oscillations and Waves','Simple harmonic motion, wave behaviour, water waves, sound and hearing in the M5 Physics additional-learning programme.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-WATER-WAVES','Water-wave Reflection, Refraction, Interference and Diffraction','M5 additional Physics outcome 4: observe and explain reflection, refraction, interference and diffraction of surface water waves and calculate related quantities.',4,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='OSCILLATIONS-WAVES'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-SOUND-PROPAGATION','Sound Production and Propagation','M5 additional Physics outcome 5: explain sound production and propagation, particle-displacement and pressure waves, sound speed and its dependence on air temperature, and sound-wave properties.',5,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='OSCILLATIONS-WAVES'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-PHY-WATER-WAVES-04','Investigate the behaviour of surface water waves','Observe and explain reflection, refraction, interference and diffraction of surface water waves; use wavefronts and ray directions to describe changes at boundaries and openings; calculate related quantities using wave speed, frequency, wavelength and angles.',4,'M5-PHY-WATER-WAVES'),
 ('M5-PHY-SOUND-PROPAGATION-05','Explain the production and propagation of sound','Explain how vibrating sources produce sound and how sound propagates through a medium; relate particle displacement to pressure variations; explain sound speed in air and its dependence on temperature in degrees Celsius; describe sound as a mechanical longitudinal wave and calculate related quantities.',5,'M5-PHY-SOUND-PROPAGATION')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
case ob.code when 'M5-PHY-WATER-WAVES-04' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 4; IPST Physics curriculum-use manual, outcome register and wave-behaviour content.'
else 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 5; IPST Physics curriculum-use manual, outcome register and sound content.' end
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where ob.code in ('M5-PHY-WATER-WAVES-04','M5-PHY-SOUND-PROPAGATION-05') and tp.code in ('M5-PHY-WATER-WAVES','M5-PHY-SOUND-PROPAGATION')
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
