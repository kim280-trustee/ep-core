-- Make required content completion an authenticated, validated operation.
begin;

create or replace function public.complete_learning_assignment_content(
  p_assignment_id uuid,
  p_content_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_assignment record;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  select u.id into v_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid());

  if v_user_id is null then
    raise exception 'Student profile was not found';
  end if;

  select a.id, a.tenant_id, a.organization_id
  into v_assignment
  from public.learning_assignments a
  where a.id = p_assignment_id
    and a.status = 'published'
    and (a.available_from is null or a.available_from <= now())
    and exists (
      select 1
      from public.learning_assignment_targets t
      where t.assignment_id = a.id and t.status = 'active'
        and (
          t.student_user_id = v_user_id
          or exists (
            select 1 from public.learning_class_memberships cm
            where cm.class_group_id = t.class_group_id
              and cm.user_id = v_user_id
              and cm.membership_type = 'student'
              and cm.status = 'active'
          )
        )
    )
  for update of a;

  if not found then
    raise exception 'This assignment is not available to the current student';
  end if;

  if not exists (
    select 1
    from public.learning_assignment_items ai
    join public.learning_content_items ci on ci.id = ai.content_item_id
    where ai.assignment_id = p_assignment_id
      and ai.content_item_id = p_content_item_id
      and ai.item_type = 'content'
      and ai.required = true
      and ai.organization_id = v_assignment.organization_id
      and ci.organization_id = v_assignment.organization_id
      and ci.status = 'published'
      and exists (
        select 1 from public.learning_content_versions cv
        where cv.content_item_id = ci.id
          and cv.status = 'published'
          and cv.published_at is not null
      )
  ) then
    raise exception 'This is not a required, published content item in the assignment';
  end if;

  if not exists (
    select 1 from public.learning_activity_events e
    where e.assignment_id = p_assignment_id
      and e.content_item_id = p_content_item_id
      and e.student_user_id = v_user_id
      and e.activity_type = 'content_viewed'
      and e.metadata->>'completion' = 'completed'
  ) then
    insert into public.learning_activity_events (
      tenant_id, organization_id, student_user_id, activity_type,
      content_item_id, assignment_id, metadata
    ) values (
      v_assignment.tenant_id, v_assignment.organization_id, v_user_id,
      'content_viewed', p_content_item_id, p_assignment_id,
      jsonb_build_object('completion', 'completed', 'source', 'validated_completion_rpc')
    );
  end if;

  return jsonb_build_object('completed', true, 'assignment_id', p_assignment_id, 'content_item_id', p_content_item_id);
end;
$function$;

revoke all on function public.complete_learning_assignment_content(uuid, uuid) from public;
grant execute on function public.complete_learning_assignment_content(uuid, uuid) to authenticated;

-- Students may log activity, but cannot forge the completion marker directly.
drop policy if exists learning_activity_events_insert on public.learning_activity_events;
create policy learning_activity_events_insert
on public.learning_activity_events
for insert to authenticated
with check (
  student_user_id in (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and tenant_id in (select u.tenant_id from public.users u where u.auth_user_id = (select auth.uid()))
  and metadata->>'completion' is distinct from 'completed'
);

-- Prevent students from changing the identity of a progress row.
revoke update on table public.learning_assignment_progress from public, anon, authenticated;
grant update (status, started_at, completed_at, last_activity_at)
  on table public.learning_assignment_progress to authenticated;

drop policy if exists learning_assignment_progress_insert on public.learning_assignment_progress;
create policy learning_assignment_progress_insert
on public.learning_assignment_progress for insert to authenticated
with check (
  student_user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and status = 'not_started'
  and exists (
    select 1
    from public.learning_assignment_targets t
    join public.learning_assignments a on a.id = t.assignment_id
    where t.id = assignment_target_id
      and t.assignment_id = learning_assignment_progress.assignment_id
      and t.organization_id = learning_assignment_progress.organization_id
      and t.status = 'active'
      and a.status = 'published'
      and (a.available_from is null or a.available_from <= now())
      and private.learning_student_has_assignment_target(a.id, learning_assignment_progress.student_user_id)
  )
);

drop policy if exists learning_assignment_progress_update on public.learning_assignment_progress;
create policy learning_assignment_progress_update
on public.learning_assignment_progress for update to authenticated
using (
  student_user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and exists (
    select 1
    from public.learning_assignment_targets t
    join public.learning_assignments a on a.id = t.assignment_id
    where t.id = learning_assignment_progress.assignment_target_id
      and t.assignment_id = learning_assignment_progress.assignment_id
      and t.organization_id = learning_assignment_progress.organization_id
      and t.status = 'active'
      and a.status = 'published'
      and (a.available_from is null or a.available_from <= now())
      and private.learning_student_has_assignment_target(a.id, learning_assignment_progress.student_user_id)
  )
)
with check (
  student_user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and exists (
    select 1
    from public.learning_assignment_targets t
    join public.learning_assignments a on a.id = t.assignment_id
    where t.id = learning_assignment_progress.assignment_target_id
      and t.assignment_id = learning_assignment_progress.assignment_id
      and t.organization_id = learning_assignment_progress.organization_id
      and t.status = 'active'
      and a.status = 'published'
      and (a.available_from is null or a.available_from <= now())
      and private.learning_student_has_assignment_target(a.id, learning_assignment_progress.student_user_id)
  )
);

-- Prevent direct progress writes from declaring completion without evidence for
-- every required item. The RPC above is the only supported source for content evidence.
create or replace function private.guard_learning_assignment_progress_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
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

  return new;
end;
$function$;

drop trigger if exists learning_assignment_progress_completion_guard on public.learning_assignment_progress;
create trigger learning_assignment_progress_completion_guard
before insert or update on public.learning_assignment_progress
for each row execute function private.guard_learning_assignment_progress_completion();

commit;
