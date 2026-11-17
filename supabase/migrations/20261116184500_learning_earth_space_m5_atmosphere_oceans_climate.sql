-- E&P Learning: M5 Earth, Astronomy and Space Science — weather, atmosphere and climate outcomes 1–13.
-- Official IPST curriculum-use manual, Additional Earth, Astronomy and Space Science,
-- M5 standard 2 / outcomes 1–13 (printed pp. 21–24; teacher analysis pp. 95–110).
-- All outcomes are grade-scoped to M5; outcome numbering is not global.
begin;
do $$ begin
 if not exists(
  select 1 from public.learning_subjects s
  join public.learning_curricula c on c.code='TH-SCI-M1-M6'
  join public.learning_education_systems es on es.id=c.education_system_id
  join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
  where s.code='EARTH_SPACE' and es.code='TH_BASIC'
    and s.status='active' and c.status='active' and g.status='active'
 ) then raise exception 'Active EARTH_SPACE subject and M5 Science grade are required.'; end if;
end $$;

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'M5-ATMOSPHERE-OCEANS-CLIMATE','Atmosphere, Oceans and Climate',
 'M5 Additional Earth, Astronomy and Space Science outcomes 1–13: global energy balance, atmospheric circulation, ocean structure and circulation, clouds and fronts, climate change, weather maps and forecasting.','active'
from public.learning_subjects s where s.code='EARTH_SPACE'
on conflict(subject_id,code) do update
set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-WEATHER-CLIMATE-OUTCOMES-01-13','Weather, Atmosphere, Oceans and Climate',
 'Official M5 standard 2 learning outcomes 1–13. Covers solar-energy distribution and global energy balance; atmospheric and ocean circulation; cloud stability and fronts; climate change; weather-map interpretation and forecasting.',1,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='EARTH_SPACE' and sk.code='M5-ATMOSPHERE-OCEANS-CLIMATE'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=1,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-EAS-ATM-01','Explain Uneven Solar Energy and Its Effects on Air Temperature','Explain key factors causing differences in solar energy received and emitted across Earth and relate them to regional air-temperature differences.',1),
 ('M5-EAS-ATM-02','Explain Earth’s Energy Balance','Explain the processes that establish Earth’s energy balance, including incoming solar radiation, reflection, absorption, transfer and outgoing radiation.',2),
 ('M5-EAS-ATM-03','Explain Forces Driving Atmospheric Circulation','Explain how pressure-gradient force, Coriolis force, centripetal force and friction affect atmospheric circulation and wind.',3),
 ('M5-EAS-ATM-04','Explain Latitudinal Atmospheric Circulation','Explain atmospheric circulation by latitude and relate global circulation cells to prevailing winds and climate patterns.',4),
 ('M5-EAS-ATM-05','Explain Ocean-Water Stratification','Explain factors that produce ocean-water layers, including differences in temperature, salinity and density.',5),
 ('M5-EAS-ATM-06','Explain Ocean Circulation and Its Patterns','Explain factors driving surface and deep-ocean circulation and describe major patterns of ocean-water movement.',6),
 ('M5-EAS-ATM-07','Explain Effects of Ocean Circulation','Explain how ocean circulation affects weather and climate, marine organisms and environmental conditions.',7),
 ('M5-EAS-ATM-08','Explain Atmospheric Stability and Cloud Formation','Explain the relationship between atmospheric stability, vertical air movement and cloud formation.',8),
 ('M5-EAS-ATM-09','Explain Weather Fronts and Associated Conditions','Explain how warm, cold, occluded and stationary fronts form and relate each front type to associated cloud and weather conditions.',9),
 ('M5-EAS-ATM-10','Explain Drivers of Global Climate Change','Explain natural and human-related factors that affect global climate, using evidence such as ice-core records and observed climate data.',10),
 ('M5-EAS-ATM-11','Analyse Climate-Change Impacts and Mitigation','Analyse and discuss events and impacts associated with global climate change and present human practices that can help slow climate change.',11),
 ('M5-EAS-ATM-12','Interpret Weather-Map Symbols','Interpret standard weather-station symbols and map features, including pressure, temperature, humidity, wind, cloud and precipitation information.',12),
 ('M5-EAS-ATM-13','Analyse and Forecast Weather from Data','Use weather maps and supporting information such as forecasts, radar and satellite observations to analyse and make basic weather predictions for practical planning.',13)
) as v(code,name,description,seq)
where s.code='EARTH_SPACE' and tp.code='M5-WEATHER-CLIMATE-OUTCOMES-01-13'
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Earth, Astronomy and Space Science, M5 standard 2 learning outcome '||ob.sequence_no||'; IPST curriculum-use manual, printed pp. 21–24 and teacher analysis pp. 95–110.'
from public.learning_objectives ob
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='EARTH_SPACE'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where ob.code in (
 'M5-EAS-ATM-01','M5-EAS-ATM-02','M5-EAS-ATM-03','M5-EAS-ATM-04',
 'M5-EAS-ATM-05','M5-EAS-ATM-06','M5-EAS-ATM-07','M5-EAS-ATM-08',
 'M5-EAS-ATM-09','M5-EAS-ATM-10','M5-EAS-ATM-11','M5-EAS-ATM-12','M5-EAS-ATM-13'
)
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
