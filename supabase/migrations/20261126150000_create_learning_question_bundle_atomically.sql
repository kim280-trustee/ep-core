-- Create a question, its academic version, scoring key and objective mapping
-- as one trusted transaction. A failure at any stage leaves no partial draft.
begin;

create or replace function public.create_learning_question_bundle(
  p_organization_id uuid,
  p_question_id uuid,
  p_code text,
  p_question_type text,
  p_curriculum_id uuid,
  p_grade_level_id uuid,
  p_subject_id uuid,
  p_prompt jsonb,
  p_configuration jsonb,
  p_explanation jsonb,
  p_evaluation_key jsonb,
  p_scoring_rules jsonb,
  p_objective_id uuid,
  p_language_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_actor_id uuid := public.learning_current_user_id();
  v_question_id uuid := p_question_id;
  v_question_created_by uuid;
  v_question_organization_id uuid;
  v_question_type text := lower(trim(coalesce(p_question_type, '')));
  v_version_no integer;
  v_version_id uuid;
begin
  if v_auth_user_id is null or v_actor_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_organization_id is null
     or not (
       public.learning_can_manage_academic_records(p_organization_id)
       or public.learning_is_active_teacher(p_organization_id)
     ) then
    raise exception 'You are not authorized to create questions in this organization';
  end if;

  if p_curriculum_id is null or p_grade_level_id is null
     or p_subject_id is null or p_objective_id is null then
    raise exception 'Curriculum, grade, subject and learning objective are required';
  end if;

  if nullif(trim(coalesce(p_code, '')), '') is null
     or jsonb_typeof(coalesce(p_prompt, '{}'::jsonb)) <> 'object'
     or nullif(trim(coalesce(p_prompt->>'text', '')), '') is null
     or jsonb_typeof(coalesce(p_configuration, '{}'::jsonb)) <> 'object' then
    raise exception 'Question code, prompt and configuration are required';
  end if;

  if v_question_type not in ('single_choice', 'true_false', 'short_answer') then
    raise exception 'Unsupported teacher question type';
  end if;

  if v_question_type = 'short_answer' then
    if coalesce(p_scoring_rules->>'method', '') <> 'manual_review'
       or p_configuration->>'response_mode' <> 'manual_review'
       or nullif(trim(coalesce(p_evaluation_key->>'expected_answer', '')), '') is null then
      raise exception 'Short-answer questions require an expected answer and manual-review scoring';
    end if;
  else
    if coalesce(p_scoring_rules->>'method', '') <> 'exact_option'
       or nullif(trim(coalesce(p_evaluation_key->>'correct_option_id', '')), '') is null
       or not exists (
         select 1
         from jsonb_array_elements(
           case when jsonb_typeof(p_configuration->'options') = 'array'
             then p_configuration->'options' else '[]'::jsonb end
         ) option_row
         where coalesce(option_row->>'key', option_row->>'value') = p_evaluation_key->>'correct_option_id'
       ) then
      raise exception 'Choice questions require a valid correct option and exact-option scoring';
    end if;
  end if;

  if v_question_id is null then
    insert into public.learning_questions (
      organization_id, code, question_type, language_code, created_by
    ) values (
      p_organization_id, upper(trim(p_code)), v_question_type,
      coalesce(nullif(trim(p_language_code), ''), 'en'), v_actor_id
    ) returning id into v_question_id;
  else
    select q.organization_id, q.created_by, q.question_type
      into v_question_organization_id, v_question_created_by, v_question_type
    from public.learning_questions q
    where q.id = v_question_id
    for update;

    if not found or v_question_organization_id is distinct from p_organization_id then
      raise exception 'The question was not found in the selected organization';
    end if;

    if v_question_type <> lower(trim(p_question_type)) then
      raise exception 'A question version cannot change the question type';
    end if;

    if not (
      public.learning_can_manage_academic_records(p_organization_id)
      or (v_question_created_by = v_actor_id and public.learning_is_active_teacher(p_organization_id))
    ) then
      raise exception 'You are not authorized to create a version of this question';
    end if;

    if exists (
      select 1 from public.learning_question_versions qv
      where qv.question_id = v_question_id and qv.published_at is not null
      group by qv.question_id
      having count(*) > 0
    ) and exists (
      select 1 from public.learning_questions q
      where q.id = v_question_id and q.status = 'retired'
    ) then
      raise exception 'Retired questions cannot receive new versions';
    end if;
  end if;

  select coalesce(max(qv.version_no), 0) + 1
    into v_version_no
  from public.learning_question_versions qv
  where qv.question_id = v_question_id;

  insert into public.learning_question_versions (
    question_id, version_no, curriculum_id, grade_level_id, subject_id,
    prompt, configuration, explanation, created_by
  ) values (
    v_question_id, v_version_no, p_curriculum_id, p_grade_level_id, p_subject_id,
    p_prompt, p_configuration, p_explanation, v_actor_id
  ) returning id into v_version_id;

  insert into public.learning_question_evaluation_keys (
    question_version_id, evaluation_key, scoring_rules
  ) values (
    v_version_id, coalesce(p_evaluation_key, '{}'::jsonb),
    coalesce(p_scoring_rules, '{}'::jsonb)
  );

  insert into public.learning_question_objectives (
    question_version_id, objective_id, weight
  ) values (v_version_id, p_objective_id, 1);

  return jsonb_build_object(
    'question_id', v_question_id,
    'question_version_id', v_version_id,
    'version_no', v_version_no
  );
end;
$function$;

revoke all on function public.create_learning_question_bundle(
  uuid, uuid, text, text, uuid, uuid, uuid, jsonb, jsonb, jsonb, jsonb, jsonb, uuid, text
) from public, anon;
grant execute on function public.create_learning_question_bundle(
  uuid, uuid, text, text, uuid, uuid, uuid, jsonb, jsonb, jsonb, jsonb, jsonb, uuid, text
) to authenticated;

commit;
