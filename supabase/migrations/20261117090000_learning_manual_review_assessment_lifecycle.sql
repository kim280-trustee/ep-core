begin;

-- Permit published short-answer questions only when their protected key and
-- version configuration explicitly select manual review.
create or replace function private.guard_learning_assessment_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status <> 'published' then
    return new;
  end if;

  if not exists (
    select 1 from public.learning_assessment_questions aq
    where aq.assessment_id = new.id
  ) then
    raise exception 'An assessment needs at least one question before publishing';
  end if;

  if exists (
    select 1
    from public.learning_assessment_questions aq
    join public.learning_question_versions qv on qv.id = aq.question_version_id
    join public.learning_questions q on q.id = qv.question_id
    left join public.learning_question_evaluation_keys ek on ek.question_version_id = qv.id
    where aq.assessment_id = new.id
      and (
        q.status <> 'published'
        or (q.organization_id is not null and q.organization_id is distinct from new.organization_id)
        or qv.published_at is null
        or not (
          (
            q.question_type in ('single_choice', 'true_false')
            and coalesce(ek.scoring_rules->>'method', '') = 'exact_option'
            and coalesce(ek.evaluation_key, '{}'::jsonb) ? 'correct_option_id'
            and exists (
              select 1
              from jsonb_array_elements(
                case when jsonb_typeof(qv.configuration->'options') = 'array'
                  then qv.configuration->'options' else '[]'::jsonb end
              ) option_row
              where coalesce(option_row->>'key', option_row->>'value') = ek.evaluation_key->>'correct_option_id'
            )
          )
          or
          (
            q.question_type = 'short_answer'
            and coalesce(ek.scoring_rules->>'method', '') = 'manual_review'
            and qv.configuration->>'response_mode' = 'manual_review'
            and jsonb_typeof(ek.evaluation_key->'expected_answer') = 'string'
            and length(trim(ek.evaluation_key->>'expected_answer')) > 0
          )
        )
      )
  ) then
    raise exception 'Every assessment question must have a published version and a valid automatic or manual-review scoring key';
  end if;

  if (new.curriculum_id is null) <> (new.grade_level_id is null) then
    raise exception 'Assessment curriculum and grade level must be set together';
  end if;

  if new.curriculum_id is not null and exists (
    select 1
    from public.learning_assessment_questions aq
    where aq.assessment_id = new.id
      and not exists (
        select 1 from public.learning_question_objectives qo
        where qo.question_version_id = aq.question_version_id
      )
  ) then
    raise exception 'Every question in an academic assessment must be mapped to at least one learning objective';
  end if;

  if new.curriculum_id is not null and exists (
    select 1
    from public.learning_assessment_questions aq
    join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
    join public.learning_objectives obj on obj.id = qo.objective_id
    join public.learning_topics tp on tp.id = obj.topic_id
    join public.learning_skills sk on sk.id = tp.skill_id
    where aq.assessment_id = new.id
      and (
        not exists (
          select 1 from public.learning_objective_alignments oa
          where oa.objective_id = qo.objective_id
            and oa.curriculum_id = new.curriculum_id
            and oa.grade_level_id = new.grade_level_id
        )
        or (new.subject_id is not null and sk.subject_id <> new.subject_id)
      )
  ) then
    raise exception 'Every question objective must match the assessment curriculum, grade and selected subject';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assessment_publication() from public, anon, authenticated;

-- Keep the established automatic evaluator intact. The wrapper handles the
-- all-manual case, which the original evaluator intentionally rejected.
alter function public.submit_learning_attempt(uuid)
  rename to submit_learning_attempt_auto_v1;

revoke all on function public.submit_learning_attempt_auto_v1(uuid) from public, anon, authenticated;

