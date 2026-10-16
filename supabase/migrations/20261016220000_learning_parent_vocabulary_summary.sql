-- Return vocabulary progress aggregates only to a parent linked to the requested student.
begin;

create or replace function public.get_learning_parent_vocabulary_summary(p_student_user_id uuid)
returns table (
  organization_id uuid,
  vocabulary_count bigint,
  practiced_count bigint,
  known_count bigint,
  due_count bigint,
  review_attempts bigint,
  correct_answers bigint,
  answered_count bigint,
  accuracy_percent numeric
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
    where l.parent_user_id = v_parent_user_id
      and l.student_user_id = p_student_user_id
      and l.status = 'active'
  ) then
    raise exception 'You do not have an active parent link to this student';
  end if;

  return query
  select
    e.organization_id,
    count(e.id)::bigint as vocabulary_count,
    count(e.id) filter (where p.review_count > 0)::bigint as practiced_count,
    count(e.id) filter (where p.status = 'known')::bigint as known_count,
    count(e.id) filter (where p.id is null or p.next_review_at <= now())::bigint as due_count,
    coalesce(sum(p.review_count), 0)::bigint as review_attempts,
    coalesce(sum(p.correct_count), 0)::bigint as correct_answers,
    coalesce(sum(p.correct_count + p.incorrect_count), 0)::bigint as answered_count,
    case
      when coalesce(sum(p.correct_count + p.incorrect_count), 0) = 0 then null
      else round(
        100.0 * sum(p.correct_count)::numeric
        / nullif(sum(p.correct_count + p.incorrect_count), 0),
        1
      )
    end as accuracy_percent
  from public.learning_vocabulary_entries e
  left join public.learning_vocabulary_progress p
    on p.organization_id = e.organization_id
   and p.vocabulary_entry_id = e.id
   and p.user_id = p_student_user_id
  where e.status = 'published'
    and exists (
      select 1
      from public.learning_parent_student_links l
      where l.organization_id = e.organization_id
        and l.parent_user_id = v_parent_user_id
        and l.student_user_id = p_student_user_id
        and l.status = 'active'
    )
  group by e.organization_id
  order by e.organization_id;
end;
$function$;

revoke all on function public.get_learning_parent_vocabulary_summary(uuid) from public, anon;
grant execute on function public.get_learning_parent_vocabulary_summary(uuid) to authenticated;

commit;
