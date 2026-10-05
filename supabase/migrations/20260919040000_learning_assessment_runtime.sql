-- E&P Learning trusted assessment runtime.
-- Student submits an attempt; trusted database logic evaluates it without
-- exposing evaluation keys to the browser.

create or replace function public.submit_learning_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_student_user_id uuid;
  v_tenant_id uuid;
  v_organization_id uuid;
  v_assessment_id uuid;
  v_attempt_status text;
  v_assessment_status text;
  v_score numeric(10,2) := 0;
  v_max_score numeric(10,2) := 0;
  v_percentage numeric(7,4);
  v_evaluated_at timestamptz := now();
  v_answer record;
  v_key jsonb;
  v_rules jsonb;
  v_correct boolean;
  v_awarded numeric(10,2);
  v_evaluated_count integer := 0;
  v_manual_count integer := 0;
  v_objective record;
  v_mastery record;
  v_evidence_count integer;
  v_evidence_correct integer;
  v_current_score numeric(6,3);
  v_previous_score numeric(6,3);
  v_new_score numeric(6,3);
  v_new_confidence numeric(6,3);
  v_new_state text;
  v_result_id uuid;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication is required';
  end if;

  /*
   * Resolve the application student identity from the authenticated
   * Supabase Auth identity.
   */
  select
    u.id,
    u.tenant_id
  into
    v_student_user_id,
    v_tenant_id
  from public.users u
  where u.auth_user_id = v_auth_user_id;

  if v_student_user_id is null then
    raise exception 'Authenticated application user was not found';
  end if;

  /*
   * Lock the attempt so two simultaneous submissions cannot evaluate
   * the same attempt independently.
   */
  select
    a.student_user_id,
    a.tenant_id,
    a.organization_id,
    a.assessment_id,
    a.status,
    ass.status
  into
    v_student_user_id,
    v_tenant_id,
    v_organization_id,
    v_assessment_id,
    v_attempt_status,
    v_assessment_status
  from public.learning_attempts a
  join public.learning_assessments ass
    on ass.id = a.assessment_id
  where a.id = p_attempt_id
  for update;

  if not found then
    raise exception 'Assessment attempt was not found';
  end if;

  if v_student_user_id <> (
    select u.id
    from public.users u
    where u.auth_user_id = v_auth_user_id
  ) then
    raise exception 'You cannot submit another student''s attempt';
  end if;

  if v_attempt_status = 'evaluated' then
    select id
    into v_result_id
    from public.learning_assessment_results
    where attempt_id = p_attempt_id;

    return jsonb_build_object(
      'attempt_id', p_attempt_id,
      'status', 'evaluated',
      'result_id', v_result_id
    );
  end if;

  if v_attempt_status not in ('in_progress', 'submitted') then
    raise exception 'Attempt cannot be submitted from status: %', v_attempt_status;
  end if;

  if v_assessment_status <> 'published' then
    raise exception 'Assessment is not published';
  end if;

  /*
   * Move the attempt into the trusted evaluation state.
   */
  update public.learning_attempts
  set
    status = 'evaluating',
    submitted_at = coalesce(submitted_at, v_evaluated_at),
    updated_at = v_evaluated_at
  where id = p_attempt_id;

  /*
   * Evaluate every assessment question that has a submitted answer.
   *
   * The pilot currently uses single_choice + exact_option.
   * Questions using other interaction types remain pending for the
   * future manual/AI evaluation layer.
   */
  for v_answer in
    select
      aa.id as answer_id,
      aa.answer,
      aq.id as assessment_question_id,
      aq.question_version_id,
      aq.points,
      aq.required,
      q.question_type
    from public.learning_attempt_answers aa
    join public.learning_assessment_questions aq
      on aq.id = aa.assessment_question_id
    join public.learning_question_versions qv
      on qv.id = aq.question_version_id
    join public.learning_questions q
      on q.id = qv.question_id
    where aa.attempt_id = p_attempt_id
    order by aq.sequence_no
  loop
    v_key := null;
    v_rules := null;
    v_correct := null;
    v_awarded := null;

    select
      ek.evaluation_key,
      ek.scoring_rules
    into
      v_key,
      v_rules
    from public.learning_question_evaluation_keys ek
    where ek.question_version_id = v_answer.question_version_id;

    if v_answer.question_type in ('single_choice', 'true_false')
       and v_key is not null
       and coalesce(v_rules->>'method', '') = 'exact_option'
    then
      v_correct :=
        (v_answer.answer->>'option_id')
        =
        (v_key->>'correct_option_id');

      v_awarded :=
        case
          when v_correct then v_answer.points
          else 0
        end;

      update public.learning_attempt_answers
      set
        evaluation_status = 'auto_evaluated',
        is_correct = v_correct,
        awarded_points = v_awarded,
        feedback = case
          when v_correct then '{"result":"correct"}'::jsonb
          else '{"result":"incorrect"}'::jsonb
        end,
        evaluated_at = v_evaluated_at,
        updated_at = v_evaluated_at
      where id = v_answer.answer_id;

      v_evaluated_count := v_evaluated_count + 1;
      v_max_score := v_max_score + v_answer.points;
      v_score := v_score + v_awarded;
    else
      v_manual_count := v_manual_count + 1;

      update public.learning_attempt_answers
      set
        evaluation_status = 'pending',
        is_correct = null,
        awarded_points = null,
        evaluated_at = null,
        updated_at = v_evaluated_at
      where id = v_answer.answer_id;
    end if;
  end loop;

  /*
   * If there are required questions with no answer, they count as
   * unanswered. Auto-evaluable questions receive zero points.
   */
  for v_answer in
    select
      aq.id as assessment_question_id,
      aq.question_version_id,
      aq.points,
      aq.required,
      q.question_type
    from public.learning_assessment_questions aq
    join public.learning_question_versions qv
      on qv.id = aq.question_version_id
    join public.learning_questions q
      on q.id = qv.question_id
    where aq.assessment_id = v_assessment_id
      and aq.required = true
      and not exists (
        select 1
        from public.learning_attempt_answers aa
        where aa.attempt_id = p_attempt_id
          and aa.assessment_question_id = aq.id
      )
  loop
    if v_answer.question_type in ('single_choice', 'true_false') then
      v_max_score := v_max_score + v_answer.points;
      v_evaluated_count := v_evaluated_count + 1;
    else
      v_manual_count := v_manual_count + 1;
    end if;
  end loop;

  if v_evaluated_count = 0 then
    raise exception 'No automatically evaluable questions were found';
  end if;

  if v_manual_count > 0 then
    /*
     * Do not falsely mark a mixed/manual assessment as fully evaluated.
     * The current pilot does not use this branch.
     */
    update public.learning_attempts
    set
      status = 'evaluating',
      score = v_score,
      max_score = v_max_score,
      percentage = case
        when v_max_score > 0 then round((v_score / v_max_score) * 100, 4)
        else null
      end,
      updated_at = v_evaluated_at
    where id = p_attempt_id;

    return jsonb_build_object(
      'attempt_id', p_attempt_id,
      'status', 'evaluating',
      'evaluated_questions', v_evaluated_count,
      'manual_questions', v_manual_count
    );
  end if;

  v_percentage :=
    case
      when v_max_score > 0
        then round((v_score / v_max_score) * 100, 4)
      else 0
    end;

  /*
   * Assessment result.
   * Pilot pass threshold = 60%.
   * This is stored as result data, not used as authorization.
   */
  insert into public.learning_assessment_results (
    attempt_id,
    student_user_id,
    organization_id,
    score,
    max_score,
    percentage,
    passed,
    evaluated_at,
    summary
  )
  values (
    p_attempt_id,
    v_student_user_id,
    v_organization_id,
    v_score,
    v_max_score,
    v_percentage,
    v_percentage >= 60,
    v_evaluated_at,
    jsonb_build_object(
      'evaluation', 'automatic',
      'evaluated_questions', v_evaluated_count,
      'manual_questions', 0
    )
  )
  on conflict (attempt_id)
  do update set
    score = excluded.score,
    max_score = excluded.max_score,
    percentage = excluded.percentage,
    passed = excluded.passed,
    evaluated_at = excluded.evaluated_at,
    summary = excluded.summary,
    updated_at = v_evaluated_at
  returning id into v_result_id;

  /*
   * Update the attempt itself.
   */
  update public.learning_attempts
  set
    status = 'evaluated',
    score = v_score,
    max_score = v_max_score,
    percentage = v_percentage,
    submitted_at = coalesce(submitted_at, v_evaluated_at),
    updated_at = v_evaluated_at
  where id = p_attempt_id;

  /*
   * Convert question evidence into objective-level mastery.
   *
   * Each objective receives the average correctness of the questions
   * mapped to it in this attempt. Historical mastery is blended with
   * the new evidence using evidence count as the weight.
   */
  for v_objective in
    select
      qo.objective_id,
      count(*)::integer as evidence_count,
      count(*) filter (where aa.is_correct = true)::integer as correct_count
    from public.learning_assessment_questions aq
    join public.learning_question_objectives qo
      on qo.question_version_id = aq.question_version_id
    join public.learning_attempt_answers aa
      on aa.attempt_id = p_attempt_id
     and aa.assessment_question_id = aq.id
    where aq.assessment_id = v_assessment_id
      and aa.evaluation_status = 'auto_evaluated'
    group by qo.objective_id
  loop
    v_evidence_count := v_objective.evidence_count;
    v_evidence_correct := v_objective.correct_count;

    v_current_score :=
      round(
        (v_evidence_correct::numeric / greatest(v_evidence_count, 1)::numeric) * 100,
        3
      );

    select *
    into v_mastery
    from public.learning_student_mastery sm
    where sm.student_user_id = v_student_user_id
      and sm.objective_id = v_objective.objective_id
      and (
        (sm.organization_id = v_organization_id)
        or (sm.organization_id is null and v_organization_id is null)
      )
    for update;

    if found then
      v_previous_score := v_mastery.mastery_score;

      v_new_score :=
        round(
          (
            (v_mastery.mastery_score * greatest(v_mastery.attempts_count, 0))
            + (v_current_score * v_evidence_count)
          )
          /
          greatest(v_mastery.attempts_count + v_evidence_count, 1),
          3
        );

      v_new_confidence :=
        least(
          100,
          greatest(v_mastery.attempts_count + v_evidence_count, 0) * 20
        );

      update public.learning_student_mastery
      set
        mastery_score = v_new_score,
        confidence_score = v_new_confidence,
        state =
          case
            when v_new_score >= 80 then 'mastered'
            when v_new_score >= 60 then 'proficient'
            when v_new_score >= 40 then 'developing'
            else 'needs_review'
          end,
        attempts_count = v_mastery.attempts_count + v_evidence_count,
        correct_count = v_mastery.correct_count + v_evidence_correct,
        last_assessed_at = v_evaluated_at,
        next_review_at =
          case
            when v_new_score < 60 then v_evaluated_at + interval '3 days'
            when v_new_score < 80 then v_evaluated_at + interval '7 days'
            else v_evaluated_at + interval '30 days'
          end,
        updated_at = v_evaluated_at
      where id = v_mastery.id;
    else
      v_previous_score := null;
      v_new_score := v_current_score;
      v_new_confidence :=
        least(100, v_evidence_count * 20);

      insert into public.learning_student_mastery (
        tenant_id,
        organization_id,
        student_user_id,
        objective_id,
        mastery_score,
        confidence_score,
        state,
        attempts_count,
        correct_count,
        last_assessed_at,
        next_review_at
      )
      values (
        v_tenant_id,
        v_organization_id,
        v_student_user_id,
        v_objective.objective_id,
        v_new_score,
        v_new_confidence,
        case
          when v_new_score >= 80 then 'mastered'
          when v_new_score >= 60 then 'proficient'
          when v_new_score >= 40 then 'developing'
          else 'needs_review'
        end,
        v_evidence_count,
        v_evidence_correct,
        v_evaluated_at,
        case
          when v_new_score < 60 then v_evaluated_at + interval '3 days'
          when v_new_score < 80 then v_evaluated_at + interval '7 days'
          else v_evaluated_at + interval '30 days'
        end
      );
    end if;

    /*
     * Preserve the evidence history independently from the current
     * mastery state.
     */
    insert into public.learning_mastery_events (
      tenant_id,
      organization_id,
      student_user_id,
      objective_id,
      attempt_id,
      previous_score,
      new_score,
      evidence
    )
    values (
      v_tenant_id,
      v_organization_id,
      v_student_user_id,
      v_objective.objective_id,
      p_attempt_id,
      v_previous_score,
      v_new_score,
      jsonb_build_object(
        'assessment_id', v_assessment_id,
        'evidence_count', v_evidence_count,
        'correct_count', v_evidence_correct,
        'current_score', v_current_score
      )
    );

    /*
     * Keep one active recommendation for weak objectives.
     */
    if v_new_score < 80
       and not exists (
         select 1
         from public.learning_recommendations existing_recommendation
         where existing_recommendation.student_user_id = v_student_user_id
           and existing_recommendation.objective_id = v_objective.objective_id
           and existing_recommendation.status = 'active'
       )
    then
      insert into public.learning_recommendations (
        tenant_id,
        organization_id,
        student_user_id,
        recommendation_type,
        objective_id,
        assessment_id,
        priority,
        reason,
        status,
        generated_at
      )
      values (
        v_tenant_id,
        v_organization_id,
        v_student_user_id,
        case when v_new_score < 60 then 'practice' else 'review' end,
        v_objective.objective_id,
        v_assessment_id,
        case when v_new_score < 60 then 90 else 70 end,
        jsonb_build_object(
          'source', 'assessment_evaluation',
          'mastery_score', v_new_score,
          'assessment_id', v_assessment_id
        ),
        'active',
        v_evaluated_at
      );
    end if;
  end loop;

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'result_id', v_result_id,
    'status', 'evaluated',
    'score', v_score,
    'max_score', v_max_score,
    'percentage', v_percentage
  );
end;
$$;

revoke execute on function public.submit_learning_attempt(uuid) from public;
revoke execute on function public.submit_learning_attempt(uuid) from anon;
grant execute on function public.submit_learning_attempt(uuid) to authenticated;


