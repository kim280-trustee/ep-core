-- Award permanent, idempotent XP when a learner completes a live classroom game.
begin;

alter table public.learning_reward_ledger
  drop constraint if exists learning_reward_ledger_check,
  drop constraint if exists learning_reward_ledger_event_type_check,
  drop constraint if exists learning_reward_ledger_source_type_check;

alter table public.learning_reward_ledger
  add constraint learning_reward_ledger_event_type_check
    check (event_type in (
      'assignment_completed',
      'assessment_passed',
      'objective_mastered',
      'weekly_quest_completed',
      'streak_milestone',
      'challenge_completed',
      'live_game_completed'
    )),
  add constraint learning_reward_ledger_source_type_check
    check (source_type in (
      'assignment',
      'assessment',
      'objective',
      'weekly_quest',
      'streak_milestone',
      'challenge',
      'live_game'
    )),
  add constraint learning_reward_ledger_check
    check (
      (event_type = 'assignment_completed' and source_type = 'assignment' and xp_delta = 20)
      or (event_type = 'assessment_passed' and source_type = 'assessment' and xp_delta = 15)
      or (event_type = 'objective_mastered' and source_type = 'objective' and xp_delta = 10)
      or (event_type = 'weekly_quest_completed' and source_type = 'weekly_quest' and xp_delta = 25)
      or (event_type = 'streak_milestone' and source_type = 'streak_milestone' and xp_delta in (20, 50, 100, 200))
      or (event_type = 'challenge_completed' and source_type = 'challenge' and xp_delta between 5 and 100)
      or (event_type = 'live_game_completed' and source_type = 'live_game' and xp_delta = 5)
    );

create or replace function private.award_learning_live_game_completion_xp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if old.status = 'completed' or new.status <> 'completed' then
    return new;
  end if;

  insert into public.learning_reward_ledger (
    tenant_id,
    organization_id,
    class_group_id,
    student_user_id,
    event_type,
    source_type,
    source_id,
    xp_delta,
    metadata,
    occurred_at
  )
  select
    new.tenant_id,
    new.organization_id,
    new.class_group_id,
    p.student_user_id,
    'live_game_completed',
    'live_game',
    new.id,
    5,
    jsonb_build_object(
      'source', 'learning_live_game_sessions',
      'game_score', p.score,
      'session_id', new.id
    ),
    coalesce(new.ended_at, now())
  from public.learning_live_game_players p
  where p.session_id = new.id
  on conflict (student_user_id, event_type, source_type, source_id) do nothing;

  return new;
end;
$function$;

revoke all on function private.award_learning_live_game_completion_xp()
  from public, anon, authenticated;

drop trigger if exists learning_live_game_completion_xp
  on public.learning_live_game_sessions;

create trigger learning_live_game_completion_xp
  after update of status on public.learning_live_game_sessions
  for each row
  when (old.status is distinct from new.status and new.status = 'completed')
  execute function private.award_learning_live_game_completion_xp();

commit;
