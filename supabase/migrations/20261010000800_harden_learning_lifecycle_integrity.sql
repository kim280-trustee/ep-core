-- Harden content status transitions, assignment progress, and completion-event idempotency.
begin;

create or replace function public.transition_learning_content_status(
  p_content_item_id uuid,
  p_status text
)
returns public.learning_content_items
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_item public.learning_content_items%rowtype;
  v_version public.learning_content_versions%rowtype;
  v_actor uuid;
  v_now timestamptz := now();
  v_sections jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  v_actor := public.learning_current_user_id();
  if v_actor is null then
    raise exception 'The current user profile was not found';
  end if;

  select * into v_item
  from public.learning_content_items
  where id = p_content_item_id
  for update;

  if not found then
    raise exception 'Content item was not found';
  end if;

  if v_item.organization_id is null
     or not public.is_organization_member(v_item.organization_id) then
    raise exception 'You do not have permission to manage this content';
  end if;

  if p_status not in ('draft', 'review', 'published', 'retired') then
    raise exception 'Unsupported content status';
  end if;

  if v_item.status = p_status then
    return v_item;
  end if;

  if not (
    (v_item.status = 'draft' and p_status = 'review')
    or (v_item.status = 'review' and p_status in ('draft', 'published'))
    or (v_item.status = 'published' and p_status = 'retired')
  ) then
    raise exception 'Invalid content status transition: % -> %', v_item.status, p_status;
  end if;

  if p_status in ('review', 'published') then
    if not exists (
      select 1
      from public.learning_content_objectives co
      where co.content_item_id = v_item.id
    ) then
      raise exception 'Content needs at least one learning objective before review or publishing';
    end if;
  end if;

  if p_status in ('review', 'published', 'draft') then
    select * into v_version
    from public.learning_content_versions
    where content_item_id = v_item.id
    order by version_no desc
    limit 1
    for update;

    if not found then
      raise exception 'Content needs a version before its status can change';
    end if;
  elsif p_status = 'retired' then
    select * into v_version
    from public.learning_content_versions
    where content_item_id = v_item.id
      and status = 'published'
    order by version_no desc
    limit 1
    for update;

    if not found then
      raise exception 'The published content version was not found';
    end if;
  end if;

  if p_status in ('review', 'published') then
    v_sections := v_version.body->'sections';
    if jsonb_typeof(v_sections) is distinct from 'array'
       or not exists (
         select 1
         from jsonb_array_elements(
           case when jsonb_typeof(v_sections) = 'array' then v_sections else '[]'::jsonb end
         ) section
         where jsonb_typeof(section) = 'object'
           and nullif(btrim(section->>'body'), '') is not null
       ) then
      raise exception 'The latest content version cannot be empty';
    end if;
  end if;

  if p_status = 'review' then
    if v_version.status <> 'draft' then
      raise exception 'Only a draft version can be submitted for review';
    end if;

    update public.learning_content_versions
    set status = 'review',
        reviewed_by = null,
        reviewed_at = null,
        published_at = null,
        updated_at = v_now
    where id = v_version.id;

    update public.learning_content_items
    set status = 'review',
        reviewed_by = null,
        reviewed_at = null,
        updated_by = v_actor,
        updated_at = v_now
    where id = v_item.id;
  elsif p_status = 'draft' then
    if v_version.status <> 'review' then
      raise exception 'Only content in review can return to draft';
    end if;

    update public.learning_content_versions
    set status = 'draft',
        reviewed_by = null,
        reviewed_at = null,
        published_at = null,
        updated_at = v_now
    where id = v_version.id;

    update public.learning_content_items
    set status = 'draft',
        reviewed_by = null,
        reviewed_at = null,
        updated_by = v_actor,
        updated_at = v_now
    where id = v_item.id;
  elsif p_status = 'published' then
    if v_item.status <> 'review' or v_version.status <> 'review' then
      raise exception 'Content and its latest version must be in review before publishing';
    end if;

    update public.learning_content_versions
    set status = 'published',
        reviewed_by = v_actor,
        reviewed_at = v_now,
        published_at = v_now,
        updated_at = v_now
    where id = v_version.id;

    update public.learning_content_items
    set status = 'published',
        reviewed_by = v_actor,
        reviewed_at = v_now,
        updated_by = v_actor,
        updated_at = v_now
    where id = v_item.id;
  elsif p_status = 'retired' then
    update public.learning_content_versions
    set status = 'retired',
        updated_at = v_now
    where id = v_version.id;

    update public.learning_content_items
    set status = 'retired',
        updated_by = v_actor,
        updated_at = v_now
    where id = v_item.id;
  end if;

  select * into v_item
  from public.learning_content_items
  where id = p_content_item_id;

  return v_item;
