-- Final read-only verification for the Thai national Science and Technology core.
-- Includes primary, lower-secondary and grade-specific M4-M6 core outcomes.
-- Specialist Biology/Chemistry/Physics/Earth-Space tracks are reported separately.
-- This script does not insert, update or delete data.

-- Core grade totals and Must/Should priority reconciliation in both catalogues.
with expected(curriculum_code,grade_code,total,must_know,stored_should,dual_count) as (
  values
    ('TH-BASIC-CORE-2008-2017','P1',15,9,6,1),
    ('TH-BASIC-CORE-2008-2017','P2',16,11,5,1),
    ('TH-BASIC-CORE-2008-2017','P3',25,19,6,1),
    ('TH-BASIC-CORE-2008-2017','P4',21,16,5,1),
    ('TH-BASIC-CORE-2008-2017','P5',32,24,8,0),
    ('TH-BASIC-CORE-2008-2017','P6',30,20,10,1),
    ('TH-BASIC-CORE-2008-2017','M1',52,35,17,0),
    ('TH-BASIC-CORE-2008-2017','M2',63,48,15,0),
    ('TH-BASIC-CORE-2008-2017','M3',59,41,18,0),
    ('TH-BASIC-CORE-2008-2017','M4',28,19,9,0),
    ('TH-BASIC-CORE-2008-2017','M5',49,42,7,0),
    ('TH-BASIC-CORE-2008-2017','M6',25,24,1,1),
    ('TH-SCI-M1-M6','M1',52,35,17,0),
    ('TH-SCI-M1-M6','M2',63,48,15,0),
    ('TH-SCI-M1-M6','M3',59,41,18,0),
    ('TH-SCI-M1-M6','M4',28,19,9,0),
    ('TH-SCI-M1-M6','M5',49,42,7,0),
    ('TH-SCI-M1-M6','M6',25,24,1,1)
),
actual as (
  select c.code curriculum_code,g.code grade_code,
         count(distinct o.id) filter(where a.required)::integer total,
         count(distinct a.id) filter(where a.required)::integer alignment_rows,
         count(distinct a.id) filter(where a.required and a.indicator_classification='must_know')::integer must_know,
         count(distinct a.id) filter(where a.required and a.indicator_classification='should_know')::integer stored_should,
         count(distinct a.id) filter(where a.required and a.notes ilike '%dual-classified%')::integer dual_count,
         count(distinct a.id) filter(where a.required and a.indicator_classification is null)::integer unclassified
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills sk on sk.id=t.skill_id
  join public.learning_subjects sub on sub.id=sk.subject_id
  where c.code in ('TH-BASIC-CORE-2008-2017','TH-SCI-M1-M6')
    and sub.code='SCI'
  group by c.code,g.code
)
select e.curriculum_code,e.grade_code,e.total expected_total,coalesce(a.total,0) actual_total,
       coalesce(a.alignment_rows,0) actual_alignment_rows,
       e.must_know expected_must,coalesce(a.must_know,0) actual_must,
       e.stored_should expected_stored_should,coalesce(a.stored_should,0) actual_stored_should,
       e.dual_count expected_dual,coalesce(a.dual_count,0) actual_dual,
       coalesce(a.unclassified,0) unclassified,
       case when coalesce(a.total,0)=e.total
              and coalesce(a.alignment_rows,0)=e.total
              and coalesce(a.must_know,0)=e.must_know
              and coalesce(a.stored_should,0)=e.stored_should
              and coalesce(a.dual_count,0)=e.dual_count
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

-- Official primary W1-W3 and W4.2 coverage by grade.
with expected(grade_code,w1_w3,w4_2,total) as (
  values
    ('P1',10,5,15),('P2',12,4,16),('P3',20,5,25),
    ('P4',16,5,21),('P5',27,5,32),('P6',26,4,30)
),
actual as (
  select g.code grade_code,
         count(distinct o.id) filter(where a.required and o.code not like '%-S4_2-%')::integer w1_w3,
         count(distinct o.id) filter(where a.required and o.code like '%-S4_2-%')::integer w4_2,
         count(distinct o.id) filter(where a.required)::integer total
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills sk on sk.id=t.skill_id
  join public.learning_subjects sub on sub.id=sk.subject_id
  where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SCI'
    and g.code in ('P1','P2','P3','P4','P5','P6')
  group by g.code
)
select e.grade_code,e.w1_w3 expected_w1_w3,coalesce(a.w1_w3,0) actual_w1_w3,
       e.w4_2 expected_w4_2,coalesce(a.w4_2,0) actual_w4_2,
       e.total expected_total,coalesce(a.total,0) actual_total,
       case when coalesce(a.w1_w3,0)=e.w1_w3 and coalesce(a.w4_2,0)=e.w4_2
              and coalesce(a.total,0)=e.total
            then 'PASS' else 'CHECK' end result
