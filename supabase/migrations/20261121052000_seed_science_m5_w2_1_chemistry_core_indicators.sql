-- M5 upper-secondary core Science tranche 1: OBEC standard W2.1 indicators 1–10 and 14–25.
-- 22 official grade-specific indicators; source pages 149–151.
-- M5/11–13 are seeded by a corrective migration after their rows were recovered from the official PDF page 151.
begin;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'MATTER-CHEMISTRY','Matter, Atomic Structure and Chemical Change','Atomic structure, periodic properties, bonding, organic compounds, polymers, chemical reactions and radioactivity.','active'
from public.learning_subjects s where s.code='SCI'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-MATTER-AND-CHEMICAL-CHANGE','Matter, Bonding and Chemical Change','Interpret chemical formulae and atomic models; explain bonding, polarity, organic compounds, polymers, reaction rates, redox and radioactivity.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='SCI' and sk.code='MATTER-CHEMISTRY'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.sequence_no,'active'
from public.learning_topics t join public.learning_skills sk on sk.id=t.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
('M5-S2_1-01','Classify elements and compounds from chemical formulae','Identify whether a substance is an element or compound and whether it is represented as atoms, molecules or ions by interpreting its chemical formula.',23),
('M5-S2_1-02','Compare Bohr and electron-cloud atomic models','Compare the Bohr model, with electrons in energy levels, with the electron-cloud model, which represents probabilities of finding electrons.',24),
('M5-S2_1-03','Determine protons, neutrons and electrons','Determine the numbers of protons, neutrons and electrons in neutral atoms and simple ions.',25),
('M5-S2_1-04','Write nuclear symbols and identify isotopes','Write nuclear symbols using atomic number and mass number, and identify isotopes of the same element.',26),
('M5-S2_1-05','Use the periodic table to classify elements','Use group and period positions to identify element categories, including metals, non-metals, metalloids, representative elements and transition elements.',27),
('M5-S2_1-06','Compare metals and non-metals','Compare electrical conductivity and electron-transfer tendencies of metals and non-metals.',28),
('M5-S2_1-07','Explain benefits and hazards of representative and transition elements','Research and present everyday uses and possible hazards of representative and transition elements, including suitable safety precautions.',29),
('M5-S2_1-08','Identify single, double and triple covalent bonds','Interpret structural formulae to identify single, double and triple covalent bonds and the shared electron pairs between atoms.',30),
('M5-S2_1-09','Identify polarity in diatomic molecules','Determine whether a covalent molecule containing two atoms is polar or non-polar by considering the atoms and bond polarity.',31),
('M5-S2_1-10','Identify hydrogen bonding from structural formulae','Identify molecules that can form hydrogen bonds by examining structural formulae and the presence of suitable hydrogen–nitrogen, hydrogen–oxygen or hydrogen–fluorine bonds.',32),
('M5-S2_1-14','Classify saturated and unsaturated hydrocarbons','Use structural formulae to distinguish saturated hydrocarbons, which contain only carbon–carbon single bonds, from unsaturated hydrocarbons containing double or triple bonds.',36),
('M5-S2_1-15','Compare polymers and their monomers','Research and compare physical properties of a polymer with those of its monomer, including state, melting behaviour and solubility.',37),
('M5-S2_1-16','Identify acid and base properties in organic structures','Identify acid or base behaviour from functional groups in organic compounds, including carboxyl (–COOH) and amino (–NH₂) groups.',38),
('M5-S2_1-17','Explain solubility using polarity','Explain how solubility depends on the relative polarity of solute and solvent, using the principle that substances with similar polarity tend to dissolve in one another.',39),
('M5-S2_1-18','Relate polymer structure to thermoplastic and thermoset properties','Analyse how linear, branched and cross-linked polymer structures relate to thermoplastic and thermosetting behaviour and practical uses.',40),
('M5-S2_1-19','Evaluate environmental impacts of polymer products','Research how extensive polymer use affects organisms and the environment, and propose reduction, reuse, recycling or other prevention measures.',41),
('M5-S2_1-20','Interpret chemical equations','Identify reactants and products, interpret symbols in chemical equations and explain conservation of atoms when equations are balanced.',42),
('M5-S2_1-21','Investigate factors affecting reaction rate','Conduct experiments and explain how concentration, surface area, temperature and catalysts affect the rate of a chemical reaction.',43),
('M5-S2_1-22','Explain reaction-rate factors in daily life and industry','Research and explain how factors affecting reaction rates are applied in everyday life or industrial processes.',44),
('M5-S2_1-23','Explain oxidation-reduction reactions','Explain that redox reactions involve electron transfer and identify oxidation and reduction in simple examples.',45),
('M5-S2_1-24','Calculate radioactive half-life and remaining quantity','Explain properties of radioactive substances and calculate half-life and the quantity remaining after a given time.',46),
('M5-S2_1-25','Explain uses and safe handling of radioactive substances','Research useful applications of alpha, beta and gamma radiation and explain precautions that reduce risks to living things and the environment.',47)
) v(code,name,description,sequence_no)
where s.code='SCI' and t.code='M5-MATTER-AND-CHEMICAL-CHANGE'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,v.sequence_no,true,'OBEC 2021 source; exact indicator '||v.indicator_code||'. Grade-specific M5 alignment only.',v.classification
from (values
('M5-S2_1-01','ว 2.1 ม.5/1',23,'must_know'),
('M5-S2_1-02','ว 2.1 ม.5/2',24,'should_know'),
('M5-S2_1-03','ว 2.1 ม.5/3',25,'must_know'),
('M5-S2_1-04','ว 2.1 ม.5/4',26,'must_know'),
('M5-S2_1-05','ว 2.1 ม.5/5',27,'must_know'),
('M5-S2_1-06','ว 2.1 ม.5/6',28,'must_know'),
('M5-S2_1-07','ว 2.1 ม.5/7',29,'must_know'),
('M5-S2_1-08','ว 2.1 ม.5/8',30,'must_know'),
('M5-S2_1-09','ว 2.1 ม.5/9',31,'must_know'),
('M5-S2_1-10','ว 2.1 ม.5/10',32,'must_know'),
('M5-S2_1-14','ว 2.1 ม.5/14',36,'must_know'),
('M5-S2_1-15','ว 2.1 ม.5/15',37,'must_know'),
('M5-S2_1-16','ว 2.1 ม.5/16',38,'must_know'),
('M5-S2_1-17','ว 2.1 ม.5/17',39,'must_know'),
('M5-S2_1-18','ว 2.1 ม.5/18',40,'must_know'),
('M5-S2_1-19','ว 2.1 ม.5/19',41,'should_know'),
('M5-S2_1-20','ว 2.1 ม.5/20',42,'must_know'),
('M5-S2_1-21','ว 2.1 ม.5/21',43,'must_know'),
('M5-S2_1-22','ว 2.1 ม.5/22',44,'should_know'),
('M5-S2_1-23','ว 2.1 ม.5/23',45,'should_know'),
('M5-S2_1-24','ว 2.1 ม.5/24',46,'must_know'),
('M5-S2_1-25','ว 2.1 ม.5/25',47,'should_know')
) v(code,indicator_code,sequence_no,classification)
join public.learning_objectives o on o.code=v.code join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=true,notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();
commit;