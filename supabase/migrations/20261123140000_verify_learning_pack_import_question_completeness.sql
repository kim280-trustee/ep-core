-- Verify completeness of existing teacher-pack question drafts without exposing answer keys.
-- The function returns only status flags; protected evaluation-key JSON never leaves the database.

begin;

create or replace function public.verify_learning_pack_import_questions(
  p_organization_id uuid,
  p_class_group_id uuid,
  p_expected_questions jsonb
)
returns table (
  question_code text,
  question_exists boolean,
  is_complete boolean,
  issue text
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_expected_count integer;
  v_distinct_count integer;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_organization_id is null
    or p_class_group_id is null
    or not public.is_organization_member(p_organization_id) then
    raise exception 'You are not authorized to inspect imported questions for this organization';
  end if;

  if not exists (
    select 1
    from public.learning_class_groups class_group
    where class_group.id = p_class_group_id
      and class_group.organization_id = p_organization_id
      and class_group.status = 'active'
  ) then
    raise exception 'The selected class is not active in this organization';
  end if;

  if not (
    (
      public.learning_can_manage_academic_records(p_organization_id)
      and public.is_organization_member(p_organization_id)
    )
    or exists (
      select 1
      from public.learning_class_memberships membership
      where membership.organization_id = p_organization_id
        and membership.class_group_id = p_class_group_id
        and membership.user_id = public.learning_current_user_id()
        and membership.membership_type = 'teacher'
        and membership.status = 'active'
    )
  ) then
    raise exception 'Only an authorized class teacher or academic manager can verify imported question drafts';
  end if;

  if p_expected_questions is null or jsonb_typeof(p_expected_questions) <> 'array' then
    raise exception 'Expected questions must be supplied as a JSON array';
  end if;

  v_expected_count := jsonb_array_length(p_expected_questions);
  if v_expected_count < 1 or v_expected_count > 100 then
    raise exception 'Verify between 1 and 100 expected questions per request';
  end if;

  select count(distinct upper(trim(item.code)))
    into v_distinct_count
  from jsonb_to_recordset(p_expected_questions) as item(
    code text,
    prompt text,
    expected_answer text,
    objective_id uuid,
    curriculum_id uuid,
    grade_level_id uuid,
    subject_id uuid,
    language_code text
  );

  if v_distinct_count <> v_expected_count then
    raise exception 'Expected question codes must be present and unique';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_expected_questions) as item(
      code text,
      prompt text,
      expected_answer text,
      objective_id uuid,
      curriculum_id uuid,
      grade_level_id uuid,
      subject_id uuid,
      language_code text
    )
    where nullif(trim(item.code), '') is null
      or nullif(trim(item.prompt), '') is null
      or nullif(trim(item.expected_answer), '') is null
      or item.objective_id is null
      or item.curriculum_id is null
      or item.grade_level_id is null
      or item.subject_id is null
      or item.language_code is null
      or item.language_code not in ('en', 'th')
  ) then
    raise exception 'Every expected question needs code, prompt, answer, objective and complete academic scope';
  end if;

  return query
  with expected as (
    select
      upper(trim(item.code)) code,
      item.prompt,
      item.expected_answer,
      item.objective_id,
      item.curriculum_id,
      item.grade_level_id,
      item.subject_id,
      item.language_code
    from jsonb_to_recordset(p_expected_questions) as item(
      code text,
      prompt text,
      expected_answer text,
      objective_id uuid,
      curriculum_id uuid,
      grade_level_id uuid,
      subject_id uuid,
      language_code text
    )
  )
  select
    e.code,
    q.id is not null,
    coalesce(
      q.id is not null
      and q.question_type = 'short_answer'
      and q.language_code = e.language_code
      and q.status = 'draft'
      and details.version_count = 1
      and details.scope_match_count = 1
      and details.prompt_match_count = 1
      and details.key_count = 1
      and details.key_match_count = 1
      and mappings.mapping_count = 1
      and mappings.expected_mapping_count = 1
      and exists (
        select 1
        from public.learning_objectives objective
        join public.learning_topics topic on topic.id = objective.topic_id
        join public.learning_skills skill on skill.id = topic.skill_id
        join public.learning_objective_alignments alignment on alignment.objective_id = objective.id
        join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
        join public.learning_grade_levels grade
          on grade.id = alignment.grade_level_id and grade.curriculum_id = alignment.curriculum_id
        join public.learning_subjects subject on subject.id = skill.subject_id
        join public.learning_curriculum_subjects curriculum_subject
          on curriculum_subject.curriculum_id = curriculum.id
         and curriculum_subject.subject_id = subject.id
        where objective.id = e.objective_id
          and objective.status = 'active'
          and topic.status = 'active'
          and skill.status = 'active'
          and skill.subject_id = e.subject_id
          and alignment.curriculum_id = e.curriculum_id
          and alignment.grade_level_id = e.grade_level_id
          and curriculum.status = 'active'
          and grade.status = 'active'
          and subject.status = 'active'
          and curriculum_subject.status = 'active'
      ),
      false
    ),
    case
      when q.id is null then 'missing_question'
      when q.question_type <> 'short_answer'
        or q.language_code is distinct from e.language_code
        or q.status is distinct from 'draft' then 'question_state_mismatch'
      when details.version_count <> 1 then 'question_version_incomplete'
      when details.scope_match_count <> 1 then 'academic_scope_mismatch'
      when details.prompt_match_count <> 1 then 'question_prompt_mismatch'
      when details.key_count <> 1 or details.key_match_count <> 1 then 'protected_answer_key_incomplete'
      when mappings.mapping_count <> 1 or mappings.expected_mapping_count <> 1 then 'objective_mapping_incomplete'
      when not exists (
        select 1
        from public.learning_objectives objective
        join public.learning_topics topic on topic.id = objective.topic_id
        join public.learning_skills skill on skill.id = topic.skill_id
        join public.learning_objective_alignments alignment on alignment.objective_id = objective.id
        join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
        join public.learning_grade_levels grade
          on grade.id = alignment.grade_level_id and grade.curriculum_id = alignment.curriculum_id
        join public.learning_subjects subject on subject.id = skill.subject_id
        join public.learning_curriculum_subjects curriculum_subject
          on curriculum_subject.curriculum_id = curriculum.id
         and curriculum_subject.subject_id = subject.id
        where objective.id = e.objective_id
          and objective.status = 'active'
          and topic.status = 'active'
          and skill.status = 'active'
          and skill.subject_id = e.subject_id
          and alignment.curriculum_id = e.curriculum_id
          and alignment.grade_level_id = e.grade_level_id
          and curriculum.status = 'active'
          and grade.status = 'active'
          and subject.status = 'active'
          and curriculum_subject.status = 'active'
      ) then 'objective_academic_alignment_mismatch'
      else null
    end
  from expected e
  left join public.learning_questions q
    on q.organization_id = p_organization_id
   and q.code = e.code
  left join lateral (
    select
      count(v.id)::integer version_count,
      count(v.id) filter (
        where v.curriculum_id = e.curriculum_id
          and v.grade_level_id = e.grade_level_id
          and v.subject_id = e.subject_id
          and v.published_at is null
      )::integer scope_match_count,
      count(v.id) filter (
        where v.prompt->>'text' = e.prompt
      )::integer prompt_match_count,
      count(k.question_version_id)::integer key_count,
      count(k.question_version_id) filter (
        where k.evaluation_key->>'expected_answer' = e.expected_answer
          and k.scoring_rules->>'method' = 'manual_review'
      )::integer key_match_count
    from public.learning_question_versions v
    left join public.learning_question_evaluation_keys k
      on k.question_version_id = v.id
    where v.question_id = q.id
  ) details on true
  left join lateral (
    select
      count(*)::integer mapping_count,
      count(*) filter (where qo.objective_id = e.objective_id)::integer expected_mapping_count
    from public.learning_question_objectives qo
    where qo.question_version_id in (
      select v.id from public.learning_question_versions v where v.question_id = q.id
    )
  ) mappings on true
  order by e.code;
end;
$function$;

revoke all on function public.verify_learning_pack_import_questions(uuid, uuid, jsonb) from public, anon;
grant execute on function public.verify_learning_pack_import_questions(uuid, jsonb) to authenticated;

commit;
