-- E&P Learning — read-only Science teacher-pack post-import verification
-- Run after the 17 Science packs are imported as drafts, before teachers create new versions.
-- Read-only: no inserts, updates, deletes, publication or RLS bypass.
-- Counts only imported Science lessons and their matching generated question codes.

with pack_items as (
  select distinct i.id, i.organization_id, i.code, i.language_code, i.status
  from public.learning_content_items i
  join public.learning_content_objectives co on co.content_item_id=i.id
  join public.learning_objectives o on o.id=co.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills sk on sk.id=t.skill_id
  join public.learning_subjects sub on sub.id=sk.subject_id
  where i.content_type='lesson'
    and i.metadata->>'source'='teacher_pack_import'
    and sub.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
),
pack_objectives as (
  select distinct i.organization_id,co.objective_id
  from pack_items i
  join public.learning_content_objectives co on co.content_item_id=i.id
),
pack_questions as (
  select distinct q.id,q.organization_id,q.code,q.language_code,q.status,
         qv.grade_level_id,qv.curriculum_id,qv.subject_id,qo.objective_id
  from public.learning_questions q
  join public.learning_question_versions qv on qv.question_id=q.id
  join public.learning_question_objectives qo on qo.question_version_id=qv.id
  join pack_objectives po
    on po.objective_id=qo.objective_id
   and po.organization_id=q.organization_id
  join public.learning_objectives o on o.id=qo.objective_id
  where left(q.code,length('EP-' || o.code))='EP-' || o.code
    and right(q.code,3) similar to 'Q[0-9][0-9]'
),
content_versions as (
  select v.id,v.content_item_id,v.published_at
  from public.learning_content_versions v
  join pack_items i on i.id=v.content_item_id
),
question_versions as (
  select v.id,v.question_id,v.published_at
  from public.learning_question_versions v
  join pack_questions q on q.id=v.question_id
),
question_objective_counts as (
  select objective_id,grade_level_id,count(distinct id) question_count
  from pack_questions
  group by objective_id,grade_level_id
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
  select i.id,count(distinct v.id) version_count,
         count(distinct co.objective_id) objective_link_count
  from pack_items i
  left join content_versions v on v.content_item_id=i.id
  left join public.learning_content_objectives co on co.content_item_id=i.id
  group by i.id
),
metrics as (
  select 'lessons' metric,count(*)::bigint actual,715::bigint expected from pack_items
  union all select 'lesson_versions',count(*),715 from content_versions
  union all select 'lesson_objective_links',count(*),715
    from public.learning_content_objectives co join pack_items i on i.id=co.content_item_id
  union all select 'questions',count(*),2145 from pack_questions
  union all select 'question_versions',count(*),2145 from question_versions
  union all select 'protected_answer_keys',count(*),2145
    from public.learning_question_evaluation_keys k join question_versions v on v.id=k.question_version_id
  union all select 'question_objective_links',count(*),2145
    from public.learning_question_objectives qo join question_versions v on v.id=qo.question_version_id
  union all select 'objective_grade_pairs_not_three_questions',count(*)::bigint,0
    from question_objective_counts where question_count<>3
  union all select 'questions_wrong_curriculum_grade_alignment',count(distinct q.id)::bigint,0
    from pack_questions q
    left join public.learning_objective_alignments oa
      on oa.objective_id=q.objective_id
     and oa.curriculum_id=q.curriculum_id
     and oa.grade_level_id=q.grade_level_id
    where oa.id is null
  union all select 'questions_wrong_subject_alignment',count(distinct q.id)::bigint,0
    from pack_questions q
    join public.learning_objectives o on o.id=q.objective_id
    join public.learning_topics t on t.id=o.topic_id
    join public.learning_skills sk on sk.id=t.skill_id
    where q.subject_id is distinct from sk.subject_id
  union all select 'questions_wrong_version_count',count(*) filter(where version_count<>1),0 from question_integrity
  union all select 'questions_wrong_answer_key_count',count(*) filter(where answer_key_count<>1),0 from question_integrity
  union all select 'questions_wrong_objective_link_count',count(*) filter(where objective_link_count<>1),0 from question_integrity
  union all select 'lessons_wrong_version_count',count(*) filter(where version_count<>1),0 from lesson_integrity
  union all select 'lessons_wrong_objective_link_count',count(*) filter(where objective_link_count<>1),0 from lesson_integrity
  union all select 'duplicate_lesson_codes',count(*)::bigint,0
    from (select organization_id,code from pack_items group by organization_id,code having count(*)>1) d
  union all select 'duplicate_question_codes',count(*)::bigint,0
    from (select organization_id,code from pack_questions group by organization_id,code having count(*)>1) d
  union all select 'published_lesson_versions',count(*) filter(where published_at is not null),0 from content_versions
  union all select 'published_question_versions',count(*) filter(where published_at is not null),0 from question_versions
)
select metric,actual,expected,
       case when actual=expected then 'PASS' else 'CHECK' end result
