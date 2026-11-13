-- Let an ordinary active class teacher read only their own assigned timetable entries.
-- This does not broaden the school-wide timetable SELECT policy.
begin;

create or replace function public.list_learning_teacher_timetable()
returns setof public.learning_timetable_entries
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  v_user_id := public.learning_current_user_id();
  if v_user_id is null then
    raise exception 'User profile not found' using errcode = '28000';
  end if;

  return query
  select entry.*
  from public.learning_timetable_entries entry
  join public.learning_class_groups class_group
    on class_group.id = entry.class_group_id
   and class_group.organization_id = entry.organization_id
   and class_group.tenant_id = entry.tenant_id
   and class_group.status = 'active'
  join public.organizations org
    on org.id = entry.organization_id
   and org.tenant_id = entry.tenant_id
   and org.status = 'active'
  where entry.teacher_user_id = v_user_id
    and entry.status = 'active'
    and exists (
      select 1
      from public.learning_class_memberships membership
      where membership.tenant_id = entry.tenant_id
        and membership.organization_id = entry.organization_id
        and membership.class_group_id = entry.class_group_id
        and membership.user_id = v_user_id
        and membership.membership_type = 'teacher'
        and membership.status = 'active'
    )
  order by entry.day_of_week, entry.starts_at;
end;
$function$;

revoke all on function public.list_learning_teacher_timetable() from public, anon;
grant execute on function public.list_learning_teacher_timetable() to authenticated;

commit;
