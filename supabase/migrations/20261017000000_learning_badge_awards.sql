begin;

create table if not exists public.learning_badge_awards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  student_user_id uuid not null references public.users(id) on delete cascade,
  badge_code text not null check (badge_code in (
    'first_steps',
    'content_explorer',
    'assessment_achiever',
    'learning_champion'
  )),
  badge_title text not null,
  description text not null,
  rule_version integer not null default 1 check (rule_version > 0),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  awarded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_badge_awards_student_badge_unique
    unique (tenant_id, student_user_id, badge_code)
);

create index if not exists learning_badge_awards_student_awarded_idx
  on public.learning_badge_awards (tenant_id, student_user_id, awarded_at desc);

alter table public.learning_badge_awards enable row level security;

drop policy if exists "Students can view their own learning badge awards"
  on public.learning_badge_awards;
create policy "Students can view their own learning badge awards"
  on public.learning_badge_awards
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = learning_badge_awards.student_user_id
        and u.tenant_id = learning_badge_awards.tenant_id
        and u.auth_user_id = (select auth.uid())
    )
  );

grant select on public.learning_badge_awards to authenticated;
revoke insert, update, delete on public.learning_badge_awards from anon, authenticated;

create or replace function public.sync_learning_badge_awards()
returns setof public.learning_badge_awards
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_student_user_id uuid;
  v_tenant_id uuid;
  v_lesson_count integer := 0;
  v_assessment_count integer := 0;
  v_evidence_count integer := 0;
begin
  select u.id, u.tenant_id
    into v_student_user_id, v_tenant_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_student_user_id is null or v_tenant_id is null then
    raise exception 'Authenticated learner profile not found';
  end if;

  select count(distinct e.content_item_id)::integer
    into v_lesson_count
  from public.learning_activity_events e
  where e.tenant_id = v_tenant_id
    and e.student_user_id = v_student_user_id
    and e.activity_type = 'content_viewed'
    and e.content_item_id is not null
    and e.metadata @> '{"completion":"completed","source":"validated_completion_rpc"}'::jsonb;

  select count(distinct a.assessment_id)::integer
    into v_assessment_count
  from public.learning_attempts a
  join public.learning_assessment_results r
    on r.attempt_id = a.id
   and r.student_user_id = v_student_user_id
  where a.tenant_id = v_tenant_id
    and a.student_user_id = v_student_user_id
    and a.status = 'evaluated'
    and r.evaluated_at is not null;

  v_evidence_count := v_lesson_count + v_assessment_count;

  if v_evidence_count >= 1 then
    insert into public.learning_badge_awards as existing (
      tenant_id, student_user_id, badge_code, badge_title, description,
      rule_version, evidence_count
    ) values (
      v_tenant_id, v_student_user_id, 'first_steps', 'First Steps',
      'Complete your first lesson or evaluated assessment.', 1, v_evidence_count
    )
    on conflict (tenant_id, student_user_id, badge_code) do update
      set evidence_count = greatest(existing.evidence_count, excluded.evidence_count),
          updated_at = now();
  end if;

  if v_lesson_count >= 3 then
    insert into public.learning_badge_awards as existing (
      tenant_id, student_user_id, badge_code, badge_title, description,
      rule_version, evidence_count
    ) values (
      v_tenant_id, v_student_user_id, 'content_explorer', 'Content Explorer',
      'Complete three different lessons.', 1, v_lesson_count
    )
    on conflict (tenant_id, student_user_id, badge_code) do update
      set evidence_count = greatest(existing.evidence_count, excluded.evidence_count),
          updated_at = now();
  end if;

  if v_assessment_count >= 3 then
    insert into public.learning_badge_awards as existing (
      tenant_id, student_user_id, badge_code, badge_title, description,
      rule_version, evidence_count
    ) values (
      v_tenant_id, v_student_user_id, 'assessment_achiever', 'Assessment Achiever',
      'Finish three different evaluated assessments.', 1, v_assessment_count
    )
    on conflict (tenant_id, student_user_id, badge_code) do update
      set evidence_count = greatest(existing.evidence_count, excluded.evidence_count),
          updated_at = now();
  end if;

  if v_evidence_count >= 10 then
    insert into public.learning_badge_awards as existing (
      tenant_id, student_user_id, badge_code, badge_title, description,
      rule_version, evidence_count
    ) values (
      v_tenant_id, v_student_user_id, 'learning_champion', 'Learning Champion',
      'Build a record of ten distinct learning completions.', 1, v_evidence_count
    )
    on conflict (tenant_id, student_user_id, badge_code) do update
      set evidence_count = greatest(existing.evidence_count, excluded.evidence_count),
          updated_at = now();
  end if;

  return query
    select a.*
    from public.learning_badge_awards a
    where a.tenant_id = v_tenant_id
      and a.student_user_id = v_student_user_id
    order by a.awarded_at desc, a.badge_code asc;
end;
$function$;


create or replace function public.get_learning_parent_badge_awards(p_student_user_id uuid)
returns table (
  badge_code text,
  badge_title text,
  description text,
  awarded_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare
  v_parent_user_id uuid;
begin
  select u.id into v_parent_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_parent_user_id is null then
    raise exception 'Authenticated parent profile not found';
  end if;

  if not exists (
    select 1
    from public.learning_parent_student_links l
    join public.learning_class_memberships cm
      on cm.organization_id = l.organization_id
     and cm.user_id = l.student_user_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where l.parent_user_id = v_parent_user_id
      and l.student_user_id = p_student_user_id
      and l.status = 'active'
  ) then
    raise exception 'You do not have an active parent link to this student';
  end if;

  return query
  select a.badge_code, a.badge_title, a.description, a.awarded_at
  from public.learning_badge_awards a
  where a.student_user_id = p_student_user_id
    and exists (
      select 1
      from public.learning_parent_student_links l
      join public.organizations o on o.id = l.organization_id
      join public.learning_class_memberships cm
        on cm.organization_id = l.organization_id
       and cm.user_id = l.student_user_id
       and cm.membership_type = 'student'
       and cm.status = 'active'
      where l.parent_user_id = v_parent_user_id
        and l.student_user_id = p_student_user_id
        and l.status = 'active'
        and o.tenant_id = a.tenant_id
    )
  order by a.awarded_at desc, a.badge_code asc;
end;
$function$;

revoke all on function public.get_learning_parent_badge_awards(uuid) from public, anon;
grant execute on function public.get_learning_parent_badge_awards(uuid) to authenticated;

revoke all on function public.sync_learning_badge_awards() from public, anon;
grant execute on function public.sync_learning_badge_awards() to authenticated;

commit;
