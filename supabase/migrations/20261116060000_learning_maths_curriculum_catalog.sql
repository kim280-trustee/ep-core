-- E&P Learning: establish a separate Thai Mathematics curriculum catalogue.
-- This deliberately does not modify the existing English MEP pilot curriculum,
-- academic year, class group, class memberships, or published learning records.

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
    raise exception 'Active Thai Basic Education system (TH_BASIC) is required before creating the Mathematics curriculum.';
  end if;
end;
$$;

insert into public.learning_subjects (code, name, description, status)
values (
  'MATH',
  'Mathematics',
  'Mathematics learning for Thai lower and upper secondary education.',
  'active'
)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  status = 'active',
  updated_at = now();

insert into public.learning_curricula (
  education_system_id,
  code,
  name,
  version,
  description,
  status
)
select
  es.id,
  'TH-MATH-M1-M6',
  'Thai Basic Education — Mathematics M1–M6',
  '2026.1',
  'Separate Mathematics curriculum catalogue for Thai lower and upper secondary levels. This curriculum is independent of the English MEP pilot curriculum.',
  'active'
from public.learning_education_systems es
join public.learning_countries c on c.id = es.country_id
where es.code = 'TH_BASIC'
  and c.code = 'TH'
on conflict (education_system_id, code) do update
set
  name = excluded.name,
  version = excluded.version,
  description = excluded.description,
  status = 'active',
  updated_at = now();

insert into public.learning_grade_levels (
  curriculum_id,
  code,
  name,
  sequence_no,
  description,
  status
)
select
  curriculum.id,
  grades.code,
  grades.name,
  grades.sequence_no,
  grades.description,
  'active'
from public.learning_curricula curriculum
join public.learning_education_systems es
  on es.id = curriculum.education_system_id
cross join (
  values
    ('M1', 'Mathayom 1', 1, 'Lower secondary year 1.'),
    ('M2', 'Mathayom 2', 2, 'Lower secondary year 2.'),
    ('M3', 'Mathayom 3', 3, 'Lower secondary year 3.'),
    ('M4', 'Mathayom 4', 4, 'Upper secondary year 1.'),
    ('M5', 'Mathayom 5', 5, 'Upper secondary year 2.'),
    ('M6', 'Mathayom 6', 6, 'Upper secondary year 3.')
) as grades(code, name, sequence_no, description)
where curriculum.code = 'TH-MATH-M1-M6'
  and es.code = 'TH_BASIC'
on conflict (curriculum_id, code) do update
set
  name = excluded.name,
  sequence_no = excluded.sequence_no,
  description = excluded.description,
  status = 'active',
  updated_at = now();

insert into public.learning_curriculum_subjects (
  curriculum_id,
  subject_id,
  code,
  name,
  status
)
select
  curriculum.id,
  subject.id,
  'MATH',
  'Mathematics',
  'active'
from public.learning_curricula curriculum
join public.learning_education_systems es
  on es.id = curriculum.education_system_id
join public.learning_subjects subject
  on subject.code = 'MATH'
where curriculum.code = 'TH-MATH-M1-M6'
  and es.code = 'TH_BASIC'
on conflict (curriculum_id, subject_id) do update
set
  code = excluded.code,
  name = excluded.name,
  status = 'active',
  updated_at = now();

commit;
