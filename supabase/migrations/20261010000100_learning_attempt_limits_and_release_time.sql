-- Enforce assessment attempt limits and release times in the database.
begin;

alter table public.learning_attempts
  add column if not exists assignment_id uuid references public.learning_assignments(id) on delete set null;

create index if not exists learning_attempts_assignment_student_idx
  on public.learning_attempts(assignment_id, student_user_id, assessment_id);

-- Backfill only when an attempt maps unambiguously to one targeted assignment.
with candidate_assignments as (
  select la.id as attempt_id, min(a.id::text)::uuid as assignment_id, count(distinct a.id) as assignment_count
  from public.learning_attempts la
  join public.learning_assignment_items ai on ai.assessment_id = la.assessment_id
  join public.learning_assignments a on a.id = ai.assignment_id
    and a.status = 'published'
  join public.learning_assignment_targets t on t.assignment_id = a.id
    and t.status = 'active'
    and (
      t.student_user_id = la.student_user_id
      or exists (
        select 1 from public.learning_class_memberships cm
        where cm.class_group_id = t.class_group_id
          and cm.user_id = la.student_user_id
          and cm.membership_type = 'student'
          and cm.status = 'active'
      )
    )
  where la.assignment_id is null
  group by la.id
)
update public.learning_attempts la
set assignment_id = ca.assignment_id
from candidate_assignments ca
where ca.attempt_id = la.id
  and ca.assignment_count = 1;


create or replace function private.enforce_learning_attempt_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_count integer;
  v_limit integer;
  v_next_attempt_number integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;
  select u.id into v_user_id from public.users u
  where u.auth_user_id = (select auth.uid());
  if v_user_id is null or new.student_user_id <> v_user_id then
    raise exception 'You cannot start another student''s assessment attempt';
  end if;
  if new.assignment_id is null then
    raise exception 'An assignment is required to start an assessment attempt';
  end if;

  perform 1 from public.learning_assessments a
  where a.id = new.assessment_id and a.status = 'published'
  for update;
  if not found then raise exception 'Assessment is not published'; end if;

  if exists (
    select 1
    from public.learning_assessment_questions aq
    join public.learning_question_versions qv on qv.id = aq.question_version_id
    join public.learning_questions q on q.id = qv.question_id
    left join public.learning_question_evaluation_keys ek on ek.question_version_id = qv.id
    where aq.assessment_id = new.assessment_id
      and (
        q.status <> 'published'
        or (q.organization_id is not null and q.organization_id is distinct from (select a.organization_id from public.learning_assessments a where a.id = new.assessment_id))
        or qv.published_at is null
        or q.question_type not in ('single_choice', 'true_false')
        or coalesce(ek.scoring_rules->>'method', '') <> 'exact_option'
        or not (coalesce(ek.evaluation_key, '{}'::jsonb) ? 'correct_option_id')
        or not exists (
          select 1
          from jsonb_array_elements(
            case
              when jsonb_typeof(qv.configuration->'options') = 'array'
                then qv.configuration->'options'
              else '[]'::jsonb
            end
          ) option_row
          where coalesce(option_row->>'key', option_row->>'value') = ek.evaluation_key->>'correct_option_id'
        )
      )
  ) then
    raise exception 'This assessment is not configured for automatic scoring';
  end if;

  if not exists (
    select 1 from public.learning_assignment_items ai
    join public.learning_assignments a on a.id = ai.assignment_id
    where ai.assignment_id = new.assignment_id
      and ai.assessment_id = new.assessment_id
      and a.status = 'published'
      and a.tenant_id = new.tenant_id
      and a.organization_id is not distinct from new.organization_id
      and (a.available_from is null or a.available_from <= now())
      and private.learning_student_has_assignment_target(a.id, new.student_user_id)
  ) then
    raise exception 'This assessment is not available in the selected assignment';
  end if;

  select a.max_attempts into v_limit
  from public.learning_assignments a
  where a.id = new.assignment_id;

  select count(*)::integer into v_count from public.learning_attempts la
  where la.assessment_id = new.assessment_id
    and la.student_user_id = new.student_user_id
    and (la.assignment_id = new.assignment_id or la.assignment_id is null);

  if v_limit is not null and v_count >= v_limit then
    raise exception 'You have reached the maximum number of attempts';
  end if;

  -- Attempt numbers are unique per student and assessment, even if the same
  -- assessment is reused by multiple assignments.
  select coalesce(max(la.attempt_number), 0) + 1
  into v_next_attempt_number
  from public.learning_attempts la
  where la.assessment_id = new.assessment_id
    and la.student_user_id = new.student_user_id;

  if new.attempt_number <> v_next_attempt_number then
    raise exception 'Attempt number is out of date; refresh and try again';
  end if;
  return new;
end;
$function$;

revoke all on function private.enforce_learning_attempt_limits() from public, anon, authenticated;

drop trigger if exists learning_attempts_enforce_limits on public.learning_attempts;
create trigger learning_attempts_enforce_limits
before insert on public.learning_attempts
for each row execute function private.enforce_learning_attempt_limits();

create or replace function private.learning_assignment_visible(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_catalog'
as $function$
  select exists (
    select 1 from public.learning_assignments a
    where a.id = target_assignment_id
      and a.status = 'published'
      and (a.available_from is null or a.available_from <= now())
      and exists (
        select 1 from public.learning_assignment_targets t
        where t.assignment_id = a.id and t.status = 'active'
          and (
            t.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
            or exists (
              select 1 from public.learning_class_memberships cm
              where cm.class_group_id=t.class_group_id
                and cm.user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
                and cm.membership_type='student' and cm.status='active'
            )
          )
      )
  );
$function$;

create or replace function private.learning_assessment_visible_to_student(p_assessment_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1
    from public.learning_assessments a
    join public.learning_assignment_items ai on ai.assessment_id = a.id
    join public.learning_assignments ass on ass.id = ai.assignment_id
    join public.learning_assignment_targets t on t.assignment_id = ass.id
    where a.id = p_assessment_id
      and a.status = 'published'
      and ass.status = 'published'
      and (ass.available_from is null or ass.available_from <= now())
      and t.status = 'active'
      and (
        t.student_user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
        or exists (
          select 1 from public.learning_class_memberships cm
          where cm.class_group_id = t.class_group_id
            and cm.user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
            and cm.membership_type = 'student'
            and cm.status = 'active'
        )
      )
  );
$function$;

commit;
