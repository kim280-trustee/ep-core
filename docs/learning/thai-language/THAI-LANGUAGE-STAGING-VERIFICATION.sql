-- Thai Language P1-M6 curriculum verification.
-- Read-only checks; no curriculum, school or learner data is modified.

with expected(grade_code,indicators,must_know,should_know) as (
 values
 ('P1',22,17,5),('P2',27,20,7),('P3',31,24,7),
 ('P4',33,26,7),('P5',33,28,5),('P6',34,28,6),
 ('M1',35,31,4),('M2',32,26,6),('M3',36,30,6),
 ('M4',36,31,5),('M5',36,31,5),('M6',36,31,5)
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
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='THAI-LANGUAGE'
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
order by case e.grade_code
 when 'P1' then 1 when 'P2' then 2 when 'P3' then 3 when 'P4' then 4
 when 'P5' then 5 when 'P6' then 6 when 'M1' then 7 when 'M2' then 8
 when 'M3' then 9 when 'M4' then 10 when 'M5' then 11 else 12 end;

-- Unique objectives, grade alignments and classification totals.
select
 count(distinct o.id)::integer unique_indicators,
 count(a.id)::integer grade_alignments,
 count(distinct o.id) filter(where a.indicator_classification='must_know')::integer must_know_objectives,
 count(distinct o.id) filter(where a.indicator_classification='should_know')::integer should_know_objectives,
 count(*) filter(where a.indicator_classification is null)::integer unclassified_alignments
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills s on s.id=t.skill_id
join public.learning_subjects sub on sub.id=s.subject_id
where c.code='TH-BASIC-CORE-2008-2017' and sub.code='THAI-LANGUAGE';

-- Shared M4-M6 objectives must each have exactly three grade alignments.
select o.code,count(distinct g.code)::integer aligned_grades,
       string_agg(distinct g.code,', ' order by g.code) grade_codes
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills s on s.id=t.skill_id
join public.learning_subjects sub on sub.id=s.subject_id
where c.code='TH-BASIC-CORE-2008-2017' and sub.code='THAI-LANGUAGE'
  and g.code in ('M4','M5','M6')
group by o.id,o.code
having count(distinct g.code)<>3;

-- Duplicate objective codes across skill strands must return zero rows.
select o.code,count(distinct s.id)::integer skill_count
from public.learning_objectives o
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills s on s.id=t.skill_id
join public.learning_subjects sub on sub.id=s.subject_id
where sub.code='THAI-LANGUAGE'
group by o.code
having count(distinct s.id)>1;
