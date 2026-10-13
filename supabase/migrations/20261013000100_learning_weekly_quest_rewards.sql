-- Persist weekly quest bonuses from verified learning evidence.
begin;

alter table public.learning_reward_ledger
  drop constraint learning_reward_ledger_check,
  drop constraint learning_reward_ledger_event_type_check,
  drop constraint learning_reward_ledger_source_type_check;

alter table public.learning_reward_ledger
  add constraint learning_reward_ledger_event_type_check
    check (event_type in ('assignment_completed', 'assessment_passed', 'objective_mastered', 'weekly_quest_completed')),
  add constraint learning_reward_ledger_source_type_check
    check (source_type in ('assignment', 'assessment', 'objective', 'weekly_quest')),
  add constraint learning_reward_ledger_check
    check (
      (event_type = 'assignment_completed' and source_type = 'assignment' and xp_delta = 20)
      or (event_type = 'assessment_passed' and source_type = 'assessment' and xp_delta = 15)
      or (event_type = 'objective_mastered' and source_type = 'objective' and xp_delta = 10)
      or (event_type = 'weekly_quest_completed' and source_type = 'weekly_quest' and xp_delta = 25)
    );

create or replace function private.issue_learning_weekly_quest_reward(
  p_tenant_id uuid,
  p_organization_id uuid,
  p_student_user_id uuid,
  p_quest_code text,
  p_week_start date,
  p_occurred_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_source_id uuid;
begin
  v_source_id := (
    substr(md5(p_student_user_id::text || ':' || p_quest_code || ':' || p_week_start::text), 1, 8) || '-' ||
    substr(md5(p_student_user_id::text || ':' || p_quest_code || ':' || p_week_start::text), 9, 4) || '-' ||
    substr(md5(p_student_user_id::text || ':' || p_quest_code || ':' || p_week_start::text), 13, 4) || '-' ||
    substr(md5(p_student_user_id::text || ':' || p_quest_code || ':' || p_week_start::text), 17, 4) || '-' ||
    substr(md5(p_student_user_id::text || ':' || p_quest_code || ':' || p_week_start::text), 21, 12)
  )::uuid;

  insert into public.learning_reward_ledger (
    tenant_id, organization_id, class_group_id, student_user_id,
    event_type, source_type, source_id, xp_delta, metadata, occurred_at
  )
  values (
    p_tenant_id, p_organization_id, null, p_student_user_id,
    'weekly_quest_completed', 'weekly_quest', v_source_id, 25,
    jsonb_build_object('quest_code', p_quest_code, 'week_start', p_week_start::text),
    coalesce(p_occurred_at, now())
  )
  on conflict (student_user_id, event_type, source_type, source_id) do nothing;
end;
$function$;

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
    if new.event_type = 'weekly_quest_completed' then
      return new;
    end if;
  end if;

  v_tenant_id := new.tenant_id;
  v_organization_id := new.organization_id;
  v_student_user_id := new.student_user_id;
  v_occurred_at := new.occurred_at;

  if v_tenant_id is null or v_organization_id is null or v_student_user_id is null or v_occurred_at is null then
    return new;
  end if;

  select case
    when exists (select 1 from pg_catalog.pg_timezone_names tz where tz.name = o.timezone) then o.timezone
    else 'UTC'
  end
  into v_timezone
  from public.organizations o
  where o.id = v_organization_id and o.tenant_id = v_tenant_id;

  if v_timezone is null then
    return new;
  end if;

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

  select count(distinct (e.occurred_at at time zone v_timezone)::date)::integer
    into v_practice_days
  from public.learning_activity_events e
  where e.student_user_id = v_student_user_id
    and e.organization_id = v_organization_id
    and e.occurred_at >= v_week_start_at
    and e.occurred_at < v_week_end_at;

  if v_practice_days >= 3 then
    perform private.issue_learning_weekly_quest_reward(
      v_tenant_id, v_organization_id, v_student_user_id,
      'learn_on_three_days', v_week_start, v_occurred_at
    );
  end if;

  return new;
end;
$function$;

revoke all on function private.issue_learning_weekly_quest_reward(uuid, uuid, uuid, text, date, timestamptz) from public, anon, authenticated;
revoke all on function private.evaluate_learning_weekly_quests() from public, anon, authenticated;

create trigger learning_reward_weekly_quests
  after insert on public.learning_reward_ledger
  for each row
  execute function private.evaluate_learning_weekly_quests();

create trigger learning_activity_weekly_quests
  after insert on public.learning_activity_events
  for each row
  execute function private.evaluate_learning_weekly_quests();

-- Backfill quests already completed in the current organization-local week.
with organization_weeks as (
  select
    o.id as organization_id,
    o.tenant_id,
    case when exists (select 1 from pg_catalog.pg_timezone_names tz where tz.name = o.timezone)
      then o.timezone else 'UTC' end as timezone_name
  from public.organizations o
),
week_bounds as (
  select
    ow.organization_id,
    ow.tenant_id,
    ow.timezone_name,
    date_trunc('week', now() at time zone ow.timezone_name)::date as week_start,
    date_trunc('week', now() at time zone ow.timezone_name)::timestamp at time zone ow.timezone_name as week_start_at,
    (date_trunc('week', now() at time zone ow.timezone_name)::date + 7)::timestamp at time zone ow.timezone_name as week_end_at
  from organization_weeks ow
),
eligible_quests as (
  select l.tenant_id, l.organization_id, l.student_user_id, 'finish_two_assignments'::text as quest_code,
         wb.week_start, max(l.occurred_at) as occurred_at
  from public.learning_reward_ledger l
  join week_bounds wb on wb.organization_id = l.organization_id and wb.tenant_id = l.tenant_id
  where l.event_type = 'assignment_completed'
    and l.occurred_at >= wb.week_start_at and l.occurred_at < wb.week_end_at
  group by l.tenant_id, l.organization_id, l.student_user_id, wb.week_start
  having count(distinct l.source_id) >= 2
  union all
  select l.tenant_id, l.organization_id, l.student_user_id, 'pass_an_assessment'::text,
         wb.week_start, max(l.occurred_at)
  from public.learning_reward_ledger l
  join week_bounds wb on wb.organization_id = l.organization_id and wb.tenant_id = l.tenant_id
  where l.event_type = 'assessment_passed'
    and l.occurred_at >= wb.week_start_at and l.occurred_at < wb.week_end_at
  group by l.tenant_id, l.organization_id, l.student_user_id, wb.week_start
  having count(distinct l.source_id) >= 1
  union all
  select e.tenant_id, e.organization_id, e.student_user_id, 'learn_on_three_days'::text,
         wb.week_start, max(e.occurred_at)
  from public.learning_activity_events e
  join week_bounds wb on wb.organization_id = e.organization_id and wb.tenant_id = e.tenant_id
  where e.occurred_at >= wb.week_start_at and e.occurred_at < wb.week_end_at
  group by e.tenant_id, e.organization_id, e.student_user_id, wb.week_start, wb.timezone_name
  having count(distinct (e.occurred_at at time zone wb.timezone_name)::date) >= 3
)
select private.issue_learning_weekly_quest_reward(
  q.tenant_id, q.organization_id, q.student_user_id, q.quest_code, q.week_start, q.occurred_at
)
from eligible_quests q;

commit;
