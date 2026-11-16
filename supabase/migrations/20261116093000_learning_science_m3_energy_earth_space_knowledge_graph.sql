-- E&P Learning: M3 energy, light, astronomy and Earth-system knowledge graph.
-- Official Thai Basic Education Core Curriculum B.E. 2551, revised B.E. 2560.
-- Seeds 32 M3 indicators: ว 2.3 (21), ว 3.1 (4), ว 3.2 (7).
-- Technology standards ว 4.1/ว 4.2 remain outside the Science subject.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s
 join public.learning_curricula c on c.code='TH-SCI-M1-M6'
 join public.learning_education_systems es on es.id=c.education_system_id
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M3'
 where s.code='SCI' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active SCI M3 curriculum is required.'; end if;
end $$;

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,t.code,t.name,t.description,t.seq,'active'
from public.learning_subjects s join public.learning_skills sk on sk.subject_id=s.id
join (values
 ('ENERGY','M3-ELECTRICITY','Electricity and Circuits','Potential difference, current, resistance, circuit configurations, electrical energy and safe use.',4),
 ('ENERGY','M3-LIGHT-AND-EM','Electromagnetic Waves and Light','Electromagnetic spectrum, reflection, refraction, lenses, optical instruments and illumination.',5),
 ('EARTH','M3-SOLAR-SYSTEM','Solar System and Space Technology','Gravity, planetary motion, seasons, lunar phases, tides and space technology.',6),
 ('EARTH','M3-ROCKS-AND-HAZARDS','Rocks, Fossils, Weather and Natural Hazards','Rock cycle, mineral resources, fossils, monsoons, Thai seasons and natural hazard preparedness.',7)
) as t(skill_code,code,name,description,seq) on true
where s.code='SCI'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,o.code,o.name,o.description,o.seq,'active'
from public.learning_subjects s join public.learning_skills sk on sk.subject_id=s.id
join (values
 ('M3-ELECTRICITY','M3-S2_3-01','Apply Ohm''s law','Analyse relationships among potential difference, current and resistance and calculate values using V = IR.',1),
 ('M3-ELECTRICITY','M3-S2_3-02','Graph current and potential difference','Plot and interpret graphs showing the relationship between electric current and potential difference.',2),
 ('M3-ELECTRICITY','M3-S2_3-03','Measure electrical quantities','Use voltmeters and ammeters correctly to measure potential difference and current.',3),
 ('M3-ELECTRICITY','M3-S2_3-04','Analyse series and parallel circuits','Analyse current and potential difference in circuits with multiple resistors connected in series and parallel.',4),
 ('M3-ELECTRICITY','M3-S2_3-05','Draw series and parallel circuits','Draw circuit diagrams representing series and parallel resistor arrangements.',5),
 ('M3-ELECTRICITY','M3-S2_3-06','Explain basic electronic components','Describe the functions of resistors, diodes, transistors and capacitors.',6),
 ('M3-ELECTRICITY','M3-S2_3-07','Build a simple electronic circuit','Draw and assemble a basic circuit using suitable electronic components under safe supervision.',7),
 ('M3-ELECTRICITY','M3-S2_3-08','Calculate electrical energy and cost','Calculate electrical energy using W = Pt and estimate household electricity costs from appliance data.',8),
 ('M3-ELECTRICITY','M3-S2_3-09','Use electrical appliances efficiently and safely','Evaluate appliance choices and propose efficient, safe electricity-use practices.',9),
 ('M3-ELECTRICITY','M3-S2_3-10','Explain energy changes in electrical appliances','Explain energy transformations in common electrical appliances using evidence.',10),
 ('M3-ELECTRICITY','M3-S2_3-11','Explain electrical power ratings','Interpret appliance power ratings and relate power to energy use over time.',11),
 ('M3-LIGHT-AND-EM','M3-S2_3-12','Explain electromagnetic waves','Describe electromagnetic waves and distinguish regions of the electromagnetic spectrum.',12),
 ('M3-LIGHT-AND-EM','M3-S2_3-13','Evaluate electromagnetic wave applications and hazards','Explain benefits and potential hazards of electromagnetic waves in daily life.',13),
 ('M3-LIGHT-AND-EM','M3-S2_3-14','Investigate reflection of light','Design and conduct a suitable experiment to test the law of reflection.',14),
 ('M3-LIGHT-AND-EM','M3-S2_3-15','Draw images formed by mirrors','Draw ray diagrams to show image formation by plane and curved mirrors.',15),
 ('M3-LIGHT-AND-EM','M3-S2_3-16','Explain refraction and dispersion','Explain refraction through transparent media and dispersion of white light using evidence.',16),
 ('M3-LIGHT-AND-EM','M3-S2_3-17','Draw images formed by thin lenses','Draw ray diagrams showing image formation by thin lenses.',17),
 ('M3-LIGHT-AND-EM','M3-S2_3-18','Explain optical instruments and the eye','Explain light phenomena and the operation of optical instruments and the eye lens.',18),
 ('M3-LIGHT-AND-EM','M3-S2_3-19','Draw optical instrument and eye ray diagrams','Draw ray diagrams for image formation in optical instruments and the eye.',19),
 ('M3-LIGHT-AND-EM','M3-S2_3-20','Measure illuminance','Measure light illuminance using an appropriate light meter and record results in lux.',20),
 ('M3-LIGHT-AND-EM','M3-S2_3-21','Recommend suitable lighting','Analyse how illuminance affects vision and recommend suitable lighting for different activities.',21),
 ('M3-SOLAR-SYSTEM','M3-S3_1-01','Explain planetary orbits using gravity','Explain planetary orbits around the Sun using gravitational force and the inverse-square relationship.',1),
 ('M3-SOLAR-SYSTEM','M3-S3_1-02','Model seasons and apparent solar motion','Model how Earth''s axial tilt and orbit produce seasons and changes in the Sun''s apparent path.',2),
 ('M3-SOLAR-SYSTEM','M3-S3_1-03','Model lunar phases and tides','Model lunar phases, changes in moonrise and moonset times, and the causes of tides.',3),
 ('M3-SOLAR-SYSTEM','M3-S3_1-04','Evaluate space technology','Explain uses of space technology and describe progress in space exploration.',4),
 ('M3-ROCKS-AND-HAZARDS','M3-S3_2-01','Explain the rock cycle','Compare igneous, sedimentary and metamorphic rock formation and model the rock cycle.',1),
 ('M3-ROCKS-AND-HAZARDS','M3-S3_2-02','Evaluate uses of rocks and minerals','Describe and give examples of how rocks and minerals are used in daily life.',2),
 ('M3-ROCKS-AND-HAZARDS','M3-S3_2-03','Model fossil formation and interpret evidence','Model fossil formation and infer past environments from fossil evidence.',3),
 ('M3-ROCKS-AND-HAZARDS','M3-S3_2-04','Compare local winds and monsoons','Compare land and sea breezes with monsoon winds and explain their effects.',4),
 ('M3-ROCKS-AND-HAZARDS','M3-S3_2-05','Explain Thailand''s seasons','Explain how seasonal monsoons and solar heating contribute to Thailand''s seasons.',5),
 ('M3-ROCKS-AND-HAZARDS','M3-S3_2-06','Analyse natural hazards','Describe impacts of floods, coastal erosion, landslides, earthquakes and tsunamis.',6),
 ('M3-ROCKS-AND-HAZARDS','M3-S3_2-07','Prepare for natural hazards','Recommend local monitoring, preparedness and safe actions for natural hazards and geological disasters.',7)
) as o(topic_code,code,name,description,seq) on true
join public.learning_topics tp on tp.skill_id=sk.id and tp.code=o.topic_code
where s.code='SCI'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,a.seq,true,
 'Thailand Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017); official indicator '||a.indicator||'.'