end;
$function$;

revoke all on function public.transition_learning_content_status(uuid, text) from public, anon;
grant execute on function public.transition_learning_content_status(uuid, text) to authenticated;

-- Permit only supported assignment lifecycle transitions.
create or replace function private.guard_learning_assignment_status_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if (old.status = 'draft' and new.status = 'published')
     or (old.status = 'published' and new.status = 'closed')
     or (old.status = 'closed' and new.status = 'published')
     or (old.status <> 'archived' and new.status = 'archived') then
    return new;
  end if;

  raise exception 'Invalid assignment status transition: % -> %', old.status, new.status;
end;
$function$;

revoke all on function private.guard_learning_assignment_status_transition() from public, anon, authenticated;
drop trigger if exists learning_assignments_status_transition_guard on public.learning_assignments;
create trigger learning_assignments_status_transition_guard
before update of status on public.learning_assignments
for each row execute function private.guard_learning_assignment_status_transition();

-- Keep progress monotonic and ensure completed rows have evidence for every required item.
create or replace function private.guard_learning_assignment_progress_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if old.status = 'completed' then
      raise exception 'Completed assignment progress cannot be reopened; reassign the work instead';
    end if;

    if not (
      (old.status = 'not_started' and new.status in ('in_progress', 'completed', 'overdue'))
      or (old.status = 'in_progress' and new.status in ('completed', 'overdue'))
      or (old.status = 'overdue' and new.status in ('in_progress', 'completed'))
    ) then
      raise exception 'Invalid assignment progress transition: % -> %', old.status, new.status;
    end if;
  end if;

  if new.status = 'in_progress' then
    new.started_at := coalesce(new.started_at, old.started_at, now());
    new.last_activity_at := coalesce(new.last_activity_at, now());
    return new;
  end if;

  if new.status <> 'completed' then
    return new;
  end if;

  if exists (
    select 1
    from public.learning_assignment_items ai
    where ai.assignment_id = new.assignment_id
      and ai.required = true
      and (
        (ai.item_type = 'content' and not exists (
          select 1 from public.learning_activity_events e
          where e.assignment_id = new.assignment_id
            and e.content_item_id = ai.content_item_id
            and e.student_user_id = new.student_user_id
            and e.activity_type = 'content_viewed'
            and e.metadata->>'completion' = 'completed'
        ))
        or
        (ai.item_type = 'assessment' and not exists (
          select 1
          from public.learning_attempts la
          join public.learning_assessment_results ar on ar.attempt_id = la.id
          where la.assessment_id = ai.assessment_id
            and la.assignment_id = new.assignment_id
            and la.student_user_id = new.student_user_id
            and la.status = 'evaluated'
        ))
      )
  ) then
    raise exception 'Required assignment activities must be completed before marking this assignment complete';
  end if;

  new.started_at := coalesce(new.started_at, old.started_at, now());
  new.completed_at := coalesce(new.completed_at, old.completed_at, now());
  new.last_activity_at := coalesce(new.last_activity_at, now());
  return new;
end;
$function$;

-- Serialize completion-event inserts per student/assignment so retries and concurrent
-- assessment submissions cannot create duplicate completion events.
create or replace function private.dedupe_learning_assignment_completion_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.activity_type <> 'assignment_completed' or new.assignment_id is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(new.assignment_id::text || ':' || new.student_user_id::text, 0)
  );

  if exists (
    select 1
    from public.learning_activity_events e
    where e.activity_type = 'assignment_completed'
      and e.assignment_id = new.assignment_id
      and e.student_user_id = new.student_user_id
  ) then
    return null;
  end if;

  return new;
end;
$function$;

revoke all on function private.dedupe_learning_assignment_completion_event() from public, anon, authenticated;
drop trigger if exists learning_activity_events_assignment_completion_dedupe on public.learning_activity_events;
create trigger learning_activity_events_assignment_completion_dedupe
before insert on public.learning_activity_events
for each row execute function private.dedupe_learning_assignment_completion_event();

commit;
