-- Allow authorized academic administrators to extend the shared subject catalogue
-- and attach existing subjects to curricula. Read access remains unchanged.
begin;

drop policy if exists learning_subjects_catalog_insert on public.learning_subjects;
create policy learning_subjects_catalog_insert
on public.learning_subjects
for insert
to authenticated
with check (public.has_permission('learning.academic.manage'));

drop policy if exists learning_curriculum_subjects_catalog_insert on public.learning_curriculum_subjects;
create policy learning_curriculum_subjects_catalog_insert
on public.learning_curriculum_subjects
for insert
to authenticated
with check (public.has_permission('learning.academic.manage'));

grant insert on public.learning_subjects, public.learning_curriculum_subjects to authenticated;

commit;
