-- Harden Learning assignment RLS by moving student visibility lookup outside mutually recursive policies.

create schema if not exists private;

create or replace function private.learning_assignment_visible(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.learning_assignments a
    where a.id = target_assignment_id
      and a.status = 'published'
      and exists (
        select 1
        from public.learning_assignment_targets t
        where t.assignment_id = a.id
          and t.status = 'active'
          and (
            t.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
            or exists (
              select 1
              from public.learning_class_memberships cm
              where cm.class_group_id=t.class_group_id
                and cm.user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
                and cm.membership_type='student'
                and cm.status='active'
            )
          )
      )
  );
$$;

revoke all on function private.learning_assignment_visible(uuid) from public;
grant execute on function private.learning_assignment_visible(uuid) to authenticated;

drop policy if exists learning_assignments_select on public.learning_assignments;
create policy learning_assignments_select on public.learning_assignments
for select to authenticated
using (public.is_organization_member(organization_id) or private.learning_assignment_visible(id));

drop policy if exists learning_assignment_items_select on public.learning_assignment_items;
create policy learning_assignment_items_select on public.learning_assignment_items
for select to authenticated
using (
  exists (
    select 1
    from public.learning_assignments a
    where a.id=assignment_id
      and (public.is_organization_member(a.organization_id) or private.learning_assignment_visible(a.id))
  )
);

drop policy if exists learning_assignment_targets_select on public.learning_assignment_targets;
create policy learning_assignment_targets_select on public.learning_assignment_targets
for select to authenticated
using (
  exists (
    select 1
    from public.learning_assignments a
    where a.id=assignment_id
      and (public.is_organization_member(a.organization_id) or (private.learning_assignment_visible(a.id) and status='active'))
  )
);