-- E&P Learning: M4 Earth, Astronomy and Space Science — geology outcomes 1–12.
-- Official IPST curriculum-use manual, Additional Earth, Astronomy and Space Science,
-- M4 standard 1 learning outcomes 1–12 (printed curriculum pages 17–20; teacher analysis pp. 80–92).
-- All twelve geology outcomes, including topographic/geological map interpretation (outcome 12),
-- are explicitly presented in the M4 teaching section. Do not allocate outcome 12 to M5/M6.
begin;
do $$ begin
 if not exists(
  select 1 from public.learning_subjects s
  join public.learning_curricula c on c.code='TH-SCI-M1-M6'
  join public.learning_education_systems es on es.id=c.education_system_id
  join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
  where s.code='EARTH_SPACE' and es.code='TH_BASIC'
    and s.status='active' and c.status='active' and g.status='active'
 ) then raise exception 'Active EARTH_SPACE subject and M4 Science grade are required.'; end if;
end $$;

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'M4-GEOLOGY','Earth Structure, Geological Processes and Resources',
 'M4 additional learning outcomes 1–12: Earth structure, plate tectonics, geological evidence and history, geohazards, minerals, rocks, fossil fuels and geological/topographic maps.','active'
from public.learning_subjects s where s.code='EARTH_SPACE'
on conflict(subject_id,code) do update
set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M4-GEOLOGY-OUTCOMES-01-12','Earth Structure, Tectonics, Geohazards and Geological Resources',
 'Official M4 standard 1 learning outcomes 1–12. Includes evidence-based geological interpretation, resource identification and map literacy.','active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='EARTH_SPACE' and sk.code='M4-GEOLOGY'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=1,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M4-EAS-GEO-01','Explain Earth’s Internal Structure','Explain the layers and properties of Earth’s internal structure using evidence such as rock and meteorite composition and seismic-wave behaviour.',1),
 ('M4-EAS-GEO-02','Evaluate Geological Evidence for Plate Movement','Explain geological evidence supporting the movement of tectonic plates, including matching rock belts, mountain ranges, fossils, glacial traces, ocean-floor ages, palaeomagnetism and mid-ocean ridges.',2),
 ('M4-EAS-GEO-03','Explain Plate Boundaries and Their Geological Features','Identify causes and explain types of plate-boundary movement and the landforms and geological structures associated with convergent, divergent and transform boundaries.',3),
 ('M4-EAS-GEO-04','Reconstruct Past Geological Events','Analyse present-day geological evidence and explain the sequence of past geological events using stratigraphic principles, relative and absolute dating, and the geologic time scale.',4),
 ('M4-EAS-GEO-05','Explain Volcanic Eruptions and Volcanic Hazards','Explain the causes and processes of volcanic eruptions, factors affecting eruption intensity and volcano shape, and use hazard information to propose monitoring and safety practices.',5),
 ('M4-EAS-GEO-06','Explain Earthquakes and Earthquake Safety','Explain earthquake causes, processes, magnitude, intensity and effects, identify hazard-risk areas, and propose monitoring and personal safety practices.',6),
 ('M4-EAS-GEO-07','Explain Tsunamis and Tsunami Safety','Explain tsunami causes, generation processes and impacts, identify areas at risk, and propose warning, preparedness and safe-response practices.',7),
 ('M4-EAS-GEO-08','Identify Minerals and Evaluate Their Uses','Examine and identify minerals using observable physical properties and appropriate tests, analyse their properties, and propose suitable and sustainable uses of mineral resources.',8),
 ('M4-EAS-GEO-09','Classify Rocks and Evaluate Their Uses','Examine, classify and name rocks using formation processes, texture and mineral composition; distinguish igneous, sedimentary and metamorphic rocks and explain suitable uses.',9),
 ('M4-EAS-GEO-10','Explain Petroleum and Coal Formation and Exploration','Explain how petroleum and coal form and how geological information is used to investigate and explore their deposits.',10),
 ('M4-EAS-GEO-11','Evaluate Products from Petroleum and Coal','Describe properties of products derived from petroleum and coal and present appropriate, efficient and responsible uses.',11),
 ('M4-EAS-GEO-12','Interpret Topographic and Geological Maps','Read and interpret topographic and geological maps for a specified area and explain applications such as resource assessment, land-use planning and infrastructure siting.',12)
) as v(code,name,description,seq)
where s.code='EARTH_SPACE' and tp.code='M4-GEOLOGY-OUTCOMES-01-12'
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Earth, Astronomy and Space Science, M4 standard 1 learning outcome '||ob.sequence_no||'; IPST curriculum-use manual, printed curriculum pages 17–20 and teacher analysis pp. 80–92.'
from public.learning_objectives ob
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='EARTH_SPACE'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M4'
where ob.code in (
 'M4-EAS-GEO-01','M4-EAS-GEO-02','M4-EAS-GEO-03','M4-EAS-GEO-04',
 'M4-EAS-GEO-05','M4-EAS-GEO-06','M4-EAS-GEO-07','M4-EAS-GEO-08',
 'M4-EAS-GEO-09','M4-EAS-GEO-10','M4-EAS-GEO-11','M4-EAS-GEO-12'
)
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
