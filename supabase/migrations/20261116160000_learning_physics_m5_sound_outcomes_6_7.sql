-- E&P Learning: M5 Physics additional-learning outcomes 6–7 (sound).
-- Official IPST Physics curriculum-use manual, printed pp. 136–138.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_education_systems es on es.id=c.education_system_id join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5' where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M5 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'OSCILLATIONS-WAVES','Oscillations and Waves','Simple harmonic motion, natural frequency, resonance, wave behaviour and sound in the M5 Physics additional-learning programme.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-SOUND','Sound, Hearing and Sound Phenomena','M5 additional Physics outcomes 6–7: sound intensity, sound level, hearing, sound quality, noise pollution, resonance in air columns, beats, standing waves, Doppler effect and shock waves.',6,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='PHYSICS' and sk.code='OSCILLATIONS-WAVES'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-PHY-SOUND-06','Explain sound intensity, sound level, hearing and noise pollution','Explain sound intensity and sound level, their relationship to source power and distance, the role of frequency and the ear in hearing, sound quality, and the effects and prevention of noise pollution; calculate sound intensity and sound level. ',6),
 ('M5-PHY-SOUND-PHENOMENA-07','Investigate resonance, beats, standing sound waves and Doppler effects','Investigate resonance of air in a pipe open at one end; explain beats, standing sound waves, the Doppler effect and sonic shock waves; calculate related quantities and describe practical applications of sound.',7)
) as v(code,name,description,seq)
where s.code='PHYSICS' and tp.code='M5-PHY-SOUND'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,case ob.code when 'M5-PHY-SOUND-06' then 6 else 7 end,true,
case ob.code when 'M5-PHY-SOUND-06' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 6; IPST Physics curriculum-use manual, printed p. 136.'
else 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 learning outcome 7; IPST Physics curriculum-use manual, printed p. 138.' end
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where ob.code in ('M5-PHY-SOUND-06','M5-PHY-SOUND-PHENOMENA-07') and tp.code='M5-PHY-SOUND'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
