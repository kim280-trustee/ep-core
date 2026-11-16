-- Allow academic managers to align existing knowledge objectives to curriculum grades.
-- Existing integrity triggers validate the curriculum, grade, and objective subject.

begin;

grant insert on public.learning_objective_alignments to authenticated;

create policy learning_objective_alignments_manage_insert
on public.learning_objective_alignments
for insert
to authenticated
with check (public.has_permission('learning.academic.manage'));

commit;
