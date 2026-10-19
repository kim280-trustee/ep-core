begin;

create or replace function private.sync_learning_assessment_result_to_gradebook(
  p_result_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result record;
  v_assignment record;
  v_assignment_count integer;
  v_term_id uuid;
  v_term_count integer;
  v_category_id uuid;
  v_category_weight numeric(8,3);
  v_objective_id uuid;
  v_objective_count integer;
  v_topic_id uuid;
  v_objective_ids jsonb;
begin
  select
    r.id,
    r.attempt_id,
    r.student_user_id,
    r.organization_id,
    r.score,
    r.max_score,
    r.percentage,
    r.evaluated_at,
    a.assessment_id,
    ass.title as assessment_title
  into v_result
  from public.learning_assessment_results r
  join public.learning_attempts a on a.id = r.attempt_id
  join public.learning_assessments ass on ass.id = a.assessment_id
  where r.id = p_result_id;

  if not found or v_result.score is null or v_result.max_score is null then
    return false;
  end if;

  with candidates as (
    select distinct
      a.id as assignment_id,
      a.tenant_id,
      a.organization_id,
      a.class_subject_id,
      a.created_by,
      a.title as assignment_title,
      t.class_group_id
    from public.learning_assignment_items ai
    join public.learning_assignments a on a.id = ai.assignment_id
    join public.learning_assignment_targets t on t.assignment_id = a.id
    where ai.assessment_id = v_result.assessment_id
      and ai.item_type = 'assessment'
      and a.status = 'published'
      and t.status = 'active'
      and (
        t.student_user_id = v_result.student_user_id
        or (
          t.class_group_id is not null
          and exists (
            select 1
            from public.learning_class_memberships cm
            where cm.class_group_id = t.class_group_id
              and cm.user_id = v_result.student_user_id
              and cm.membership_type = 'student'
              and cm.status = 'active'
          )
        )
      )
  )
  select count(*) into v_assignment_count from candidates;

  if v_assignment_count <> 1 then
    return false;
  end if;

  with candidates as (
    select distinct
      a.id as assignment_id,
      a.tenant_id,
      a.organization_id,
      a.class_subject_id,
      a.created_by,
      a.title as assignment_title,
      t.class_group_id
    from public.learning_assignment_items ai
    join public.learning_assignments a on a.id = ai.assignment_id
    join public.learning_assignment_targets t on t.assignment_id = a.id
    where ai.assessment_id = v_result.assessment_id
      and ai.item_type = 'assessment'
      and a.status = 'published'
      and t.status = 'active'
      and (
        t.student_user_id = v_result.student_user_id
        or (
          t.class_group_id is not null
          and exists (
            select 1
            from public.learning_class_memberships cm
            where cm.class_group_id = t.class_group_id
              and cm.user_id = v_result.student_user_id
              and cm.membership_type = 'student'
              and cm.status = 'active'
          )
        )
      )
  )
  select * into v_assignment from candidates limit 1;

  if v_assignment.class_subject_id is null or v_assignment.class_group_id is null then
    return false;
  end if;

  select count(*)
  into v_term_count
  from public.learning_terms
  where organization_id = v_assignment.organization_id
    and status = 'active';

  if v_term_count <> 1 then
    return false;
  end if;

  select id into v_term_id
  from public.learning_terms
  where organization_id = v_assignment.organization_id
    and status = 'active'
  limit 1;

  select id, default_weight
  into v_category_id, v_category_weight
  from public.learning_gradebook_categories
  where organization_id = v_assignment.organization_id
    and code = 'assessment'
    and status = 'active'
  limit 1;

  if v_category_id is null then
    insert into public.learning_gradebook_categories (
      organization_id, code, name, description, default_weight, status
    )
    values (
      v_assignment.organization_id,
      'assessment',
      'Assessment',
      'Automatically recorded assessment results.',
      1,
      'active'
    )
    on conflict (organization_id, code) do nothing;

    select id, default_weight
    into v_category_id, v_category_weight
    from public.learning_gradebook_categories
    where organization_id = v_assignment.organization_id
      and code = 'assessment'
      and status = 'active'
    limit 1;
  end if;

  select count(distinct qo.objective_id)
  into v_objective_count
  from public.learning_assessment_questions aq
  join public.learning_question_objectives qo
    on qo.question_version_id = aq.question_version_id
  where aq.assessment_id = v_result.assessment_id;

  if v_objective_count = 1 then
    select distinct qo.objective_id
    into v_objective_id
    from public.learning_assessment_questions aq
    join public.learning_question_objectives qo
      on qo.question_version_id = aq.question_version_id
    where aq.assessment_id = v_result.assessment_id
    limit 1;

    select topic_id into v_topic_id
    from public.learning_objectives
    where id = v_objective_id;
  end if;

  select coalesce(
    jsonb_agg(distinct qo.objective_id) filter (where qo.objective_id is not null),
    '[]'::jsonb
  )
  into v_objective_ids
  from public.learning_assessment_questions aq
  join public.learning_question_objectives qo
    on qo.question_version_id = aq.question_version_id
  where aq.assessment_id = v_result.assessment_id;

  insert into public.learning_gradebook_entries (
    tenant_id,
    organization_id,
    term_id,
    class_group_id,
    class_subject_id,
    student_user_id,
    category_id,
    title,
    description,
    record_type,
    source_type,
    assignment_id,
    assessment_id,
    attempt_id,
    assessment_result_id,
    topic_id,
    objective_id,
    score,
    max_score,
    weight,
    included_in_grade,
    recorded_at,
    notes,
    created_by,
    updated_by
  )
  values (
    v_assignment.tenant_id,
    v_assignment.organization_id,
    v_term_id,
    v_assignment.class_group_id,
    v_assignment.class_subject_id,
    v_result.student_user_id,
    v_category_id,
    v_result.assessment_title,
    v_assignment.assignment_title,
    'assessment',
    'assessment_result',
    v_assignment.assignment_id,
    v_result.assessment_id,
    v_result.attempt_id,
    v_result.id,
    v_topic_id,
    v_objective_id,
    v_result.score,
    v_result.max_score,
    coalesce(v_category_weight, 1),
    true,
    v_result.evaluated_at,
    jsonb_build_object(
      'source', 'assessment_result',
      'automatic', true,
      'assessment_result_id', v_result.id,
      'attempt_id', v_result.attempt_id,
      'objective_ids', v_objective_ids
    ),
    v_assignment.created_by,
    v_assignment.created_by
  )
  on conflict (assessment_result_id) where assessment_result_id is not null
  do update set
    tenant_id = excluded.tenant_id,
    organization_id = excluded.organization_id,
    term_id = excluded.term_id,
    class_group_id = excluded.class_group_id,
    class_subject_id = excluded.class_subject_id,
    student_user_id = excluded.student_user_id,
    category_id = excluded.category_id,
    title = excluded.title,
    description = excluded.description,
    record_type = excluded.record_type,
    source_type = excluded.source_type,
    assignment_id = excluded.assignment_id,
    assessment_id = excluded.assessment_id,
    attempt_id = excluded.attempt_id,
    topic_id = excluded.topic_id,
    objective_id = excluded.objective_id,
    score = excluded.score,
    max_score = excluded.max_score,
    weight = excluded.weight,
    included_in_grade = excluded.included_in_grade,
    recorded_at = excluded.recorded_at,
    notes = excluded.notes,
    updated_by = excluded.updated_by,
    updated_at = now();

  return true;
end;
$$;

revoke all on function private.sync_learning_assessment_result_to_gradebook(uuid)
from public, anon, authenticated;

create or replace function private.sync_learning_assessment_result_gradebook_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.sync_learning_assessment_result_to_gradebook(new.id);
  return new;
end;
$$;

revoke all on function private.sync_learning_assessment_result_gradebook_trigger()
from public, anon, authenticated;

drop trigger if exists learning_assessment_result_gradebook_sync
on public.learning_assessment_results;

create trigger learning_assessment_result_gradebook_sync
after insert or update of score, max_score, percentage, evaluated_at
on public.learning_assessment_results
for each row
execute function private.sync_learning_assessment_result_gradebook_trigger();

do $$
declare
  r record;
begin
  for r in select id from public.learning_assessment_results loop
    perform private.sync_learning_assessment_result_to_gradebook(r.id);
  end loop;
end;
$$;

commit;
