-- E&P Learning: Thai national curriculum foundation.
-- The master catalogue is deliberately draft until all official indicators are
-- transcribed, grade-checked and reviewed. Existing Maths, Science and Cambridge
-- subject curricula remain intact.
--
-- Source basis:
-- OBEC Basic Education Core Curriculum B.E. 2551 (2008), with 2017 revisions
-- for Mathematics, Science and Geography, and subsequent 2018/2019 orders.
-- The 2025 early-primary curriculum is registered separately for P1-P3.

begin;

do $$
begin
  if not exists (
    select 1
    from public.learning_education_systems es
    join public.learning_countries c on c.id = es.country_id
    where es.code = 'TH_BASIC'
      and c.code = 'TH'
      and es.status = 'active'
      and c.status = 'active'
  ) then
    raise exception 'Active Thai Basic Education system (TH_BASIC) is required.';
  end if;
end;
$$;

-- Add the six learning-area subjects that are not yet in the shared catalogue.
-- Existing MATH and SCI subject records are reused without renaming them.
insert into public.learning_subjects (code, name, description, status)
values
  ('THAI-LANGUAGE', 'Thai Language', 'Thai learning area (กลุ่มสาระการเรียนรู้ภาษาไทย).', 'active'),
  ('SOCIAL-STUDIES', 'Social Studies, Religion and Culture', 'Thai learning area (กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม), including the 2017 revised Geography standards.', 'active'),
  ('HEALTH-PE', 'Health and Physical Education', 'Thai learning area (กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา).', 'active'),
  ('ARTS', 'Arts', 'Thai learning area (กลุ่มสาระการเรียนรู้ศิลปะ).', 'active'),
  ('CAREER', 'Career', 'Thai learning area (กลุ่มสาระการเรียนรู้การงานอาชีพ). Technology standards were moved to Science and Technology under the 2017 revision and subsequent 2018 order.', 'active'),
  ('FOREIGN-LANGUAGES', 'Foreign Languages', 'Thai learning area (กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ).', 'active')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    status = 'active',
    updated_at = now();

-- Master framework: 2008 core curriculum plus the applicable 2017 revisions.
-- Keep it draft until all eight areas' official standards and indicators are loaded.
insert into public.learning_curricula
  (education_system_id, code, name, version, description, status)
select es.id,
       'TH-BASIC-CORE-2008-2017',
       'Thai Basic Education Core Curriculum — B.E. 2551 with 2017 revisions',
       'B.E. 2551 (2008); revised standards B.E. 2560 (2017); subsequent orders 2561 (2018)',
       'Master framework for Prathom 1–6 and Mathayom 1–6. Includes eight learning areas. Mathematics, Science and Geography use the 2017 revised standards; Science and Technology and Career naming/scope follow subsequent OBEC orders. Draft until all official grade indicators are transcribed and verified.',
       'draft'
from public.learning_education_systems es
join public.learning_countries c on c.id = es.country_id
where es.code = 'TH_BASIC' and c.code = 'TH'
on conflict (education_system_id, code) do update
set name = excluded.name,
    version = excluded.version,
    description = excluded.description,
    status = 'draft',
    updated_at = now();

-- Separate early-primary framework. Do not merge its outcomes into the 2008
-- framework; the official 2025 P1-P3 documents need their own transcription.
insert into public.learning_curricula
  (education_system_id, code, name, version, description, status)
select es.id,
       'TH-PRIMARY-2025-P1-P3',
       'Thai Primary Education Curriculum B.E. 2568 — P1 to P3',
       'B.E. 2568 (2025)',
       'Separate official early-primary curriculum for Prathom 1–3. Kept in draft pending full transcription of its learning areas, competencies, outcomes and assessment structure from the OBEC 2025 documents.',
       'draft'
from public.learning_education_systems es
join public.learning_countries c on c.id = es.country_id
where es.code = 'TH_BASIC' and c.code = 'TH'
on conflict (education_system_id, code) do update
set name = excluded.name,
    version = excluded.version,
    description = excluded.description,
    status = 'draft',
    updated_at = now();

-- Grade levels for the 2008/2017 national framework: P1-P6 and M1-M6.
insert into public.learning_grade_levels
  (curriculum_id, code, name, sequence_no, description, status)
select curriculum.id, grade.code, grade.name, grade.sequence_no, grade.description, 'active'
from public.learning_curricula curriculum
join public.learning_education_systems es on es.id = curriculum.education_system_id
cross join (values
  ('P1','Prathom 1',1,'Primary education year 1.'),
  ('P2','Prathom 2',2,'Primary education year 2.'),
  ('P3','Prathom 3',3,'Primary education year 3.'),
  ('P4','Prathom 4',4,'Primary education year 4.'),
  ('P5','Prathom 5',5,'Primary education year 5.'),
  ('P6','Prathom 6',6,'Primary education year 6.'),
  ('M1','Mathayom 1',7,'Lower secondary education year 1.'),
  ('M2','Mathayom 2',8,'Lower secondary education year 2.'),
  ('M3','Mathayom 3',9,'Lower secondary education year 3.'),
  ('M4','Mathayom 4',10,'Upper secondary education year 1.'),
  ('M5','Mathayom 5',11,'Upper secondary education year 2.'),
  ('M6','Mathayom 6',12,'Upper secondary education year 3.')
) as grade(code,name,sequence_no,description)
where curriculum.code = 'TH-BASIC-CORE-2008-2017'
  and es.code = 'TH_BASIC'
