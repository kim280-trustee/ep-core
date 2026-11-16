-- E&P Learning: M6 Earth, Astronomy and Space Science — astronomy outcomes 1–19.
-- Official IPST curriculum-use manual, additional Earth, Astronomy and Space Science,
-- M6 standard 3 learning outcomes 1–19 (printed pp. 25–30; crosswalk pp. 31–32).
-- Astronomy outcome numbering is grade/standard scoped. All 19 are assigned to M6.
begin;
do $$ begin
 if not exists(
  select 1 from public.learning_subjects s
  join public.learning_curricula c on c.code='TH-SCI-M1-M6'
  join public.learning_education_systems es on es.id=c.education_system_id
  join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
  where s.code='EARTH_SPACE' and es.code='TH_BASIC'
    and s.status='active' and c.status='active' and g.status='active'
 ) then raise exception 'Active EARTH_SPACE subject and M6 Science grade are required.'; end if;
end $$;

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'M6-ASTRONOMY-SPACE','Astronomy and Space Science',
 'M6 additional learning outcomes 1–19: universe and galaxies, stellar formation and evolution, Solar System dynamics, the Sun, celestial sphere, astronomical time, apparent planetary positions, space technology and sky observation.','active'
from public.learning_subjects s where s.code='EARTH_SPACE'
on conflict(subject_id,code) do update
set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M6-ASTRONOMY-OUTCOMES-01-19','Universe, Stars, Solar System and Observational Astronomy',
 'Official M6 standard 3 learning outcomes 1–19. Includes Big Bang evidence, Milky Way, stellar physics and evolution, planetary orbits, solar activity, celestial coordinates, solar time, apparent planetary positions and space exploration.','active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='EARTH_SPACE' and sk.code='M6-ASTRONOMY-SPACE'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=1,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-EAS-AST-01','Explain the Evolution of the Universe after the Big Bang','Explain changes in the energy, matter, size and temperature of the universe at different stages after the Big Bang.',1),
 ('M6-EAS-AST-02','Evaluate Evidence Supporting the Big Bang','Explain evidence supporting the Big Bang model, including the relationship between galaxy recession velocity and distance and the cosmic microwave background.',2),
 ('M6-EAS-AST-03','Describe the Milky Way and the Solar System’s Location','Explain the structure and components of the Milky Way and locate the Solar System within it, linking this position to the Milky Way appearance observed from Earth.',3),
 ('M6-EAS-AST-04','Explain the Formation of Stars','Explain star formation by describing changes in pressure, temperature and size as a protostar develops into a star.',4),
 ('M6-EAS-AST-05','Explain Energy Production in Stars','Explain stellar energy production and its effects by analysing the proton–proton chain and carbon–nitrogen–oxygen cycle.',5),
 ('M6-EAS-AST-06','Relate Stellar Luminosity and Magnitude','Identify factors affecting stellar luminosity and explain the relationship between luminosity and stellar magnitude.',6),
 ('M6-EAS-AST-07','Relate Stellar Colour, Surface Temperature and Spectrum','Explain the relationships among a star’s colour, surface temperature and spectrum.',7),
 ('M6-EAS-AST-08','Calculate Stellar Distance Using Parallax','Explain the parallax method for measuring stellar distance and calculate distance from a measured parallax angle.',8),
 ('M6-EAS-AST-09','Analyse Stellar Evolution with the Hertzsprung–Russell Diagram','Explain stellar evolutionary stages in relation to initial mass and analyse changes in stellar properties using the Hertzsprung–Russell diagram.',9),
 ('M6-EAS-AST-10','Explain Solar System Formation and Habitable Planetary Zones','Explain the formation of the Solar System, classify the regions and populations orbiting the Sun, and describe planetary characteristics that can support life.',10),
 ('M6-EAS-AST-11','Apply Kepler’s Laws and Newtonian Gravity to Planetary Orbits','Explain planetary motion using Kepler’s laws and Newton’s law of gravitation, and calculate planetary orbital periods.',11),
 ('M6-EAS-AST-12','Explain the Sun, Solar Wind and Solar Storms','Explain the Sun’s structure, the origin of solar wind and solar storms, and analyse and present their effects on Earth, including Thailand.',12),
 ('M6-EAS-AST-13','Model the Celestial Sphere and Astronomical Coordinates','Construct a celestial-sphere model, relate its key points and lines to the real sky, and explain locating stars using horizontal and equatorial coordinate systems.',13),
 ('M6-EAS-AST-14','Explain Apparent Rising and Setting Paths','Observe the sky and explain the apparent rising and setting paths of the Sun and stars.',14),
 ('M6-EAS-AST-15','Explain Apparent Solar Time','Collect and compare observations of the times when the Sun crosses an observer’s meridian on different days to explain apparent solar time.',15),
 ('M6-EAS-AST-16','Explain Mean Solar Time and World Time Zones','Explain mean solar time and how local times are compared and organised into time zones around Earth.',16),
 ('M6-EAS-AST-17','Relate Planetary Elongation to Apparent Position','Explain planetary elongation in relation to orbital position and connect it to the apparent positions of planets observed from Earth.',17),
 ('M6-EAS-AST-18','Evaluate Space Exploration Technologies and Applications','Research and explain space exploration using telescopes across different wavelengths, satellites, spacecraft and space stations, and propose applications of space technology in everyday life or the future.',18),
 ('M6-EAS-AST-19','Plan and Present a Sky-Observation Activity','Research, design and present an activity for observing celestial objects with the unaided eye and/or a telescope.',19)
) as v(code,name,description,seq)
where s.code='EARTH_SPACE' and tp.code='M6-ASTRONOMY-OUTCOMES-01-19'
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Earth, Astronomy and Space Science, M6 standard 3 learning outcome '||ob.sequence_no||'; IPST curriculum-use manual, printed pp. 25–30 and crosswalk pp. 31–32.'
from public.learning_objectives ob
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='EARTH_SPACE'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
where ob.code in (
 'M6-EAS-AST-01','M6-EAS-AST-02','M6-EAS-AST-03','M6-EAS-AST-04',
 'M6-EAS-AST-05','M6-EAS-AST-06','M6-EAS-AST-07','M6-EAS-AST-08',
 'M6-EAS-AST-09','M6-EAS-AST-10','M6-EAS-AST-11','M6-EAS-AST-12',
 'M6-EAS-AST-13','M6-EAS-AST-14','M6-EAS-AST-15','M6-EAS-AST-16',
 'M6-EAS-AST-17','M6-EAS-AST-18','M6-EAS-AST-19'
)
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
