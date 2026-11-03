-- Direct gradebook writes must target a student actively enrolled in the
-- exact class and class subject represented by the gradebook row.
begin;

drop policy if exists learning_gradebook_entries_insert
on public.learning_gradebook_entries;
create policy learning_gradebook_entries_insert
on public.learning_gradebook_entries
for insert
to authenticated
with check (
  public.learning_can_manage_academic_records(organization_id)
  and created_by = public.learning_current_user_id()
  and exists (
    select 1
    from public.organizations o
    join public.learning_class_memberships cm
      on cm.organization_id = o.id
     and cm.tenant_id = o.tenant_id
     and cm.class_group_id = learning_gradebook_entries.class_group_id
     and cm.user_id = learning_gradebook_entries.student_user_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    join public.learning_class_subjects cs
      on cs.organization_id = o.id
     and cs.class_group_id = cm.class_group_id
     and cs.id = learning_gradebook_entries.class_subject_id
     and cs.status = 'active'
    where o.id = learning_gradebook_entries.organization_id
      and o.tenant_id = learning_gradebook_entries.tenant_id
      and o.status = 'active'
  )
);

drop policy if exists learning_gradebook_entries_update
on public.learning_gradebook_entries;
create policy learning_gradebook_entries_update
on public.learning_gradebook_entries
for update
to authenticated
using (public.learning_can_manage_academic_records(organization_id))
with check (
  public.learning_can_manage_academic_records(organization_id)
  and exists (
    select 1
    from public.organizations o
    join public.learning_class_memberships cm
      on cm.organization_id = o.id
     and cm.tenant_id = o.tenant_id
     and cm.class_group_id = learning_gradebook_entries.class_group_id
     and cm.user_id = learning_gradebook_entries.student_user_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    join public.learning_class_subjects cs
      on cs.organization_id = o.id
     and cs.class_group_id = cm.class_group_id
     and cs.id = learning_gradebook_entries.class_subject_id
     and cs.status = 'active'
    where o.id = learning_gradebook_entries.organization_id
      and o.tenant_id = learning_gradebook_entries.tenant_id
      and o.status = 'active'
  )
);

commit;
