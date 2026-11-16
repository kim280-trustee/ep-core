-- E&P Learning: M4 Physics, verified mechanics outcomes 8-9.
-- Official IPST Physics curriculum-use manual, M4, pp. 108-110.
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
select s.id,'MECHANICS-EQUILIBRIUM','Mechanical Equilibrium and Stability','Static and dynamic equilibrium, moments, couples, centre of mass, centre of gravity and stability of objects.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-MECHANICAL-EQUILIBRIUM','Equilibrium, Centre of Mass and Stability','Verified M4 Physics additional-learning outcomes 8-9: mechanical equilibrium, moments, couples, free-body diagrams, centre of mass, centre of gravity and stability.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='PHYSICS' and sk.code='MECHANICS-EQUILIBRIUM'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M4-PHY-MECH-08','Analyse mechanical equilibrium, moments and couples','Explain translational and rotational equilibrium; calculate moments and resultant moments; analyse couples; draw free-body diagrams for objects in mechanical equilibrium; and investigate equilibrium of three forces.',8),
('M4-PHY-MECH-09','Explain centre of mass, centre of gravity and stability','Observe and explain how a force through an object’s centre of mass affects its motion, distinguish centre of mass from centre of gravity, and analyse how centre-of-gravity position affects stability.',9)
) as o(code,name,description,seq) on true
where s.code='PHYSICS' and tp.code='M4-MECHANICAL-EQUILIBRIUM'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M4 learning outcome '||a.seq||'; IPST Physics curriculum-use manual, pp. '||a.pages||'.'
from (values ('M4-PHY-MECH-08',8,'108-109'),('M4-PHY-MECH-09',9,'110')) as a(code,seq,pages)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
