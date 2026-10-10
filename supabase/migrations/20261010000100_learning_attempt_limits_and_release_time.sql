-- Enforce assessment attempt limits and release times in the database.
begin;

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
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;
  select u.id into v_user_id from public.users u
  where u.auth_user_id = (select auth.uid());
  if v_user_id is null or new.student_user_id <> v_user_id then
    raise exception 'You cannot start another student''s assessment attempt';
  end if;

  perform 1 from public.learning_assessments a
  where a.id = new.assessment_id and a.status = 'published'
  for update;
  if not found then raise exception 'Assessment is not published'; end if;

  if not exists (
    select 1 from public.learning_assignment_items ai
    join public.learning_assignments a on a.id = ai.assignment_id
    where ai.assessment_id = new.assessment_id
      and a.status = 'published'
      and (a.available_from is null or a.available_from <= now())
      and private.learning_student_has_assignment_target(a.id, new.student_user_id)
  ) then
    raise exception 'No released assignment is available for this assessment';
  end if;

  select min(a.max_attempts) into v_limit
  from public.learning_assignment_items ai
  join public.learning_assignments a on a.id = ai.assignment_id
  where ai.assessment_id = new.assessment_id
    and a.status = 'published'
    and (a.available_from is null or a.available_from <= now())
    and a.max_attempts is not null
    and private.learning_student_has_assignment_target(a.id, new.student_user_id);

  select count(*)::integer into v_count from public.learning_attempts la
  where la.assessment_id = new.assessment_id
    and la.student_user_id = new.student_user_id
    and la.status <> 'abandoned';

  if v_limit is not null and v_count >= v_limit then
    raise exception 'You have reached the maximum number of attempts';
  end if;
  if new.attempt_number <> v_count + 1 then
    raise exception 'Attempt number is out of date; refresh and try again';
  end if;
  return new;
end;
$function$;

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

commit;
