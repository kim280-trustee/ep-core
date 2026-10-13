-- Award permanent, idempotent XP when a learner first reaches mastered state for an objective.
begin;

alter table public.learning_reward_ledger
  drop constraint learning_reward_ledger_check,
  drop constraint learning_reward_ledger_event_type_check,
  drop constraint learning_reward_ledger_source_type_check;

alter table public.learning_reward_ledger
  add constraint learning_reward_ledger_event_type_check
    check (event_type in ('assignment_completed', 'assessment_passed', 'objective_mastered')),
  add constraint learning_reward_ledger_source_type_check
    check (source_type in ('assignment', 'assessment', 'objective')),
  add constraint learning_reward_ledger_check
    check (
      (event_type = 'assignment_completed' and source_type = 'assignment' and xp_delta = 20)
      or (event_type = 'assessment_passed' and source_type = 'assessment' and xp_delta = 15)
      or (event_type = 'objective_mastered' and source_type = 'objective' and xp_delta = 10)
    );

create or replace function private.award_learning_objective_mastery_reward()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.state <> 'mastered' then
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
  values (
    new.tenant_id,
    new.organization_id,
    null,
    new.student_user_id,
    'objective_mastered',
    'objective',
    new.objective_id,
    10,
    jsonb_build_object('source', 'learning_student_mastery'),
    coalesce(new.updated_at, now())
  )
  on conflict (student_user_id, event_type, source_type, source_id) do nothing;

  return new;
end;
$function$;

revoke all on function private.award_learning_objective_mastery_reward() from public, anon, authenticated;

create trigger learning_reward_objective_mastered
  after insert or update of state on public.learning_student_mastery
  for each row
  when (new.state = 'mastered')
  execute function private.award_learning_objective_mastery_reward();

-- Award existing mastery rows once. The same unique key makes this safe to rerun.
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
select distinct on (m.student_user_id, m.objective_id)
  m.tenant_id,
  m.organization_id,
  null,
  m.student_user_id,
  'objective_mastered',
  'objective',
  m.objective_id,
  10,
  jsonb_build_object('source', 'mastery_backfill'),
  coalesce(m.updated_at, now())
from public.learning_student_mastery m
where m.state = 'mastered'
order by m.student_user_id, m.objective_id, m.updated_at desc
on conflict (student_user_id, event_type, source_type, source_id) do nothing;

commit;
