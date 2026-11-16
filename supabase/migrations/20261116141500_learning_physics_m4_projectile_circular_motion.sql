-- E&P Learning: M4 Physics, verified curved-motion outcomes 16-17.
-- Official IPST Physics curriculum-use manual and IPST outcome-to-indicator crosswalk.
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
select s.id,'CURVED-MOTION','Curved Motion','Projectile motion, uniform circular motion, centripetal force and satellite motion.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-CURVED-MOTION','Projectile and Circular Motion','Verified M4 Physics additional-learning outcomes 16-17: projectile motion; uniform circular motion, centripetal force and satellite orbits.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='PHYSICS' and sk.code='CURVED-MOTION'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M4-PHY-PROJECTILE-16','Explain, analyse and calculate projectile motion','Explain, analyse and calculate quantities for parabolic motion under a uniform gravitational field when air resistance is neglected; recognise that horizontal and vertical motion occur simultaneously and are independent, and investigate projectile motion.',16),
('M4-PHY-CIRCULAR-17','Investigate and calculate uniform circular motion','Investigate and explain the relationships among centripetal force, orbital radius, linear speed, angular speed and object mass for circular motion in a horizontal plane; calculate related quantities and apply circular-motion principles to satellite orbits.',17)
) as o(code,name,description,seq) on true
where s.code='PHYSICS' and tp.code='M4-CURVED-MOTION'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M4 learning outcome '||a.seq||'; IPST Physics curriculum-use manual and official outcome-to-indicator crosswalk.'
from (values ('M4-PHY-PROJECTILE-16',16),('M4-PHY-CIRCULAR-17',17)) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
