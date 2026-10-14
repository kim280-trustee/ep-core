-- Backfill achievement titles for milestones earned before the notification enrichment trigger was deployed.
begin;

with assignment_ranked as (
  select l.id, l.student_user_id,
         row_number() over (partition by l.student_user_id order by l.occurred_at, l.id) as milestone_rank
  from public.learning_reward_ledger l
  where l.event_type = 'assignment_completed'
),
assessment_ranked as (
  select l.id, l.student_user_id,
         row_number() over (partition by l.student_user_id order by l.occurred_at, l.id) as milestone_rank
  from public.learning_reward_ledger l
  where l.event_type = 'assessment_passed'
),
mastery_ranked as (
  select l.id, l.student_user_id,
         row_number() over (partition by l.student_user_id order by l.occurred_at, l.id) as milestone_rank
  from public.learning_reward_ledger l
  where l.event_type = 'objective_mastered'
),
streak_badges as (
  select distinct on (l.student_user_id)
    l.id, l.student_user_id, 'Week Warrior'::text as badge_title
  from public.learning_reward_ledger l
  where l.event_type = 'streak_milestone'
    and coalesce((l.metadata ->> 'milestone_days')::integer, 0) >= 7
  order by l.student_user_id, l.occurred_at, l.id
),
weekly_quest_rows as (
  select l.id, l.student_user_id, l.organization_id,
         l.metadata ->> 'week_start' as week_start,
         l.metadata ->> 'quest_code' as quest_code,
         l.occurred_at,
         row_number() over (
           partition by l.student_user_id, l.organization_id, l.metadata ->> 'week_start'
           order by l.occurred_at, l.id
         ) as quest_rank
  from public.learning_reward_ledger l
  where l.event_type = 'weekly_quest_completed'
    and nullif(l.metadata ->> 'week_start', '') is not null
    and nullif(l.metadata ->> 'quest_code', '') is not null
),
weekly_quest_totals as (
  select student_user_id, organization_id, week_start,
         count(distinct quest_code)::integer as distinct_quests
  from weekly_quest_rows
  group by student_user_id, organization_id, week_start
),
badge_rows as (
  select id as reward_ledger_id, student_user_id, 'Rising Star'::text as badge_title
  from assignment_ranked where milestone_rank = 10
  union all
  select id, student_user_id, 'Quiz Champion'::text
  from assessment_ranked where milestone_rank = 5
  union all
  select id, student_user_id, 'Mastery Expert'::text
  from mastery_ranked where milestone_rank = 10
  union all
  select id, student_user_id, badge_title from streak_badges
  union all
  select q.id, q.student_user_id, 'Weekly Champion'::text
  from weekly_quest_rows q
  join weekly_quest_totals t
    on t.student_user_id = q.student_user_id
   and t.organization_id = q.organization_id
   and t.week_start = q.week_start
  where t.distinct_quests >= 3 and q.quest_rank = 3
)
update public.learning_reward_notifications n
set title = 'Badge unlocked: ' || b.badge_title,
    message = '+' || l.xp_delta::text
      || ' XP earned. You also unlocked the '
      || b.badge_title || ' achievement badge.'
from badge_rows b
join public.learning_reward_ledger l on l.id = b.reward_ledger_id
where n.reward_ledger_id = b.reward_ledger_id
  and n.student_user_id = b.student_user_id;

commit;
