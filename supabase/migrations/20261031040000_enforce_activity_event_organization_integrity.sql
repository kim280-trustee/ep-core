begin;

-- Resolve and validate the organization for every student activity event.
-- This runs before RLS WITH CHECK, so clients may omit organization_id only
-- when the linked learning records provide an unambiguous organization.
create or replace function private.enforce_learning_activity_event_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_assignment_org_id uuid := null;
  v_assignment_tenant_id uuid := null;
  v_assessment_org_id uuid := null;
  v_session_org_id uuid := null;
  v_session_tenant_id uuid := null;
  v_session_student_id uuid := null;
  v_content_org_id uuid := null;
  v_org_id uuid;
  v_org_tenant_id uuid;
  v_student_tenant_id uuid;
begin
  if new.assignment_id is not null then
    select a.organization_id, a.tenant_id
      into v_assignment_org_id, v_assignment_tenant_id
    from public.learning_assignments a
    where a.id = new.assignment_id;
    if not found then raise exception 'Activity assignment was not found'; end if;
  end if;

  if new.assessment_id is not null then
    select a.organization_id
      into v_assessment_org_id
    from public.learning_assessments a
    where a.id = new.assessment_id;
    if not found then raise exception 'Activity assessment was not found'; end if;
  end if;

  if new.session_id is not null then
    select s.organization_id, s.tenant_id, s.student_user_id
      into v_session_org_id, v_session_tenant_id, v_session_student_id
    from public.learning_sessions s
    where s.id = new.session_id;
    if not found then raise exception 'Activity session was not found'; end if;
    if v_session_student_id is distinct from new.student_user_id then
      raise exception 'Activity session belongs to a different student';
    end if;
  end if;

  if new.content_item_id is not null then
    select c.organization_id
      into v_content_org_id
    from public.learning_content_items c
    where c.id = new.content_item_id;
    if not found then raise exception 'Activity content item was not found'; end if;
  end if;

  v_org_id := coalesce(
    new.organization_id,
    v_assignment_org_id,
    v_assessment_org_id,
    v_session_org_id,
    v_content_org_id
  );

  if v_org_id is null then
    raise exception 'Activity event must resolve to an organization';
  end if;

  if new.organization_id is not null and new.organization_id is distinct from v_org_id then
    raise exception 'Activity event organization does not match its linked records';
  end if;
  if v_assignment_org_id is not null
     and v_assignment_org_id is distinct from v_org_id then
    raise exception 'Activity assignment belongs to a different organization';
  end if;
  if v_assessment_org_id is not null
     and v_assessment_org_id is distinct from v_org_id then
    raise exception 'Activity assessment belongs to a different organization';
  end if;
  if v_session_org_id is not null
     and v_session_org_id is distinct from v_org_id then
    raise exception 'Activity session belongs to a different organization';
  end if;
  if v_content_org_id is not null
     and v_content_org_id is distinct from v_org_id then
    raise exception 'Activity content belongs to a different organization';
  end if;

  select o.tenant_id into v_org_tenant_id
  from public.organizations o
  where o.id = v_org_id;
  if not found or v_org_tenant_id is distinct from new.tenant_id then
    raise exception 'Activity event tenant does not match its organization';
  end if;

  select u.tenant_id into v_student_tenant_id
  from public.users u
  where u.id = new.student_user_id;
  if not found or v_student_tenant_id is distinct from new.tenant_id then
    raise exception 'Activity event student does not belong to its tenant';
  end if;

  if v_assignment_tenant_id is not null
     and v_assignment_tenant_id is distinct from new.tenant_id then
    raise exception 'Activity assignment belongs to a different tenant';
  end if;
  if v_session_tenant_id is not null
     and v_session_tenant_id is distinct from new.tenant_id then
    raise exception 'Activity session belongs to a different tenant';
  end if;

  new.organization_id := v_org_id;
  return new;
end;
$function$;

revoke all on function private.enforce_learning_activity_event_organization()
from public, anon, authenticated;

drop trigger if exists learning_activity_event_organization_integrity
on public.learning_activity_events;
create trigger learning_activity_event_organization_integrity
before insert or update of
  tenant_id, organization_id, student_user_id, session_id,
  assignment_id, assessment_id, content_item_id
on public.learning_activity_events
for each row
execute function private.enforce_learning_activity_event_organization();

-- Backfill only rows whose assignment supplies an unambiguous organization.
update public.learning_activity_events e
set organization_id = a.organization_id
from public.learning_assignments a
where e.organization_id is null
  and e.assignment_id = a.id
  and a.organization_id is not null
  and a.tenant_id = e.tenant_id;

-- Student event inserts must now resolve to a real organization in the same tenant.
drop policy if exists learning_activity_events_insert
on public.learning_activity_events;
create policy learning_activity_events_insert
on public.learning_activity_events
for insert
to authenticated
with check (
  student_user_id = public.learning_current_user_id()
  and tenant_id = (
    select u.tenant_id
    from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and organization_id is not null
  and exists (
    select 1
    from public.organizations o
    where o.id = learning_activity_events.organization_id
      and o.tenant_id = learning_activity_events.tenant_id
      and o.status = 'active'
  )
  and (metadata ->> 'completion') is distinct from 'completed'
);

commit;
