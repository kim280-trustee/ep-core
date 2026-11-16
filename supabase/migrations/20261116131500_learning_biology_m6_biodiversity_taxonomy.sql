-- E&P Learning: M6 Biology, additional-study strand 2, outcomes 1-5.
-- Official OBEC/IPST revised curriculum B.E. 2560 (2017), Biology, biodiversity and taxonomy.
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
select s.id,'BIODIVERSITY-TAXONOMY','Biodiversity and Biological Classification','Biodiversity across genetic, species and ecosystem levels; origin of early life, major organism groups, taxonomy and identification keys.','active'
from public.learning_subjects s where s.code='BIOLOGY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M6-BIODIVERSITY-CLASSIFICATION','Biodiversity, Origin of Life and Taxonomy','M6 Biology additional-study strand 2 outcomes 1-5: levels and importance of biodiversity, early cells and unicellular evolution, major organism groups, taxonomic hierarchy and scientific naming, dichotomous keys.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='BIOLOGY' and sk.code='BIODIVERSITY-TAXONOMY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M6-BIO-BIODIV-01','Explain levels and importance of biodiversity','Discuss the importance of biodiversity and explain relationships among genetic diversity, species diversity and ecosystem diversity, using grounded examples.',1),
('M6-BIO-BIODIV-02','Explain hypotheses for the origin of early cells','Explain scientific hypotheses and evidence about the formation of early cells and the evolution of unicellular organisms, distinguishing evidence from unresolved questions.',2),
('M6-BIO-BIODIV-03','Compare major groups of organisms','Explain key characteristics and give examples of bacteria, protists, plants, fungi and animals, using evidence-based characteristics rather than superficial appearance alone.',3),
('M6-BIO-BIODIV-04','Apply taxonomic hierarchy and binomial nomenclature','Explain classification from broad to specific taxonomic ranks and correctly format scientific names at species level using binomial nomenclature.',4),
('M6-BIO-BIODIV-05','Construct and use dichotomous identification keys','Construct a clear dichotomous key that separates a supplied set of organisms or specimens using observable, mutually exclusive paired characteristics.',5)
) as o(code,name,description,seq) on true
where s.code='BIOLOGY' and tp.code='M6-BIODIVERSITY-CLASSIFICATION'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Biology strand 2, M6 learning outcome '||a.seq||'; official Biology curriculum guide.'
from (values
('M6-BIO-BIODIV-01',1),('M6-BIO-BIODIV-02',2),('M6-BIO-BIODIV-03',3),('M6-BIO-BIODIV-04',4),('M6-BIO-BIODIV-05',5)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='BIOLOGY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
