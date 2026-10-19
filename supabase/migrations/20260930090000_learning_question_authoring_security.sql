-- Secure write-only authoring path for assessment evaluation keys.
-- The key table remains unreadable to browser clients.

create or replace function public.save_learning_question_evaluation_key(
  p_question_version_id uuid,
  p_evaluation_key jsonb,
  p_scoring_rules jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_organization_id uuid;
  v_published_at timestamptz;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select q.organization_id, qv.published_at
  into v_organization_id, v_published_at
  from public.learning_question_versions qv
  join public.learning_questions q on q.id = qv.question_id
  where qv.id = p_question_version_id;

  if v_organization_id is null then
    raise exception 'Question version was not found';
  end if;

  if not public.is_organization_member(v_organization_id) then
    raise exception 'You are not a member of this organization';
  end if;

  if v_published_at is not null then
    raise exception 'Published question versions are immutable; create a new version';
  end if;

  if coalesce(p_scoring_rules->>'method', '') not in ('exact_option', 'manual_review') then
    raise exception 'Unsupported scoring method';
  end if;

  insert into public.learning_question_evaluation_keys (
    question_version_id, evaluation_key, scoring_rules, updated_at
  )
  values (
    p_question_version_id, coalesce(p_evaluation_key, '{}'::jsonb), coalesce(p_scoring_rules, '{}'::jsonb), now()
  )
  on conflict (question_version_id) do update set
    evaluation_key = excluded.evaluation_key,
    scoring_rules = excluded.scoring_rules,
    updated_at = now();
end;
$$;

revoke execute on function public.save_learning_question_evaluation_key(uuid,jsonb,jsonb) from public;
revoke execute on function public.save_learning_question_evaluation_key(uuid,jsonb,jsonb) from anon;
grant execute on function public.save_learning_question_evaluation_key(uuid,jsonb,jsonb) to authenticated;
