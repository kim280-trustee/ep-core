-- E&P Learning: M5 Physics additional-learning outcomes 9–11 (geometrical optics).
-- Official IPST Physics curriculum-use manual, printed pp. 142–145.
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
select sk.id,'M5-PHY-LIGHT-REFLECTION','Reflection and Mirrors','M5 additional Physics outcome 9: laws of reflection, ray diagrams and image formation by plane and spherical mirrors.',9,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='LIGHT-OPTICS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-LIGHT-REFRACTION','Refraction and Total Internal Reflection','M5 additional Physics outcome 10: Snell law, refractive index, apparent depth, critical angle and total internal reflection.',10,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='LIGHT-OPTICS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-LIGHT-LENSES','Thin Lenses and Image Formation','M5 additional Physics outcome 11: ray diagrams, thin-lens equation, magnification and practical applications of lenses.',11,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='LIGHT-OPTICS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-PHY-LIGHT-REFLECTION-09','Investigate reflection and image formation by mirrors','Investigate and explain reflection using the law of reflection; draw reflected rays and determine image position, size and type for plane and spherical mirrors; calculate related quantities and explain everyday applications.',9,'M5-PHY-LIGHT-REFLECTION'),
 ('M5-PHY-LIGHT-REFRACTION-10','Investigate refraction and total internal reflection','Investigate and explain the relationship between refractive index, angle of incidence and angle of refraction; explain real and apparent depth, critical angle and total internal reflection; calculate related quantities.',10,'M5-PHY-LIGHT-REFRACTION'),
 ('M5-PHY-LIGHT-LENSES-11','Construct images formed by thin lenses','Draw ray diagrams and determine image position, size and type for thin lenses; use the thin-lens equation and magnification relationship to calculate related quantities and explain practical applications.',11,'M5-PHY-LIGHT-LENSES')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
case ob.code
 when 'M5-PHY-LIGHT-REFLECTION-09' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 9; IPST Physics curriculum-use manual, printed pp. 142–143.'
 when 'M5-PHY-LIGHT-REFRACTION-10' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 10; IPST Physics curriculum-use manual, printed pp. 144–145.'
 else 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 11; IPST Physics curriculum-use manual, printed p. 146.'
end
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where ob.code in ('M5-PHY-LIGHT-REFLECTION-09','M5-PHY-LIGHT-REFRACTION-10','M5-PHY-LIGHT-LENSES-11') and tp.code in ('M5-PHY-LIGHT-REFLECTION','M5-PHY-LIGHT-REFRACTION','M5-PHY-LIGHT-LENSES')
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