on conflict (curriculum_id, code) do update
set name = excluded.name,
    sequence_no = excluded.sequence_no,
    description = excluded.description,
    status = 'active',
    updated_at = now();

-- Grade levels for the distinct 2025 early-primary framework.
insert into public.learning_grade_levels
  (curriculum_id, code, name, sequence_no, description, status)
select curriculum.id, grade.code, grade.name, grade.sequence_no, grade.description, 'active'
from public.learning_curricula curriculum
join public.learning_education_systems es on es.id = curriculum.education_system_id
cross join (values
  ('P1','Prathom 1',1,'Primary education year 1 under the B.E. 2568 curriculum.'),
  ('P2','Prathom 2',2,'Primary education year 2 under the B.E. 2568 curriculum.'),
  ('P3','Prathom 3',3,'Primary education year 3 under the B.E. 2568 curriculum.')
) as grade(code,name,sequence_no,description)
where curriculum.code = 'TH-PRIMARY-2025-P1-P3'
  and es.code = 'TH_BASIC'
on conflict (curriculum_id, code) do update
set name = excluded.name,
    sequence_no = excluded.sequence_no,
    description = excluded.description,
    status = 'active',
    updated_at = now();

-- The eight official learning areas. Subject-specific names may differ from the
-- shared catalogue display name; the curriculum-level name is authoritative here.
insert into public.learning_curriculum_subjects
  (curriculum_id, subject_id, code, name, status)
select curriculum.id, subject.id, area.code, area.name, 'active'
from public.learning_curricula curriculum
join public.learning_education_systems es on es.id = curriculum.education_system_id
join (values
  ('THAI-LANGUAGE','THAI-LANGUAGE','Thai Language','ภาษาไทย'),
  ('MATH','MATH','Mathematics','คณิตศาสตร์'),
  ('SCI','SCI','Science and Technology','วิทยาศาสตร์และเทคโนโลยี'),
  ('SOCIAL-STUDIES','SOCIAL-STUDIES','Social Studies, Religion and Culture','สังคมศึกษา ศาสนา และวัฒนธรรม'),
  ('HEALTH-PE','HEALTH-PE','Health and Physical Education','สุขศึกษาและพลศึกษา'),
  ('ARTS','ARTS','Arts','ศิลปะ'),
  ('CAREER','CAREER','Career','การงานอาชีพ'),
  ('FOREIGN-LANGUAGES','FOREIGN-LANGUAGES','Foreign Languages','ภาษาต่างประเทศ')
) as area(subject_code,code,name,thai_name) on true
join public.learning_subjects subject on subject.code = area.subject_code
where curriculum.code = 'TH-BASIC-CORE-2008-2017'
  and es.code = 'TH_BASIC'
on conflict (curriculum_id, subject_id) do update
set code = excluded.code,
    name = excluded.name,
    status = 'active',
    updated_at = now();

-- Reuse already-reviewed secondary Mathematics and lower-secondary Science
-- objectives in the master framework. The detailed source curricula remain active.
-- Science M4-M6 specialist tracks remain in TH-SCI-M1-M6 until their official
-- integrated/subject-specific placement is reconciled against the OBEC documents.
insert into public.learning_objective_alignments
  (objective_id, curriculum_id, grade_level_id, sequence_no, required, notes)
select source_alignment.objective_id,
       target_curriculum.id,
       target_grade.id,
       source_alignment.sequence_no,
       source_alignment.required,
       'Carried forward from ' || source_curriculum.code ||
       '; original subject/grade alignment retained and reused in the Thai national master framework.'
from public.learning_objective_alignments source_alignment
join public.learning_curricula source_curriculum
  on source_curriculum.id = source_alignment.curriculum_id
join public.learning_grade_levels source_grade
  on source_grade.id = source_alignment.grade_level_id
 and source_grade.curriculum_id = source_curriculum.id
join public.learning_objectives objective
  on objective.id = source_alignment.objective_id
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id
join public.learning_curricula target_curriculum
  on target_curriculum.code = 'TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels target_grade
  on target_grade.curriculum_id = target_curriculum.id
 and target_grade.code = source_grade.code
join public.learning_curriculum_subjects target_subject
  on target_subject.curriculum_id = target_curriculum.id
 and target_subject.subject_id = subject.id
 and target_subject.status = 'active'
where (
    (source_curriculum.code = 'TH-MATH-M1-M6' and subject.code = 'MATH')
    or
    (source_curriculum.code = 'TH-SCI-M1-M6' and subject.code = 'SCI'
      and source_grade.code in ('M1','M2','M3'))
  )
on conflict (objective_id, curriculum_id, grade_level_id) do nothing;

commit;
