-- Extend one-time streak rewards to 14-day and 30-day learning milestones.
-- Milestones use organization-local calendar days and are derived from recorded activity.
begin;

alter table public.learning_reward_ledger
  drop constraint learning_reward_ledger_check;

alter table public.learning_reward_ledger
  add constraint learning_reward_ledger_check check (
    (event_type='assignment_completed' and source_type='assignment' and xp_delta=20) or
    (event_type='assessment_passed' and source_type='assessment' and xp_delta=15) or
    (event_type='objective_mastered' and source_type='objective' and xp_delta=10) or
    (event_type='weekly_quest_completed' and source_type='weekly_quest' and xp_delta=25) or
    (event_type='streak_milestone' and source_type='streak_milestone' and xp_delta in (20,50,100,200)) or
    (event_type='challenge_completed' and source_type='challenge' and xp_delta between 5 and 100)
  );

create or replace function private.award_learning_streak_milestone()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_timezone text;
  v_day date;
  v_streak integer := 0;
  v_milestone integer;
  v_xp integer;
  v_seed text;
  v_source_id uuid;
begin
  if new.tenant_id is null or new.organization_id is null or new.student_user_id is null or new.occurred_at is null then
    return new;
  end if;

  select case
    when exists(select 1 from pg_catalog.pg_timezone_names tz where tz.name=o.timezone) then o.timezone
    else 'UTC'
  end
  into v_timezone
  from public.organizations o
  where o.id=new.organization_id and o.tenant_id=new.tenant_id;

  if v_timezone is null then return new; end if;
  v_day := (new.occurred_at at time zone v_timezone)::date;

  with recursive days(activity_day, streak_length) as (
    select v_day, 1
    union all
    select d.activity_day - 1, d.streak_length + 1
    from days d
    where d.streak_length < 365
      and exists (
        select 1
        from public.learning_activity_events e
        where e.tenant_id=new.tenant_id
          and e.organization_id=new.organization_id
          and e.student_user_id=new.student_user_id
          and (e.occurred_at at time zone v_timezone)::date=d.activity_day - 1
      )
  )
  select coalesce(max(streak_length),0) into v_streak from days;

  foreach v_milestone in array array[3,7,14,30] loop
    if v_streak >= v_milestone then
      v_xp := case v_milestone when 3 then 20 when 7 then 50 when 14 then 100 else 200 end;
      v_seed := new.tenant_id::text||':'||new.organization_id::text||':'||new.student_user_id::text||':streak:'||v_milestone::text;
      v_source_id := (
        substr(md5(v_seed),1,8)||'-'||substr(md5(v_seed),9,4)||'-'||
        substr(md5(v_seed),13,4)||'-'||substr(md5(v_seed),17,4)||'-'||substr(md5(v_seed),21,12)
      )::uuid;

      insert into public.learning_reward_ledger(
        tenant_id,organization_id,class_group_id,student_user_id,event_type,source_type,
        source_id,xp_delta,metadata,occurred_at
      )
      values(
        new.tenant_id,new.organization_id,null,new.student_user_id,'streak_milestone',
        'streak_milestone',v_source_id,v_xp,
        jsonb_build_object('milestone_days',v_milestone,'timezone',v_timezone),
        new.occurred_at
      )
      on conflict(student_user_id,event_type,source_type,source_id) do nothing;
    end if;
  end loop;

  return new;
end;
$function$;

revoke all on function private.award_learning_streak_milestone() from public,anon,authenticated;

