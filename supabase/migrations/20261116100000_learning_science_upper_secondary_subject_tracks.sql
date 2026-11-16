-- E&P Learning: upper-secondary Thai additional Science subject tracks.
-- The 2017 Thai Science curriculum distinguishes M1-M3 core indicators from
-- M4-M6 additional learning outcomes in Biology, Chemistry, Physics and
-- Earth, Astronomy and Space Science. Keep these as distinct subjects so
-- upper-secondary classes can select the correct course strand.
-- No school, class, learner or content records are created.
begin;

do $$
begin
  if not exists (
    select 1
    from public.learning_education_systems es
    join public.learning_curricula c on c.education_system_id=es.id
    join public.learning_grade_levels g on g.curriculum_id=c.id
    where es.code='TH_BASIC'
      and c.code='TH-SCI-M1-M6'
      and g.code in ('M4','M5','M6')
      and es.status='active' and c.status='active' and g.status='active'
  ) then
    raise exception 'Active Thai Science curriculum with M4-M6 grades is required.';
  end if;
end $$;

insert into public.learning_subjects(code,name,description,status)
values
 ('BIOLOGY','Biology','Thai upper-secondary additional Science strand: Biology learning outcomes for M4-M6.', 'active'),
 ('CHEMISTRY','Chemistry','Thai upper-secondary additional Science strand: Chemistry learning outcomes for M4-M6.', 'active'),
 ('PHYSICS','Physics','Thai upper-secondary additional Science strand: Physics learning outcomes for M4-M6.', 'active'),
 ('EARTH_SPACE','Earth, Astronomy and Space Science','Thai upper-secondary additional Science strand: Earth, Astronomy and Space Science learning outcomes for M4-M6.', 'active')
on conflict(code) do update
set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_curriculum_subjects(curriculum_id,subject_id,code,name,status)
select c.id,s.id,s.code,s.name,'active'
from public.learning_curricula c
join public.learning_education_systems es on es.id=c.education_system_id and es.code='TH_BASIC'
join public.learning_subjects s on s.code in ('BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
where c.code='TH-SCI-M1-M6'
on conflict(curriculum_id,subject_id) do update
set code=excluded.code,name=excluded.name,status='active',updated_at=now();

commit;
