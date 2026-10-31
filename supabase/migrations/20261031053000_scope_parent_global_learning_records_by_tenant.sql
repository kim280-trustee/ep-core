-- Preserve parent visibility for tenant-wide mastery/recommendation rows whose
-- organization_id is intentionally NULL, while still requiring an active linked
-- student enrolment in an organisation belonging to that same tenant.
begin;

create or replace function private.learning_parent_student_ids(
  p_organization_id uuid,
  p_tenant_id uuid
)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $function$
  select distinct l.student_user_id
  from public.learning_parent_student_links l
  join public.users p on p.id = l.parent_user_id
  join public.organizations o on o.id = l.organization_id
  join public.learning_class_memberships cm
    on cm.organization_id = l.organization_id
   and cm.tenant_id = o.tenant_id
   and cm.user_id = l.student_user_id
   and cm.membership_type = 'student'
   and cm.status = 'active'
  where p.auth_user_id = (select auth.uid())
    and (p_organization_id is null or l.organization_id = p_organization_id)
    and (p_tenant_id is null or o.tenant_id = p_tenant_id)
    and l.status = 'active'
    and o.status = 'active'
$function$;

revoke all on function private.learning_parent_student_ids(uuid,uuid) from public, anon;
grant execute on function private.learning_parent_student_ids(uuid,uuid) to authenticated;

drop policy if exists learning_parent_mastery_view on public.learning_student_mastery;
create policy learning_parent_mastery_view
on public.learning_student_mastery for select to authenticated
using (
  student_user_id in (
    select private.learning_parent_student_ids(organization_id, tenant_id)
  )
);

drop policy if exists learning_parent_mastery_events_view on public.learning_mastery_events;
create policy learning_parent_mastery_events_view
on public.learning_mastery_events for select to authenticated
using (
  student_user_id in (
    select private.learning_parent_student_ids(organization_id, tenant_id)
  )
);

drop policy if exists learning_parent_recommendations_view on public.learning_recommendations;
create policy learning_parent_recommendations_view
on public.learning_recommendations for select to authenticated
using (
  student_user_id in (
    select private.learning_parent_student_ids(organization_id, tenant_id)
  )
);

commit;
