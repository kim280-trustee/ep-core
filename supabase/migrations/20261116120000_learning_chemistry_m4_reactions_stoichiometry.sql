-- E&P Learning: M4 Chemistry, additional-study strand 2, outcomes 1-7.
-- Official OBEC revised curriculum B.E. 2560 (2017), Chemistry, p. 118.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
 where s.code='CHEMISTRY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Chemistry subject and M4 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'REACTION-STOICHIOMETRY','Chemical Reactions and Stoichiometry','Chemical equation interpretation and balancing, quantitative relationships, limiting reactants and percentage yield.','active'
from public.learning_subjects s where s.code='CHEMISTRY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-CHEMICAL-REACTIONS-STOICHIOMETRY','Chemical Reactions and Stoichiometry','M4 Chemistry additional-study strand 2: balanced equations, mole ratios, mass, solution concentration, gas volume, multistep reactions, limiting reactants and percentage yield.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='CHEMISTRY' and sk.code='REACTION-STOICHIOMETRY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M4-CHEM-STOICH-01','Interpret and balance chemical equations','Interpret formulae, coefficients, state symbols and reaction conditions; balance equations by conserving each element’s atoms.',1),
('M4-CHEM-STOICH-02','Calculate reaction quantities from mass','Convert between mass and amount of substance and use balanced-equation mole ratios to calculate reactant or product masses.',2),
('M4-CHEM-STOICH-03','Calculate reaction quantities using solution concentration','Use molar concentration and solution volume to determine amount of dissolved reactant or product in a stoichiometric calculation.',3),
('M4-CHEM-STOICH-04','Calculate reaction quantities involving gas volume','Use appropriate gas-volume relationships and balanced-equation mole ratios to calculate gas quantities under stated conditions.',4),
('M4-CHEM-STOICH-05','Solve multistep stoichiometry problems','Combine balanced equations and mole relationships to solve quantitative problems involving reactions that occur in multiple steps.',5),
('M4-CHEM-STOICH-06','Identify limiting reactants and calculate quantities','Determine the limiting reactant from available reactant amounts and calculate product formed and excess reactant remaining.',6),
('M4-CHEM-STOICH-07','Calculate percentage yield','Calculate theoretical yield and percentage yield from actual experimental yield, with units and appropriate significant figures.',7)
) as o(code,name,description,seq) on true
where s.code='CHEMISTRY' and tp.code='M4-CHEMICAL-REACTIONS-STOICHIOMETRY'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Chemistry strand 2, M4 learning outcome '||a.seq||'; official source p. 118.'
from (values
('M4-CHEM-STOICH-01',1),('M4-CHEM-STOICH-02',2),('M4-CHEM-STOICH-03',3),('M4-CHEM-STOICH-04',4),('M4-CHEM-STOICH-05',5),('M4-CHEM-STOICH-06',6),('M4-CHEM-STOICH-07',7)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='CHEMISTRY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
