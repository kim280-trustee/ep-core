-- Complete Live Games classroom controls: timed rounds, safe multi-select, and host cancellation.
begin;

alter table public.learning_live_game_sessions
  add column question_deadline_at timestamptz;

alter table public.learning_live_game_sessions
  add constraint learning_live_game_sessions_time_limit_check
  check (
    coalesce((settings->>'time_limit_seconds')::integer, 0) between 0 and 180
  );

create or replace function private.set_learning_live_game_question_deadline()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_seconds integer := coalesce((new.settings->>'time_limit_seconds')::integer, 0);
begin
  if new.status in ('completed','cancelled') then
    new.question_deadline_at := null;
  elsif new.status = 'in_progress' then
    if tg_op = 'INSERT' then
      new.question_deadline_at := case when v_seconds > 0
        then now() + make_interval(secs => v_seconds) else null end;
    elsif old.status is distinct from new.status
      or old.current_question_index is distinct from new.current_question_index then
      new.question_deadline_at := case when v_seconds > 0
        then now() + make_interval(secs => v_seconds) else null end;
    end if;
  end if;
  return new;
end;
$function$;

revoke all on function private.set_learning_live_game_question_deadline()
  from public, anon, authenticated;

drop trigger if exists learning_live_game_question_deadline
  on public.learning_live_game_sessions;

create trigger learning_live_game_question_deadline
before insert or update of status, current_question_index, settings
on public.learning_live_game_sessions
for each row execute function private.set_learning_live_game_question_deadline();

create or replace function public.submit_learning_live_game_answer(
  p_session_id uuid,
  p_assessment_question_id uuid,
  p_answer jsonb,
  p_response_time_ms integer default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := public.learning_current_user_id();
  v_session public.learning_live_game_sessions%rowtype;
  v_player public.learning_live_game_players%rowtype;
  v_question record;
  v_key jsonb;
  v_rules jsonb;
  v_correct boolean;
  v_points numeric(10,2);
  v_answer_id uuid;
  v_selected text[];
  v_expected text[];
begin
  if v_user is null then raise exception 'Sign in to submit an answer.'; end if;
  if p_response_time_ms is not null and p_response_time_ms<0 then raise exception 'Invalid response time.'; end if;
  select * into v_session from public.learning_live_game_sessions s
  where s.id=p_session_id and s.status='in_progress' for update;
  if not found then raise exception 'This game is not accepting answers.'; end if;
  if v_session.question_deadline_at is not null and now() > v_session.question_deadline_at then
    raise exception 'Time is up for this question.';
  end if;
  select * into v_player from public.learning_live_game_players p
  where p.session_id=p_session_id and p.student_user_id=v_user and p.status='active';
  if not found then raise exception 'Join this game before answering.'; end if;

  select aq.id as assessment_question_id,aq.question_version_id,aq.points,q.question_type
  into v_question
  from public.learning_assessment_questions aq
  join public.learning_question_versions qv on qv.id=aq.question_version_id
  join public.learning_questions q on q.id=qv.question_id
  where aq.assessment_id=v_session.assessment_id
  order by aq.sequence_no
  offset (v_session.current_question_index-1) limit 1;
  if not found then raise exception 'Current question was not found.'; end if;
  if v_question.assessment_question_id is distinct from p_assessment_question_id then
    raise exception 'The question has changed. Load the current question before answering.';
  end if;

  select ek.evaluation_key,ek.scoring_rules into v_key,v_rules
  from public.learning_question_evaluation_keys ek
  where ek.question_version_id=v_question.question_version_id;

  if v_question.question_type in ('single_choice','true_false')
     and v_key is not null and coalesce(v_rules->>'method','')='exact_option' then
    v_correct := (p_answer->>'option_id')=(v_key->>'correct_option_id');
  elsif v_question.question_type='multiple_choice'
     and v_key is not null and coalesce(v_rules->>'method','')='exact_options'
     and jsonb_typeof(v_key->'correct_option_ids')='array'
     and jsonb_typeof(p_answer->'option_ids')='array' then
    select array_agg(value order by value) into v_selected
    from jsonb_array_elements_text(p_answer->'option_ids');
    select array_agg(value order by value) into v_expected
    from jsonb_array_elements_text(v_key->'correct_option_ids');
    v_correct := coalesce(v_selected,'{}'::text[]) = coalesce(v_expected,'{}'::text[]);
  else
    raise exception 'This question type or scoring method is not supported in live games yet.';
  end if;

  v_points := case when v_correct then v_question.points else 0 end;
  insert into public.learning_live_game_answers(
    tenant_id,organization_id,session_id,player_id,assessment_question_id,
    answer,is_correct,points_awarded,response_time_ms
  ) values (
    v_session.tenant_id,v_session.organization_id,p_session_id,v_player.id,
    v_question.assessment_question_id,p_answer,v_correct,v_points,p_response_time_ms
  ) returning id into v_answer_id;

  update public.learning_live_game_players
  set score=score+v_points,last_seen_at=now()
  where id=v_player.id;

  return jsonb_build_object('answer_id',v_answer_id,'is_correct',v_correct,'points_awarded',v_points);
exception when unique_violation then
  raise exception 'You have already answered this question.';
end;
$function$;

create or replace function public.get_learning_live_game_question(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_session public.learning_live_game_sessions%rowtype;
  v_question record;
  v_total integer;
begin
  select * into v_session
  from public.learning_live_game_sessions s
  where s.id=p_session_id and exists (
    select 1 from public.learning_live_game_players p
    where p.session_id=s.id and p.student_user_id=public.learning_current_user_id()
      and p.status='active'
  );
  if not found then raise exception 'Join this game to view its questions.'; end if;

  select count(*) into v_total
  from public.learning_assessment_questions aq
  where aq.assessment_id=v_session.assessment_id;

  if v_session.status<>'in_progress' then
    return jsonb_build_object('status',v_session.status,'current_question_index',v_session.current_question_index,'total_questions',v_total);
  end if;

  select aq.id as assessment_question_id, aq.points, q.question_type,
         qv.prompt, qv.configuration
  into v_question
  from public.learning_assessment_questions aq
  join public.learning_question_versions qv on qv.id=aq.question_version_id
  join public.learning_questions q on q.id=qv.question_id
  where aq.assessment_id=v_session.assessment_id
  order by aq.sequence_no
  offset (v_session.current_question_index-1) limit 1;
  if not found then raise exception 'Current question was not found.'; end if;

  return jsonb_build_object(
    'status',v_session.status,
    'current_question_index',v_session.current_question_index,
    'total_questions',v_total,
    'assessment_question_id',v_question.assessment_question_id,
    'question_type',v_question.question_type,
    'prompt',v_question.prompt,
    'configuration',v_question.configuration,
    'points',v_question.points,
    'deadline_at',v_session.question_deadline_at
  );
end;
$function$;

create or replace function public.cancel_learning_live_game_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare v_user uuid := public.learning_current_user_id();
begin
  update public.learning_live_game_sessions s
  set status='cancelled',ended_at=now(),updated_at=now()
  where s.id=p_session_id and s.status in ('lobby','in_progress')
    and s.host_user_id=v_user
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.class_group_id=s.class_group_id and cm.user_id=v_user
        and cm.membership_type='teacher' and cm.status='active'
    );
  if not found then raise exception 'You cannot end this game.'; end if;
end;
$function$;

revoke all on function public.cancel_learning_live_game_session(uuid) from public,anon;
grant execute on function public.cancel_learning_live_game_session(uuid) to authenticated;

commit;