create or replace function public.submit_learning_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_student_user_id uuid;
  v_status text;
  v_result jsonb;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select u.id into v_student_user_id
  from public.users u
  where u.auth_user_id = v_auth_user_id;

  if v_student_user_id is null then
    raise exception 'Authenticated application user was not found';
  end if;

  select a.status into v_status
  from public.learning_attempts a
  where a.id = p_attempt_id
    and a.student_user_id = v_student_user_id
  for update;

  if not found then
    raise exception 'Assessment attempt was not found or is not owned by this student';
  end if;

  if v_status = 'evaluated' then
    return jsonb_build_object('attempt_id', p_attempt_id, 'status', 'evaluated');
  end if;

  begin
    v_result := public.submit_learning_attempt_auto_v1(p_attempt_id);
    return v_result;
  exception when raise_exception then
    if sqlerrm <> 'No automatically evaluable questions were found' then
      raise;
    end if;
  end;

  -- The original function's exception rolled back its sub-block. Mark the
  -- manual responses pending and leave the attempt awaiting teacher review.
  update public.learning_attempt_answers aa
  set evaluation_status = 'pending',
      is_correct = null,
      awarded_points = null,
      evaluated_at = null,
      updated_at = now()
  from public.learning_assessment_questions aq
  join public.learning_question_versions qv on qv.id = aq.question_version_id
  join public.learning_questions q on q.id = qv.question_id
  join public.learning_question_evaluation_keys ek on ek.question_version_id = qv.id
  where aa.attempt_id = p_attempt_id
    and aa.assessment_question_id = aq.id
    and q.question_type = 'short_answer'
    and ek.scoring_rules->>'method' = 'manual_review';

  update public.learning_attempts
  set status = 'evaluating',
      submitted_at = coalesce(submitted_at, now()),
      updated_at = now()
  where id = p_attempt_id;

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'status', 'evaluating',
    'message', 'Submitted for teacher review'
  );
end;
$function$;

revoke all on function public.submit_learning_attempt(uuid) from public, anon;
grant execute on function public.submit_learning_attempt(uuid) to authenticated;

