-- Persist learning rewards from authoritative assignment completion and assessment results.
begin;

create table public.learning_reward_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid,
  student_user_id uuid not null,
  event_type text not null check (event_type in ('assignment_completed', 'assessment_passed')),
  source_type text not null check (source_type in ('assignment', 'assessment')),
  source_id uuid not null,
  xp_delta integer not null check (xp_delta > 0),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (tenant_id) references public.tenants(id) on delete cascade,
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (tenant_id, student_user_id) references public.users(tenant_id, id) on delete cascade,
  unique (student_user_id, event_type, source_type, source_id),
  check (
    (event_type = 'assignment_completed' and source_type = 'assignment' and xp_delta = 20)
    or (event_type = 'assessment_passed' and source_type = 'assessment' and xp_delta = 15)
  )
);

create index learning_reward_ledger_student_time_idx
  on public.learning_reward_ledger(student_user_id, occurred_at desc);
create index learning_reward_ledger_org_time_idx
  on public.learning_reward_ledger(organization_id, occurred_at desc);

-- Mastery state is read-only to clients; trusted database routines remain responsible for updates.
revoke insert, update, delete on table public.learning_student_mastery from public, anon, authenticated;

alter table public.learning_reward_ledger enable row level security;
revoke all on public.learning_reward_ledger from anon, authenticated;
grant select on public.learning_reward_ledger to authenticated;

create policy learning_reward_ledger_select_own
  on public.learning_reward_ledger
  for select to authenticated
  using (
    student_user_id in (
      select u.id from public.users u
      where u.auth_user_id = (select auth.uid())
    )
  );

-- Only database triggers can award XP. Clients receive no insert/update/delete grants.
create or replace function private.award_learning_assignment_reward()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_tenant_id uuid;
begin
  select a.tenant_id into v_tenant_id
  from public.learning_assignments a
  where a.id = new.assignment_id
    and a.organization_id = new.organization_id;

  if v_tenant_id is null then
    return new;
  end if;

  insert into public.learning_reward_ledger (
    tenant_id, organization_id, student_user_id,
    event_type, source_type, source_id, xp_delta, metadata, occurred_at
  ) values (
    v_tenant_id, new.organization_id, new.student_user_id,
    'assignment_completed', 'assignment', new.assignment_id, 20,
    jsonb_build_object('source', 'learning_assignment_progress'), coalesce(new.completed_at, now())
  )
  on conflict (student_user_id, event_type, source_type, source_id) do nothing;

  return new;
end;
$function$;

create or replace function private.award_learning_assessment_reward()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_attempt record;
begin
  if new.passed is distinct from true then
    return new;
  end if;

  select a.tenant_id, a.organization_id, a.student_user_id, a.assessment_id
    into v_attempt
  from public.learning_attempts a
  where a.id = new.attempt_id
    and a.student_user_id = new.student_user_id;

  if v_attempt.student_user_id is null then
    return new;
  end if;

  insert into public.learning_reward_ledger (
    tenant_id, organization_id, student_user_id,
    event_type, source_type, source_id, xp_delta, metadata, occurred_at
  ) values (
    v_attempt.tenant_id, coalesce(new.organization_id, v_attempt.organization_id),
    v_attempt.student_user_id, 'assessment_passed', 'assessment',
    v_attempt.assessment_id, 15,
    jsonb_build_object('source', 'learning_assessment_results'), new.evaluated_at
  )
  on conflict (student_user_id, event_type, source_type, source_id) do nothing;

  return new;
end;
$function$;

revoke all on function private.award_learning_assignment_reward() from public, anon, authenticated;
revoke all on function private.award_learning_assessment_reward() from public, anon, authenticated;

create trigger learning_reward_assignment_completed
  after insert or update of status on public.learning_assignment_progress
  for each row
  when (new.status = 'completed')
  execute function private.award_learning_assignment_reward();

create trigger learning_reward_assessment_passed
  after insert or update of passed on public.learning_assessment_results
  for each row
  when (new.passed is true)
  execute function private.award_learning_assessment_reward();

-- Mastery XP is intentionally deferred until mastery state is written only by a trusted path.

-- Backfill current qualifying records once, with the same idempotency keys used by triggers.
insert into public.learning_reward_ledger (
  tenant_id, organization_id, student_user_id, event_type, source_type, source_id, xp_delta, metadata, occurred_at
)
select a.tenant_id, p.organization_id, p.student_user_id,
       'assignment_completed', 'assignment', p.assignment_id, 20,
       jsonb_build_object('source', 'backfill'), coalesce(p.completed_at, p.updated_at, now())
from public.learning_assignment_progress p
join public.learning_assignments a
  on a.id = p.assignment_id and a.organization_id = p.organization_id
where p.status = 'completed'
on conflict (student_user_id, event_type, source_type, source_id) do nothing;

insert into public.learning_reward_ledger (
  tenant_id, organization_id, student_user_id, event_type, source_type, source_id, xp_delta, metadata, occurred_at
)
select distinct on (a.student_user_id, a.assessment_id)
       a.tenant_id, coalesce(r.organization_id, a.organization_id), a.student_user_id,
       'assessment_passed', 'assessment', a.assessment_id, 15,
       jsonb_build_object('source', 'backfill'), r.evaluated_at
from public.learning_assessment_results r
join public.learning_attempts a on a.id = r.attempt_id
where r.passed is true
order by a.student_user_id, a.assessment_id, r.evaluated_at asc
on conflict (student_user_id, event_type, source_type, source_id) do nothing;

