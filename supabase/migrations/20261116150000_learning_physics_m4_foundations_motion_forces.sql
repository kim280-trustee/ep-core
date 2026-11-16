-- E&P Learning: M4 Physics outcomes 1-7, extracted from the official IPST curriculum-use manual.
-- Manual printed pp. 17-20. These outcomes are explicitly under the M4 grade heading.
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
select s.id,v.code,v.name,v.description,'active'
from public.learning_subjects s
cross join (values
('FOUNDATIONS-MEASUREMENT','Physics Foundations and Measurement','Nature and development of physics, measurement, uncertainty, significant figures, SI units and graph interpretation.'),
('MOTION-FORCES','Motion and Forces','Straight-line motion, resultant forces, Newton laws, universal gravitation, gravitational fields and friction.')
) v(code,name,description)
where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
join (values
('FOUNDATIONS-MEASUREMENT','M4-PHY-FOUNDATIONS','Nature of Physics and Measurement','M4 additional Physics outcomes 1-2: development of physics knowledge, scientific inquiry, measurement, uncertainty, SI units, significant figures and graph analysis.',1),
('MOTION-FORCES','M4-PHY-MOTION-FORCES','Straight-line Motion and Forces','M4 additional Physics outcomes 3-7: uniformly accelerated straight-line motion, gravity, resultant forces, Newton laws, universal gravitation, gravitational fields and friction.',2)
) v(skill_code,code,name,description,seq) on v.skill_code=sk.code
where s.code='PHYSICS'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M4-PHY-FOUNDATIONS','M4-PHY-FOUNDATIONS-01','Explain the nature and development of physics','Investigate and explain how knowledge in physics is developed, its history, and how the development of physical principles and concepts contributes to new knowledge and technology.',1),
('M4-PHY-FOUNDATIONS','M4-PHY-MEASUREMENT-02','Measure and report physical quantities accurately','Measure and report physical quantities appropriately, consider measurement uncertainty, present experimental results using graphs, and analyse and interpret straight-line graphs.',2),
('M4-PHY-MOTION-FORCES','M4-PHY-MOTION-03','Analyse uniformly accelerated straight-line motion','Investigate and explain relationships among position, displacement, velocity and acceleration for uniformly accelerated straight-line motion using graphs and equations; investigate gravitational acceleration and calculate related quantities.',3),
('M4-PHY-MOTION-FORCES','M4-PHY-FORCES-04','Explain forces and resultant-force effects','Explain how forces and resultant forces affect motion, investigate the resultant of two forces acting at an angle, and calculate related quantities.',4),
('M4-PHY-MOTION-FORCES','M4-PHY-NEWTON-05','Apply Newton laws and free-body diagrams','Draw free-body diagrams, investigate and explain Newton laws of motion, apply them to the motion of objects, and calculate related quantities.',5),
('M4-PHY-MOTION-FORCES','M4-PHY-GRAVITATION-06','Explain universal gravitation and gravitational fields','Explain the law of universal gravitation and how the gravitational field gives objects weight, and calculate related quantities.',6),
('M4-PHY-MOTION-FORCES','M4-PHY-FRICTION-07','Analyse friction between surfaces','Analyse and explain friction between pairs of surfaces when objects are at rest and in motion, investigate coefficients of friction, and apply friction concepts to everyday situations.',7)
) o(topic_code,code,name,description,seq) on o.topic_code=tp.code
where s.code='PHYSICS'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M4 learning outcome '||a.seq||'; IPST Physics curriculum-use manual, printed pp. '||a.pages||'.'
from (values
('M4-PHY-FOUNDATIONS-01',1,'17'),
('M4-PHY-MEASUREMENT-02',2,'17'),
('M4-PHY-MOTION-03',3,'18'),
('M4-PHY-FORCES-04',4,'19'),
('M4-PHY-NEWTON-05',5,'19'),
('M4-PHY-GRAVITATION-06',6,'19'),
('M4-PHY-FRICTION-07',7,'20')
) a(code,seq,pages)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
