-- Read-only coverage audit: Mathematics is currently secondary-only.
-- Run before seeding the missing primary P1-P6 catalogue.
with expected(curriculum_code,grade_code,expected_objectives) as (
  values
    ('TH-BASIC-CORE-2008-2017','P1',0),
    ('TH-BASIC-CORE-2008-2017','P2',0),
    ('TH-BASIC-CORE-2008-2017','P3',0),
    ('TH-BASIC-CORE-2008-2017','P4',0),
    ('TH-BASIC-CORE-2008-2017','P5',0),
    ('TH-BASIC-CORE-2008-2017','P6',0),
    ('TH-BASIC-CORE-2008-2017','M1',9),
    ('TH-BASIC-CORE-2008-2017','M2',12),
    ('TH-BASIC-CORE-2008-2017','M3',12),
    ('TH-BASIC-CORE-2008-2017','M4',3),
    ('TH-BASIC-CORE-2008-2017','M5',4),
    ('TH-BASIC-CORE-2008-2017','M6',1),
    ('TH-MATH-M1-M6','M1',9),
    ('TH-MATH-M1-M6','M2',12),
    ('TH-MATH-M1-M6','M3',12),
    ('TH-MATH-M1-M6','M4',3),
    ('TH-MATH-M1-M6','M5',4),
    ('TH-MATH-M1-M6','M6',1)
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
  where c.code in ('TH-BASIC-CORE-2008-2017','TH-MATH-M1-M6')
    and s.code='MATH'
  group by c.code,g.code
)
select e.curriculum_code,e.grade_code,e.expected_objectives,
       coalesce(a.required_objectives,0) actual_required_objectives,
       coalesce(a.required_alignments,0) actual_required_alignments,
       coalesce(a.must_know,0) must_know,
       coalesce(a.should_know,0) should_know,
       coalesce(a.unclassified,0) unclassified,
       case when coalesce(a.required_objectives,0)=e.expected_objectives
              and coalesce(a.required_alignments,0)=e.expected_objectives
              and coalesce(a.unclassified,0)=0
            then 'PASS' else 'CHECK' end result
from expected e
left join actual a using(curriculum_code,grade_code)
order by e.curriculum_code,
  case e.grade_code
    when 'P1' then 1 when 'P2' then 2 when 'P3' then 3
    when 'P4' then 4 when 'P5' then 5 when 'P6' then 6
    when 'M1' then 7 when 'M2' then 8 when 'M3' then 9
    when 'M4' then 10 when 'M5' then 11 else 12 end;

-- Summary: the national master has 41 secondary Mathematics objectives and
-- zero primary Mathematics objectives. The secondary-specific catalogue
-- repeats the same 41 objectives with one alignment per grade.
select c.code curriculum,
       count(distinct o.id) filter(where a.required)::integer required_objectives,
       count(distinct a.id) filter(where a.required)::integer required_alignments,
       count(distinct a.id) filter(where a.required and a.indicator_classification='must_know')::integer must_know,
       count(distinct a.id) filter(where a.required and a.indicator_classification='should_know')::integer should_know
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
where c.code in ('TH-BASIC-CORE-2008-2017','TH-MATH-M1-M6')
  and s.code='MATH'
group by c.code
order by c.code;
