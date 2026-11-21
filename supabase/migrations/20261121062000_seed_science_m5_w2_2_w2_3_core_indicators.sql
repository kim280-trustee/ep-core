-- M5 upper-secondary core Science tranche 2: W2.2 (1–10) and W2.3 (1–12).
-- 22 grade-specific indicators; source pages 151–158.
begin;
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.topic_code,v.topic_name,v.topic_desc,v.sequence_no,'active'
from (values
('FORCE','M5-MOTION-AND-FORCES','Motion, Forces and Electromagnetism','Analyse acceleration and force vectors; explain Newton laws, gravity, magnetic fields, motors and electromagnetic induction.',1),
('ENERGY','M5-WAVES-ENERGY-AND-OPTICS','Waves, Energy and Optics','Explain nuclear energy, wave behaviour, sound, colour vision, filters, electromagnetic waves and communication.',2)
) v(skill_code,topic_code,topic_name,topic_desc,sequence_no)
join public.learning_skills sk on sk.code=v.skill_code
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.sequence_no,'active'
from (values
('M5-S2_2-01','Interpret velocity-time data and explain acceleration','Analyse velocity-time data to explain acceleration as the rate of change of velocity, including its direction relative to velocity.',48,'M5-MOTION-AND-FORCES'),
('M5-S2_2-02','Find the resultant of coplanar forces','Observe and explain how to find the resultant of several forces acting in the same plane by adding force vectors.',49,'M5-MOTION-AND-FORCES'),
('M5-S2_2-03','Relate acceleration to resultant force and mass','Analyse how an object''s acceleration depends on the resultant force and its mass, applying Newton''s second law.',50,'M5-MOTION-AND-FORCES'),
('M5-S2_2-04','Explain action-reaction force pairs','Explain that interaction forces occur in equal and opposite pairs, act simultaneously and act on different objects.',51,'M5-MOTION-AND-FORCES'),
('M5-S2_2-05','Explain motion under different types of acceleration','Explain how acceleration produces straight-line, projectile, circular and oscillatory motion.',52,'M5-MOTION-AND-FORCES'),
('M5-S2_2-06','Explain gravity and orbital motion','Explain how gravitational attraction acts on objects with mass and relates to the motion of satellites and the Moon around Earth.',53,'M5-MOTION-AND-FORCES'),
('M5-S2_2-07','Explain magnetic fields produced by electric current','Observe and explain that an electric current produces a magnetic field around its path, using the right-hand rule to determine direction.',54,'M5-MOTION-AND-FORCES'),
('M5-S2_2-08','Explain magnetic forces and electric motors','Explain magnetic forces on moving charged particles and current-carrying conductors in a magnetic field, and relate these forces to motor operation.',55,'M5-MOTION-AND-FORCES'),
('M5-S2_2-09','Explain electromagnetic induction and EMF','Explain how a changing magnetic field through a conductor coil induces an electromotive force and give a practical application.',56,'M5-MOTION-AND-FORCES'),
('M5-S2_2-10','Explain strong and weak nuclear forces','Research and explain the roles of the strong and weak nuclear forces in nuclear stability and radioactive beta decay.',57,'M5-MOTION-AND-FORCES'),
('M5-S2_3-01','Explain nuclear energy, fission and fusion','Explain nuclear energy from fission and fusion and relate released energy to changes in mass.',58,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-02','Evaluate technologies that convert energy to electricity','Research how alternative energy sources are converted into electrical energy and discuss the efficiency and cost-effectiveness of technologies.',59,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-03','Explain reflection, refraction, diffraction and superposition','Observe and explain reflection, refraction, diffraction and superposition when waves encounter boundaries, obstacles or other waves.',60,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-04','Explain natural frequency and resonance','Explain natural frequency, resonance and the increased amplitude that can occur when a periodic driving force matches an object''s natural frequency.',61,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-05','Explain wave behaviour of sound','Observe and explain reflection, refraction, diffraction and superposition of sound waves.',62,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-06','Relate sound intensity, loudness and frequency to hearing','Explain the relationship between sound intensity and sound level, and how frequency relates to pitch and human hearing.',63,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-07','Explain echo, beats, Doppler effect and sound resonance','Observe and explain echoes, beats from nearby frequencies, Doppler frequency shifts and resonance in air columns.',64,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-08','Apply sound knowledge in daily life','Research and give examples of using sound knowledge in medicine, musical tuning, instrument design and human voice production.',65,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-09','Explain colour vision and colour-vision deficiency','Explain how objects absorb and reflect different colours of light and how cone-cell differences can cause colour-vision deficiency.',66,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-10','Explain colour filters and mixing light and pigments','Observe and explain how colour filters transmit or absorb light and compare additive mixing of light with subtractive mixing of pigments.',67,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-11','Explain electromagnetic waves and devices','Research electromagnetic waves, their electric and magnetic field components, and the operation of devices that use them.',68,'M5-WAVES-ENERGY-AND-OPTICS'),
('M5-S2_3-12','Explain communication using electromagnetic signals','Explain how electromagnetic waves transmit information and compare analogue and digital communication signals.',69,'M5-WAVES-ENERGY-AND-OPTICS')
) v(code,name,description,sequence_no,topic_code)
join public.learning_topics t on t.code=v.topic_code
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,v.sequence_no,true,'OBEC 2021 source; exact indicator '||v.indicator_code||'. Grade-specific M5 alignment only.',v.classification
from (values
('M5-S2_2-01','ว 2.2 ม.5/1',48,'must_know'),
('M5-S2_2-02','ว 2.2 ม.5/2',49,'must_know'),
('M5-S2_2-03','ว 2.2 ม.5/3',50,'must_know'),
('M5-S2_2-04','ว 2.2 ม.5/4',51,'must_know'),
('M5-S2_2-05','ว 2.2 ม.5/5',52,'must_know'),
('M5-S2_2-06','ว 2.2 ม.5/6',53,'must_know'),
('M5-S2_2-07','ว 2.2 ม.5/7',54,'must_know'),
('M5-S2_2-08','ว 2.2 ม.5/8',55,'must_know'),
('M5-S2_2-09','ว 2.2 ม.5/9',56,'must_know'),
('M5-S2_2-10','ว 2.2 ม.5/10',57,'should_know'),
('M5-S2_3-01','ว 2.3 ม.5/1',58,'must_know'),
('M5-S2_3-02','ว 2.3 ม.5/2',59,'must_know'),
('M5-S2_3-03','ว 2.3 ม.5/3',60,'must_know'),
('M5-S2_3-04','ว 2.3 ม.5/4',61,'must_know'),
('M5-S2_3-05','ว 2.3 ม.5/5',62,'must_know'),
('M5-S2_3-06','ว 2.3 ม.5/6',63,'must_know'),
('M5-S2_3-07','ว 2.3 ม.5/7',64,'must_know'),
('M5-S2_3-08','ว 2.3 ม.5/8',65,'must_know'),
('M5-S2_3-09','ว 2.3 ม.5/9',66,'must_know'),
('M5-S2_3-10','ว 2.3 ม.5/10',67,'must_know'),
('M5-S2_3-11','ว 2.3 ม.5/11',68,'must_know'),
('M5-S2_3-12','ว 2.3 ม.5/12',69,'must_know')
) v(code,indicator_code,sequence_no,classification)
join public.learning_objectives o on o.code=v.code join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=true,notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();
commit;