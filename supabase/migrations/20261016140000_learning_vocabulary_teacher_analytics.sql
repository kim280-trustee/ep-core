-- Teacher-facing aggregate vocabulary mastery. Individual student review rows remain private.
create or replace function public.get_learning_vocabulary_analytics(p_organization_id uuid)
returns table (
  vocabulary_entry_id uuid,
  word text,
  topic text,
  students_practiced bigint,
  students_known bigint,
  students_due bigint,
  review_count bigint,
  correct_count bigint,
  incorrect_count bigint,
  accuracy_percent numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if not private.can_manage_learning_vocabulary(p_organization_id) then
    raise exception 'Not authorized to view vocabulary analytics for this school'
      using errcode = '42501';
  end if;

  return query
  with eligible_progress as (
    select p.*
    from public.learning_vocabulary_progress p
    where p.organization_id = p_organization_id
      and exists (
        select 1
        from public.learning_class_memberships cm
        where cm.tenant_id = p.tenant_id
          and cm.organization_id = p.organization_id
          and cm.user_id = p.user_id
          and cm.membership_type = 'student'
          and cm.status = 'active'
      )
  ),
  entry_totals as (
    select
      ep.vocabulary_entry_id,
      count(distinct ep.user_id) as students_practiced,
      count(distinct ep.user_id) filter (where ep.status = 'known') as students_known,
      count(distinct ep.user_id) filter (where ep.next_review_at <= now()) as students_due,
      coalesce(sum(ep.review_count), 0)::bigint as review_count,
      coalesce(sum(ep.correct_count), 0)::bigint as correct_count,
      coalesce(sum(ep.incorrect_count), 0)::bigint as incorrect_count
    from eligible_progress ep
    group by ep.vocabulary_entry_id
  )
  select
    e.id,
    e.word,
    e.topic,
    coalesce(t.students_practiced, 0)::bigint,
    coalesce(t.students_known, 0)::bigint,
    coalesce(t.students_due, 0)::bigint,
    coalesce(t.review_count, 0)::bigint,
    coalesce(t.correct_count, 0)::bigint,
    coalesce(t.incorrect_count, 0)::bigint,
    case
      when coalesce(t.correct_count, 0) + coalesce(t.incorrect_count, 0) = 0 then 0::numeric
      else round(
        100.0 * coalesce(t.correct_count, 0)::numeric
        / (coalesce(t.correct_count, 0) + coalesce(t.incorrect_count, 0)),
        1
      )
    end
  from public.learning_vocabulary_entries e
  left join entry_totals t on t.vocabulary_entry_id = e.id
  where e.organization_id = p_organization_id
    and e.status = 'published'
  order by coalesce(t.students_practiced, 0) desc, e.word asc;
end;
$function$;

revoke all on function public.get_learning_vocabulary_analytics(uuid) from public, anon;
grant execute on function public.get_learning_vocabulary_analytics(uuid) to authenticated;
