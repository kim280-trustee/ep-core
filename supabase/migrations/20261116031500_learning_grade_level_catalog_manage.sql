-- Allow authorized academic administrators to add grade levels to curricula.
begin;

drop policy if exists learning_grade_levels_catalog_insert on public.learning_grade_levels;
create policy learning_grade_levels_catalog_insert
on public.learning_grade_levels
for insert
to authenticated
with check (public.has_permission('learning.academic.manage'));

grant insert on public.learning_grade_levels to authenticated;

commit;