from expected e left join actual a using(grade_code)
order by e.grade_code;

-- National-master and canonical-secondary core totals.
select c.code curriculum,
       count(distinct o.id) filter(where a.required)::integer unique_required_core,
       count(distinct a.id) filter(where a.required)::integer required_core_alignments,
       count(distinct a.id) filter(where a.required and a.indicator_classification='must_know')::integer must_know,
       count(distinct a.id) filter(where a.required and a.indicator_classification='should_know')::integer stored_should,
       count(distinct a.id) filter(where a.required and a.notes ilike '%dual-classified%')::integer dual_labels,
       count(distinct a.id) filter(where a.required and a.indicator_classification is null)::integer unclassified,
       case when c.code='TH-BASIC-CORE-2008-2017'
              and count(distinct o.id) filter(where a.required)=415
              and count(distinct a.id) filter(where a.required)=415
              and count(distinct a.id) filter(where a.required and a.indicator_classification='must_know')=308
              and count(distinct a.id) filter(where a.required and a.indicator_classification='should_know')=107
              and count(distinct a.id) filter(where a.required and a.notes ilike '%dual-classified%')=6
              and count(distinct a.id) filter(where a.required and a.indicator_classification is null)=0
            then 'PASS'
            when c.code='TH-SCI-M1-M6'
              and count(distinct o.id) filter(where a.required)=276
              and count(distinct a.id) filter(where a.required)=276
              and count(distinct a.id) filter(where a.required and a.indicator_classification='must_know')=209
              and count(distinct a.id) filter(where a.required and a.indicator_classification='should_know')=67
              and count(distinct a.id) filter(where a.required and a.notes ilike '%dual-classified%')=1
              and count(distinct a.id) filter(where a.required and a.indicator_classification is null)=0
            then 'PASS' else 'CHECK' end result
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id
where sub.code='SCI'
  and c.code in ('TH-BASIC-CORE-2008-2017','TH-SCI-M1-M6')
group by c.code
order by c.code;

-- Nine legacy M3 W3.2 outcomes are preserved as supplementary, non-required records.
select c.code curriculum,count(distinct o.id)::integer legacy_supplementary_outcomes,
       count(distinct a.id) filter(where not a.required)::integer non_required_alignments
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id
where c.code in ('TH-BASIC-CORE-2008-2017','TH-SCI-M1-M6')
  and sub.code='SCI' and o.code like 'M3-S3_2-%'
group by c.code
order by c.code;

-- Separate M4-M6 specialist outcomes; these do not count toward the 415 core.
with expected(subject_code,grade_code,expected_count) as (
  values
    ('BIOLOGY','M4',32),('BIOLOGY','M5',39),('BIOLOGY','M6',37),
    ('CHEMISTRY','M4',28),('CHEMISTRY','M5',38),('CHEMISTRY','M6',15),
    ('PHYSICS','M4',17),('PHYSICS','M5',26),('PHYSICS','M6',24),
    ('EARTH_SPACE','M4',12),('EARTH_SPACE','M5',13),('EARTH_SPACE','M6',19)
),
actual as (
  select sub.code subject_code,g.code grade_code,
         count(distinct o.id) filter(where a.required)::integer actual_count
  from public.learning_objective_alignments a
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=a.curriculum_id
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills sk on sk.id=t.skill_id
  join public.learning_subjects sub on sub.id=sk.subject_id
  where c.code='TH-SCI-M1-M6'
    and sub.code in ('BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
  group by sub.code,g.code
)
select e.subject_code,e.grade_code,e.expected_count,coalesce(a.actual_count,0) actual_count,
       case when coalesce(a.actual_count,0)=e.expected_count then 'PASS' else 'CHECK' end result
from expected e left join actual a using(subject_code,grade_code)
order by e.subject_code,e.grade_code;

-- Duplicate required core alignments must be zero.
select c.code curriculum,g.code grade_code,o.code objective_code,count(a.id)::integer alignment_rows
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id
where c.code in ('TH-BASIC-CORE-2008-2017','TH-SCI-M1-M6')
  and sub.code='SCI' and a.required
group by c.code,g.code,o.code
having count(a.id)<>1
order by c.code,g.code,o.code;
