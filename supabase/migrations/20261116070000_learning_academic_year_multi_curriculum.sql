-- Normalize school academic years so they are organization-scoped, not curriculum-scoped.
-- Each class group already owns its curriculum and grade level. A school year can therefore
-- contain classes using different curricula without duplicating the school's calendar.
-- Preserve existing curriculum_id values as optional legacy metadata.

begin;

alter table public.learning_class_groups
  drop constraint if exists class_year_curriculum_fk;

alter table public.learning_academic_years
  alter column curriculum_id drop not null;

comment on column public.learning_academic_years.curriculum_id is
  'Legacy optional curriculum metadata. Curriculum is selected per class group; a school academic year may contain classes from multiple curricula.';

commit;
