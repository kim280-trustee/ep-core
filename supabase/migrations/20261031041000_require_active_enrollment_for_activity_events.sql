-- Activity events may be recorded only by an actively enrolled student.
-- Tenant ownership alone is insufficient after an enrollment is suspended.
begin;

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
    join public.learning_class_memberships cm
      on cm.organization_id = o.id
     and cm.tenant_id = o.tenant_id
     and cm.user_id = learning_activity_events.student_user_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where o.id = learning_activity_events.organization_id
      and o.tenant_id = learning_activity_events.tenant_id
      and o.status = 'active'
  )
  and (metadata ->> 'completion') is distinct from 'completed'
);

commit;
