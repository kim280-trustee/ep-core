-- E&P Learning: M4 Physics, verified work and power outcome 10.
-- Official IPST Physics curriculum-use manual, M4, printed p. 112.
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
select s.id,'WORK-ENERGY','Work and Mechanical Energy','Work, kinetic and potential energy, elastic potential energy, and the work-energy relationship.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-WORK-ENERGY','Work, Energy and Conservation of Mechanical Energy','Verified M4 Physics additional-learning outcomes 10-12: work, power, energy, work-energy theorem and conservation of mechanical energy.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='PHYSICS' and sk.code='WORK-ENERGY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M4-PHY-WORK-10','Analyse and calculate work and average power','Analyse and calculate the work done by a constant force using the work equation and the area under a force–displacement graph, and explain and calculate average power.',10)
) as o(code,name,description,seq) on true
where s.code='PHYSICS' and tp.code='M4-WORK-ENERGY'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,10,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M4 learning outcome 10; IPST Physics curriculum-use manual, printed p. 112.'
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
where ob.code='M4-PHY-WORK-10' and tp.code='M4-WORK-ENERGY'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
