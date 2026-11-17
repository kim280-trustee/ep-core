-- E&P Learning: M3 materials and chemical reactions knowledge graph (ว 2.1).
-- Official Thai Basic Education Core Curriculum B.E. 2551, revised B.E. 2560.
-- Seeds eight M3 indicators. No school or learner records are created.
begin;
do $$ begin
  if not exists (
    select 1 from public.learning_subjects s
    join public.learning_curricula c on c.code='TH-SCI-M1-M6'
    join public.learning_education_systems es on es.id=c.education_system_id
    join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M3'
    where s.code='SCI' and es.code='TH_BASIC'
      and s.status='active' and c.status='active' and g.status='active'
  ) then raise exception 'Active SCI M3 curriculum is required.'; end if;
end $$;

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,t.code,t.name,t.description,t.seq,'active'
from public.learning_subjects s
join public.learning_skills sk on sk.subject_id=s.id
join (values
 ('MATTER','M3-MATERIALS','Polymers, Ceramics and Composites','Properties, uses, value and responsible use of modern materials.',5),
 ('MATTER','M3-CHEMICAL-REACTIONS','Chemical Reactions and Applications','Chemical change, conservation of mass, energy transfer, common reactions and safe applications.',6)
) as t(skill_code,code,name,description,seq) on sk.code=t.skill_code
where s.code='SCI'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_subjects s
join public.learning_skills sk on sk.subject_id=s.id
join (values
 ('M3-MATERIALS','M3-S2_1-01','Identify properties and uses of polymers, ceramics and composites','Use evidence and information to identify physical properties and uses of polymers, ceramics and composite materials.',1),
 ('M3-MATERIALS','M3-S2_1-02','Use materials economically and responsibly','Explain the value of polymers, ceramics and composites and recommend economical, responsible use.',2),
 ('M3-CHEMICAL-REACTIONS','M3-S2_1-03','Model chemical reactions','Explain chemical reactions as rearrangements of atoms and represent them with word equations.',3),
 ('M3-CHEMICAL-REACTIONS','M3-S2_1-04','Apply the law of conservation of mass','Use evidence to explain that total mass is conserved in a chemical reaction.',4),
 ('M3-CHEMICAL-REACTIONS','M3-S2_1-05','Compare endothermic and exothermic reactions','Analyse temperature evidence to distinguish heat-absorbing and heat-releasing reactions.',5),
 ('M3-CHEMICAL-REACTIONS','M3-S2_1-06','Explain common chemical reactions','Explain rusting, acid-metal, acid-base, base-metal, combustion, acid rain and photosynthesis reactions using evidence and word equations.',6),
 ('M3-CHEMICAL-REACTIONS','M3-S2_1-07','Evaluate benefits and hazards of chemical reactions','Identify benefits and hazards of everyday chemical reactions and recommend prevention or mitigation measures.',7),
 ('M3-CHEMICAL-REACTIONS','M3-S2_1-08','Design a solution using chemical-reaction knowledge','Design and evaluate a safe everyday solution using knowledge of chemical reactions, integrating science, mathematics, technology and engineering.',8)
) as o(topic_code,code,name,description,seq) on true
join public.learning_topics tp on tp.skill_id=sk.id and tp.code=o.topic_code
where s.code='SCI' and sk.code='MATTER'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,
 'Thailand Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017); official indicator '||a.indicator||'.'
from (values
 ('M3-S2_1-01',1,'ว 2.1 ม.3/1'),
 ('M3-S2_1-02',2,'ว 2.1 ม.3/2'),
 ('M3-S2_1-03',3,'ว 2.1 ม.3/3'),
 ('M3-S2_1-04',4,'ว 2.1 ม.3/4'),
 ('M3-S2_1-05',5,'ว 2.1 ม.3/5'),
 ('M3-S2_1-06',6,'ว 2.1 ม.3/6'),
 ('M3-S2_1-07',7,'ว 2.1 ม.3/7'),
 ('M3-S2_1-08',8,'ว 2.1 ม.3/8')
) as a(code,seq,indicator)
join public.learning_objectives ob on ob.code=a.code
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M3'
on conflict(objective_id,curriculum_id,grade_level_id)
do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
