begin;

-- Mapping changes must not silently leave an included assessment score in a
-- term calculation. Preserve the score row and source identity; only change
-- inclusion with a complete audit snapshot. Finalized term grades block the
-- source-mapping mutation until an authorized reopen has occurred.
create or replace function private.exclude_assessment_gradebook_entries_for_mapping_change(
  p_assignment_id uuid,
  p_assessment_id uuid,
  p_class_group_id uuid,
  p_student_user_id uuid,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_entry public.learning_gradebook_entries%rowtype;
  v_after public.learning_gradebook_entries%rowtype;
  v_actor uuid;
  v_changed integer := 0;
begin
  if p_assignment_id is null or p_reason is null or btrim(p_reason) = '' then
    raise exception 'A source assignment and reconciliation reason are required';
  end if;

  for v_entry in
    select e.*
    from public.learning_gradebook_entries e
    where e.source_type = 'assessment_result'
      and e.assignment_id = p_assignment_id
      and e.included_in_grade = true
      and (p_assessment_id is null or e.assessment_id = p_assessment_id)
      and (p_class_group_id is null or e.class_group_id = p_class_group_id)
      and (p_student_user_id is null or e.student_user_id = p_student_user_id)
    order by e.id
    for update
  loop
    if exists (
      select 1
      from public.learning_term_grades grade
      where grade.tenant_id = v_entry.tenant_id
        and grade.organization_id = v_entry.organization_id
        and grade.term_id = v_entry.term_id
        and grade.class_subject_id = v_entry.class_subject_id
        and grade.student_user_id = v_entry.student_user_id
        and grade.status = 'finalized'
    ) then
      raise exception
        'Assignment mapping cannot change while a linked term grade is finalized. Reopen the term grade with an audit reason first.';
    end if;

    v_actor := coalesce(
      public.learning_current_user_id(),
      v_entry.updated_by,
      v_entry.created_by
    );

    update public.learning_gradebook_entries
    set included_in_grade = false,
        updated_by = v_actor,
        updated_at = now()
    where id = v_entry.id
    returning * into v_after;

    insert into public.learning_gradebook_audit_log (
      organization_id,
      term_id,
      class_subject_id,
      student_user_id,
      gradebook_entry_id,
      action,
      before_data,
      after_data,
      reason,
      changed_by
    ) values (
      v_entry.organization_id,
      v_entry.term_id,
      v_entry.class_subject_id,
      v_entry.student_user_id,
      v_entry.id,
      'exclude_assessment_mapping_change',
      to_jsonb(v_entry),
      to_jsonb(v_after),
      btrim(p_reason),
      v_actor
    );

    v_changed := v_changed + 1;
  end loop;

  return v_changed;
end;
$function$;

revoke all on function private.exclude_assessment_gradebook_entries_for_mapping_change(uuid, uuid, uuid, uuid, text)
from public, anon, authenticated;

create or replace function private.guard_learning_assessment_assignment_item_mapping()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if old.item_type = 'assessment'
     and old.assessment_id is not null
     and (
       tg_op = 'DELETE'
       or new.assignment_id is distinct from old.assignment_id
       or new.item_type is distinct from old.item_type
       or new.assessment_id is distinct from old.assessment_id
     ) then
    perform private.exclude_assessment_gradebook_entries_for_mapping_change(
      old.assignment_id,
      old.assessment_id,
      null,
      null,
      'Assessment assignment mapping removed or changed'
    );
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

revoke all on function private.guard_learning_assessment_assignment_item_mapping()
from public, anon, authenticated;

drop trigger if exists learning_assessment_assignment_item_mapping_guard
on public.learning_assignment_items;
create trigger learning_assessment_assignment_item_mapping_guard
before delete or update of assignment_id, item_type, assessment_id
on public.learning_assignment_items
for each row
execute function private.guard_learning_assessment_assignment_item_mapping();

create or replace function private.guard_learning_assessment_assignment_target_mapping()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if old.status = 'active'
     and (
       tg_op = 'DELETE'
       or new.status is distinct from old.status
       or new.assignment_id is distinct from old.assignment_id
       or new.class_group_id is distinct from old.class_group_id
       or new.student_user_id is distinct from old.student_user_id
     ) then
    perform private.exclude_assessment_gradebook_entries_for_mapping_change(
      old.assignment_id,
      null,
      old.class_group_id,
      old.student_user_id,
      'Active assessment assignment target removed or changed'
    );
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

revoke all on function private.guard_learning_assessment_assignment_target_mapping()
from public, anon, authenticated;

drop trigger if exists learning_assessment_assignment_target_mapping_guard
on public.learning_assignment_targets;
create trigger learning_assessment_assignment_target_mapping_guard
before delete or update of assignment_id, class_group_id, student_user_id, status
on public.learning_assignment_targets
for each row
execute function private.guard_learning_assessment_assignment_target_mapping();

commit;
