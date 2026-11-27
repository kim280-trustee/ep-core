begin;

-- Keep the original calculated score and any approved manual override distinct.
-- Recalculation refreshes the calculation snapshot but must not erase an override.
alter table public.learning_term_grade_history
  add column if not exists override_score numeric,
  add column if not exists override_grade text,
  add column if not exists override_reason text;

create or replace function public.calculate_learning_term_grade(
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
  v_tenant_id uuid;
  v_organization_id uuid;
  v_class_group_id uuid;
  v_grade public.learning_term_grades%rowtype;
  v_entry_count integer;
  v_total_weight numeric;
  v_calculated_score numeric;
  v_calculation jsonb;
  v_grade_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  select u.id, u.tenant_id into v_current_user_id, v_tenant_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_current_user_id is null then
    raise exception 'Application user record was not found';
  end if;

  select cs.organization_id, cs.class_group_id
    into v_organization_id, v_class_group_id
  from public.learning_class_subjects cs
  where cs.id = p_class_subject_id and cs.status = 'active'
  limit 1;

  if v_organization_id is null then
    raise exception 'Class subject was not found or is inactive';
  end if;

  if not public.learning_can_manage_academic_records(v_organization_id) then
    raise exception 'You are not allowed to manage academic records for this organization';
  end if;

  if not exists (
    select 1 from public.learning_terms t
    where t.id = p_term_id and t.organization_id = v_organization_id
  ) then
    raise exception 'Term does not belong to the selected organization';
  end if;

  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.organization_id = v_organization_id
      and cm.class_group_id = v_class_group_id
      and cm.user_id = p_student_user_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
  ) then
    raise exception 'Student is not an active member of the selected class';
  end if;

  -- Serialize recalculation against override/finalization on an existing grade.
  select * into v_grade
  from public.learning_term_grades tg
  where tg.term_id = p_term_id
    and tg.class_subject_id = p_class_subject_id
    and tg.student_user_id = p_student_user_id
  for update;

  if found and v_grade.status = 'finalized' then
    raise exception 'The term grade is already finalized';
  end if;

  select count(*)::integer, coalesce(sum(e.weight), 0)
    into v_entry_count, v_total_weight
  from public.learning_gradebook_entries e
  where e.term_id = p_term_id
    and e.class_subject_id = p_class_subject_id
    and e.student_user_id = p_student_user_id
    and e.included_in_grade = true;

  if v_entry_count = 0 or v_total_weight <= 0 then
    raise exception 'No included gradebook scores exist for this student';
  end if;

  select round(sum(e.percentage * e.weight) / nullif(sum(e.weight), 0), 4)
    into v_calculated_score
  from public.learning_gradebook_entries e
  where e.term_id = p_term_id
    and e.class_subject_id = p_class_subject_id
    and e.student_user_id = p_student_user_id
    and e.included_in_grade = true;

  select jsonb_build_object(
    'method', 'weighted_percentage',
    'entryCount', v_entry_count,
    'totalWeight', v_total_weight,
    'calculatedScore', v_calculated_score,
    'appliedOverride', case when v_grade.override_score is not null then
      jsonb_build_object(
        'score', v_grade.override_score,
        'grade', v_grade.override_grade,
        'reason', v_grade.override_reason
      )
      else null end,
    'calculatedAt', now(),
    'entries', coalesce((
      select jsonb_agg(jsonb_build_object(
        'entryId', e.id,
        'title', e.title,
        'recordType', e.record_type,
        'percentage', e.percentage,
        'weight', e.weight
      ) order by e.recorded_at, e.id)
      from public.learning_gradebook_entries e
      where e.term_id = p_term_id
        and e.class_subject_id = p_class_subject_id
        and e.student_user_id = p_student_user_id
        and e.included_in_grade = true
    ), '[]'::jsonb)
  ) into v_calculation;

  insert into public.learning_term_grades (
    tenant_id, organization_id, term_id, class_group_id,
    class_subject_id, student_user_id, score, letter_grade,
    status, calculation
  ) values (
    v_tenant_id, v_organization_id, p_term_id, v_class_group_id,
    p_class_subject_id, p_student_user_id,
    coalesce(v_grade.override_score, v_calculated_score),
    case when v_grade.override_score is not null then v_grade.override_grade else null end,
    'draft', v_calculation
  )
  on conflict (term_id, class_subject_id, student_user_id)
  do update set
    score = coalesce(public.learning_term_grades.override_score, excluded.score),
    letter_grade = case
      when public.learning_term_grades.override_score is not null
        then public.learning_term_grades.override_grade
      else public.learning_term_grades.letter_grade
    end,
    calculation = excluded.calculation,
    updated_at = now()
  returning id into v_grade_id;

  return v_grade_id;
end;
$function$;

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

revoke all on function public.calculate_learning_term_grade(uuid, uuid, uuid) from public, anon;
grant execute on function public.calculate_learning_term_grade(uuid, uuid, uuid) to authenticated;
revoke all on function public.finalize_learning_term_grade(uuid, uuid, uuid) from public, anon;
grant execute on function public.finalize_learning_term_grade(uuid, uuid, uuid) to authenticated;

commit;
