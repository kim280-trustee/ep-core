-- Focused remediation for confirmed SECURITY DEFINER authorization and grade-finalization gaps.
-- Preserves existing records and published assessment data.

create or replace function public.save_learning_question_evaluation_key(
  p_question_version_id uuid, p_evaluation_key jsonb, p_scoring_rules jsonb
)
returns void language plpgsql security definer set search_path = ''
as $function$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_organization_id uuid;
  v_published_at timestamptz;
begin
  if v_auth_user_id is null then raise exception 'Authentication is required'; end if;
  select q.organization_id, qv.published_at
    into v_organization_id, v_published_at
  from public.learning_question_versions qv
  join public.learning_questions q on q.id = qv.question_id
  where qv.id = p_question_version_id
  for update of qv;
  if v_organization_id is null then raise exception 'Question version was not found'; end if;
  if not (
    public.learning_can_manage_academic_records(v_organization_id)
    or exists (
      select 1 from public.learning_class_memberships cm
      join public.users u on u.id = cm.user_id
      where cm.organization_id = v_organization_id
        and cm.membership_type = 'teacher' and cm.status = 'active'
        and u.auth_user_id = v_auth_user_id
    )
  ) then
    raise exception 'Active teacher membership or academic management permission is required';
  end if;
  if v_published_at is not null then
    raise exception 'Published question versions are immutable; create a new version';
  end if;
  if coalesce(p_scoring_rules->>'method', '') not in ('exact_option', 'manual_review') then
    raise exception 'Unsupported scoring method';
  end if;
  insert into public.learning_question_evaluation_keys (
    question_version_id, evaluation_key, scoring_rules, updated_at
  ) values (
    p_question_version_id, coalesce(p_evaluation_key, '{}'::jsonb),
    coalesce(p_scoring_rules, '{}'::jsonb), now()
  )
  on conflict (question_version_id) do update
    set evaluation_key = excluded.evaluation_key,
        scoring_rules = excluded.scoring_rules, updated_at = now();
end;
$function$;

revoke execute on function public.save_learning_question_evaluation_key(uuid,jsonb,jsonb) from public, anon;
grant execute on function public.save_learning_question_evaluation_key(uuid,jsonb,jsonb) to authenticated;