create or replace function public.grade_learning_attempt_answer(
  p_answer_id uuid,
  p_awarded_points numeric,
  p_teacher_feedback text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_teacher_id uuid;
  v_answer record;
  v_pending_manual integer;
  v_score numeric(10,2);
  v_max_score numeric(10,2);
  v_percentage numeric(7,4);
  v_result_id uuid;
  v_now timestamptz := now();
  v_objective record;
  v_previous_score numeric(6,3);
  v_new_score numeric(6,3);
  v_confidence numeric(6,3);
begin
  if v_auth_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select u.id into v_teacher_id
  from public.users u
  where u.auth_user_id = v_auth_user_id;

  if v_teacher_id is null then
    raise exception 'Authenticated teacher account was not found';
  end if;

  select
    aa.id as answer_id,
    aa.attempt_id,
    aa.assessment_question_id,
    aa.evaluation_status,
    a.status as attempt_status,
    a.student_user_id,
    a.tenant_id,
    a.organization_id,
    a.assessment_id,
    aq.points,
    aq.question_version_id,
    q.question_type,
    ek.scoring_rules
  into v_answer
  from public.learning_attempt_answers aa
  join public.learning_attempts a on a.id = aa.attempt_id
  join public.learning_assessment_questions aq on aq.id = aa.assessment_question_id
  join public.learning_question_versions qv on qv.id = aq.question_version_id
  join public.learning_questions q on q.id = qv.question_id
  left join public.learning_question_evaluation_keys ek on ek.question_version_id = qv.id
  where aa.id = p_answer_id
  for update of aa, a;

  if not found then
    raise exception 'Assessment answer was not found';
  end if;

  if v_answer.attempt_status <> 'evaluating' then
    raise exception 'Only submitted attempts awaiting review can be graded';
  end if;

  if v_answer.question_type <> 'short_answer'
     or coalesce(v_answer.scoring_rules->>'method', '') <> 'manual_review' then
    raise exception 'This answer is not configured for manual review';
  end if;

  if v_answer.evaluation_status = 'manual_reviewed' then
    raise exception 'This answer has already been graded';
  end if;

  if p_awarded_points is null or p_awarded_points < 0 or p_awarded_points > v_answer.points then
    raise exception 'Awarded points must be between zero and the question maximum';
  end if;

  if v_answer.organization_id is null
     or not (
       public.learning_can_manage_academic_records(v_answer.organization_id)
       or public.learning_is_active_teacher(v_answer.organization_id)
     ) then
    raise exception 'You are not authorized to grade this assessment';
  end if;

  update public.learning_attempt_answers
  set evaluation_status = 'manual_reviewed',
      is_correct = (p_awarded_points >= v_answer.points),
      awarded_points = p_awarded_points,
      feedback = case
        when nullif(trim(coalesce(p_teacher_feedback, '')), '') is null then '{}'::jsonb
        else jsonb_build_object('teacher_feedback', trim(p_teacher_feedback))
      end,
      evaluated_at = v_now,
      updated_at = v_now
  where id = p_answer_id;

  select count(*)::integer into v_pending_manual
  from public.learning_attempt_answers aa
  join public.learning_assessment_questions aq on aq.id = aa.assessment_question_id
  join public.learning_question_versions qv on qv.id = aq.question_version_id
  join public.learning_questions q on q.id = qv.question_id
  join public.learning_question_evaluation_keys ek on ek.question_version_id = qv.id
  where aa.attempt_id = v_answer.attempt_id
    and q.question_type = 'short_answer'
    and ek.scoring_rules->>'method' = 'manual_review'
    and aa.evaluation_status <> 'manual_reviewed';

  if v_pending_manual > 0 then
    return jsonb_build_object(
      'attempt_id', v_answer.attempt_id,
      'status', 'evaluating',
      'pending_manual_answers', v_pending_manual
    );
  end if;

  -- Unanswered required questions contribute zero while optional unanswered
  -- questions are excluded from the denominator.
  select
    coalesce(sum(coalesce(aa.awarded_points, 0)), 0),
    coalesce(sum(aq.points) filter (where aa.id is not null or aq.required), 0)
  into v_score, v_max_score
  from public.learning_assessment_questions aq
  left join public.learning_attempt_answers aa
    on aa.attempt_id = v_answer.attempt_id
   and aa.assessment_question_id = aq.id
  where aq.assessment_id = v_answer.assessment_id;

  v_percentage := case when v_max_score > 0
    then round((v_score / v_max_score) * 100, 4) else 0 end;

  insert into public.learning_assessment_results (
    attempt_id, student_user_id, organization_id, score, max_score,
    percentage, passed, evaluated_at, summary
  )
  values (
    v_answer.attempt_id, v_answer.student_user_id, v_answer.organization_id,
    v_score, v_max_score, v_percentage, v_percentage >= 60, v_now,
    jsonb_build_object('evaluation', 'teacher_review', 'graded_by', v_teacher_id)
  )
  on conflict (attempt_id) do update
  set score = excluded.score,
      max_score = excluded.max_score,
      percentage = excluded.percentage,
      passed = excluded.passed,
      evaluated_at = excluded.evaluated_at,
      summary = excluded.summary,
      updated_at = v_now
  returning id into v_result_id;

  update public.learning_attempts
  set status = 'evaluated',
      score = v_score,
      max_score = v_max_score,
      percentage = v_percentage,
      updated_at = v_now
  where id = v_answer.attempt_id;

  -- Record objective mastery only after all manual responses are graded.
  for v_objective in
    select
      qo.objective_id,
      count(*)::integer as evidence_count,
      count(*) filter (where aa.is_correct = true)::integer as correct_count
    from public.learning_assessment_questions aq
    join public.learning_question_objectives qo on qo.question_version_id = aq.question_version_id
    join public.learning_attempt_answers aa
      on aa.attempt_id = v_answer.attempt_id
     and aa.assessment_question_id = aq.id
    where aq.assessment_id = v_answer.assessment_id
      and aa.evaluation_status in ('auto_evaluated', 'manual_reviewed')
    group by qo.objective_id
  loop
    select sm.mastery_score into v_previous_score
    from public.learning_student_mastery sm
    where sm.student_user_id = v_answer.student_user_id
      and sm.objective_id = v_objective.objective_id
      and sm.organization_id is not distinct from v_answer.organization_id
    for update;

    if found then
      v_new_score := round(
        ((v_previous_score * greatest((
          select sm.attempts_count from public.learning_student_mastery sm
          where sm.student_user_id = v_answer.student_user_id
            and sm.objective_id = v_objective.objective_id
            and sm.organization_id is not distinct from v_answer.organization_id
        ), 0)) + ((v_objective.correct_count::numeric / greatest(v_objective.evidence_count, 1)) * 100))
        / greatest((
          select sm.attempts_count + v_objective.evidence_count
          from public.learning_student_mastery sm
          where sm.student_user_id = v_answer.student_user_id
            and sm.objective_id = v_objective.objective_id
            and sm.organization_id is not distinct from v_answer.organization_id
        ), 1), 3);
      update public.learning_student_mastery sm
      set mastery_score = v_new_score,
          confidence_score = least(100, (sm.attempts_count + v_objective.evidence_count) * 20),
          state = case
            when v_new_score >= 80 then 'mastered'
            when v_new_score >= 60 then 'proficient'
            when v_new_score >= 40 then 'developing'
            else 'needs_review' end,
          attempts_count = sm.attempts_count + v_objective.evidence_count,
          correct_count = sm.correct_count + v_objective.correct_count,
          last_assessed_at = v_now,
          next_review_at = case
            when v_new_score < 60 then v_now + interval '3 days'
            when v_new_score < 80 then v_now + interval '7 days'
            else v_now + interval '30 days' end,
          updated_at = v_now
      where sm.student_user_id = v_answer.student_user_id
        and sm.objective_id = v_objective.objective_id
        and sm.organization_id is not distinct from v_answer.organization_id;
    else
      v_new_score := round(
        (v_objective.correct_count::numeric / greatest(v_objective.evidence_count, 1)) * 100, 3
      );
      v_confidence := least(100, v_objective.evidence_count * 20);
      insert into public.learning_student_mastery (
        tenant_id, organization_id, student_user_id, objective_id,
        mastery_score, confidence_score, state, attempts_count, correct_count,
        last_assessed_at, next_review_at
      ) values (
        v_answer.tenant_id, v_answer.organization_id, v_answer.student_user_id,
        v_objective.objective_id, v_new_score, v_confidence,
        case when v_new_score >= 80 then 'mastered'
          when v_new_score >= 60 then 'proficient'
          when v_new_score >= 40 then 'developing' else 'needs_review' end,
        v_objective.evidence_count, v_objective.correct_count, v_now,
        case when v_new_score < 60 then v_now + interval '3 days'
          when v_new_score < 80 then v_now + interval '7 days'
          else v_now + interval '30 days' end
      );
    end if;

    insert into public.learning_mastery_events (
      tenant_id, organization_id, student_user_id, objective_id, attempt_id,
      previous_score, new_score, evidence
    ) values (
      v_answer.tenant_id, v_answer.organization_id, v_answer.student_user_id,
      v_objective.objective_id, v_answer.attempt_id, v_previous_score,
      v_new_score,
      jsonb_build_object('source', 'teacher_review', 'assessment_id', v_answer.assessment_id,
        'evidence_count', v_objective.evidence_count, 'correct_count', v_objective.correct_count)
    );
    v_new_score := null;
    v_previous_score := null;
  end loop;

  return jsonb_build_object(
    'attempt_id', v_answer.attempt_id,
    'result_id', v_result_id,
    'status', 'evaluated',
    'score', v_score,
    'max_score', v_max_score,
    'percentage', v_percentage
  );
end;
$function$;

revoke all on function public.grade_learning_attempt_answer(uuid, numeric, text) from public, anon;
grant execute on function public.grade_learning_attempt_answer(uuid, numeric, text) to authenticated;

commit;
