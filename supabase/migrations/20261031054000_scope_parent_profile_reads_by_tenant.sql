-- Parent profile visibility must use the tenant-aware helper as well.
-- The original no-argument helper spans every organisation linked to a parent;
-- leaving its users policy in place would retain a cross-organisation read path.
begin;

drop policy if exists learning_parent_student_user_view on public.users;

create policy learning_parent_student_user_view
on public.users
for select
to authenticated
using (
  id in (
    select private.learning_parent_student_ids(null::uuid, users.tenant_id)
  )
);

commit;
