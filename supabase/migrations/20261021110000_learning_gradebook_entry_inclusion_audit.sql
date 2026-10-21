begin;

create or replace function public.set_learning_gradebook_entry_included(
  p_entry_id uuid,
  p_included_in_grade boolean,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_entry public.learning_gradebook_entries%rowtype;
  v_after public.learning_gradebook_entries%rowtype;
  v_grade_status text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_user_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  if p_included_in_grade is null then
    raise exception 'An inclusion choice is required';
  end if;

  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'A reason is required when changing grade inclusion';
  end if;

  select *
    into v_entry
  from public.learning_gradebook_entries e
  where e.id = p_entry_id
  for update;

  if not found then
    raise exception 'Gradebook entry was not found';
  end if;

  if not public.learning_can_manage_academic_records(v_entry.organization_id) then
    raise exception 'You are not allowed to manage academic records for this organization';
  end if;

  if p_included_in_grade and v_entry.status <> 'graded' then
    raise exception 'Only graded records can be included in a term grade';
  end if;

  select grade.status into v_grade_status
  from public.learning_term_grades grade
  where grade.tenant_id = v_entry.tenant_id
    and grade.organization_id = v_entry.organization_id
    and grade.term_id = v_entry.term_id
    and grade.class_subject_id = v_entry.class_subject_id
    and grade.student_user_id = v_entry.student_user_id
  limit 1
  for update;

  if v_grade_status = 'finalized' then
    raise exception 'The term grade is finalized. Reopen it with an audit reason before changing included records.';
  end if;

  if v_entry.included_in_grade = p_included_in_grade then
    return true;
  end if;

  update public.learning_gradebook_entries
  set included_in_grade = p_included_in_grade,
      updated_by = v_user_id,
      updated_at = now()
  where id = p_entry_id
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
    'toggle_entry_inclusion',
    to_jsonb(v_entry),
    to_jsonb(v_after),
    btrim(p_reason),
    v_user_id
  );

  return true;
end;
$function$;

revoke all on function public.set_learning_gradebook_entry_included(uuid, boolean, text) from public, anon;
grant execute on function public.set_learning_gradebook_entry_included(uuid, boolean, text) to authenticated;

commit;
