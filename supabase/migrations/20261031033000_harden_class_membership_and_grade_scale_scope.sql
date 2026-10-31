-- Class membership writes are administrative operations, not general
-- organisation-member operations. Composite FKs already enforce tenant and
-- class/user ownership; these policies enforce the actor's authority.
-- Also prevent a class subject from referencing another organisation's scale.
begin;

drop policy if exists learning_class_memberships_manage
on public.learning_class_memberships;

drop policy if exists learning_class_memberships_manager_insert
on public.learning_class_memberships;
create policy learning_class_memberships_manager_insert
on public.learning_class_memberships
for insert to authenticated
with check (
  public.learning_can_manage_academic_records(organization_id)
);

drop policy if exists learning_class_memberships_manager_update
on public.learning_class_memberships;
create policy learning_class_memberships_manager_update
on public.learning_class_memberships
for update to authenticated
using (public.learning_can_manage_academic_records(organization_id))
with check (public.learning_can_manage_academic_records(organization_id));

drop policy if exists learning_class_memberships_manager_delete
on public.learning_class_memberships;
create policy learning_class_memberships_manager_delete
on public.learning_class_memberships
for delete to authenticated
using (public.learning_can_manage_academic_records(organization_id));

create unique index if not exists learning_grade_scales_org_id_uq
on public.learning_grade_scales(organization_id, id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.learning_class_subjects'::regclass
      and conname = 'class_subject_grade_scale_org_fk'
  ) then
    alter table public.learning_class_subjects
      add constraint class_subject_grade_scale_org_fk
      foreign key (organization_id, grade_scale_id)
      references public.learning_grade_scales(organization_id, id)
      on delete restrict
      not valid;
  end if;
end;
$$;

alter table public.learning_class_subjects
validate constraint class_subject_grade_scale_org_fk;

commit;
