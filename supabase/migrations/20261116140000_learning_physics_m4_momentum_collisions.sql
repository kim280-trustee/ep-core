-- E&P Learning: M4 Physics, verified momentum and collisions outcomes 14-15.
-- Official IPST Physics curriculum-use manual, M4, printed pp. 118-120.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
 where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M4 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'MOMENTUM-COLLISIONS','Momentum and Collisions','Momentum, impulse, impulse force, force-time graphs, collisions and conservation of momentum.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-MOMENTUM-COLLISIONS','Momentum, Impulse and Collisions','Verified M4 Physics additional-learning outcomes 14-15: momentum and impulse; one-dimensional collisions and conservation of momentum.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='PHYSICS' and sk.code='MOMENTUM-COLLISIONS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M4-PHY-MOMENTUM-14','Explain and calculate momentum and impulse','Explain and calculate the momentum of an object; explain the relationship between impulse force, momentum and impulse; and calculate impulse using equations and the area under a resultant-force versus time graph.',14),
('M4-PHY-COLLISION-15','Investigate and calculate one-dimensional collisions','Investigate, explain and calculate quantities for one-dimensional elastic and inelastic collisions and one-dimensional separation events, applying conservation of momentum when there is no external resultant force on the system.',15)
) as o(code,name,description,seq) on true
where s.code='PHYSICS' and tp.code='M4-MOMENTUM-COLLISIONS'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M4 learning outcome '||a.seq||'; IPST Physics curriculum-use manual, printed pp. '||a.pages||'.'
from (values ('M4-PHY-MOMENTUM-14',14,'118-119'),('M4-PHY-COLLISION-15',15,'119-120')) as a(code,seq,pages)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
