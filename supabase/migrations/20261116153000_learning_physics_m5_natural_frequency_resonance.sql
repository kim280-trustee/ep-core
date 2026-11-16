-- E&P Learning: M5 Physics additional-learning outcome 2.
-- Official IPST Physics curriculum-use manual, printed page 129.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_education_systems es on es.id=c.education_system_id join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5' where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M5 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'OSCILLATIONS-WAVES','Oscillations and Waves','Simple harmonic motion, natural frequency, resonance and wave behaviour in the M5 Physics additional-learning programme.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-SHM','Simple Harmonic Motion','M5 additional Physics outcomes 1–2: simple harmonic motion, natural frequency and resonance.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='OSCILLATIONS-WAVES'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,'M5-PHY-RESONANCE-02','Explain natural frequency and resonance','Explain the natural frequency of an object and resonance when an external driving frequency matches the natural frequency, increasing the oscillation amplitude.',2,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and tp.code='M5-PHY-SHM'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,2,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 2; IPST Physics curriculum-use manual, printed p. 129.'
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where ob.code='M5-PHY-RESONANCE-02' and tp.code='M5-PHY-SHM'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
