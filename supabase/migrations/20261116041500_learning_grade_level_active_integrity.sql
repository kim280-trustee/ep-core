-- Ensure classes and objective alignments only reference active grade levels.
-- Prevent deactivating a grade level while active academic records depend on it.

begin;

create or replace function private.guard_learning_active_grade_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_grade_curriculum_id uuid;
  v_grade_status text;
begin
  select grade.curriculum_id, grade.status
    into v_grade_curriculum_id, v_grade_status
  from public.learning_grade_levels grade
  where grade.id = new.grade_level_id;

  if v_grade_curriculum_id is null
    or v_grade_curriculum_id is distinct from new.curriculum_id
    or v_grade_status is distinct from 'active' then
    raise exception 'The selected grade level must be active and belong to the selected curriculum.';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_active_grade_reference()
  from public, anon, authenticated;

drop trigger if exists learning_class_group_active_grade_guard
  on public.learning_class_groups;
create trigger learning_class_group_active_grade_guard
before insert or update of curriculum_id, grade_level_id
on public.learning_class_groups
for each row
execute function private.guard_learning_active_grade_reference();

drop trigger if exists learning_objective_alignment_active_grade_guard
  on public.learning_objective_alignments;
create trigger learning_objective_alignment_active_grade_guard
before insert or update of curriculum_id, grade_level_id
on public.learning_objective_alignments
for each row
execute function private.guard_learning_active_grade_reference();

create or replace function private.guard_learning_grade_level_deactivation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if old.status = 'active' and new.status = 'inactive' then
    if exists (
      select 1
      from public.learning_class_groups class_group
      where class_group.curriculum_id = old.curriculum_id
        and class_group.grade_level_id = old.id
        and class_group.status <> 'archived'
    ) or exists (
      select 1
      from public.learning_objective_alignments alignment
      where alignment.curriculum_id = old.curriculum_id
        and alignment.grade_level_id = old.id
    ) or exists (
      select 1
      from public.learning_assessments assessment
      where assessment.curriculum_id = old.curriculum_id
        and assessment.grade_level_id = old.id
    ) then
      raise exception 'This grade level is still used by a class, objective alignment, or assessment and cannot be deactivated.';
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_grade_level_deactivation()
  from public, anon, authenticated;

drop trigger if exists learning_grade_level_deactivation_guard
  on public.learning_grade_levels;
create trigger learning_grade_level_deactivation_guard
before update of status
on public.learning_grade_levels
for each row
execute function private.guard_learning_grade_level_deactivation();

commit;
