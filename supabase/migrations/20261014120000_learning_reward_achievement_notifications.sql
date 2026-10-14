-- Notify learners when every achievement shown in the Rewards UI is unlocked.
-- The base notification trigger runs first and inserts one notification per ledger event.
-- This trigger enriches that event's notification only when it crosses an additional badge milestone.
begin;

create or replace function private.enrich_learning_reward_achievement_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_badge_title text;
  v_count integer;
  v_quest_count integer;
begin
  if new.event_type = 'assignment_completed' then
    select count(*)::integer into v_count
    from public.learning_reward_ledger
    where student_user_id = new.student_user_id
      and event_type = 'assignment_completed';

    if v_count = 10 then
      v_badge_title := 'Rising Star';
    end if;
  elsif new.event_type = 'assessment_passed' then
    select count(*)::integer into v_count
    from public.learning_reward_ledger
    where student_user_id = new.student_user_id
      and event_type = 'assessment_passed';

    if v_count = 5 then
      v_badge_title := 'Quiz Champion';
    end if;
  elsif new.event_type = 'objective_mastered' then
    select count(*)::integer into v_count
    from public.learning_reward_ledger
    where student_user_id = new.student_user_id
      and event_type = 'objective_mastered';

    if v_count = 10 then
      v_badge_title := 'Mastery Expert';
    end if;
  elsif new.event_type = 'streak_milestone'
    and coalesce((new.metadata ->> 'milestone_days')::integer, 0) >= 7 then
    v_badge_title := 'Week Warrior';
  elsif new.event_type = 'weekly_quest_completed'
    and nullif(new.metadata ->> 'week_start', '') is not null then
    select count(distinct l.metadata ->> 'quest_code')::integer
      into v_quest_count
    from public.learning_reward_ledger l
    where l.student_user_id = new.student_user_id
      and l.organization_id = new.organization_id
      and l.event_type = 'weekly_quest_completed'
      and l.metadata ->> 'week_start' = new.metadata ->> 'week_start'
      and nullif(l.metadata ->> 'quest_code', '') is not null;

    if v_quest_count >= 3 then
      v_badge_title := 'Weekly Champion';
    end if;
  end if;

  if v_badge_title is not null then
    update public.learning_reward_notifications
    set title = 'Badge unlocked: ' || v_badge_title,
        message = '+' || new.xp_delta::text
          || ' XP earned. You also unlocked the '
          || v_badge_title || ' achievement badge.'
    where student_user_id = new.student_user_id
      and reward_ledger_id = new.id;
  end if;

  return new;
end;
$function$;

revoke all on function private.enrich_learning_reward_achievement_notification()
  from public, anon, authenticated;

drop trigger if exists learning_reward_notification_milestone_enrichment
  on public.learning_reward_ledger;

create trigger learning_reward_notification_milestone_enrichment
  after insert on public.learning_reward_ledger
  for each row
  execute function private.enrich_learning_reward_achievement_notification();

commit;