from (values
 ('M3-S2_3-01',1,'ว 2.3 ม.3/1'),('M3-S2_3-02',2,'ว 2.3 ม.3/2'),('M3-S2_3-03',3,'ว 2.3 ม.3/3'),
 ('M3-S2_3-04',4,'ว 2.3 ม.3/4'),('M3-S2_3-05',5,'ว 2.3 ม.3/5'),('M3-S2_3-06',6,'ว 2.3 ม.3/6'),
 ('M3-S2_3-07',7,'ว 2.3 ม.3/7'),('M3-S2_3-08',8,'ว 2.3 ม.3/8'),('M3-S2_3-09',9,'ว 2.3 ม.3/9'),
 ('M3-S2_3-10',10,'ว 2.3 ม.3/10'),('M3-S2_3-11',11,'ว 2.3 ม.3/11'),('M3-S2_3-12',12,'ว 2.3 ม.3/12'),
 ('M3-S2_3-13',13,'ว 2.3 ม.3/13'),('M3-S2_3-14',14,'ว 2.3 ม.3/14'),('M3-S2_3-15',15,'ว 2.3 ม.3/15'),
 ('M3-S2_3-16',16,'ว 2.3 ม.3/16'),('M3-S2_3-17',17,'ว 2.3 ม.3/17'),('M3-S2_3-18',18,'ว 2.3 ม.3/18'),
 ('M3-S2_3-19',19,'ว 2.3 ม.3/19'),('M3-S2_3-20',20,'ว 2.3 ม.3/20'),('M3-S2_3-21',21,'ว 2.3 ม.3/21'),
 ('M3-S3_1-01',22,'ว 3.1 ม.3/1'),('M3-S3_1-02',23,'ว 3.1 ม.3/2'),('M3-S3_1-03',24,'ว 3.1 ม.3/3'),('M3-S3_1-04',25,'ว 3.1 ม.3/4'),
 ('M3-S3_2-01',26,'ว 3.2 ม.3/1'),('M3-S3_2-02',27,'ว 3.2 ม.3/2'),('M3-S3_2-03',28,'ว 3.2 ม.3/3'),
 ('M3-S3_2-04',29,'ว 3.2 ม.3/4'),('M3-S3_2-05',30,'ว 3.2 ม.3/5'),('M3-S3_2-06',31,'ว 3.2 ม.3/6'),('M3-S3_2-07',32,'ว 3.2 ม.3/7')
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
