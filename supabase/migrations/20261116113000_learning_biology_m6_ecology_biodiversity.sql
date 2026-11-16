-- E&P Learning: M6 Biology, additional-study strand 5 (Ecology), outcomes 1-13.
-- Official OBEC revised curriculum B.E. 2560 (2017), Additional Biology, pp. 105-106.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
 where s.code='BIOLOGY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Biology subject and M6 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ECOLOGY','Ecology','Ecosystems, energy flow, biogeochemical cycles, biomes, succession, population ecology and environmental sustainability.','active'
from public.learning_subjects s where s.code='BIOLOGY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M6-ECOLOGY-ENVIRONMENT','Ecosystems, Populations and Environmental Sustainability','M6 Biology additional-study strand 5: ecosystem energy transfer, nutrient cycles, biomes, succession, population dynamics and environmental resource challenges.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='BIOLOGY' and sk.code='ECOLOGY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M6-BIO-ECO-01','Analyse energy transfer in ecosystems','Analyse energy transfer through producers, consumers and decomposers using food chains, food webs and ecological pyramids; distinguish one-way energy flow from cycling of matter.',1),
('M6-BIO-ECO-02','Explain biomagnification and its prevention','Explain how persistent pollutants can become more concentrated at higher trophic levels and evaluate source reduction, regulation and safe waste-management measures.',2),
('M6-BIO-ECO-03','Explain nitrogen sulfur and phosphorus cycles','Represent and explain key transfers and transformations in the nitrogen, sulfur and phosphorus cycles using labelled diagrams.',3),
('M6-BIO-ECO-04','Compare major terrestrial biomes','Compare biome characteristics across geographic zones using climate, especially temperature and precipitation, and characteristic vegetation and organisms.',4),
('M6-BIO-ECO-05','Compare primary and secondary succession','Compare primary and secondary ecological succession, identify their starting conditions and explain how communities change over time.',5),
('M6-BIO-ECO-06','Describe population characteristics','Describe selected population characteristics, including population size, density, distribution, age structure, birth rate, death rate and migration.',6),
('M6-BIO-ECO-07','Compare exponential and logistic population growth','Interpret exponential and logistic population-growth curves and explain the role of environmental limits and carrying capacity.',7),
('M6-BIO-ECO-08','Explain factors controlling population growth','Explain how density-dependent and density-independent factors, resource availability, births, deaths and migration influence population size.',8),
('M6-BIO-ECO-09','Analyse water scarcity and water pollution','Analyse causes and impacts of water scarcity and water pollution and evaluate practical management, prevention and remediation strategies.',9),
('M6-BIO-ECO-10','Analyse air pollution and its impacts','Analyse sources and impacts of air pollution, including particulate matter and harmful gases, and evaluate prevention and mitigation measures.',10),
('M6-BIO-ECO-11','Analyse soil resource problems','Analyse soil erosion, degradation and contamination, their effects on ecosystems and food production, and appropriate conservation responses.',11),
('M6-BIO-ECO-12','Evaluate deforestation and forest conservation','Analyse ecological and social impacts of deforestation and evaluate approaches to prevent forest loss and support forest conservation and restoration.',12),
('M6-BIO-ECO-13','Evaluate wildlife decline and conservation','Analyse causes and consequences of wildlife population decline and evaluate habitat protection, sustainable use and other evidence-based conservation approaches.',13)
) as o(code,name,description,seq) on true
where s.code='BIOLOGY' and tp.code='M6-ECOLOGY-ENVIRONMENT'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Biology strand 5, M6 learning outcome '||a.seq||'; official source pp. 105-106.'
from (values
('M6-BIO-ECO-01',1),('M6-BIO-ECO-02',2),('M6-BIO-ECO-03',3),('M6-BIO-ECO-04',4),('M6-BIO-ECO-05',5),('M6-BIO-ECO-06',6),('M6-BIO-ECO-07',7),('M6-BIO-ECO-08',8),('M6-BIO-ECO-09',9),('M6-BIO-ECO-10',10),('M6-BIO-ECO-11',11),('M6-BIO-ECO-12',12),('M6-BIO-ECO-13',13)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='BIOLOGY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
