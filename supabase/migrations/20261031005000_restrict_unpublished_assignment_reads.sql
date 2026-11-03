-- Students must not discover draft assignments or their items/targets merely
-- because they are members of the organisation. Authors and academic managers
-- retain access needed for authoring and review.
begin;

create or replace function private.learning_assignment_visible(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
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
            t.student_user_id = public.learning_current_user_id()
            or exists (
              select 1
              from public.learning_class_memberships cm
              where cm.class_group_id = t.class_group_id
                and cm.organization_id = a.organization_id
                and cm.user_id = public.learning_current_user_id()
                and cm.membership_type = 'student'
                and cm.status = 'active'
            )
          )
      )
  );
$function$;

revoke all on function private.learning_assignment_visible(uuid) from public, anon;
grant execute on function private.learning_assignment_visible(uuid) to authenticated;

drop policy if exists learning_assignments_select on public.learning_assignments;
create policy learning_assignments_select
on public.learning_assignments
for select to authenticated
using (
  public.learning_can_manage_academic_records(organization_id)
  or private.learning_can_manage_assignment(id, organization_id)
  or private.learning_assignment_visible(id)
);

drop policy if exists learning_assignment_items_select on public.learning_assignment_items;
create policy learning_assignment_items_select
on public.learning_assignment_items
for select to authenticated
using (
  exists (
    select 1
    from public.learning_assignments a
    where a.id = assignment_id
      and (
        public.learning_can_manage_academic_records(a.organization_id)
        or private.learning_can_manage_assignment(a.id, a.organization_id)
        or private.learning_assignment_visible(a.id)
      )
  )
);

drop policy if exists learning_assignment_targets_select on public.learning_assignment_targets;
create policy learning_assignment_targets_select
on public.learning_assignment_targets
for select to authenticated
using (
  exists (
    select 1
    from public.learning_assignments a
    where a.id = assignment_id
      and (
        public.learning_can_manage_academic_records(a.organization_id)
        or private.learning_can_manage_assignment(a.id, a.organization_id)
        or (status = 'active' and private.learning_assignment_visible(a.id))
      )
  )
);

commit;
