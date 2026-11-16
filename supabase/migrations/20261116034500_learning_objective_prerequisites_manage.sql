-- Manage prerequisite relationships between learning objectives.
-- The trigger prevents cycles so the graph remains a valid directed acyclic graph.

begin;

create or replace function public.prevent_learning_objective_prerequisite_cycles()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (
    with recursive prerequisite_chain(objective_id) as (
      select new.prerequisite_objective_id
      union
      select prerequisite.prerequisite_objective_id
      from public.learning_objective_prerequisites prerequisite
      join prerequisite_chain chain
        on prerequisite.objective_id = chain.objective_id
    )
    select 1
    from prerequisite_chain
    where objective_id = new.objective_id
  ) then
    raise exception 'This prerequisite would create a circular learning-objective dependency.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists learning_objective_prerequisites_prevent_cycle
  on public.learning_objective_prerequisites;

create trigger learning_objective_prerequisites_prevent_cycle
before insert or update of objective_id, prerequisite_objective_id
on public.learning_objective_prerequisites
for each row
execute function public.prevent_learning_objective_prerequisite_cycles();

drop policy if exists learning_objective_prerequisites_manage_insert
  on public.learning_objective_prerequisites;
create policy learning_objective_prerequisites_manage_insert
on public.learning_objective_prerequisites
for insert
to authenticated
with check (public.has_permission('learning.academic.manage'));

drop policy if exists learning_objective_prerequisites_manage_delete
  on public.learning_objective_prerequisites;
create policy learning_objective_prerequisites_manage_delete
on public.learning_objective_prerequisites
for delete
to authenticated
using (public.has_permission('learning.academic.manage'));

grant insert, delete on public.learning_objective_prerequisites to authenticated;

commit;
