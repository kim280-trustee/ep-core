-- Health and Physical Education curriculum verification.
-- Curriculum records only; no school, class, student or assignment records are changed.

with expected(grade_code,indicators,must_know,should_know) as (
  values
    ('P1',15,8,7),('P2',21,11,10),('P3',18,9,9),
    ('P4',19,13,6),('P5',25,12,13),('P6',22,6,16),
    ('M1',23,17,6),('M2',25,15,10),('M3',24,12,12),
    ('M4',29,12,17),('M5',29,12,17),('M6',29,12,17)
), actual as (
  select
    g.code grade_code,
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
  where c.code='TH-BASIC-CORE-2008-2017' and sub.code='HEALTH-PE'
  group by g.code
)
select
  e.grade_code,e.indicators expected_indicators,coalesce(a.indicators,0) actual_indicators,
  e.must_know expected_must,coalesce(a.must_know,0) actual_must,
  e.should_know expected_should,coalesce(a.should_know,0) actual_should,
  coalesce(a.unclassified,0) unclassified,
  case when coalesce(a.indicators,0)=e.indicators
      and coalesce(a.must_know,0)=e.must_know
      and coalesce(a.should_know,0)=e.should_know
      and coalesce(a.unclassified,0)=0
    then 'PASS' else 'CHECK' end result
from expected e left join actual a using(grade_code)
order by case when e.grade_code like 'P%' then 0 else 1 end,e.grade_code;

-- Overall unique-objective and alignment totals.
select
  count(distinct a.objective_id) unique_objectives,
  count(a.id) grade_alignments,
  count(*) filter(where a.indicator_classification='must_know') must_know_alignment_rows,
  count(*) filter(where a.indicator_classification='should_know') should_know_alignment_rows,
  count(*) filter(where a.indicator_classification is null) unclassified_alignment_rows
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills s on s.id=t.skill_id
join public.learning_subjects sub on sub.id=s.subject_id
where c.code='TH-BASIC-CORE-2008-2017' and sub.code='HEALTH-PE';

-- Every shared M4-M6 objective must have all three grade alignments.
select count(*) shared_objectives_missing_grade_alignment
from (
  select a.objective_id,count(distinct g.code) grade_count
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills s on s.id=t.skill_id
  join public.learning_subjects sub on sub.id=s.subject_id
  where c.code='TH-BASIC-CORE-2008-2017' and sub.code='HEALTH-PE'
    and g.code in ('M4','M5','M6')
  group by a.objective_id
) shared
where grade_count<>3;

-- Confirm teacher packs have not been imported as drafts yet.
select
  (select count(distinct ci.id)
   from public.learning_content_items ci
   join public.learning_content_objectives co on co.content_item_id=ci.id
   join public.learning_objectives o on o.id=co.objective_id
   join public.learning_topics t on t.id=o.topic_id
   join public.learning_skills s on s.id=t.skill_id
   join public.learning_subjects sub on sub.id=s.subject_id
   where sub.code='HEALTH-PE') hpe_lesson_drafts,
  (select count(distinct q.id)
   from public.learning_questions q
   join public.learning_question_versions v on v.question_id=q.id
   join public.learning_question_objectives qo on qo.question_version_id=v.id
   join public.learning_objectives o on o.id=qo.objective_id
   join public.learning_topics t on t.id=o.topic_id
   join public.learning_skills s on s.id=t.skill_id
   join public.learning_subjects sub on sub.id=s.subject_id
   where sub.code='HEALTH-PE') hpe_question_drafts;
