-- Foreign Languages curriculum verification.
-- Curriculum records only; no school, class, student or assignment records are changed.

with expected(grade_code,indicators,must_know,should_know) as (
  values
    ('P1',16,9,7),('P2',16,9,7),('P3',18,13,5),
    ('P4',20,17,3),('P5',20,19,1),('P6',20,19,1),
    ('M1',20,19,1),('M2',21,19,2),('M3',21,19,2),
    ('M4',21,17,4),('M5',21,17,4),('M6',21,17,4)
), actual as (
  select g.code grade_code,
    count(distinct o.id)::integer indicators,
    count(*) filter(where a.indicator_classification='must_know')::integer must_know,
    count(*) filter(where a.indicator_classification='should_know')::integer should_know,
    count(*) filter(where a.indicator_classification is null)::integer unclassified
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills s on s.id=t.skill_id
  join public.learning_subjects sub on sub.id=s.subject_id
  where c.code='TH-BASIC-CORE-2008-2017' and sub.code='FOREIGN-LANGUAGES'
  group by g.code
)
select e.grade_code,e.indicators expected_indicators,coalesce(a.indicators,0) actual_indicators,
  e.must_know expected_must,coalesce(a.must_know,0) actual_must,
  e.should_know expected_should,coalesce(a.should_know,0) actual_should,
  coalesce(a.unclassified,0) unclassified,
  case when coalesce(a.indicators,0)=e.indicators
    and coalesce(a.must_know,0)=e.must_know
    and coalesce(a.should_know,0)=e.should_know
    and coalesce(a.unclassified,0)=0 then 'PASS' else 'CHECK' end result
from expected e left join actual a using(grade_code)
order by case when e.grade_code like 'P%' then 0 else 1 end,e.grade_code;

-- Overall unique-indicator and alignment totals.
select count(distinct a.objective_id) unique_indicators,count(a.id) grade_alignments,
  count(*) filter(where a.indicator_classification='must_know') must_alignment_rows,
  count(*) filter(where a.indicator_classification='should_know') should_alignment_rows,
  count(*) filter(where a.indicator_classification is null) unclassified_alignment_rows
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills s on s.id=t.skill_id
join public.learning_subjects sub on sub.id=s.subject_id
where c.code='TH-BASIC-CORE-2008-2017' and sub.code='FOREIGN-LANGUAGES';

-- Every shared M4-M6 objective must have all three grade alignments.
select count(*) shared_objectives,count(*) filter(where grade_count=3) complete_shared,
  count(*) filter(where grade_count<>3) missing_grade
from (
  select a.objective_id,count(distinct g.code) grade_count
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills s on s.id=t.skill_id
  join public.learning_subjects sub on sub.id=s.subject_id
  where c.code='TH-BASIC-CORE-2008-2017' and sub.code='FOREIGN-LANGUAGES'
    and g.code in ('M4','M5','M6')
  group by a.objective_id
) shared;

-- Confirm that all stored official indicator codes match standard, grade and sequence.
with codes as (
  select g.code grade,t.code standard_code,o.code objective_code,a.notes,
    row_number() over(partition by g.code,t.code order by o.sequence_no,o.code) indicator_no
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills s on s.id=t.skill_id
  join public.learning_subjects sub on sub.id=s.subject_id
  where c.code='TH-BASIC-CORE-2008-2017' and sub.code='FOREIGN-LANGUAGES'
)
select count(*) total,
  count(*) filter(where notes like '%'||standard_code||' '||
    case when grade like 'P%' then 'ป.'||substring(grade from 2)
         when grade in ('M4','M5','M6') then 'ม.4-6'
         else 'ม.'||substring(grade from 2) end||'/'||indicator_no||'%') matching_codes,
  count(*) filter(where notes not like '%'||standard_code||' '||
    case when grade like 'P%' then 'ป.'||substring(grade from 2)
         when grade in ('M4','M5','M6') then 'ม.4-6'
         else 'ม.'||substring(grade from 2) end||'/'||indicator_no||'%') mismatched_codes
from codes;

-- Confirm that no duplicate objective-to-skill assignments exist.
select count(*) duplicate_objectives
from (
  select o.id
  from public.learning_objectives o
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills s on s.id=t.skill_id
  join public.learning_subjects sub on sub.id=s.subject_id
  where sub.code='FOREIGN-LANGUAGES'
  group by o.id
  having count(distinct s.id)>1
) duplicates;

-- Confirm teacher packs have not been imported as drafts yet.
select
  (select count(distinct ci.id)
   from public.learning_content_items ci
   join public.learning_content_objectives co on co.content_item_id=ci.id
   join public.learning_objectives o on o.id=co.objective_id
   join public.learning_topics t on t.id=o.topic_id
   join public.learning_skills s on s.id=t.skill_id
   join public.learning_subjects sub on sub.id=s.subject_id
   where sub.code='FOREIGN-LANGUAGES') lesson_drafts,
  (select count(distinct q.id)
   from public.learning_questions q
   join public.learning_question_versions v on v.question_id=q.id
   join public.learning_question_objectives qo on qo.question_version_id=v.id
   join public.learning_objectives o on o.id=qo.objective_id
   join public.learning_topics t on t.id=o.topic_id
   join public.learning_skills s on s.id=t.skill_id
   join public.learning_subjects sub on sub.id=s.subject_id
   where sub.code='FOREIGN-LANGUAGES') question_drafts;
