-- Prevent ordinary client activity events from earning streak and weekly-practice rewards.
-- Only validated lesson completions and authoritative reward-ledger events count as learning evidence.
begin;

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
  if tg_table_name = 'learning_activity_events' then
    if new.activity_type is distinct from 'content_viewed'
      or new.metadata ->> 'completion' is distinct from 'completed'
      or new.metadata ->> 'source' is distinct from 'validated_completion_rpc' then
      return new;
    end if;
  elsif tg_table_name = 'learning_reward_ledger' then
    if new.event_type not in ('assignment_completed', 'assessment_passed', 'objective_mastered') then
      return new;
    end if;
  else
    return new;
  end if;

  if new.tenant_id is null or new.organization_id is null
    or new.student_user_id is null or new.occurred_at is null then
    return new;
  end if;

  select case
    when exists(select 1 from pg_catalog.pg_timezone_names tz where tz.name = o.timezone) then o.timezone
    else 'UTC'
  end
  into v_timezone
  from public.organizations o
  where o.id = new.organization_id and o.tenant_id = new.tenant_id;

  if v_timezone is null then return new; end if;
  v_day := (new.occurred_at at time zone v_timezone)::date;

  with recursive verified_days(activity_day, streak_length) as (
    select v_day, 1
    union all
    select d.activity_day - 1, d.streak_length + 1
    from verified_days d
    where d.streak_length < 365
      and exists (
        select 1
        from (
          select (e.occurred_at at time zone v_timezone)::date as activity_day
          from public.learning_activity_events e
          where e.tenant_id = new.tenant_id
            and e.organization_id = new.organization_id
            and e.student_user_id = new.student_user_id
            and e.activity_type = 'content_viewed'
            and e.metadata ->> 'completion' = 'completed'
            and e.metadata ->> 'source' = 'validated_completion_rpc'
          union
          select (l.occurred_at at time zone v_timezone)::date as activity_day
          from public.learning_reward_ledger l
          where l.tenant_id = new.tenant_id
            and l.organization_id = new.organization_id
            and l.student_user_id = new.student_user_id
            and l.event_type in ('assignment_completed', 'assessment_passed', 'objective_mastered')
        ) evidence
        where evidence.activity_day = d.activity_day - 1
      )
  )
  select coalesce(max(streak_length), 0) into v_streak from verified_days;

  foreach v_milestone in array array[3, 7, 14, 30] loop
    if v_streak >= v_milestone then
      v_xp := case v_milestone when 3 then 20 when 7 then 50 when 14 then 100 else 200 end;
      v_seed := new.tenant_id::text || ':' || new.organization_id::text || ':' ||
        new.student_user_id::text || ':streak:' || v_milestone::text;
      v_source_id := (
        substr(md5(v_seed), 1, 8) || '-' || substr(md5(v_seed), 9, 4) || '-' ||
        substr(md5(v_seed), 13, 4) || '-' || substr(md5(v_seed), 17, 4) || '-' ||
        substr(md5(v_seed), 21, 12)
      )::uuid;

      insert into public.learning_reward_ledger (
        tenant_id, organization_id, class_group_id, student_user_id,
        event_type, source_type, source_id, xp_delta, metadata, occurred_at
      )
      values (
        new.tenant_id, new.organization_id, null, new.student_user_id,
        'streak_milestone', 'streak_milestone', v_source_id, v_xp,
        jsonb_build_object('milestone_days', v_milestone, 'timezone', v_timezone),
        new.occurred_at
      )
      on conflict (student_user_id, event_type, source_type, source_id) do nothing;
    end if;
  end loop;

  return new;
end;
$function$;

revoke all on function private.award_learning_streak_milestone() from public, anon, authenticated;

drop trigger if exists learning_reward_streak_milestone_ledger on public.learning_reward_ledger;
create trigger learning_reward_streak_milestone_ledger
  after insert on public.learning_reward_ledger
  for each row execute function private.award_learning_streak_milestone();

create or replace function private.evaluate_learning_weekly_quests()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_tenant_id uuid;
  v_organization_id uuid;
  v_student_user_id uuid;
  v_occurred_at timestamptz;
  v_timezone text;
  v_week_start date;
  v_week_start_at timestamptz;
  v_week_end_at timestamptz;
  v_assignment_count integer;
  v_assessment_count integer;
  v_practice_days integer;
