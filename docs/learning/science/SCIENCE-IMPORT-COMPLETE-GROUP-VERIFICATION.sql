-- Read-only acceptance check for all 17 imported Science packs.
-- Starts from expected lesson/question slots so missing dependent rows remain visible.
-- Expected: 2,145 QUESTION_SLOT rows and one SUMMARY row, all PASS.
with imported_lessons as (
  select distinct i.organization_id,i.id content_item_id,i.language_code,
         co.objective_id,o.code objective_code,sk.subject_id
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
expected_slots as (
  select l.organization_id,l.content_item_id,l.objective_id,l.objective_code,
         l.subject_id,l.language_code,
         'EP-' || l.objective_code || '-Q' || lpad(n.sequence_no::text,2,'0') expected_question_code
  from imported_lessons l
  cross join generate_series(1,3) as n(sequence_no)
),
slot_integrity as (
  select e.content_item_id,e.objective_id,e.objective_code,e.expected_question_code,
    e.language_code expected_language,
    count(distinct q.id)::bigint question_count,
    count(distinct q.id) filter (where q.language_code is distinct from e.language_code)::bigint wrong_language_count,
    count(distinct q.id) filter (where q.status is distinct from 'draft')::bigint non_draft_question_count,
    count(distinct qv.id)::bigint version_count,
    count(distinct k.question_version_id)::bigint answer_key_count,
    count(distinct qo.question_version_id) filter (where qo.objective_id=e.objective_id)::bigint correct_objective_link_count,
    count(distinct qo.question_version_id) filter (where qo.objective_id is distinct from e.objective_id)::bigint wrong_objective_link_count,
    count(distinct qv.id) filter (where qv.subject_id is distinct from e.subject_id)::bigint wrong_subject_version_count,
    count(distinct qv.id) filter (where not exists (
      select 1 from public.learning_objective_alignments oa
      where oa.objective_id=e.objective_id
        and oa.curriculum_id=qv.curriculum_id
        and oa.grade_level_id=qv.grade_level_id
    ))::bigint wrong_curriculum_grade_version_count
  from expected_slots e
  left join public.learning_questions q
    on q.organization_id=e.organization_id and q.code=e.expected_question_code
  left join public.learning_question_versions qv on qv.question_id=q.id
  left join public.learning_question_evaluation_keys k on k.question_version_id=qv.id
  left join public.learning_question_objectives qo on qo.question_version_id=qv.id
  group by e.content_item_id,e.objective_id,e.objective_code,e.expected_question_code,
           e.language_code,e.subject_id
),
slot_results as (
  select *,
    case
      when question_count<>1 then 'CHECK_QUESTION_COUNT'
      when wrong_language_count<>0 then 'CHECK_LANGUAGE'
      when non_draft_question_count<>0 then 'CHECK_QUESTION_STATUS'
      when version_count<>1 then 'CHECK_VERSION_COUNT'
      when answer_key_count<>1 then 'CHECK_PROTECTED_ANSWER_KEY'
      when correct_objective_link_count<>1 then 'CHECK_OBJECTIVE_LINK'
      when wrong_objective_link_count<>0 then 'CHECK_WRONG_OBJECTIVE_LINK'
      when wrong_subject_version_count<>0 then 'CHECK_SUBJECT_ALIGNMENT'
      when wrong_curriculum_grade_version_count<>0 then 'CHECK_CURRICULUM_GRADE_ALIGNMENT'
      else 'PASS'
    end result
  from slot_integrity
)
select 'QUESTION_SLOT' record_type,objective_code,expected_question_code,expected_language,
       question_count,version_count,answer_key_count,correct_objective_link_count,
       wrong_objective_link_count,wrong_subject_version_count,
       wrong_curriculum_grade_version_count,result
from slot_results
union all
select 'SUMMARY',null,null,null,
       count(*) filter (where question_count=1)::bigint,
       count(*) filter (where version_count=1)::bigint,
       count(*) filter (where answer_key_count=1)::bigint,
       count(*) filter (where correct_objective_link_count=1)::bigint,
       count(*) filter (where wrong_objective_link_count>0)::bigint,
       count(*) filter (where wrong_subject_version_count>0)::bigint,
       count(*) filter (where wrong_curriculum_grade_version_count>0)::bigint,
       case when count(*)=2145 and count(*) filter (where result='PASS')=2145 then 'PASS' else 'CHECK' end
from slot_results
order by record_type,objective_code,expected_question_code;
