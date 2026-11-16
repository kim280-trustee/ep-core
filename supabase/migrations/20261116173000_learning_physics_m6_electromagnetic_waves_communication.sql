-- E&P Learning: M6 Physics verified electricity outcomes 7–8.
-- Official IPST Physics curriculum-use manual, printed pp. 178–179, both under M6.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_education_systems es on es.id=c.education_system_id join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6' where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M6 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ELECTRICITY-MAGNETISM','Electricity and Magnetism','Magnetic fields, electromagnetic induction, AC, electromagnetic waves and communication in M6 additional Physics.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-ELECTROMAGNETIC-WAVES-07','Electromagnetic Waves and Polarisation','M6 additional Physics outcome 7: electromagnetic-wave generation and properties, spectrum, unpolarised and linearly polarised light, polaroid sheets and applications.',7),
 ('M6-PHY-ELECTROMAGNETIC-COMMUNICATION-08','Communication Using Electromagnetic Waves','M6 additional Physics outcome 8: transmission of information using electromagnetic waves and comparison of analogue and digital signals.',8)
) as v(code,name,description,seq)
where s.code='PHYSICS' and sk.code='ELECTRICITY-MAGNETISM'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-ELECTROMAGNETIC-WAVES-07','Explain electromagnetic waves and polarisation','Explain how electromagnetic waves arise from changing electric and magnetic fields; describe their transverse nature and spectrum; explain unpolarised light, linearly polarised light and polaroid sheets; describe applications of electromagnetic waves across frequency bands and related devices.',7,'M6-PHY-ELECTROMAGNETIC-WAVES-07'),
 ('M6-PHY-ELECTROMAGNETIC-COMMUNICATION-08','Explain communication using electromagnetic waves','Investigate and explain how electromagnetic waves transmit information; describe the basic stages of a communication system and compare analogue and digital signal transmission.',8,'M6-PHY-ELECTROMAGNETIC-COMMUNICATION-08')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
case ob.code
 when 'M6-PHY-ELECTROMAGNETIC-WAVES-07' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 learning outcome 7; IPST Physics curriculum-use manual, printed p. 178.'
 else 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 learning outcome 8; IPST Physics curriculum-use manual, printed p. 179.' end
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
where ob.code in ('M6-PHY-ELECTROMAGNETIC-WAVES-07','M6-PHY-ELECTROMAGNETIC-COMMUNICATION-08')
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
