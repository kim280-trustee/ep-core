-- Replace the original class-membership policy names, not parallel permissive
-- policies. PostgreSQL combines permissive policies with OR.
begin;

drop policy if exists learning_class_memberships_insert
on public.learning_class_memberships;
drop policy if exists learning_class_memberships_update
on public.learning_class_memberships;
drop policy if exists learning_class_memberships_delete
on public.learning_class_memberships;

create policy learning_class_memberships_insert
on public.learning_class_memberships
for insert to authenticated
with check (public.learning_can_manage_academic_records(organization_id));

create policy learning_class_memberships_update
on public.learning_class_memberships
for update to authenticated
using (public.learning_can_manage_academic_records(organization_id))
with check (public.learning_can_manage_academic_records(organization_id));

create policy learning_class_memberships_delete
on public.learning_class_memberships
for delete to authenticated
using (public.learning_can_manage_academic_records(organization_id));

commit;