begin
  if tg_table_name = 'learning_reward_ledger' then
    if new.event_type not in ('assignment_completed', 'assessment_passed', 'objective_mastered') then
      return new;
    end if;
  elsif tg_table_name = 'learning_activity_events' then
    if new.activity_type is distinct from 'content_viewed'
      or new.metadata ->> 'completion' is distinct from 'completed'
      or new.metadata ->> 'source' is distinct from 'validated_completion_rpc' then
      return new;
    end if;
  else
    return new;
  end if;

  v_tenant_id := new.tenant_id;
  v_organization_id := new.organization_id;
  v_student_user_id := new.student_user_id;
  v_occurred_at := new.occurred_at;

  if v_tenant_id is null or v_organization_id is null
    or v_student_user_id is null or v_occurred_at is null then
    return new;
  end if;

  select case
    when exists (select 1 from pg_catalog.pg_timezone_names tz where tz.name = o.timezone) then o.timezone
    else 'UTC'
  end
  into v_timezone
  from public.organizations o
  where o.id = v_organization_id and o.tenant_id = v_tenant_id;

  if v_timezone is null then return new; end if;

  v_week_start := date_trunc('week', v_occurred_at at time zone v_timezone)::date;
  v_week_start_at := v_week_start::timestamp at time zone v_timezone;
  v_week_end_at := (v_week_start + 7)::timestamp at time zone v_timezone;

  select count(distinct l.source_id)::integer
    into v_assignment_count
  from public.learning_reward_ledger l
  where l.student_user_id = v_student_user_id
    and l.organization_id = v_organization_id
    and l.event_type = 'assignment_completed'
    and l.occurred_at >= v_week_start_at
    and l.occurred_at < v_week_end_at;

  if v_assignment_count >= 2 then
    perform private.issue_learning_weekly_quest_reward(
      v_tenant_id, v_organization_id, v_student_user_id,
      'finish_two_assignments', v_week_start, v_occurred_at
    );
  end if;

  select count(distinct l.source_id)::integer
    into v_assessment_count
  from public.learning_reward_ledger l
  where l.student_user_id = v_student_user_id
    and l.organization_id = v_organization_id
    and l.event_type = 'assessment_passed'
    and l.occurred_at >= v_week_start_at
    and l.occurred_at < v_week_end_at;

  if v_assessment_count >= 1 then
    perform private.issue_learning_weekly_quest_reward(
      v_tenant_id, v_organization_id, v_student_user_id,
      'pass_an_assessment', v_week_start, v_occurred_at
    );
  end if;

  select count(distinct activity_day)::integer
    into v_practice_days
  from (
    select (e.occurred_at at time zone v_timezone)::date as activity_day
    from public.learning_activity_events e
    where e.tenant_id = v_tenant_id
      and e.organization_id = v_organization_id
      and e.student_user_id = v_student_user_id
      and e.activity_type = 'content_viewed'
      and e.metadata ->> 'completion' = 'completed'
      and e.metadata ->> 'source' = 'validated_completion_rpc'
      and e.occurred_at >= v_week_start_at
      and e.occurred_at < v_week_end_at
    union
    select (l.occurred_at at time zone v_timezone)::date as activity_day
    from public.learning_reward_ledger l
    where l.tenant_id = v_tenant_id
      and l.organization_id = v_organization_id
      and l.student_user_id = v_student_user_id
      and l.event_type in ('assignment_completed', 'assessment_passed', 'objective_mastered')
      and l.occurred_at >= v_week_start_at
      and l.occurred_at < v_week_end_at
  ) verified_activity;

  if v_practice_days >= 3 then
    perform private.issue_learning_weekly_quest_reward(
      v_tenant_id, v_organization_id, v_student_user_id,
      'learn_on_three_days', v_week_start, v_occurred_at
    );
  end if;

  return new;
end;
$function$;

revoke all on function private.evaluate_learning_weekly_quests() from public, anon, authenticated;

-- Existing historical rewards are preserved; future streaks and weekly practice quests
-- now require validated completion evidence or authoritative reward-ledger records.
commit;
