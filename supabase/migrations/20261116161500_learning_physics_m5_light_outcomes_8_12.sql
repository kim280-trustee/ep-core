-- E&P Learning: M5 Physics additional-learning outcomes 8 and 12 (light).
-- Official IPST Physics curriculum-use manual, printed pp. 141 and 147.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_education_systems es on es.id=c.education_system_id join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5' where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M5 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'LIGHT-OPTICS','Light and Optical Phenomena','Wave optics, reflection, refraction, image formation, colour and natural optical phenomena in the M5 Physics additional-learning programme.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-LIGHT-WAVES','Wave Optics: Interference and Diffraction','M5 additional Physics outcome 8: interference and diffraction of light using double slits, diffraction gratings and single slits.',8,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='LIGHT-OPTICS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-LIGHT-PHENOMENA','Natural Phenomena Involving Light','M5 additional Physics outcome 12: rainbows, halos, mirages and colours of the sky explained by optical principles.',12,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='LIGHT-OPTICS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-PHY-LIGHT-INTERFERENCE-08','Explain interference and diffraction of light','Explain and investigate interference and diffraction of light using a double slit, diffraction grating and single slit; interpret fringe and diffraction patterns and calculate related quantities using wavelength, slit spacing, screen distance and fringe position.',8,'M5-PHY-LIGHT-WAVES'),
 ('M5-PHY-LIGHT-PHENOMENA-12','Explain natural optical phenomena','Explain natural phenomena involving light, including primary and secondary rainbows, halos, mirages and the changing colours of the sky, using reflection, refraction, dispersion and total internal reflection where appropriate.',12,'M5-PHY-LIGHT-PHENOMENA')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
case ob.code when 'M5-PHY-LIGHT-INTERFERENCE-08' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 8; IPST Physics curriculum-use manual, printed p. 141.'
else 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 12; IPST Physics curriculum-use manual, printed p. 147.' end
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where ob.code in ('M5-PHY-LIGHT-INTERFERENCE-08','M5-PHY-LIGHT-PHENOMENA-12') and tp.code in ('M5-PHY-LIGHT-WAVES','M5-PHY-LIGHT-PHENOMENA')
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
