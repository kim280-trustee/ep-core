-- E&P Learning: M5 Physics Group 4 outcomes 15 and 18.
-- Official IPST comparison crosswalk explicitly allocates these outcomes to M5,
-- not M6. Outcome 15: nuclear forces/stability/binding energy; outcome 18: particle physics.
begin;
do $$ begin
 if not exists(
  select 1 from public.learning_subjects s
  join public.learning_curricula c on c.code='TH-SCI-M1-M6'
  join public.learning_education_systems es on es.id=c.education_system_id
  join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
  where s.code='PHYSICS' and es.code='TH_BASIC'
    and s.status='active' and c.status='active' and g.status='active'
 ) then raise exception 'Active Physics subject and M5 Science grade are required.'; end if;
end $$;

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'M5-MODERN-NUCLEAR-PHYSICS','Nuclear Structure and Particle Physics',
 'M5 additional Physics outcomes covering nuclear forces, nuclear stability, binding energy and particle-physics research.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update
set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_skills sk
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-PHY-15','NUCLEAR-FORCES-BINDING-ENERGY','Nuclear Forces, Stability and Binding Energy','M5 Group 4 outcome 15: explain nuclear forces, nuclear stability and binding energy; calculate related quantities.',15),
 ('M5-PHY-18','PARTICLE-PHYSICS-STANDARD-MODEL','Particle Physics Research and the Standard Model','M5 Group 4 outcome 18: explain particle-physics research, the Standard Model and applications of particle-physics research.',18)
) as v(code,topic_code,name,description,seq)
where s.code='PHYSICS' and sk.code='M5-MODERN-NUCLEAR-PHYSICS'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-PHY-15','Nuclear Forces, Stability and Binding Energy','Explain nuclear forces, nuclear stability and binding energy; calculate related quantities.',15,'M5-PHY-15'),
 ('M5-PHY-18','Particle Physics Research and the Standard Model','Explain particle-physics research, the Standard Model and applications of particle-physics research.',18,'M5-PHY-18')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code and sk.code='M5-MODERN-NUCLEAR-PHYSICS'
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 Group 4 outcome '||ob.sequence_no||'; official IPST outcome-to-indicator comparison crosswalk explicitly allocates this outcome to M5.'
from public.learning_objectives ob
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where ob.code in ('M5-PHY-15','M5-PHY-18')
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
