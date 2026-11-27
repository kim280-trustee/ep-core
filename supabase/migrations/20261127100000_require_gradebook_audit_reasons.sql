-- Require a meaningful audit reason for manual gradebook edits and deletions.
-- These SECURITY DEFINER RPCs remain the only supported mutation path.
begin;

create or replace function public.update_learning_manual_gradebook_entry(
  p_entry_id uuid,
  p_title text,
  p_score numeric,
  p_max_score numeric,
  p_category_id uuid default null,
  p_status text default 'graded',
  p_comment text default null,
  p_late boolean default false,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_entry public.learning_gradebook_entries%rowtype;
  v_grade_status text;
  v_user uuid;
  v_weight numeric := 1;
begin
  v_user := (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1);
  if v_user is null then
    raise exception 'Authentication is required';
  end if;

  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'A reason is required when editing a manual gradebook entry';
  end if;

  select * into v_entry
  from public.learning_gradebook_entries
  where id = p_entry_id and source_type = 'manual'
  for update;

  if not found then
    raise exception 'Manual Gradebook entry was not found';
  end if;

  if not public.learning_can_manage_academic_records(v_entry.organization_id) then
    raise exception 'You are not allowed to manage academic records for this organization';
  end if;

  select status into v_grade_status
  from public.learning_term_grades
  where term_id = v_entry.term_id
    and class_subject_id = v_entry.class_subject_id
    and student_user_id = v_entry.student_user_id
  limit 1;

  if v_grade_status = 'finalized' then
    raise exception 'The term grade is finalized. Reopen it before editing this score';
  end if;

  if p_title is null or btrim(p_title) = '' then
    raise exception 'Score title is required';
  end if;
  if p_max_score is null or p_max_score <= 0 then
    raise exception 'Maximum score must be greater than zero';
  end if;
  if p_score is null or p_score < 0 or p_score > p_max_score then
    raise exception 'Score must be between zero and the maximum score';
  end if;
  if p_status not in ('graded', 'missing', 'absent', 'excused', 'pending') then
    raise exception 'Invalid grade status';
  end if;

  if p_category_id is not null then
    select default_weight into v_weight
    from public.learning_gradebook_categories
    where id = p_category_id
      and organization_id = v_entry.organization_id
      and status = 'active';
    if v_weight is null then
      raise exception 'Gradebook category was not found or is inactive';
    end if;
  end if;

  update public.learning_gradebook_entries
  set title = btrim(p_title),
      score = p_score,
      max_score = p_max_score,
      category_id = p_category_id,
      weight = v_weight,
      status = p_status,
      comment = nullif(btrim(coalesce(p_comment, '')), ''),
      late = coalesce(p_late, false),
      included_in_grade = (p_status = 'graded'),
      updated_by = v_user,
      updated_at = now()
  where id = p_entry_id;

  insert into public.learning_gradebook_audit_log (
    organization_id, term_id, class_subject_id, student_user_id,
    gradebook_entry_id, action, before_data, after_data, reason, changed_by
  )
  values (
    v_entry.organization_id, v_entry.term_id, v_entry.class_subject_id, v_entry.student_user_id,
    v_entry.id, 'update_entry', to_jsonb(v_entry),
    (select to_jsonb(e) from public.learning_gradebook_entries e where e.id = v_entry.id),
    btrim(p_reason), v_user
  );

  return p_entry_id;
end;
$function$;

create or replace function public.delete_learning_manual_gradebook_entry(
  p_entry_id uuid,
  p_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_entry public.learning_gradebook_entries%rowtype;
  v_grade_status text;
  v_user uuid;
begin
  v_user := (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1);
  if v_user is null then
    raise exception 'Authentication is required';
  end if;

  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'A reason is required when deleting a manual gradebook entry';
  end if;

  select * into v_entry
  from public.learning_gradebook_entries
  where id = p_entry_id and source_type = 'manual'
  for update;

  if not found then
    raise exception 'Manual Gradebook entry was not found';
  end if;

  if not public.learning_can_manage_academic_records(v_entry.organization_id) then
    raise exception 'You are not allowed to manage academic records for this organization';
  end if;

  select status into v_grade_status
  from public.learning_term_grades
  where term_id = v_entry.term_id
    and class_subject_id = v_entry.class_subject_id
    and student_user_id = v_entry.student_user_id
  limit 1;

  if v_grade_status = 'finalized' then
    raise exception 'The term grade is finalized. Reopen it before deleting this score';
  end if;

  insert into public.learning_gradebook_audit_log (
    organization_id, term_id, class_subject_id, student_user_id,
    gradebook_entry_id, action, before_data, reason, changed_by
  )
  values (
    v_entry.organization_id, v_entry.term_id, v_entry.class_subject_id, v_entry.student_user_id,
    v_entry.id, 'delete_entry', to_jsonb(v_entry), btrim(p_reason), v_user
  );

  delete from public.learning_gradebook_entries where id = p_entry_id;
  return true;
end;
$function$;

revoke all on function public.update_learning_manual_gradebook_entry(uuid,text,numeric,numeric,uuid,text,text,boolean,text) from public, anon;
grant execute on function public.update_learning_manual_gradebook_entry(uuid,text,numeric,numeric,uuid,text,text,boolean,text) to authenticated;
revoke all on function public.delete_learning_manual_gradebook_entry(uuid,text) from public, anon;
grant execute on function public.delete_learning_manual_gradebook_entry(uuid,text) to authenticated;

commit;
