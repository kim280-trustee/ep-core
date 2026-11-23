-- E&P Learning — read-only Science teacher-pack post-import verification
-- Run after an authorized teacher imports the Science packs as drafts.
-- Read-only: this script does not insert, update, publish or delete records.
-- Scope is restricted to lesson items tagged source=teacher_pack_import.

with pack_items as (
  select i.id, i.organization_id, i.code, i.language_code, i.status
  from public.learning_content_items i
  where i.content_type='lesson' and i.metadata->>'source'='teacher_pack_import'
),
pack_questions as (
  select q.id, q.organization_id, q.code, q.language_code, q.status
  from public.learning_questions q
  where q.code like 'EP-%'
    and exists (select 1 from pack_items i where i.organization_id=q.organization_id)
),
content_versions as (
  select v.id, v.content_item_id, v.status, v.published_at, v.body
  from public.learning_content_versions v join pack_items i on i.id=v.content_item_id
),
question_versions as (
  select v.id, v.question_id, v.published_at
  from public.learning_question_versions v join pack_questions q on q.id=v.question_id
),
question_integrity as (
  select q.id,
    count(distinct v.id) version_count,
    count(distinct k.question_version_id) answer_key_count,
    count(distinct qo.question_version_id) objective_link_count
  from pack_questions q
  left join question_versions v on v.question_id=q.id
  left join public.learning_question_evaluation_keys k on k.question_version_id=v.id
  left join public.learning_question_objectives qo on qo.question_version_id=v.id
  group by q.id
),
lesson_integrity as (
  select i.id, count(distinct v.id) version_count,
         count(distinct co.objective_id) objective_link_count
  from pack_items i
  left join content_versions v on v.content_item_id=i.id
  left join public.learning_content_objectives co on co.content_item_id=i.id
  group by i.id
),
metrics as (
  select 'lessons' metric, count(*)::bigint actual, 715::bigint expected from pack_items
  union all select 'lesson_versions',count(*),715 from content_versions
  union all select 'lesson_objective_links',count(*),715
    from public.learning_content_objectives co join pack_items i on i.id=co.content_item_id
  union all select 'questions',count(*),2145 from pack_questions
  union all select 'question_versions',count(*),2145 from question_versions
  union all select 'protected_answer_keys',count(*),2145
    from public.learning_question_evaluation_keys k join question_versions v on v.id=k.question_version_id
  union all select 'question_objective_links',count(*),2145
    from public.learning_question_objectives qo join question_versions v on v.id=qo.question_version_id
  union all select 'questions_wrong_version_count',count(*) filter(where version_count<>1),0 from question_integrity
  union all select 'questions_wrong_answer_key_count',count(*) filter(where answer_key_count<>1),0 from question_integrity
  union all select 'questions_wrong_objective_link_count',count(*) filter(where objective_link_count<>1),0 from question_integrity
  union all select 'lessons_wrong_version_count',count(*) filter(where version_count<>1),0 from lesson_integrity
  union all select 'lessons_wrong_objective_link_count',count(*) filter(where objective_link_count<>1),0 from lesson_integrity
  union all select 'published_lesson_versions',count(*) filter(where published_at is not null),0 from content_versions
  union all select 'published_question_versions',count(*) filter(where published_at is not null),0 from question_versions
)
select metric, actual, expected,
       case when actual=expected then 'PASS' else 'CHECK' end as result
from metrics
order by metric;

-- Expected final totals: 715 lesson items, versions and objective links;
-- 2,145 question items, versions, protected answer keys and objective links.
-- Every integrity-error and published-version metric must be zero.
-- Also inspect language/status distributions separately:
select 'lesson' record_type, language_code, status, count(*) record_count
from public.learning_content_items
where content_type='lesson' and metadata->>'source'='teacher_pack_import'
group by language_code,status
union all
select 'question', q.language_code, q.status, count(*)
from public.learning_questions q
where q.code like 'EP-%'
  and exists (
    select 1 from public.learning_content_items i
    where i.organization_id=q.organization_id
      and i.metadata->>'source'='teacher_pack_import'
  )
group by q.language_code,status
order by record_type,language_code,status;

-- Teacher-only guidance preservation check:
select count(*) as lessons_with_teacher_only_guidance
from public.learning_content_versions v
join public.learning_content_items i on i.id=v.content_item_id
where i.metadata->>'source'='teacher_pack_import'
  and exists (
    select 1
    from jsonb_array_elements(
      case when jsonb_typeof(v.body->'sections')='array'
           then v.body->'sections' else '[]'::jsonb end
    ) section
    where section->>'type'='teacher_only'
      and section->>'audience'='teacher'
  );
