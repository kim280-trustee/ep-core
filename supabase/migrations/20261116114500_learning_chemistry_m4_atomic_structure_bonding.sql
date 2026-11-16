-- E&P Learning: M4 Chemistry, additional-study strand 1, outcomes 1-21.
-- Official OBEC revised curriculum B.E. 2560 (2017), Chemistry, p. 106.
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
select s.id,'ATOMIC-STRUCTURE-BONDING','Atomic Structure, Periodicity and Chemical Bonding','Atomic models, nuclear notation, electron configurations, periodic trends, radioisotopes, ionic, covalent and metallic bonding, molecular structure and material properties.','active'
from public.learning_subjects s where s.code='CHEMISTRY'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-ATOMIC-STRUCTURE-PERIODICITY-BONDING','Atomic Structure, Periodic Trends and Chemical Bonds','M4 Chemistry additional-study strand 1: development of atomic models, isotopes, electron arrangement, periodicity, radioactivity, ionic and covalent bonding, intermolecular forces, network covalent solids and metallic bonding.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='CHEMISTRY' and sk.code='ATOMIC-STRUCTURE-BONDING'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
join (values
('M4-CHEM-ATOM-01','Explain the development of atomic models','Use evidence from scientific hypotheses and experiments to explain how atomic models developed, including the contributions and limitations of major models.',1),
('M4-CHEM-ATOM-02','Interpret nuclear symbols and isotopes','Write nuclear symbols and determine proton, neutron and electron counts; explain isotopes as atoms of the same element with different neutron numbers.',2),
('M4-CHEM-ATOM-03','Write electron configurations','Write electron configurations in principal energy levels and subshells from atomic number, applying appropriate filling rules.',3),
('M4-CHEM-ATOM-04','Locate elements in the periodic table','Identify group, period and metallic, non-metallic or metalloid character for representative and transition elements.',4),
('M4-CHEM-ATOM-05','Analyse periodic trends in representative elements','Analyse trends in selected properties of representative elements across periods and down groups and explain them using atomic structure.',5),
('M4-CHEM-ATOM-06','Describe transition-metal properties','Describe characteristic properties of transition metals and compare them with representative metals using evidence and examples.',6),
('M4-CHEM-ATOM-07','Explain radioactive decay and half-life','Explain radioactive properties and calculate the remaining amount or elapsed time using half-life models.',7),
('M4-CHEM-ATOM-08','Evaluate uses and impacts of elements','Research applications of elements and evaluate potential effects on living things and the environment, using reliable sources.',8),
('M4-CHEM-ATOM-09','Explain formation of ions and ionic bonds','Explain electron transfer, ion formation and electrostatic attraction in ionic bonding using Lewis dot representations.',9),
('M4-CHEM-ATOM-10','Write and name ionic compounds','Determine formula units and name ionic compounds from ion charges, including compounds with common polyatomic ions.',10),
('M4-CHEM-ATOM-11','Calculate Born-Haber energy changes','Use a Born-Haber cycle and Hess law to calculate energy changes associated with formation of an ionic compound.',11),
('M4-CHEM-ATOM-12','Explain properties of ionic compounds','Relate ionic lattice structure to melting point, brittleness, solubility and electrical conductivity in solid and molten or dissolved states.',12),
('M4-CHEM-ATOM-13','Write ionic and net ionic equations','Write balanced ionic and net ionic equations for suitable reactions of ionic compounds and identify spectator ions.',13),
('M4-CHEM-ATOM-14','Explain covalent single double and triple bonds','Use Lewis structures to explain shared electron pairs and the formation of single, double and triple covalent bonds.',14),
('M4-CHEM-ATOM-15','Write formulas and names of covalent compounds','Write molecular formulas and apply appropriate naming conventions to common binary covalent compounds.',15),
('M4-CHEM-ATOM-16','Compare covalent bond length and bond energy','Compare bond lengths and bond energies and estimate reaction energy changes using average bond enthalpies.',16),
('M4-CHEM-ATOM-17','Predict molecular shapes and polarity','Use VSEPR theory to predict molecular geometry and determine molecular polarity from bond polarity and molecular shape.',17),
('M4-CHEM-ATOM-18','Explain intermolecular forces and physical properties','Identify intermolecular forces and relate their relative strengths to melting point, boiling point and water solubility of molecular substances.',18),
('M4-CHEM-ATOM-19','Describe network covalent solids','Research and explain structures and properties of network covalent solids such as diamond, graphite and silicon dioxide.',19),
('M4-CHEM-ATOM-20','Explain metallic bonding and metal properties','Explain metallic bonding using a lattice of positive metal ions and delocalised electrons and relate it to conductivity, malleability and ductility.',20),
('M4-CHEM-ATOM-21','Compare ionic covalent and metallic substances','Compare structures and properties of ionic, covalent and metallic substances and select suitable examples for practical applications.',21)
) as o(code,name,description,seq) on true
where s.code='CHEMISTRY' and tp.code='M4-ATOMIC-STRUCTURE-PERIODICITY-BONDING'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Chemistry strand 1, M4 learning outcome '||a.seq||'; official source p. 106.'
from (values
('M4-CHEM-ATOM-01',1),('M4-CHEM-ATOM-02',2),('M4-CHEM-ATOM-03',3),('M4-CHEM-ATOM-04',4),('M4-CHEM-ATOM-05',5),('M4-CHEM-ATOM-06',6),('M4-CHEM-ATOM-07',7),('M4-CHEM-ATOM-08',8),('M4-CHEM-ATOM-09',9),('M4-CHEM-ATOM-10',10),('M4-CHEM-ATOM-11',11),('M4-CHEM-ATOM-12',12),('M4-CHEM-ATOM-13',13),('M4-CHEM-ATOM-14',14),('M4-CHEM-ATOM-15',15),('M4-CHEM-ATOM-16',16),('M4-CHEM-ATOM-17',17),('M4-CHEM-ATOM-18',18),('M4-CHEM-ATOM-19',19),('M4-CHEM-ATOM-20',20),('M4-CHEM-ATOM-21',21)
) as a(code,seq)
join public.learning_objectives ob on ob.code=a.code join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='CHEMISTRY'
join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
