-- Inactive competitions are visible only to managers whose academic-management
-- permission is assigned in the requested organisation.
begin;

create or replace function public.get_learning_school_competitions(p_organization_id uuid)
returns table (
  id uuid,
  title text,
  description text,
  target_type text,
  target_value integer,
  bonus_xp integer,
  starts_at timestamptz,
  ends_at timestamptz,
  status text
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user uuid;
  v_can_manage boolean;
begin
  v_user := public.learning_current_user_id();
  if v_user is null then
    raise exception 'Sign in to view school competitions.';
  end if;

  if not public.is_organization_member(p_organization_id)
     and not exists (
       select 1
       from public.learning_class_memberships cm
       join public.learning_class_groups cg
         on cg.id = cm.class_group_id
        and cg.organization_id = cm.organization_id
       where cm.organization_id = p_organization_id
         and cm.user_id = v_user
         and cm.status = 'active'
     ) then
    raise exception 'You are not an active member of this school.';
  end if;

  v_can_manage := public.learning_can_manage_academic_records(p_organization_id);

  return query
  select c.id, c.title, c.description, c.target_type, c.target_value, c.bonus_xp,
         c.starts_at, c.ends_at, c.status
  from public.learning_school_competitions c
  where c.organization_id = p_organization_id
    and (c.status = 'active' or v_can_manage)
  order by c.starts_at desc, c.created_at desc;
end;
$function$;

revoke all on function public.get_learning_school_competitions(uuid) from public, anon;
grant execute on function public.get_learning_school_competitions(uuid) to authenticated;

commit;
