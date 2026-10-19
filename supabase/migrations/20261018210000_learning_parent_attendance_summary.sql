begin;

-- Parent-facing attendance aggregates are restricted to an active parent link and
-- active student enrollment in the same organization. No teacher notes or other
-- students' attendance records are returned.
create or replace function public.get_learning_parent_attendance_summary(
  p_student_user_id uuid,
  p_limit integer default 30
)
returns table (
  sessions_count bigint,
  present_count bigint,
  absent_count bigint,
  late_count bigint,
  excused_count bigint,
  latest_attendance_date date
)
language plpgsql
security definer
set search_path = ''
stable
as $function$
declare
  v_parent_user_id uuid;
begin
  select u.id into v_parent_user_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_parent_user_id is null then
    raise exception 'Authenticated E&P user profile not found';
  end if;

  if not exists (
    select 1
    from public.learning_parent_student_links l
    join public.learning_class_memberships cm
      on cm.organization_id = l.organization_id
     and cm.user_id = l.student_user_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where l.parent_user_id = v_parent_user_id
      and l.student_user_id = p_student_user_id
      and l.status = 'active'
  ) then
    raise exception 'You do not have an active parent link to an actively enrolled student';
  end if;

  return query
  with authorized_orgs as (
    select distinct l.organization_id
    from public.learning_parent_student_links l
    join public.learning_class_memberships cm
      on cm.organization_id = l.organization_id
     and cm.user_id = l.student_user_id
     and cm.membership_type = 'student'
     and cm.status = 'active'
    where l.parent_user_id = v_parent_user_id
      and l.student_user_id = p_student_user_id
      and l.status = 'active'
  ),
  recent_sessions as (
    select s.id, s.organization_id, s.attendance_date
    from public.learning_attendance_sessions s
    join authorized_orgs ao on ao.organization_id = s.organization_id
    where s.status = 'submitted'
      and exists (
        select 1
        from public.learning_attendance_records r
        where r.organization_id = s.organization_id
          and r.attendance_session_id = s.id
          and r.student_user_id = p_student_user_id
      )
    order by s.attendance_date desc, s.id
    limit greatest(1, least(coalesce(p_limit, 30), 90))
  )
  select
    count(distinct s.id)::bigint,
    count(*) filter (where r.attendance_status = 'present')::bigint,
    count(*) filter (where r.attendance_status = 'absent')::bigint,
    count(*) filter (where r.attendance_status = 'late')::bigint,
    count(*) filter (where r.attendance_status = 'excused')::bigint,
    max(s.attendance_date)
  from recent_sessions s
  join public.learning_attendance_records r
    on r.organization_id = s.organization_id
   and r.attendance_session_id = s.id
   and r.student_user_id = p_student_user_id;
end;
$function$;

revoke all on function public.get_learning_parent_attendance_summary(uuid, integer) from public, anon;
grant execute on function public.get_learning_parent_attendance_summary(uuid, integer) to authenticated;

commit;
