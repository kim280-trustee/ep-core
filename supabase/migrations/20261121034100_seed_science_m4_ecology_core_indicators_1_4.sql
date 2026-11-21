-- OBEC 2021 upper-secondary core Science: M4 ecology indicators 1–4.
-- Each indicator is aligned only to M4, in both curriculum catalogues.
-- Official source: https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf (pp. 143–144).
begin;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ECOLOGY','Ecology and Environmental Systems','Upper-secondary core Science: biomes, ecological succession, population change and environmental stewardship.','active'
from public.learning_subjects s where s.code='SCI'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-ECOSYSTEMS-AND-ENVIRONMENT','Ecosystems, Biomes and Environmental Change','Investigate biomes, ecological succession, changes in population size and human impacts on natural resources and the environment.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='SCI' and sk.code='ECOLOGY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.sequence_no,'active'
from public.learning_topics t join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
('M4-S1_1-01','Explain relationships between geography and biomes','Investigate how geographic conditions, climate and rainfall relate to biome diversity, and give examples of different biomes.',1),
('M4-S1_1-02','Explain ecological succession','Investigate causes of ecological succession and give examples of how ecological communities change over time.',2),
('M4-S1_1-03','Analyse factors that change population size','Explain and give examples of how physical and biological changes in an ecosystem affect the size of living populations.',3),
('M4-S1_1-04','Evaluate environmental impacts and conservation responses','Investigate and discuss problems affecting natural resources and the environment, and present conservation and problem-solving approaches.',4)
) as v(code,name,description,sequence_no)
where s.code='SCI' and t.code='M4-ECOSYSTEMS-AND-ENVIRONMENT'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,v.sequence_no,true,'OBEC 2021 source; exact indicator '||v.indicator_code||'. Grade-specific M4 alignment only.',v.classification
from (values
('M4-S1_1-01','ว 1.1 ม.4/1',1,'should_know'),
('M4-S1_1-02','ว 1.1 ม.4/2',2,'must_know'),
('M4-S1_1-03','ว 1.1 ม.4/3',3,'must_know'),
('M4-S1_1-04','ว 1.1 ม.4/4',4,'should_know')
) v(code,indicator_code,sequence_no,classification)
join public.learning_objectives o on o.code=v.code
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=true,notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();
commit;