from metrics
order by metric;

-- Language and draft-state distribution. Expected: 139 Thai + 576 English lessons;
-- 417 Thai + 1,728 English questions. No imported item should be published.
with pack_items as (
  select distinct i.id,i.organization_id,i.language_code,i.status
  from public.learning_content_items i
  join public.learning_content_objectives co on co.content_item_id=i.id
  join public.learning_objectives o on o.id=co.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills sk on sk.id=t.skill_id
  join public.learning_subjects sub on sub.id=sk.subject_id
  where i.content_type='lesson'
    and i.metadata->>'source'='teacher_pack_import'
    and sub.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
),
pack_questions as (
  select distinct q.id,q.organization_id,q.language_code,q.status
  from public.learning_questions q
  join public.learning_question_versions qv on qv.question_id=q.id
  join public.learning_question_objectives qo on qo.question_version_id=qv.id
  join public.learning_objectives o on o.id=qo.objective_id
  join public.learning_content_objectives co on co.objective_id=o.id
  join public.learning_content_items i
    on i.id=co.content_item_id and i.organization_id=q.organization_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills sk on sk.id=t.skill_id
  join public.learning_subjects sub on sub.id=sk.subject_id
  where i.content_type='lesson'
    and i.metadata->>'source'='teacher_pack_import'
    and sub.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
    and left(q.code,length('EP-' || o.code))='EP-' || o.code
    and right(q.code,3) similar to 'Q[0-9][0-9]'
),
expected(record_type,language_code,status,expected_count) as (
  values
    ('lesson','th','draft',139::bigint),
    ('lesson','en','draft',576::bigint),
    ('question','th','draft',417::bigint),
    ('question','en','draft',1728::bigint)
),
actual as (
  select 'lesson'::text record_type,language_code,status,count(*)::bigint actual_count
  from pack_items group by language_code,status
  union all
  select 'question',language_code,status,count(*)::bigint
  from pack_questions group by language_code,status
)
select e.record_type,e.language_code,e.status,e.expected_count,
       coalesce(a.actual_count,0) actual_count,
       case when coalesce(a.actual_count,0)=e.expected_count then 'PASS' else 'CHECK' end result
from expected e
left join actual a using(record_type,language_code,status)
order by e.record_type,e.language_code;

-- Count primary Thai Science drafts that retained their teacher-only marking guides.
-- All 139 primary lessons must retain at least one teacher-only section.
with guidance as (
  select count(distinct i.id)::bigint lessons_with_teacher_only_guidance
  from public.learning_content_versions v
  join public.learning_content_items i on i.id=v.content_item_id
  where i.content_type='lesson'
    and i.language_code='th'
    and i.metadata->>'source'='teacher_pack_import'
    and exists (
    select 1
    from public.learning_content_objectives co
    join public.learning_objectives o on o.id=co.objective_id
    join public.learning_topics t on t.id=o.topic_id
    join public.learning_skills sk on sk.id=t.skill_id
    join public.learning_subjects sub on sub.id=sk.subject_id
    where co.content_item_id=i.id
      and sub.code='SCI'
  )
  and exists (
    select 1
    from jsonb_array_elements(
      case when jsonb_typeof(v.body->'sections')='array'
           then v.body->'sections' else '[]'::jsonb end
    ) as sections(section)
    where section->>'type'='teacher_only'
      and section->>'audience'='teacher'
  )
)
select lessons_with_teacher_only_guidance,139::bigint expected,
       case when lessons_with_teacher_only_guidance=139 then 'PASS' else 'CHECK' end result
from guidance;
