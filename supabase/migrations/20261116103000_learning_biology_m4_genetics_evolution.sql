-- E&P Learning: M4 Biology, additional-study strand 2, outcomes 1-15.
-- Official OBEC revised curriculum B.E. 2560 (2017), Biology, pp. 139-140.
-- These are upper-secondary additional learning outcomes, not basic-course indicators.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
 where s.code='BIOLOGY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Biology subject and M4 Science grade are required.'; end if;
end $$;

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'GENETICS-EVOLUTION','Genetics and Evolution','Mendelian and extended inheritance, chromosome-linked genes, DNA replication, protein synthesis, mutation, DNA technology, evolutionary evidence, population genetics and speciation.','active'
from public.learning_subjects s where s.code='BIOLOGY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-GENETICS-EVOLUTION','Inheritance, Genetic Information and Evolution','M4 Biology additional-study strand 2: Mendelian inheritance, gene expression, mutation, DNA technology and evolution.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='BIOLOGY' and sk.code='GENETICS-EVOLUTION'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join (values
 ('M4-BIO-GEN-01','Analyse Mendel’s experiments','Research Mendel’s experiments, explain the design and results, and summarise how evidence supported patterns of inheritance.',1),
 ('M4-BIO-GEN-02','Apply Mendel’s laws to inheritance probabilities','Explain segregation and independent assortment; use genetic crosses to calculate genotype and phenotype probabilities in F1 and F2 generations.',2),
 ('M4-BIO-GEN-03','Explain extensions of Mendelian inheritance','Analyse inheritance patterns that extend simple Mendelian models, including incomplete dominance, codominance, multiple alleles, polygenic inheritance and linkage.',3),
 ('M4-BIO-GEN-04','Compare discontinuous and continuous variation','Analyse and compare traits with distinct categories and traits showing a continuous range, including genetic and environmental contributions.',4),
 ('M4-BIO-GEN-05','Explain inheritance of genes on chromosomes','Explain chromosomal gene transmission and distinguish examples of autosomal and sex-linked inheritance.',5),
 ('M4-BIO-GEN-06','Explain DNA structure, function and replication','Describe the properties and functions of genetic material, DNA chemical composition and structure, and the process of DNA replication.',6),
 ('M4-BIO-GEN-07','Explain protein synthesis and RNA roles','Identify transcription and translation steps and explain the roles of DNA, mRNA, tRNA and rRNA in protein synthesis.',7),
 ('M4-BIO-GEN-08','Connect genes, alleles, proteins and traits','Explain how genetic material and alleles influence proteins and phenotypes, connecting gene expression to Mendelian inheritance.',8),
 ('M4-BIO-GEN-09','Explain gene and chromosome mutations','Describe gene-level and chromosome-level mutations, their causes and examples of disorders or syndromes associated with mutations.',9),
 ('M4-BIO-GEN-10','Explain recombinant-DNA genetic modification','Explain the principles used to create genetically modified organisms through recombinant DNA technology.',10),
 ('M4-BIO-GEN-11','Evaluate applications and ethics of DNA technology','Investigate applications of DNA technology in environment, forensics, medicine, agriculture and industry, and discuss relevant bioethical considerations.',11),
 ('M4-BIO-GEN-12','Evaluate evidence for biological evolution','Investigate and explain evidence and scientific data used to support and explain the evolution of living organisms.',12),
 ('M4-BIO-GEN-13','Compare Lamarckian and Darwinian evolution','Explain and compare Lamarck’s ideas about evolution with Darwin’s theory of evolution by natural selection.',13),
 ('M4-BIO-GEN-14','Use the Hardy-Weinberg principle','State Hardy-Weinberg equilibrium conditions, explain factors that change allele frequencies, and calculate allele and genotype frequencies in populations.',14),
 ('M4-BIO-GEN-15','Explain the process of speciation','Investigate and explain processes through which new species arise, including reproductive isolation and divergence between populations.',15)
) as o(code,name,description,seq) on true
where s.code='BIOLOGY' and tp.code='M4-GENETICS-EVOLUTION'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,
 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Biology strand 2, M4 learning outcome '||a.seq||'; official source pp. 139-140.'
from (values
 ('M4-BIO-GEN-01',1),('M4-BIO-GEN-02',2),('M4-BIO-GEN-03',3),('M4-BIO-GEN-04',4),('M4-BIO-GEN-05',5),
 ('M4-BIO-GEN-06',6),('M4-BIO-GEN-07',7),('M4-BIO-GEN-08',8),('M4-BIO-GEN-09',9),('M4-BIO-GEN-10',10),
 ('M4-BIO-GEN-11',11),('M4-BIO-GEN-12',12),('M4-BIO-GEN-13',13),('M4-BIO-GEN-14',14),('M4-BIO-GEN-15',15)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='BIOLOGY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id)
do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