-- Backfill the first 14-day and 30-day streak for students whose activity already qualifies.
with org_tz as (
  select o.id organization_id,o.tenant_id,
    case when exists(select 1 from pg_catalog.pg_timezone_names tz where tz.name=o.timezone)
      then o.timezone else 'UTC' end timezone_name
  from public.organizations o
), activity_days as (
  select distinct e.tenant_id,e.organization_id,e.student_user_id,
    (e.occurred_at at time zone ot.timezone_name)::date activity_day,ot.timezone_name
  from public.learning_activity_events e
  join org_tz ot on ot.tenant_id=e.tenant_id and ot.organization_id=e.organization_id
), ranked as (
  select ad.*,
    ad.activity_day-row_number() over(
      partition by tenant_id,organization_id,student_user_id order by activity_day
    )::integer island_key
  from activity_days ad
), streaks as (
  select tenant_id,organization_id,student_user_id,timezone_name,island_key,
    min(activity_day) first_day,count(*)::integer days
  from ranked
  group by tenant_id,organization_id,student_user_id,timezone_name,island_key
), candidates as (
  select s.*,14 milestone_days,100 xp_delta,
    ((first_day+13)::timestamp at time zone timezone_name) occurred_at
  from streaks s where days>=14
  union all
  select s.*,30,200,
    ((first_day+29)::timestamp at time zone timezone_name)
  from streaks s where days>=30
), first_awards as (
  select distinct on(tenant_id,organization_id,student_user_id,milestone_days) *
  from candidates
  order by tenant_id,organization_id,student_user_id,milestone_days,occurred_at
), prepared as (
  select f.*,
    tenant_id::text||':'||organization_id::text||':'||student_user_id::text||':streak:'||milestone_days::text seed
  from first_awards f
)
insert into public.learning_reward_ledger(
  tenant_id,organization_id,class_group_id,student_user_id,event_type,source_type,
  source_id,xp_delta,metadata,occurred_at
)
select tenant_id,organization_id,null,student_user_id,'streak_milestone','streak_milestone',
  (substr(md5(seed),1,8)||'-'||substr(md5(seed),9,4)||'-'||
   substr(md5(seed),13,4)||'-'||substr(md5(seed),17,4)||'-'||substr(md5(seed),21,12))::uuid,
  xp_delta,jsonb_build_object('milestone_days',milestone_days,'timezone',timezone_name,'source','activity_backfill'),
  occurred_at
from prepared
on conflict(student_user_id,event_type,source_type,source_id) do nothing;

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
  v_milestone integer;
begin
  if new.event_type = 'assignment_completed' then
    select count(*)::integer into v_count
    from public.learning_reward_ledger
    where student_user_id=new.student_user_id and event_type='assignment_completed';
    if v_count=10 then v_badge_title := 'Rising Star'; end if;
  elsif new.event_type = 'assessment_passed' then
    select count(*)::integer into v_count
    from public.learning_reward_ledger
    where student_user_id=new.student_user_id and event_type='assessment_passed';
    if v_count=5 then v_badge_title := 'Quiz Champion'; end if;
  elsif new.event_type = 'objective_mastered' then
    select count(*)::integer into v_count
    from public.learning_reward_ledger
    where student_user_id=new.student_user_id and event_type='objective_mastered';
    if v_count=10 then v_badge_title := 'Mastery Expert'; end if;
  elsif new.event_type = 'streak_milestone' then
    v_milestone := coalesce((new.metadata ->> 'milestone_days')::integer,0);
    if v_milestone >= 30 then
      v_badge_title := 'Monthly Master';
    elsif v_milestone >= 14 then
      v_badge_title := 'Fortnight Focus';
    elsif v_milestone >= 7 then
      v_badge_title := 'Week Warrior';
    end if;
  elsif new.event_type = 'weekly_quest_completed'
    and nullif(new.metadata ->> 'week_start', '') is not null then
    select count(distinct l.metadata ->> 'quest_code')::integer into v_quest_count
    from public.learning_reward_ledger l
    where l.student_user_id=new.student_user_id
      and l.organization_id=new.organization_id
      and l.event_type='weekly_quest_completed'
      and l.metadata ->> 'week_start'=new.metadata ->> 'week_start'
      and nullif(l.metadata ->> 'quest_code','') is not null;
    if v_quest_count>=3 then v_badge_title := 'Weekly Champion'; end if;
  end if;

  if v_badge_title is not null then
    update public.learning_reward_notifications
    set title='Badge unlocked: '||v_badge_title,
        message='+'||new.xp_delta::text||' XP earned. You also unlocked the '||
          v_badge_title||' achievement badge.'
    where student_user_id=new.student_user_id and reward_ledger_id=new.id;
  end if;
  return new;
end;
$function$;

revoke all on function private.enrich_learning_reward_achievement_notification() from public,anon,authenticated;

commit;
