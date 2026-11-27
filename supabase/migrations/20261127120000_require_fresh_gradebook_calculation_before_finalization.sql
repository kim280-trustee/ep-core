begin;

-- A draft term grade is only finalizable while its stored calculation still
-- represents the exact set of currently included gradebook inputs.
create or replace function public.finalize_learning_term_grade(
  p_term_id uuid,
  p_class_subject_id uuid,
  p_student_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_current_user_id uuid;
  v_organization_id uuid;
  v_grade public.learning_term_grades%rowtype;
  v_current_entries jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  select u.id into v_current_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_current_user_id is null then
    raise exception 'Application user record was not found';
  end if;

  select cs.organization_id into v_organization_id
  from public.learning_class_subjects cs
  where cs.id = p_class_subject_id and cs.status = 'active'
  limit 1;

  if v_organization_id is null then
    raise exception 'Class subject was not found or inactive';
  end if;

  if not public.learning_can_manage_academic_records(v_organization_id) then
    raise exception 'You are not allowed to manage academic records for this organization';
  end if;

  select * into v_grade
  from public.learning_term_grades
  where term_id = p_term_id
    and class_subject_id = p_class_subject_id
    and student_user_id = p_student_user_id
  for update;

  if not found then
    raise exception 'Calculate the term grade before finalizing it';
  end if;

  if v_grade.status = 'finalized' then
    return v_grade.id;
  end if;

  if v_grade.status <> 'draft' then
    raise exception 'Only draft term grades can be finalized';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'entryId', e.id,
    'title', e.title,
    'recordType', e.record_type,
    'percentage', e.percentage,
    'weight', e.weight
  ) order by e.recorded_at, e.id), '[]'::jsonb)
  into v_current_entries
  from public.learning_gradebook_entries e
  where e.term_id = p_term_id
    and e.class_subject_id = p_class_subject_id
    and e.student_user_id = p_student_user_id
    and e.included_in_grade = true;

  if v_grade.calculation->'entries' is null
     or v_grade.calculation->'entries' is distinct from v_current_entries then
    raise exception 'Gradebook entries changed after the last calculation. Recalculate the term grade before finalizing it.';
  end if;

  insert into public.learning_term_grade_history (
    term_grade_id, organization_id, term_id, class_subject_id,
    student_user_id, score, letter_grade, calculation, status,
    finalized_at, finalized_by, snapshot_reason,
    override_score, override_grade, override_reason
  ) values (
    v_grade.id, v_grade.organization_id, v_grade.term_id,
    v_grade.class_subject_id, v_grade.student_user_id,
    v_grade.score, v_grade.letter_grade, v_grade.calculation,
    'finalized', now(), v_current_user_id, 'term_finalized',
    v_grade.override_score, v_grade.override_grade, v_grade.override_reason
  );

  update public.learning_term_grades
  set status = 'finalized',
      finalized_at = now(),
      finalized_by = v_current_user_id,
      updated_at = now()
  where id = v_grade.id and status = 'draft';

  if not found then
    raise exception 'Term grade changed during finalization; retry the operation';
  end if;

  insert into public.learning_gradebook_audit_log (
    organization_id, term_id, class_subject_id, student_user_id,
    term_grade_id, action, before_data, after_data, reason, changed_by
  ) values (
    v_grade.organization_id, v_grade.term_id, v_grade.class_subject_id,
    v_grade.student_user_id, v_grade.id, 'finalize_term_grade',
    to_jsonb(v_grade),
    (select to_jsonb(g) from public.learning_term_grades g where g.id = v_grade.id),
    'term finalized', v_current_user_id
  );

  return v_grade.id;
end;
$function$;

revoke all on function public.finalize_learning_term_grade(uuid, uuid, uuid) from public, anon;
grant execute on function public.finalize_learning_term_grade(uuid, uuid, uuid) to authenticated;

commit;
