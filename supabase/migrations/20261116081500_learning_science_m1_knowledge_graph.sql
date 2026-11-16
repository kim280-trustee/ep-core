-- E&P Learning: M1 Thai core Science knowledge graph.
-- Based on OBEC / IPST indicators in the 2017 revised Basic Education Core Curriculum.
-- Scope is standards ว 1.x, ว 2.x and ว 3.x only. Technology standards ว 4.1/ว 4.2
-- are intentionally reserved for the separate Design & Technology / Computer Studies workstream.
-- This seeds global academic taxonomy only; no school class or learner records are created.
-- Official source: https://www.academic.obec.go.th/images/document/1580786506_d_1.pdf

begin;

do $$
begin
  if not exists (
    select 1
    from public.learning_subjects s
    join public.learning_curricula c on c.code = 'TH-SCI-M1-M6'
    join public.learning_education_systems es on es.id = c.education_system_id
    join public.learning_grade_levels g on g.curriculum_id = c.id and g.code = 'M1'
    where s.code = 'SCI'
      and es.code = 'TH_BASIC'
      and s.status = 'active'
      and c.status = 'active'
      and g.status = 'active'
  ) then
    raise exception 'Active SCI subject, TH-SCI-M1-M6 curriculum and M1 grade are required before seeding M1 Science objectives.';
  end if;
end;
$$;

insert into public.learning_skills (subject_id, code, name, description, status)
select
  subject.id,
  skills.code,
  skills.name,
  skills.description,
  'active'
from public.learning_subjects subject
cross join (
  values
    ('BIO', 'Biological Science', 'Thai Science strand 1: cell structures and functions, plant processes, transport, reproduction and applications.'),
    ('MATTER', 'Matter and Materials', 'Thai Science strand 2: elements, substances, particle models, physical properties and changes of state.'),
    ('FORCE', 'Forces and Pressure', 'Thai Science strand 2: forces and pressure in everyday physical systems.'),
    ('ENERGY', 'Energy and Heat', 'Thai Science strand 2: heat, temperature, thermal expansion, equilibrium and heat transfer.'),
    ('EARTH', 'Earth and Atmosphere', 'Thai Science strand 3: atmosphere, weather systems, forecasting and climate change.')
) as skills(code, name, description)
where subject.code = 'SCI'
on conflict (subject_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  status = 'active',
  updated_at = now();

insert into public.learning_topics (skill_id, code, name, description, sequence_no, status)
select
  skill.id,
  topics.code,
  topics.name,
  topics.description,
  topics.sequence_no,
  'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('BIO', 'CELLS-AND-ORGANISATION', 'Cells and Organisation of Life', 'Compare plant and animal cells, use microscopes, relate cell structures to functions and explain levels of organisation in multicellular organisms.', 1),
    ('BIO', 'CELL-TRANSPORT-AND-PHOTOSYNTHESIS', 'Cell Transport and Photosynthesis', 'Explain diffusion, osmosis, photosynthesis and the importance of plants to living things and the environment.', 2),
    ('BIO', 'PLANT-TRANSPORT', 'Transport in Plants', 'Describe xylem and phloem and represent the movement of water, minerals and food through plants.', 3),
    ('BIO', 'PLANT-REPRODUCTION', 'Plant Reproduction and Pollination', 'Explain sexual and asexual reproduction in flowering plants, pollination, fertilisation, seed formation and germination.', 4),
    ('BIO', 'PLANT-NUTRITION-AND-PROPAGATION', 'Plant Nutrition and Propagation', 'Apply knowledge of plant nutrients, fertilisers, propagation methods and tissue culture.', 5),
    ('MATTER', 'ELEMENTS-AND-SAFETY', 'Elements and Safe Use of Materials', 'Classify metals, non-metals and metalloids, interpret their properties and evaluate safe and responsible use, including radioactive elements.', 1),
    ('MATTER', 'PURE-SUBSTANCES-AND-MIXTURES', 'Pure Substances and Mixtures', 'Compare boiling points, melting points, density, mass and volume of pure substances and mixtures.', 2),
    ('MATTER', 'ATOMS-AND-COMPOUNDS', 'Atoms, Elements and Compounds', 'Use models to explain relationships among atoms, elements, compounds and basic atomic structure.', 3),
    ('MATTER', 'PARTICLE-MODEL-AND-STATE-CHANGE', 'Particle Model and Changes of State', 'Explain particle arrangement, forces and movement in solids, liquids and gases and connect heat energy to changes of state.', 4),
    ('FORCE', 'AIR-PRESSURE', 'Air Pressure and Altitude', 'Model how air pressure changes with altitude and explain the forces exerted by air.', 1),
    ('ENERGY', 'HEAT-AND-TEMPERATURE', 'Heat, Temperature and Thermal Change', 'Measure temperature and calculate heat involved in temperature changes and changes of state.', 1),
    ('ENERGY', 'THERMAL-EXPANSION', 'Thermal Expansion and Contraction', 'Model expansion and contraction caused by heating and cooling and apply the concepts to practical problems.', 2),
    ('ENERGY', 'THERMAL-EQUILIBRIUM-AND-TRANSFER', 'Thermal Equilibrium and Heat Transfer', 'Analyse heat exchange and model conduction, convection and radiation in everyday situations.', 3),
    ('EARTH', 'ATMOSPHERIC-LAYERS', 'Layers of the Atmosphere', 'Model the layers of Earth’s atmosphere and compare their roles and benefits for life and human activity.', 1),
    ('EARTH', 'WEATHER-ELEMENTS-AND-STORMS', 'Weather Elements and Storms', 'Explain weather elements, factors affecting weather and the formation and impacts of thunderstorms and tropical cyclones.', 2),
    ('EARTH', 'WEATHER-FORECASTING', 'Weather Forecasting', 'Interpret weather information, produce simple forecasts and apply forecasts to everyday decisions and safety.', 3),
    ('EARTH', 'CLIMATE-CHANGE', 'Global Climate Change', 'Explain evidence and impacts of global climate change and identify practical responses.', 4)
) as topics(skill_code, code, name, description, sequence_no)
  on skill.code = topics.skill_code
