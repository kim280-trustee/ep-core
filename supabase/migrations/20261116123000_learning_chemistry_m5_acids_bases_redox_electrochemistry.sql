-- E&P Learning: M5 Chemistry additional-study strand 2, outcomes 14-32.
-- Official OBEC revised curriculum B.E. 2560 (2017), pp. 118-119.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
 where s.code='CHEMISTRY' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Chemistry subject and M5 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ACID-BASE-CHEMISTRY','Acid–Base Chemistry','Acid–base theories, conjugate pairs, strength, pH, neutralisation, salt hydrolysis, titration, buffers and applications.','active' from public.learning_subjects s where s.code='CHEMISTRY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-CHEM-ACID-BASE','Acids and Bases','M5 Chemistry outcomes 14–23: acid–base theories, calculations, titration, buffers and applications.',1,'active' from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='CHEMISTRY' and sk.code='ACID-BASE-CHEMISTRY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'REDOX-CHEMISTRY','Redox Chemistry','Oxidation numbers, redox identification, oxidising and reducing agents, half-reactions and balancing.','active' from public.learning_subjects s where s.code='CHEMISTRY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-CHEM-REDOX','Redox Reactions','M5 Chemistry outcomes 24–27: oxidation numbers, redox agents, half-reactions and balancing.',1,'active' from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='CHEMISTRY' and sk.code='REDOX-CHEMISTRY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ELECTROCHEMISTRY','Electrochemistry','Electrochemical cells, electrode potentials, batteries, electrolysis, electroplating, purification and corrosion.','active' from public.learning_subjects s where s.code='CHEMISTRY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-CHEM-ELECTROCHEM','Electrochemical Cells and Applications','M5 Chemistry outcomes 28–32: electrochemical cells, standard potentials, batteries, electrolysis, electroplating and technology.',1,'active' from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='CHEMISTRY' and sk.code='ELECTROCHEMISTRY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from (values
('M5-CHEM-ACID-14','Classify acids and bases using three theories','Identify acids and bases using Arrhenius, Brønsted–Lowry and Lewis definitions.',14),
('M5-CHEM-ACID-15','Identify Brønsted–Lowry conjugate acid–base pairs','Identify conjugate acid–base pairs by tracking proton transfer.',15),
('M5-CHEM-ACID-16','Compare acid and base strength','Calculate and compare ionisation or dissociation and interpret acid and base strength.',16),
('M5-CHEM-ACID-17','Calculate pH and ion concentrations','Calculate pH, hydronium concentration and hydroxide concentration for acidic and basic solutions.',17),
('M5-CHEM-ACID-18','Explain neutralisation reactions','Write balanced neutralisation equations and determine the acid–base character of the resulting solution.',18),
('M5-CHEM-ACID-19','Explain salt hydrolysis','Write salt-hydrolysis equations and predict whether a salt solution is acidic, basic or neutral.',19),
('M5-CHEM-ACID-20','Explain acid–base titration and indicator selection','Explain titration principles and select a suitable indicator for an acid–base titration.',20),
('M5-CHEM-ACID-21','Calculate titration quantities','Calculate amount or concentration of an acid or base from titration data and reaction stoichiometry.',21),
('M5-CHEM-ACID-22','Explain buffer composition and properties','Describe buffer components, resistance to pH change and common applications.',22),
('M5-CHEM-ACID-23','Apply acid–base chemistry to practical contexts','Research and present examples of using acid–base knowledge to solve problems.',23),
('M5-CHEM-REDOX-24','Calculate oxidation numbers and identify redox reactions','Assign oxidation numbers and identify oxidation–reduction reactions from changes in oxidation state.',24),
('M5-CHEM-REDOX-25','Identify oxidising and reducing agents','Analyse oxidation-number changes, identify oxidising and reducing agents, and write oxidation and reduction half-equations.',25),
('M5-CHEM-REDOX-26','Compare oxidising and reducing strength','Interpret controlled evidence comparing oxidising or reducing ability and represent the redox reactions.',26),
('M5-CHEM-REDOX-27','Balance redox equations','Balance redox equations using oxidation-number and half-reaction methods.',27),
('M5-CHEM-ELECTRO-28','Describe electrochemical cell components and reactions','Identify cell components; write anode and cathode half-equations, overall reaction and cell notation.',28),
('M5-CHEM-ELECTRO-29','Calculate standard cell potentials','Calculate standard cell potential and identify cell type, electrodes and reactions.',29),
('M5-CHEM-ELECTRO-30','Explain primary and secondary cells','Explain how primary and secondary cells operate and write their reaction equations.',30),
('M5-CHEM-ELECTRO-31','Explain electrolysis, electroplating and corrosion control','Explain electroplating, electrolysis, metal purification and corrosion prevention using electrochemical principles.',31),
('M5-CHEM-ELECTRO-32','Evaluate advances in electrochemical technology','Research and present examples of electrochemical-cell technology used in everyday life.',32)
) as o(code,name,description,seq)
join public.learning_topics tp on tp.code in ('M5-CHEM-ACID-BASE','M5-CHEM-REDOX','M5-CHEM-ELECTROCHEM')
where (o.seq between 14 and 23 and tp.code='M5-CHEM-ACID-BASE')
or (o.seq between 24 and 27 and tp.code='M5-CHEM-REDOX')
or (o.seq between 28 and 32 and tp.code='M5-CHEM-ELECTROCHEM')
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Chemistry strand 2, M5 learning outcome '||a.seq||'; official source pp. 118-119.'
from (values
('M5-CHEM-ACID-14',14),
('M5-CHEM-ACID-15',15),
('M5-CHEM-ACID-16',16),
('M5-CHEM-ACID-17',17),
('M5-CHEM-ACID-18',18),
('M5-CHEM-ACID-19',19),
('M5-CHEM-ACID-20',20),
('M5-CHEM-ACID-21',21),
('M5-CHEM-ACID-22',22),
('M5-CHEM-ACID-23',23),
('M5-CHEM-REDOX-24',24),
('M5-CHEM-REDOX-25',25),
('M5-CHEM-REDOX-26',26),
('M5-CHEM-REDOX-27',27),
('M5-CHEM-ELECTRO-28',28),
('M5-CHEM-ELECTRO-29',29),
('M5-CHEM-ELECTRO-30',30),
('M5-CHEM-ELECTRO-31',31),
('M5-CHEM-ELECTRO-32',32)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='CHEMISTRY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
