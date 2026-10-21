-- School-wide attendance analytics for authorized academic managers.
begin;

create or replace function public.get_learning_school_attendance_report(
  p_organization_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  class_group_id uuid,
  class_name text,
  class_code text,
  attendance_date date,
  present_count bigint,
  absent_count bigint,
  late_count bigint,
  excused_count bigint,
  marked_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if p_start_date is null or p_end_date is null or p_start_date > p_end_date then
    raise exception 'Choose a valid attendance report date range.';
  end if;

  if p_end_date - p_start_date > 365 then
    raise exception 'Attendance reports are limited to 366 calendar days.';
  end if;

  if not public.learning_can_manage_academic_records(p_organization_id) then
    raise exception 'You do not have permission to view school-wide attendance.';
  end if;

  return query
  select
    s.class_group_id,
    cg.name::text,
    cg.code::text,
    s.attendance_date,
    count(r.id) filter (where r.attendance_status = 'present')::bigint,
    count(r.id) filter (where r.attendance_status = 'absent')::bigint,
    count(r.id) filter (where r.attendance_status = 'late')::bigint,
    count(r.id) filter (where r.attendance_status = 'excused')::bigint,
    count(r.id)::bigint
  from public.learning_attendance_sessions s
  join public.learning_class_groups cg
    on cg.id = s.class_group_id
   and cg.organization_id = s.organization_id
  left join public.learning_attendance_records r
    on r.attendance_session_id = s.id
   and r.organization_id = s.organization_id
  where s.organization_id = p_organization_id
    and s.attendance_date between p_start_date and p_end_date
  group by s.class_group_id, cg.name, cg.code, s.attendance_date
  order by s.attendance_date desc, cg.name asc;
end;
$function$;

revoke all on function public.get_learning_school_attendance_report(uuid,date,date) from public, anon;
grant execute on function public.get_learning_school_attendance_report(uuid,date,date) to authenticated;

commit;