where subject.code = 'SCI'
on conflict (skill_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  sequence_no = excluded.sequence_no,
  status = 'active',
  updated_at = now();

insert into public.learning_objectives (topic_id, code, name, description, sequence_no, status)
select
  topic.id,
  objectives.code,
  objectives.name,
  objectives.description,
  objectives.sequence_no,
  'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id = subject.id
join (
  values
    ('CELLS-AND-ORGANISATION', 'M1-S1_2-01', 'Compare plant and animal cells', 'Compare the shapes, characteristics and structures of plant and animal cells and describe the functions of the cell wall, cell membrane, cytoplasm, nucleus, vacuole, mitochondria and chloroplast.', 1),
    ('CELLS-AND-ORGANISATION', 'M1-S1_2-02', 'Use a light microscope to study cells', 'Use a light microscope to observe cells and structures within cells.', 2),
    ('CELLS-AND-ORGANISATION', 'M1-S1_2-03', 'Relate cell shape to cell function', 'Explain how the shape and structure of different cells are suited to their functions.', 3),
    ('CELLS-AND-ORGANISATION', 'M1-S1_2-04', 'Explain levels of organisation in living things', 'Explain the organisation of multicellular organisms from cells to tissues, organs, organ systems and the whole organism.', 4),
    ('CELL-TRANSPORT-AND-PHOTOSYNTHESIS', 'M1-S1_2-05', 'Explain diffusion and osmosis', 'Explain diffusion and osmosis using evidence and give examples of these processes in everyday life.', 1),
    ('CELL-TRANSPORT-AND-PHOTOSYNTHESIS', 'M1-S1_2-06', 'Identify requirements and products of photosynthesis', 'Identify the factors required for photosynthesis and the products formed, using empirical evidence.', 2),
    ('CELL-TRANSPORT-AND-PHOTOSYNTHESIS', 'M1-S1_2-07', 'Explain the importance of photosynthesis', 'Explain why photosynthesis is important to living things and the environment.', 3),
    ('CELL-TRANSPORT-AND-PHOTOSYNTHESIS', 'M1-S1_2-08', 'Value and care for plants', 'Recognise the value of plants to living things and the environment by participating in planting and caring for trees in school and the community.', 4),
    ('PLANT-TRANSPORT', 'M1-S1_2-09', 'Describe xylem and phloem', 'Describe the structures and functions of xylem and phloem in plants.', 1),
    ('PLANT-TRANSPORT', 'M1-S1_2-10', 'Represent transport in xylem and phloem', 'Draw a diagram showing the direction of water, minerals and food transport through xylem and phloem.', 2),
    ('PLANT-REPRODUCTION', 'M1-S1_2-11', 'Explain reproduction in flowering plants', 'Explain sexual and asexual reproduction in flowering plants.', 1),
    ('PLANT-REPRODUCTION', 'M1-S1_2-12', 'Explain pollination and seed formation', 'Describe flower structures involved in pollination and explain fertilisation, fruit and seed formation, seed dispersal and germination.', 2),
    ('PLANT-REPRODUCTION', 'M1-S1_2-13', 'Recognise the importance of pollinators', 'Recognise the importance of animals that pollinate flowering plants and avoid harming them.', 3),
    ('PLANT-NUTRITION-AND-PROPAGATION', 'M1-S1_2-14', 'Explain the importance of plant nutrients', 'Explain how selected mineral nutrients affect plant growth and survival.', 1),
    ('PLANT-NUTRITION-AND-PROPAGATION', 'M1-S1_2-15', 'Select suitable fertilisers', 'Choose a fertiliser with suitable nutrients for a plant in a given situation.', 2),
    ('PLANT-NUTRITION-AND-PROPAGATION', 'M1-S1_2-16', 'Select suitable plant propagation methods', 'Choose a plant propagation method that suits a human need using knowledge of plant reproduction.', 3),
    ('PLANT-NUTRITION-AND-PROPAGATION', 'M1-S1_2-17', 'Explain uses of plant tissue culture', 'Explain the importance and applications of plant tissue-culture technology.', 4),
    ('PLANT-NUTRITION-AND-PROPAGATION', 'M1-S1_2-18', 'Apply plant propagation knowledge', 'Recognise the benefits of plant propagation and apply this knowledge in everyday life.', 5),

    ('ELEMENTS-AND-SAFETY', 'M1-S2_1-01', 'Classify metals, non-metals and metalloids', 'Explain selected physical properties of metals, non-metals and metalloids using observations, tests and information sources, and classify elements accordingly.', 1),
    ('ELEMENTS-AND-SAFETY', 'M1-S2_1-02', 'Evaluate impacts of using elements', 'Analyse effects of using metals, non-metals, metalloids and radioactive elements on living things, the environment, the economy and society.', 2),
    ('ELEMENTS-AND-SAFETY', 'M1-S2_1-03', 'Promote safe and responsible use of elements', 'Recognise the value of elements and propose safe and efficient ways to use metals, non-metals, metalloids and radioactive elements.', 3),
    ('PURE-SUBSTANCES-AND-MIXTURES', 'M1-S2_1-04', 'Compare boiling and melting points', 'Compare boiling and melting points of pure substances and mixtures by measuring temperature, plotting graphs and interpreting data.', 1),
    ('PURE-SUBSTANCES-AND-MIXTURES', 'M1-S2_1-05', 'Compare density of pure substances and mixtures', 'Explain and compare the density of pure substances and mixtures.', 2),
    ('PURE-SUBSTANCES-AND-MIXTURES', 'M1-S2_1-06', 'Measure mass and volume', 'Use suitable instruments to measure the mass and volume of pure substances and mixtures.', 3),
    ('ATOMS-AND-COMPOUNDS', 'M1-S2_1-07', 'Relate atoms, elements and compounds', 'Explain relationships among atoms, elements and compounds using models and information.', 1),
    ('ATOMS-AND-COMPOUNDS', 'M1-S2_1-08', 'Model atomic structure', 'Explain atomic structure in terms of protons, neutrons and electrons using a model.', 2),
    ('PARTICLE-MODEL-AND-STATE-CHANGE', 'M1-S2_1-09', 'Compare particles in solids, liquids and gases', 'Explain and compare particle arrangement, intermolecular forces and particle movement in the same substance in solid, liquid and gas states using models.', 1),
    ('PARTICLE-MODEL-AND-STATE-CHANGE', 'M1-S2_1-10', 'Explain heat energy and changes of state', 'Explain how thermal energy relates to changes of state using empirical evidence and models.', 2),

    ('AIR-PRESSURE', 'M1-S2_2-01', 'Model air pressure and altitude', 'Create a model explaining the relationship between air pressure and height above Earth’s surface.', 1),

    ('HEAT-AND-TEMPERATURE', 'M1-S2_3-01', 'Calculate heat in temperature and state changes', 'Interpret data and calculate heat required for temperature changes and changes of state using Q = mcΔT and Q = mL.', 1),
    ('HEAT-AND-TEMPERATURE', 'M1-S2_3-02', 'Measure temperature with a thermometer', 'Use a thermometer to measure the temperature of substances.', 2),
    ('THERMAL-EXPANSION', 'M1-S2_3-03', 'Model thermal expansion and contraction', 'Create a model explaining how substances expand or contract when they gain or lose heat.', 1),
    ('THERMAL-EXPANSION', 'M1-S2_3-04', 'Apply thermal expansion knowledge', 'Recognise the practical value of thermal expansion and contraction by analysing everyday problems and proposing solutions.', 2),
    ('THERMAL-EQUILIBRIUM-AND-TRANSFER', 'M1-S2_3-05', 'Calculate heat transfer at thermal equilibrium', 'Analyse heat-transfer situations and calculate heat exchanged between substances until thermal equilibrium using Q lost = Q gained.', 1),
    ('THERMAL-EQUILIBRIUM-AND-TRANSFER', 'M1-S2_3-06', 'Model the three modes of heat transfer', 'Create models explaining heat transfer by conduction, convection and radiation.', 2),
    ('THERMAL-EQUILIBRIUM-AND-TRANSFER', 'M1-S2_3-07', 'Design a device using heat-transfer knowledge', 'Design, select or construct a device to solve an everyday problem using knowledge of heat transfer.', 3),

    ('ATMOSPHERIC-LAYERS', 'M1-S3_2-01', 'Model the layers of the atmosphere', 'Create a model explaining the layers of the atmosphere and compare the benefits of each layer.', 1),
    ('WEATHER-ELEMENTS-AND-STORMS', 'M1-S3_2-02', 'Explain factors affecting weather elements', 'Explain factors that affect changes in weather elements using collected data.', 1),
    ('WEATHER-ELEMENTS-AND-STORMS', 'M1-S3_2-03', 'Compare thunderstorms and tropical cyclones', 'Compare how thunderstorms and tropical cyclones form, their effects on living things and the environment, and safe responses.', 2),
    ('WEATHER-FORECASTING', 'M1-S3_2-04', 'Make a simple weather forecast', 'Explain weather forecasting and produce a simple forecast from collected weather data.', 1),
    ('WEATHER-FORECASTING', 'M1-S3_2-05', 'Use weather forecasts responsibly', 'Recognise the value of weather forecasts and present ways to use forecasts for daily decisions and safety.', 2),
    ('CLIMATE-CHANGE', 'M1-S3_2-06', 'Explain global climate change and its impacts', 'Explain current global climate-change conditions and impacts using collected information.', 1),
    ('CLIMATE-CHANGE', 'M1-S3_2-07', 'Respond to global climate change', 'Recognise the impacts of global climate change and propose practical actions to adapt and reduce contributing activities.', 2)
) as objectives(topic_code, code, name, description, sequence_no)
  on true
join public.learning_topics topic
  on topic.skill_id = skill.id
 and topic.code = objectives.topic_code
where subject.code = 'SCI'
on conflict (topic_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  sequence_no = excluded.sequence_no,
  status = 'active',
  updated_at = now();

insert into public.learning_objective_alignments (
  objective_id,
  curriculum_id,
  grade_level_id,
  sequence_no,
  required,
  notes
)
select
  objective.id,
  curriculum.id,
  grade.id,
  alignment.sequence_no,
  true,
  'Thailand Basic Education Core Curriculum B.E. 2551 (2008), Science indicators revised B.E. 2560 (2017); indicator ' || alignment.indicator_code || '.'
from public.learning_objectives objective
join public.learning_topics objective_topic
  on objective_topic.id = objective.topic_id
join public.learning_skills objective_skill
  on objective_skill.id = objective_topic.skill_id
join public.learning_subjects objective_subject
  on objective_subject.id = objective_skill.subject_id
 and objective_subject.code = 'SCI'
join (
  values
    ('M1-S1_2-01', 1, 'ว 1.2 ม.1/1'),
    ('M1-S1_2-02', 2, 'ว 1.2 ม.1/2'),
    ('M1-S1_2-03', 3, 'ว 1.2 ม.1/3'),
    ('M1-S1_2-04', 4, 'ว 1.2 ม.1/4'),
    ('M1-S1_2-05', 5, 'ว 1.2 ม.1/5'),
    ('M1-S1_2-06', 6, 'ว 1.2 ม.1/6'),
    ('M1-S1_2-07', 7, 'ว 1.2 ม.1/7'),
    ('M1-S1_2-08', 8, 'ว 1.2 ม.1/8'),
    ('M1-S1_2-09', 9, 'ว 1.2 ม.1/9'),
    ('M1-S1_2-10', 10, 'ว 1.2 ม.1/10'),
    ('M1-S1_2-11', 11, 'ว 1.2 ม.1/11'),
    ('M1-S1_2-12', 12, 'ว 1.2 ม.1/12'),
    ('M1-S1_2-13', 13, 'ว 1.2 ม.1/13'),
    ('M1-S1_2-14', 14, 'ว 1.2 ม.1/14'),
    ('M1-S1_2-15', 15, 'ว 1.2 ม.1/15'),
    ('M1-S1_2-16', 16, 'ว 1.2 ม.1/16'),
    ('M1-S1_2-17', 17, 'ว 1.2 ม.1/17'),
    ('M1-S1_2-18', 18, 'ว 1.2 ม.1/18'),
    ('M1-S2_1-01', 19, 'ว 2.1 ม.1/1'),
    ('M1-S2_1-02', 20, 'ว 2.1 ม.1/2'),
    ('M1-S2_1-03', 21, 'ว 2.1 ม.1/3'),
    ('M1-S2_1-04', 22, 'ว 2.1 ม.1/4'),
    ('M1-S2_1-05', 23, 'ว 2.1 ม.1/5'),
    ('M1-S2_1-06', 24, 'ว 2.1 ม.1/6'),
    ('M1-S2_1-07', 25, 'ว 2.1 ม.1/7'),
    ('M1-S2_1-08', 26, 'ว 2.1 ม.1/8'),
    ('M1-S2_1-09', 27, 'ว 2.1 ม.1/9'),
    ('M1-S2_1-10', 28, 'ว 2.1 ม.1/10'),
    ('M1-S2_2-01', 29, 'ว 2.2 ม.1/1'),
    ('M1-S2_3-01', 30, 'ว 2.3 ม.1/1'),
    ('M1-S2_3-02', 31, 'ว 2.3 ม.1/2'),
    ('M1-S2_3-03', 32, 'ว 2.3 ม.1/3'),
    ('M1-S2_3-04', 33, 'ว 2.3 ม.1/4'),
    ('M1-S2_3-05', 34, 'ว 2.3 ม.1/5'),
    ('M1-S2_3-06', 35, 'ว 2.3 ม.1/6'),
    ('M1-S2_3-07', 36, 'ว 2.3 ม.1/7'),
    ('M1-S3_2-01', 37, 'ว 3.2 ม.1/1'),
    ('M1-S3_2-02', 38, 'ว 3.2 ม.1/2'),
    ('M1-S3_2-03', 39, 'ว 3.2 ม.1/3'),
    ('M1-S3_2-04', 40, 'ว 3.2 ม.1/4'),
    ('M1-S3_2-05', 41, 'ว 3.2 ม.1/5'),
    ('M1-S3_2-06', 42, 'ว 3.2 ม.1/6'),
    ('M1-S3_2-07', 43, 'ว 3.2 ม.1/7')
) as alignment(objective_code, sequence_no, indicator_code)
  on alignment.objective_code = objective.code
join public.learning_curricula curriculum
  on curriculum.code = 'TH-SCI-M1-M6'
join public.learning_education_systems es
  on es.id = curriculum.education_system_id
 and es.code = 'TH_BASIC'
join public.learning_grade_levels grade
  on grade.curriculum_id = curriculum.id
 and grade.code = 'M1'
where objective.status = 'active'
on conflict (objective_id, curriculum_id, grade_level_id) do update
set
  sequence_no = excluded.sequence_no,
  required = excluded.required,
  notes = excluded.notes,
  updated_at = now();

commit;
