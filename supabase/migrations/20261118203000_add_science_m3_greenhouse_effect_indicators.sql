begin;

-- M3 national Science also includes the two greenhouse-effect indicators
-- under standard ว 3.2. These were missing from the original 51-objective seed.
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M3-CLIMATE-AND-GREENHOUSE','Climate and the Greenhouse Effect',
 'Greenhouse-effect models, effects on living organisms and actions to reduce greenhouse-gas emissions.',
 8,'active'
from public.learning_subjects s
join public.learning_skills sk on sk.subject_id=s.id
where s.code='SCI' and sk.code='EARTH'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics t
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M3-S3_2-08','Model the greenhouse effect and its impacts',
  'Create a model that explains the greenhouse effect and describe its effects on living organisms.',1),
 ('M3-S3_2-09','Propose actions to reduce greenhouse gas emissions',
  'Explain impacts of the greenhouse effect and propose practical actions that reduce activities producing greenhouse gases.',2)
) as v(code,name,description,seq)
where s.code='SCI' and t.code='M3-CLIMATE-AND-GREENHOUSE'
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select o.id,c.id,g.id,v.seq,true,
 'Thailand Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017); official indicator '||v.indicator||'.'
from (values
 ('M3-S3_2-08',8,'ว 3.2 ม.3/8'),
 ('M3-S3_2-09',9,'ว 3.2 ม.3/9')
) as v(code,seq,indicator)
join public.learning_objectives o on o.code=v.code
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills s on s.id=t.skill_id
join public.learning_subjects sub on sub.id=s.subject_id and sub.code='SCI'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' and c.status='active'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M3' and g.status='active'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();

commit;