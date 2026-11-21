-- M6 upper-secondary core Science: 25 grade-specific indicators.
-- OBEC 2021 standards W3.1 (10), W3.2 (14), W4.2 (1), source pages 158–167.
-- M6/4 is dual-classified Must-Know and Should-Know; stored as Must-Know with the second class noted.
begin;
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.topic_code,v.topic_name,v.topic_desc,v.sequence_no,'active'
from (values
('EARTH','M6-UNIVERSE-STARS-AND-SPACE','Universe, Stars and Space Exploration','Explain the Big Bang, galaxies, stars, the Solar System, solar activity and space technologies.',1),
('EARTH','M6-EARTH-STRUCTURE-AND-CLIMATE','Earth Structure, Tectonics and Climate Systems','Explain Earth structure, plate tectonics, geological hazards, atmospheric circulation, ocean currents, climate and weather.',2),
('TECH','M6-DIGITAL-SHARING-AND-IT-IMPACTS','Digital Sharing, Ethics and Technology Change','Present and share information safely and ethically and analyse the effects of information technology on life, work, society and culture.',1)
) v(skill_code,topic_code,topic_name,topic_desc,sequence_no)
join public.learning_skills sk on sk.code=v.skill_code
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,v.code,v.name,v.description,v.sequence_no,'active'
from (values
('M6-S3_1-01','Explain the origin and evolution of the universe','Explain changes in the universe''s energy, matter, size and temperature after the Big Bang at different stages of cosmic evolution.',70,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-02','Explain evidence supporting the Big Bang theory','Explain evidence for the Big Bang using the relationship between galaxy distance and recession speed and the cosmic microwave background.',71,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-03','Describe the Milky Way and the Solar System''s location','Explain the structure and components of the Milky Way, locate the Solar System within it and relate this to the Milky Way''s appearance in the night sky.',72,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-04','Explain how stars form from nebulae','Explain the formation of stars from collapsing nebular material, including changes in pressure, temperature and size before nuclear fusion begins.',73,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-05','Explain stellar luminosity and magnitude','Identify factors affecting stellar luminosity and explain the relationship between luminosity and the magnitude scale used by observers.',74,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-06','Relate star colour, surface temperature and spectrum','Explain how a star''s colour relates to its surface temperature and spectrum, and how spectra help classify stars.',75,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-07','Explain stellar evolution using initial mass','Explain how a star''s initial mass influences its evolution, lifetime and final state.',76,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-08','Explain Solar System formation and habitable planetary conditions','Explain the formation of the Solar System from the solar nebula, classify broad regions of Solar System bodies and identify conditions that can support life.',77,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-09','Explain the Sun, solar wind and solar storms','Describe the Sun''s internal and atmospheric structure, explain solar wind and solar storms, and analyse possible effects on Earth, including Thailand.',78,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_1-10','Explain space exploration technologies and applications','Research space exploration using telescopes across different wavelengths, satellites, spacecraft and space stations, and propose applications of space technology in everyday life or the future.',79,'M6-UNIVERSE-STARS-AND-SPACE'),
('M6-S3_2-01','Explain Earth''s internal layers and their properties','Explain the layers of Earth using chemical composition and mechanical properties, and identify evidence supporting these models.',80,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-02','Explain geological evidence for plate tectonics','Explain evidence supporting the movement of tectonic plates, including matching continental margins, rock patterns, fossils, palaeomagnetism and ocean-floor features.',81,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-03','Identify plate-boundary types and associated evidence','Explain causes and types of tectonic plate boundaries and relate them to geological features and hazards.',82,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-04','Explain volcanic eruptions and safety measures','Explain causes and processes of volcanic eruptions, identify areas at risk and propose monitoring and safety measures.',83,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-05','Explain earthquakes, impacts and preparedness','Explain earthquake causes, magnitude and intensity, impacts and risk areas, and propose monitoring and personal safety measures.',84,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-06','Explain tsunamis and coastal preparedness','Explain tsunami causes, processes and impacts, identify at-risk coastal areas and propose warning and safety measures.',85,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-07','Explain uneven solar energy received across Earth','Explain why different parts of Earth receive different amounts of solar energy, considering Earth''s shape and tilt, surface properties, aerosols and clouds.',66,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-08','Explain atmospheric circulation caused by pressure differences','Explain how horizontal and vertical air movement caused by pressure differences creates atmospheric circulation.',67,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-09','Explain the Coriolis effect on moving air','Explain how Earth''s rotation causes the Coriolis effect and changes the direction of moving air in the Northern and Southern Hemispheres.',68,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-10','Explain global atmospheric circulation and climate zones','Explain latitudinal atmospheric circulation patterns and how they relate to tropical, temperate and polar climate zones.',69,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-11','Explain surface ocean-current circulation','Explain the factors driving surface ocean currents and describe broad circulation patterns in the Northern and Southern Hemispheres.',90,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-12','Explain climate and ecosystem effects of ocean-atmosphere circulation','Explain how atmospheric and ocean-surface circulation affect climate, weather, living organisms and environments, including El Niño and La Niña.',91,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-13','Explain global climate-change drivers and mitigation','Explain natural and human factors affecting global climate change and present actions that reduce human contributions.',92,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S3_2-14','Interpret weather maps and use forecasts for planning','Interpret important weather-map symbols and combine weather information from forecasts, radar and satellite images to plan activities safely.',93,'M6-EARTH-STRUCTURE-AND-CLIMATE'),
('M6-S4_2-01','Share information safely and evaluate changes in information technology','Use information technology to present and share information safely and ethically, and analyse how changes in information technology affect life, work, society and culture.',102,'M6-DIGITAL-SHARING-AND-IT-IMPACTS')
) v(code,name,description,sequence_no,topic_code)
join public.learning_topics t on t.code=v.topic_code
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,v.sequence_no,true,
 'OBEC 2021 source; exact indicator '||v.indicator_code||'. Grade-specific M6 alignment only.'||
 case when v.code='M6-S3_1-04' then ' Dual-classified: Must-Know and Should-Know; stored primary classification is Must-Know.' else '' end,
v.classification
from (values
('M6-S3_1-01','ว 3.1 ม.6/1',70,'must_know'),
('M6-S3_1-02','ว 3.1 ม.6/2',71,'must_know'),
('M6-S3_1-03','ว 3.1 ม.6/3',72,'must_know'),
('M6-S3_1-04','ว 3.1 ม.6/4',73,'must_know'),
('M6-S3_1-05','ว 3.1 ม.6/5',74,'must_know'),
('M6-S3_1-06','ว 3.1 ม.6/6',75,'must_know'),
('M6-S3_1-07','ว 3.1 ม.6/7',76,'must_know'),
('M6-S3_1-08','ว 3.1 ม.6/8',77,'must_know'),
('M6-S3_1-09','ว 3.1 ม.6/9',78,'must_know'),
('M6-S3_1-10','ว 3.1 ม.6/10',79,'must_know'),
('M6-S3_2-01','ว 3.2 ม.6/1',80,'must_know'),
('M6-S3_2-02','ว 3.2 ม.6/2',81,'must_know'),
('M6-S3_2-03','ว 3.2 ม.6/3',82,'must_know'),
('M6-S3_2-04','ว 3.2 ม.6/4',83,'must_know'),
('M6-S3_2-05','ว 3.2 ม.6/5',84,'must_know'),
('M6-S3_2-06','ว 3.2 ม.6/6',85,'must_know'),
('M6-S3_2-07','ว 3.2 ม.6/7',66,'should_know'),
('M6-S3_2-08','ว 3.2 ม.6/8',67,'must_know'),
('M6-S3_2-09','ว 3.2 ม.6/9',68,'must_know'),
('M6-S3_2-10','ว 3.2 ม.6/10',69,'must_know'),
('M6-S3_2-11','ว 3.2 ม.6/11',90,'must_know'),
('M6-S3_2-12','ว 3.2 ม.6/12',91,'must_know'),
('M6-S3_2-13','ว 3.2 ม.6/13',92,'must_know'),
('M6-S3_2-14','ว 3.2 ม.6/14',93,'must_know'),
('M6-S4_2-01','ว 4.2 ม.6/1',102,'must_know')
) v(code,indicator_code,sequence_no,classification)
join public.learning_objectives o on o.code=v.code
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SCI'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=true,notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();
commit;