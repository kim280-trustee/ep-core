-- Extend vocabulary entries with related forms and add school-scoped teacher analytics.
-- This depends on 20261014220000_learning_vocabulary_foundation.sql.
alter table public.learning_vocabulary_entries
  add column if not exists word_forms text[] not null default '{}'::text[],
  add column if not exists synonyms text[] not null default '{}'::text[],
  add column if not exists antonyms text[] not null default '{}'::text[];

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
declare
  v_actor_id uuid;
  v_tenant_id uuid;
  v_can_manage boolean := false;
  v_is_teacher boolean := false;
begin
  if p_organization_id is null then
    raise exception 'A school organization is required.' using errcode = '22004';
  end if;

  select u.id, u.tenant_id
    into v_actor_id, v_tenant_id
  from public.users u
  where u.auth_user_id = (select auth.uid())
  limit 1;

  if v_actor_id is null then
    raise exception 'The authenticated user could not be resolved.' using errcode = '42501';
  end if;

  select coalesce(public.has_permission('learning.academic.manage'), false)
    and exists (
      select 1
      from public.organization_memberships om
      where om.tenant_id = v_tenant_id
        and om.organization_id = p_organization_id
        and om.user_id = v_actor_id
        and om.status = 'active'
    )
    into v_can_manage;

  select exists (
    select 1
    from public.learning_class_memberships cm
    where cm.tenant_id = v_tenant_id
      and cm.organization_id = p_organization_id
      and cm.user_id = v_actor_id
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  )
  into v_is_teacher;

  if not coalesce(v_can_manage, false) and not coalesce(v_is_teacher, false) then
    raise exception 'An active teacher membership or school academic-management permission is required.' using errcode = '42501';
  end if;

  return query
  select
    e.id,
    e.word,
    e.topic,
    count(distinct p.user_id) filter (where p.review_count > 0),
    count(distinct p.user_id) filter (where p.status = 'known'),
    count(distinct p.user_id) filter (where p.status = 'learning' and p.next_review_at <= now()),
    coalesce(sum(p.review_count), 0)::bigint,
    coalesce(sum(p.correct_count), 0)::bigint,
    coalesce(sum(p.incorrect_count), 0)::bigint,
    coalesce(
      round(
        sum(p.correct_count)::numeric * 100
        / nullif(sum(p.correct_count + p.incorrect_count), 0),
        2
      ),
      0
    )::numeric
  from public.learning_vocabulary_entries e
  left join public.learning_vocabulary_progress p
    on p.tenant_id = e.tenant_id
   and p.organization_id = e.organization_id
   and p.vocabulary_entry_id = e.id
   and (
     v_can_manage
     or exists (
       select 1
       from public.learning_class_memberships teacher_membership
       join public.learning_class_memberships student_membership
         on student_membership.tenant_id = teacher_membership.tenant_id
        and student_membership.organization_id = teacher_membership.organization_id
        and student_membership.class_group_id = teacher_membership.class_group_id
        and student_membership.membership_type = 'student'
        and student_membership.status = 'active'
       where teacher_membership.tenant_id = e.tenant_id
         and teacher_membership.organization_id = e.organization_id
         and teacher_membership.user_id = v_actor_id
         and teacher_membership.membership_type = 'teacher'
         and teacher_membership.status = 'active'
         and student_membership.user_id = p.user_id
     )
   )
  where e.tenant_id = v_tenant_id
    and e.organization_id = p_organization_id
  group by e.id, e.word, e.topic
  order by e.word;
end;
$function$;

revoke all on function public.get_learning_vocabulary_analytics(uuid) from public, anon;
grant execute on function public.get_learning_vocabulary_analytics(uuid) to authenticated;