-- Direct table writes must have the same authoring boundary as the RPC.
drop policy if exists learning_questions_write on public.learning_questions;
create policy learning_questions_write on public.learning_questions
for insert to authenticated
with check (
  organization_id is not null
  and created_by in (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and (
    public.learning_can_manage_academic_records(organization_id)
    or exists (
      select 1 from public.learning_class_memberships cm
      join public.users u on u.id = cm.user_id
      where cm.organization_id = learning_questions.organization_id
        and cm.membership_type = 'teacher' and cm.status = 'active'
        and u.auth_user_id = (select auth.uid())
    )
  )
);

drop policy if exists learning_questions_update on public.learning_questions;
create policy learning_questions_update on public.learning_questions
for update to authenticated
using (
  organization_id is not null and (
    public.learning_can_manage_academic_records(organization_id)
    or exists (
      select 1 from public.learning_class_memberships cm
      join public.users u on u.id = cm.user_id
      where cm.organization_id = learning_questions.organization_id
        and cm.membership_type = 'teacher' and cm.status = 'active'
        and u.auth_user_id = (select auth.uid())
    )
  )
)
with check (
  organization_id is not null and (
    public.learning_can_manage_academic_records(organization_id)
    or exists (
      select 1 from public.learning_class_memberships cm
      join public.users u on u.id = cm.user_id
      where cm.organization_id = learning_questions.organization_id
        and cm.membership_type = 'teacher' and cm.status = 'active'
        and u.auth_user_id = (select auth.uid())
    )
  )
);

drop policy if exists learning_questions_delete on public.learning_questions;
create policy learning_questions_delete on public.learning_questions
for delete to authenticated
using (
  organization_id is not null and (
    public.learning_can_manage_academic_records(organization_id)
    or exists (
      select 1 from public.learning_class_memberships cm
      join public.users u on u.id = cm.user_id
      where cm.organization_id = learning_questions.organization_id
        and cm.membership_type = 'teacher' and cm.status = 'active'
        and u.auth_user_id = (select auth.uid())
    )
  )
);

drop policy if exists learning_question_versions_write on public.learning_question_versions;
create policy learning_question_versions_write on public.learning_question_versions
for insert to authenticated
with check (
  created_by in (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and exists (
    select 1 from public.learning_questions q
    where q.id = learning_question_versions.question_id
      and q.organization_id is not null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or exists (
          select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id
          where cm.organization_id = q.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists learning_question_versions_update on public.learning_question_versions;
create policy learning_question_versions_update on public.learning_question_versions
for update to authenticated
using (
  exists (
    select 1 from public.learning_questions q
    where q.id = learning_question_versions.question_id
      and q.organization_id is not null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or exists (
          select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id
          where cm.organization_id = q.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())
        )
      )
  )
)
with check (
  exists (
    select 1 from public.learning_questions q
    where q.id = learning_question_versions.question_id
      and q.organization_id is not null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or exists (
          select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id
          where cm.organization_id = q.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists learning_question_versions_delete on public.learning_question_versions;
create policy learning_question_versions_delete on public.learning_question_versions
for delete to authenticated
using (
  exists (
    select 1 from public.learning_questions q
    where q.id = learning_question_versions.question_id
      and q.organization_id is not null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or exists (
          select 1 from public.learning_class_memberships cm
          join public.users u on u.id = cm.user_id
          where cm.organization_id = q.organization_id
            and cm.membership_type = 'teacher' and cm.status = 'active'
            and u.auth_user_id = (select auth.uid())
        )
      )
  )
);

-- Enforce finalization for inserts as well as updates and deletes.
create or replace function public.learning_guard_finalized_gradebook_entry_mutation()
returns trigger language plpgsql set search_path = ''
as $function$
begin
  if current_user in ('anon', 'authenticated') then
    raise exception 'Gradebook records must be changed through the audited gradebook RPC workflow.';
  end if;
  if tg_op = 'INSERT' then
    if exists (
      select 1 from public.learning_term_grades grade
      where grade.tenant_id = new.tenant_id
        and grade.organization_id = new.organization_id
        and grade.term_id = new.term_id
        and grade.class_subject_id = new.class_subject_id
        and grade.student_user_id = new.student_user_id
        and grade.status = 'finalized'
    ) then
      raise exception 'The term grade is finalized. Reopen it with an audit reason before adding a gradebook record.';
    end if;
    return new;
  end if;
  if exists (
    select 1 from public.learning_term_grades grade
    where grade.tenant_id = old.tenant_id
      and grade.organization_id = old.organization_id
      and grade.term_id = old.term_id
      and grade.class_subject_id = old.class_subject_id
      and grade.student_user_id = old.student_user_id
      and grade.status = 'finalized'
  ) then
    raise exception 'The term grade is finalized. Reopen it with an audit reason before changing or deleting an existing gradebook record.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$function$;

-- Serialize calculations with finalization and reject a finalized conflict.
create or replace function public.calculate_learning_term_grade(
  p_term_id uuid, p_class_subject_id uuid, p_student_user_id uuid
)
returns uuid language plpgsql security definer set search_path = ''
as $function$
declare
  v_current_user_id uuid;
  v_tenant_id uuid;
  v_organization_id uuid;
  v_class_group_id uuid;
  v_grade_id uuid;
  v_existing_status text;
  v_entry_count integer;
  v_total_weight numeric;
  v_score numeric;
  v_calculation jsonb;
  v_grading_method text;
  v_grade_scale_id uuid;
  v_letter_grade text;
begin
  if (select auth.uid()) is null then raise exception 'Authentication is required'; end if;
  select u.id, u.tenant_id into v_current_user_id, v_tenant_id
  from public.users u where u.auth_user_id = (select auth.uid()) limit 1;
  if v_current_user_id is null then raise exception 'Application user record was not found'; end if;

  select cs.organization_id, cs.class_group_id, cs.grading_method, cs.grade_scale_id
    into v_organization_id, v_class_group_id, v_grading_method, v_grade_scale_id
  from public.learning_class_subjects cs
  where cs.id = p_class_subject_id and cs.status = 'active' limit 1;
  if v_organization_id is null then raise exception 'Class subject was not found or is inactive'; end if;
  if not public.learning_can_manage_academic_records(v_organization_id) then
    raise exception 'You are not allowed to manage academic records for this organization';
  end if;
  if not exists (
    select 1 from public.learning_terms t
    where t.id = p_term_id and t.organization_id = v_organization_id
  ) then raise exception 'Term does not belong to the selected organization'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.organization_id = v_organization_id and cm.class_group_id = v_class_group_id
      and cm.user_id = p_student_user_id and cm.membership_type = 'student' and cm.status = 'active'
  ) then raise exception 'Student is not an active member of the selected class'; end if;

  select tg.id, tg.status into v_grade_id, v_existing_status
  from public.learning_term_grades tg
  where tg.term_id = p_term_id and tg.class_subject_id = p_class_subject_id
    and tg.student_user_id = p_student_user_id
  for update;
  if v_existing_status = 'finalized' then raise exception 'The term grade is already finalized'; end if;

  select count(*)::integer, coalesce(sum(e.weight), 0)
    into v_entry_count, v_total_weight
  from public.learning_gradebook_entries e
  where e.term_id = p_term_id and e.class_subject_id = p_class_subject_id
    and e.student_user_id = p_student_user_id and e.included_in_grade = true;
  if v_entry_count = 0 then raise exception 'No included gradebook scores exist for this student'; end if;

  if coalesce(v_grading_method, 'weighted_percentage') = 'points_total' then
    select round(100 * sum(e.score) / nullif(sum(e.max_score), 0), 4) into v_score
    from public.learning_gradebook_entries e
    where e.term_id = p_term_id and e.class_subject_id = p_class_subject_id
      and e.student_user_id = p_student_user_id and e.included_in_grade = true;
  else
    if v_total_weight <= 0 then raise exception 'Included gradebook weights must be greater than zero'; end if;
    select round(sum(e.percentage * e.weight) / nullif(sum(e.weight), 0), 4) into v_score
    from public.learning_gradebook_entries e
    where e.term_id = p_term_id and e.class_subject_id = p_class_subject_id
      and e.student_user_id = p_student_user_id and e.included_in_grade = true;
  end if;

  if v_grade_scale_id is not null then
    select r.label into v_letter_grade
    from public.learning_grade_scale_rules r
    where r.grade_scale_id = v_grade_scale_id and v_score between r.min_percentage and r.max_percentage
    order by r.sequence_no, r.min_percentage desc limit 1;
  end if;

  select jsonb_build_object(
    'method', coalesce(v_grading_method, 'weighted_percentage'),
    'entryCount', v_entry_count, 'totalWeight', v_total_weight,
    'calculatedScore', v_score, 'letterGrade', v_letter_grade, 'calculatedAt', now(),
    'entries', coalesce((
      select jsonb_agg(jsonb_build_object(
        'entryId', e.id, 'title', e.title, 'recordType', e.record_type,
        'percentage', e.percentage, 'weight', e.weight
      ) order by e.recorded_at, e.id)
      from public.learning_gradebook_entries e
      where e.term_id = p_term_id and e.class_subject_id = p_class_subject_id
        and e.student_user_id = p_student_user_id and e.included_in_grade = true
    ), '[]'::jsonb)
  ) into v_calculation;

  insert into public.learning_term_grades (
    tenant_id, organization_id, term_id, class_group_id, class_subject_id,
    student_user_id, score, letter_grade, status, calculation
  ) values (
    v_tenant_id, v_organization_id, p_term_id, v_class_group_id, p_class_subject_id,
    p_student_user_id, v_score, v_letter_grade, 'draft', v_calculation
  )
  on conflict (term_id, class_subject_id, student_user_id)
  do update set score = excluded.score, letter_grade = excluded.letter_grade,
    calculation = excluded.calculation, updated_at = now()
  where public.learning_term_grades.status <> 'finalized'
  returning id into v_grade_id;

  if v_grade_id is null then
    raise exception 'The term grade was finalized during calculation; no changes were saved';
  end if;
  return v_grade_id;
end;
$function$;
