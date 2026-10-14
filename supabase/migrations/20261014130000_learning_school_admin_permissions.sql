-- School setup is an administrative workflow. Organization membership alone
-- grants access to read academic data, but does not grant permission to mutate it.
-- Keep the existing organization boundary and require the established settings.manage
-- permission for writes. This uses the existing core RBAC model and adds no new role.

drop policy if exists learning_academic_years_manage on public.learning_academic_years;
create policy learning_academic_years_insert on public.learning_academic_years
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
create policy learning_academic_years_update on public.learning_academic_years
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
create policy learning_academic_years_delete on public.learning_academic_years
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));

drop policy if exists learning_terms_manage on public.learning_terms;
create policy learning_terms_insert on public.learning_terms
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
create policy learning_terms_update on public.learning_terms
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
create policy learning_terms_delete on public.learning_terms
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));

drop policy if exists learning_class_groups_manage on public.learning_class_groups;
create policy learning_class_groups_insert on public.learning_class_groups
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
create policy learning_class_groups_update on public.learning_class_groups
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
create policy learning_class_groups_delete on public.learning_class_groups
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));

drop policy if exists learning_class_subjects_manage on public.learning_class_subjects;
create policy learning_class_subjects_insert on public.learning_class_subjects
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
create policy learning_class_subjects_update on public.learning_class_subjects
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
create policy learning_class_subjects_delete on public.learning_class_subjects
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));

drop policy if exists learning_class_memberships_insert on public.learning_class_memberships;
create policy learning_class_memberships_insert on public.learning_class_memberships
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
drop policy if exists learning_class_memberships_update on public.learning_class_memberships;
create policy learning_class_memberships_update on public.learning_class_memberships
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
drop policy if exists learning_class_memberships_delete on public.learning_class_memberships;
create policy learning_class_memberships_delete on public.learning_class_memberships
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('settings.manage'));
