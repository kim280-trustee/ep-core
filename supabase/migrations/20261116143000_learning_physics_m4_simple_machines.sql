-- E&P Learning: M4 Physics, verified simple-machines outcome 13.
-- Official IPST Physics curriculum-use manual, M4 additional-learning outcome 13.
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
select s.id,'SIMPLE-MACHINES','Simple Machines','Work, mechanical advantage and efficiency of common simple machines.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-SIMPLE-MACHINES','Simple Machines: Work, Efficiency and Mechanical Advantage','Verified M4 Physics additional-learning outcome 13: operation, efficiency and mechanical advantage of selected simple machines.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='PHYSICS' and sk.code='SIMPLE-MACHINES'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,'M4-PHY-SIMPLE-MACHINES-13','Explain and calculate simple-machine efficiency and mechanical advantage','Explain how selected simple machines operate using the principles of work and mechanical equilibrium; calculate efficiency and mechanical advantage for levers, pulleys, inclined planes, wedges, screws, and wheel-and-axle systems.',13,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
where s.code='PHYSICS' and tp.code='M4-SIMPLE-MACHINES'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,13,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M4 learning outcome 13; IPST Physics curriculum-use manual.'
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
where ob.code='M4-PHY-SIMPLE-MACHINES-13'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
