-- E&P Learning runtime hardening: RLS policy consolidation and FK indexes.

create index if not exists learning_class_memberships_tenant_org_idx on public.learning_class_memberships(tenant_id,organization_id);
create index if not exists learning_assignment_items_content_idx on public.learning_assignment_items(content_item_id);
create index if not exists learning_assignment_items_assessment_idx on public.learning_assignment_items(assessment_id);
create index if not exists learning_assignment_targets_tenant_assignment_idx on public.learning_assignment_targets(tenant_id,assignment_id);
create index if not exists learning_assignment_progress_org_target_idx on public.learning_assignment_progress(organization_id,assignment_target_id);
create index if not exists learning_assignment_progress_org_student_idx on public.learning_assignment_progress(organization_id,student_user_id);
create index if not exists learning_sessions_tenant_org_idx on public.learning_sessions(tenant_id,organization_id);
create index if not exists learning_activity_events_tenant_org_idx on public.learning_activity_events(tenant_id,organization_id);
create index if not exists learning_activity_events_tenant_student_idx on public.learning_activity_events(tenant_id,student_user_id);
create index if not exists learning_activity_events_session_idx on public.learning_activity_events(session_id);
create index if not exists learning_activity_events_content_idx on public.learning_activity_events(content_item_id);
create index if not exists learning_activity_events_assessment_idx on public.learning_activity_events(assessment_id);

drop policy if exists learning_class_memberships_manage on public.learning_class_memberships;
create policy learning_class_memberships_insert on public.learning_class_memberships for insert to authenticated
with check (public.is_organization_member(organization_id));
create policy learning_class_memberships_update on public.learning_class_memberships for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));
create policy learning_class_memberships_delete on public.learning_class_memberships for delete to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists learning_assignments_manage on public.learning_assignments;
create policy learning_assignments_insert on public.learning_assignments for insert to authenticated
with check (public.is_organization_member(organization_id));
create policy learning_assignments_update on public.learning_assignments for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));
create policy learning_assignments_delete on public.learning_assignments for delete to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists learning_assignment_items_manage on public.learning_assignment_items;
create policy learning_assignment_items_insert on public.learning_assignment_items for insert to authenticated
with check (exists(select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)));
create policy learning_assignment_items_update on public.learning_assignment_items for update to authenticated
using (exists(select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)))
with check (exists(select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)));
create policy learning_assignment_items_delete on public.learning_assignment_items for delete to authenticated
using (exists(select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)));

drop policy if exists learning_assignment_targets_manage on public.learning_assignment_targets;
create policy learning_assignment_targets_insert on public.learning_assignment_targets for insert to authenticated
with check (exists(select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)));
create policy learning_assignment_targets_update on public.learning_assignment_targets for update to authenticated
using (exists(select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)))
with check (exists(select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)));
create policy learning_assignment_targets_delete on public.learning_assignment_targets for delete to authenticated
using (exists(select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)));

drop policy if exists learning_assignment_progress_insert on public.learning_assignment_progress;
create policy learning_assignment_progress_insert on public.learning_assignment_progress for insert to authenticated
with check (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  and private.learning_assignment_visible(assignment_id)
);

drop policy if exists learning_sessions_insert on public.learning_sessions;
create policy learning_sessions_insert on public.learning_sessions for insert to authenticated
with check (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  and tenant_id in (select u.tenant_id from public.users u where u.auth_user_id=(select auth.uid()))
  and (organization_id is null or public.is_organization_member(organization_id))
);

drop policy if exists learning_activity_events_insert on public.learning_activity_events;
create policy learning_activity_events_insert on public.learning_activity_events for insert to authenticated
with check (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  and tenant_id in (select u.tenant_id from public.users u where u.auth_user_id=(select auth.uid()))
  and (organization_id is null or public.is_organization_member(organization_id))
);