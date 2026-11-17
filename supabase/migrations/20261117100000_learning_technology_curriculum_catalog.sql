-- E&P Learning: Cambridge Click Start International Edition Computer Studies catalogue.
-- M1 uses Learner's Book 4; M2 uses Learner's Book 5; M3 uses Learner's Book 6.
-- This replaces the previously staged Thai national Technology catalogue.
-- Do not add M4-M6 until the school's books for those grades are confirmed.

begin;

do $$
begin
  if not exists (
    select 1 from public.learning_education_systems es
    join public.learning_countries c on c.id = es.country_id
    where es.code = 'TH_BASIC' and c.code = 'TH'
      and es.status = 'active' and c.status = 'active'
  ) then
    raise exception 'Active Thai Basic Education system (TH_BASIC) is required before creating the Computer Studies curriculum.';
  end if;
end;
$$;

insert into public.learning_subjects (code, name, description, status)
values ('COMPUTER-STUDIES', 'Computer Studies',
  'School Computer Studies sequence based on Cambridge Click Start International Edition Learner''s Books 4, 5 and 6 for M1, M2 and M3.',
  'active')
on conflict (code) do update
set name=excluded.name, description=excluded.description, status='active', updated_at=now();

insert into public.learning_curricula (education_system_id, code, name, version, description, status)
select es.id, 'CLICK-START-M1-M3', 'Cambridge Click Start International Edition — Computer Studies M1–M3',
  'Learner''s Books 4–6',
  'M1: Learner''s Book 4; M2: Learner''s Book 5; M3: Learner''s Book 6. This is the school textbook sequence, not a Thai national Technology curriculum.',
  'active'
from public.learning_education_systems es
join public.learning_countries c on c.id=es.country_id
where es.code='TH_BASIC' and c.code='TH'
on conflict (education_system_id, code) do update
set name=excluded.name, version=excluded.version, description=excluded.description,
    status='active', updated_at=now();

insert into public.learning_grade_levels (curriculum_id, code, name, sequence_no, description, status)
select curriculum.id, grades.code, grades.name, grades.sequence_no, grades.description, 'active'
from public.learning_curricula curriculum
join public.learning_education_systems es on es.id=curriculum.education_system_id
cross join (values
 ('M1','Mathayom 1',1,'Cambridge Click Start International Edition Learner''s Book 4.'),
 ('M2','Mathayom 2',2,'Cambridge Click Start International Edition Learner''s Book 5.'),
 ('M3','Mathayom 3',3,'Cambridge Click Start International Edition Learner''s Book 6.')
) as grades(code,name,sequence_no,description)
where curriculum.code='CLICK-START-M1-M3' and es.code='TH_BASIC'
on conflict (curriculum_id, code) do update
set name=excluded.name, sequence_no=excluded.sequence_no, description=excluded.description,
    status='active', updated_at=now();

insert into public.learning_curriculum_subjects (curriculum_id, subject_id, code, name, status)
select curriculum.id, subject.id, 'COMPUTER-STUDIES', 'Computer Studies', 'active'
from public.learning_curricula curriculum
join public.learning_education_systems es on es.id=curriculum.education_system_id
join public.learning_subjects subject on subject.code='COMPUTER-STUDIES'
where curriculum.code='CLICK-START-M1-M3' and es.code='TH_BASIC'
on conflict (curriculum_id, subject_id) do update
set code=excluded.code, name=excluded.name, status='active', updated_at=now();

commit;
