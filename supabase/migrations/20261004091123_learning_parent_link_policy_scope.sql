drop policy if exists learning_parent_links_manage on public.learning_parent_student_links;

create policy learning_parent_links_insert
on public.learning_parent_student_links
for insert
to authenticated
with check (
  learning_can_manage_academic_records(organization_id)
  and exists (
    select 1 from public.users p
    where p.id = parent_user_id
      and p.tenant_id = (select o.tenant_id from public.organizations o where o.id = organization_id)
  )
  and exists (
    select 1 from public.users s
    where s.id = student_user_id
      and s.tenant_id = (select o.tenant_id from public.organizations o where o.id = organization_id)
  )
);

create policy learning_parent_links_update
on public.learning_parent_student_links
for update
to authenticated
using (learning_can_manage_academic_records(organization_id))
with check (
  learning_can_manage_academic_records(organization_id)
  and exists (
    select 1 from public.users p
    where p.id = parent_user_id
      and p.tenant_id = (select o.tenant_id from public.organizations o where o.id = organization_id)
  )
  and exists (
    select 1 from public.users s
    where s.id = student_user_id
      and s.tenant_id = (select o.tenant_id from public.organizations o where o.id = organization_id)
  )
);

create policy learning_parent_links_delete
on public.learning_parent_student_links
for delete
to authenticated
using (learning_can_manage_academic_records(organization_id));
