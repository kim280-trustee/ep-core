-- Read-only post-seed verification for primary Mathematics P1-P6.
-- Expected totals are sourced from OBEC's 2021 Must-Know / Should-Know summary,
-- with official indicator numbering cross-walked to the 2017 revised standards.
-- This script does not modify curriculum, school, class or learner data.

with expected(curriculum_code,grade_code,total,must_know,should_know) as (
  values
    ('TH-BASIC-CORE-2008-2017','P1',10,6,4),
    ('TH-BASIC-CORE-2008-2017','P2',16,13,3),
    ('TH-BASIC-CORE-2008-2017','P3',28,22,6),
    ('TH-BASIC-CORE-2008-2017','P4',22,15,7),
    ('TH-BASIC-CORE-2008-2017','P5',19,11,8),
    ('TH-BASIC-CORE-2008-2017','P6',21,15,6),
    ('TH-MATH-P1-P6','P1',10,6,4),
    ('TH-MATH-P1-P6','P2',16,13,3),
    ('TH-MATH-P1-P6','P3',28,22,6),
    ('TH-MATH-P1-P6','P4',22,15,7),
    ('TH-MATH-P1-P6','P5',19,11,8),
    ('TH-MATH-P1-P6','P6',21,15,6)
),
actual as (
  select c.code curriculum_code,g.code grade_code,
         count(distinct o.id) filter(where a.required)::integer required_objectives,
         count(distinct a.id) filter(where a.required)::integer required_alignments,
         count(distinct a.id) filter(where a.required and a.indicator_classification='must_know')::integer must_know,
         count(distinct a.id) filter(where a.required and a.indicator_classification='should_know')::integer should_know,
         count(distinct a.id) filter(where a.required and a.indicator_classification is null)::integer unclassified
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills sk on sk.id=t.skill_id
  join public.learning_subjects s on s.id=sk.subject_id
  where c.code in ('TH-BASIC-CORE-2008-2017','TH-MATH-P1-P6')
    and s.code='MATH'
    and g.code in ('P1','P2','P3','P4','P5','P6')
  group by c.code,g.code
)
select e.curriculum_code,e.grade_code,e.total expected_objectives,
       coalesce(a.required_objectives,0) actual_objectives,
       coalesce(a.required_alignments,0) actual_required_alignments,
       e.must_know expected_must,coalesce(a.must_know,0) actual_must,
       e.should_know expected_should,coalesce(a.should_know,0) actual_should,
       coalesce(a.unclassified,0) unclassified,
       case when coalesce(a.required_objectives,0)=e.total
              and coalesce(a.required_alignments,0)=e.total
              and coalesce(a.must_know,0)=e.must_know
              and coalesce(a.should_know,0)=e.should_know
              and coalesce(a.unclassified,0)=0
            then 'PASS' else 'CHECK' end result
from expected e
left join actual a using(curriculum_code,grade_code)
order by e.curriculum_code,
  case e.grade_code when 'P1' then 1 when 'P2' then 2 when 'P3' then 3
                    when 'P4' then 4 when 'P5' then 5 else 6 end;

-- Confirm 116 unique primary objective codes and 116 alignments in each catalogue.
select c.code curriculum_code,count(distinct o.id)::integer unique_objectives,
       count(distinct a.id) filter(where a.required)::integer required_alignments,
       count(distinct o.id) filter(where a.required and a.indicator_classification='must_know')::integer must_know,
       count(distinct o.id) filter(where a.required and a.indicator_classification='should_know')::integer should_know,
       count(distinct o.id) filter(where a.required and a.indicator_classification is null)::integer unclassified
from public.learning_curricula c
join public.learning_objective_alignments a on a.curriculum_id=c.id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join public.learning_grade_levels g on g.id=a.grade_level_id
where c.code in ('TH-BASIC-CORE-2008-2017','TH-MATH-P1-P6')
  and s.code='MATH' and g.code in ('P1','P2','P3','P4','P5','P6')
group by c.code order by c.code;

-- Check that official codes remain unique within each catalogue.
with official_codes as (
  select c.code curriculum_code,o.code objective_code,
         substring(a.notes from 'Official indicator (ค [0-9]\.[0-9] ป\.[1-6]/[0-9]+)') official_indicator
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills sk on sk.id=t.skill_id
  join public.learning_subjects s on s.id=sk.subject_id
  where c.code in ('TH-BASIC-CORE-2008-2017','TH-MATH-P1-P6')
    and s.code='MATH'
)
select curriculum_code,official_indicator,count(*)::integer occurrences
from official_codes
where official_indicator is not null
group by curriculum_code,official_indicator
having count(*)>1
order by curriculum_code,official_indicator;

-- Explicitly verify the P3 money indicator uses the corrected 2017 code ค 2.1 ป.3/1.
select c.code curriculum_code,o.code objective_code,a.notes
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join public.learning_grade_levels g on g.id=a.grade_level_id
where c.code in ('TH-BASIC-CORE-2008-2017','TH-MATH-P1-P6')
  and s.code='MATH' and g.code='P3' and o.code='P3-K2_1-01'
order by c.code;
