-- Read-only verification for the E&P Learning Science curriculum migrations.
-- Run only AFTER the 45 Science migrations, M2/M3 strand-integrity correction,
-- M3 greenhouse-effect addition and four OBEC priority-classification migrations are applied.
-- This script does not insert, update or delete data.

with expected(subject_code, grade_code, expected_objectives) as (
  values
    ('SCI','M1',43), ('SCI','M2',48), ('SCI','M3',53),
    ('BIOLOGY','M4',32), ('BIOLOGY','M5',39), ('BIOLOGY','M6',37),
    ('CHEMISTRY','M4',28), ('CHEMISTRY','M5',38), ('CHEMISTRY','M6',15),
    ('PHYSICS','M4',17), ('PHYSICS','M5',26), ('PHYSICS','M6',24),
    ('EARTH_SPACE','M4',12), ('EARTH_SPACE','M5',13), ('EARTH_SPACE','M6',19)
),
actual as (
  select
    subject.code as subject_code,
    grade.code as grade_code,
    count(distinct objective.id)::integer as actual_objectives
  from public.learning_objectives objective
  join public.learning_topics topic on topic.id = objective.topic_id
  join public.learning_skills skill on skill.id = topic.skill_id
  join public.learning_subjects subject on subject.id = skill.subject_id
  join public.learning_objective_alignments alignment on alignment.objective_id = objective.id
  join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
  join public.learning_grade_levels grade
    on grade.id = alignment.grade_level_id
   and grade.curriculum_id = alignment.curriculum_id
  join public.learning_education_systems education_system
    on education_system.id = curriculum.education_system_id
  where curriculum.code = 'TH-SCI-M1-M6'
    and education_system.code = 'TH_BASIC'
    and subject.code in ('SCI','BIOLOGY','CHEMISTRY','PHYSICS','EARTH_SPACE')
  group by subject.code, grade.code
)
select
  expected.subject_code,
  expected.grade_code,
  expected.expected_objectives,
  coalesce(actual.actual_objectives, 0) as actual_objectives,
  case when coalesce(actual.actual_objectives, 0) = expected.expected_objectives
    then 'PASS' else 'CHECK' end as result
from expected
left join actual using (subject_code, grade_code)
order by
  case expected.subject_code
    when 'SCI' then 1 when 'BIOLOGY' then 2 when 'CHEMISTRY' then 3
    when 'PHYSICS' then 4 else 5 end,
  expected.grade_code;


-- OBEC 2021 priority-classification coverage for lower-secondary core Science.
-- M1 and M2 are complete. M3 has 44 indicators classified across biology/materials, energy/light and astronomy;
-- the nine M3 W3.2 Earth-system indicators are absent from the OBEC 2021 priority
-- table and are intentionally left unclassified rather than assigned guessed labels.
with expected(grade_code, expected_must, expected_should, expected_not_in_priority_table) as (
  values ('M1',29,14,0), ('M2',37,11,0), ('M3',33,11,9)
), actual as (
  select
    grade.code as grade_code,
    count(*) filter (where alignment.indicator_classification='must_know')::integer as must_know,
    count(*) filter (where alignment.indicator_classification='should_know')::integer as should_know,
    count(*) filter (where alignment.indicator_classification is null)::integer as not_in_priority_table
  from public.learning_objective_alignments alignment
  join public.learning_curricula curriculum on curriculum.id=alignment.curriculum_id
  join public.learning_grade_levels grade
    on grade.id=alignment.grade_level_id and grade.curriculum_id=alignment.curriculum_id
  join public.learning_objectives objective on objective.id=alignment.objective_id
  join public.learning_topics topic on topic.id=objective.topic_id
  join public.learning_skills skill on skill.id=topic.skill_id
  join public.learning_subjects subject on subject.id=skill.subject_id
  where curriculum.code='TH-SCI-M1-M6' and subject.code='SCI'
    and grade.code in ('M1','M2','M3')
  group by grade.code
)
select
  expected.grade_code,
  expected.expected_must,
  coalesce(actual.must_know,0) as actual_must,
  expected.expected_should,
  coalesce(actual.should_know,0) as actual_should,
  expected.expected_not_in_priority_table,
  coalesce(actual.not_in_priority_table,0) as actual_not_in_priority_table,
  case when coalesce(actual.must_know,0)=expected.expected_must
      and coalesce(actual.should_know,0)=expected.expected_should
      and coalesce(actual.not_in_priority_table,0)=expected.expected_not_in_priority_table
    then 'PASS' else 'CHECK' end as result
from expected left join actual using (grade_code)
order by expected.grade_code;


-- National Basic Education Core Curriculum Science cross-check.
-- M1-M3 must mirror the complete 144-indicator SCI track exactly. This catches
-- any future omission when an indicator is added to the subject-specific track.
with expected(grade_code,expected_total,expected_must,expected_should,expected_not_in_priority_table) as (
 values ('M1',43,29,14,0),('M2',48,37,11,0),('M3',53,33,11,9)
), actual as (
 select grade.code grade_code,
        count(*)::integer total,
        count(*) filter(where alignment.indicator_classification='must_know')::integer must_know,
        count(*) filter(where alignment.indicator_classification='should_know')::integer should_know,
        count(*) filter(where alignment.indicator_classification is null)::integer not_in_priority_table
 from public.learning_objective_alignments alignment
 join public.learning_curricula curriculum on curriculum.id=alignment.curriculum_id
 join public.learning_grade_levels grade on grade.id=alignment.grade_level_id and grade.curriculum_id=curriculum.id
 join public.learning_objectives objective on objective.id=alignment.objective_id
 join public.learning_topics topic on topic.id=objective.topic_id
 join public.learning_skills skill on skill.id=topic.skill_id
 join public.learning_subjects subject on subject.id=skill.subject_id
 where curriculum.code='TH-BASIC-CORE-2008-2017' and subject.code='SCI'
   and grade.code in ('M1','M2','M3')
 group by grade.code
)
select expected.grade_code,expected.expected_total,coalesce(actual.total,0) actual_total,
       expected.expected_must,coalesce(actual.must_know,0) actual_must,
       expected.expected_should,coalesce(actual.should_know,0) actual_should,
       expected.expected_not_in_priority_table,coalesce(actual.not_in_priority_table,0) actual_not_in_priority_table,
       case when coalesce(actual.total,0)=expected.expected_total
          and coalesce(actual.must_know,0)=expected.expected_must
          and coalesce(actual.should_know,0)=expected.expected_should
          and coalesce(actual.not_in_priority_table,0)=expected.expected_not_in_priority_table
         then 'PASS' else 'CHECK' end result
from expected left join actual using(grade_code)
order by expected.grade_code;

-- Current national-core gap check against OBEC's 2021 Science and Technology
-- grade totals. CHECK is expected until all W1-W4 indicators are seeded.
with expected(grade_code,expected_indicators) as (
 values ('P1',15),('P2',16),('P3',25),('P4',21),('P5',32),('P6',30),
        ('M1',52),('M2',63),('M3',59),('M4',102),('M5',102),('M6',102)
), actual as (
 select g.code grade_code,count(distinct o.id)::integer actual_indicators
 from public.learning_objective_alignments a
 join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills s on s.id=t.skill_id
 join public.learning_subjects sub on sub.id=s.subject_id
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SCI'
 group by g.code
)
select e.grade_code,e.expected_indicators,coalesce(a.actual_indicators,0) actual_indicators,
       case when coalesce(a.actual_indicators,0)=e.expected_indicators then 'PASS' else 'GAP' end result
from expected e left join actual a using(grade_code)
order by case e.grade_code
 when 'P1' then 1 when 'P2' then 2 when 'P3' then 3 when 'P4' then 4
 when 'P5' then 5 when 'P6' then 6 when 'M1' then 7 when 'M2' then 8
 when 'M3' then 9 when 'M4' then 10 when 'M5' then 11 else 12 end;

-- Completed primary W4.2 batch: verify coverage and exact OBEC 2021
-- must-know / should-know classifications, including corrected P4-P6 rows.
with expected(grade_code,total,must_know,should_know) as (
 values
 ('P1',5,4,1),('P2',4,2,2),('P3',5,4,1),
 ('P4',5,3,2),('P5',5,3,2),('P6',4,3,1)
), actual as (
 select g.code grade_code,
        count(distinct o.id)::integer total,
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
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SCI'
   and o.code ~ '^P[1-6]-S4_2-'
 group by g.code
)
select e.grade_code,e.total expected_total,coalesce(a.total,0) actual_total,
       e.must_know expected_must,coalesce(a.must_know,0) actual_must,
       e.should_know expected_should,coalesce(a.should_know,0) actual_should,
       coalesce(a.unclassified,0) unclassified,
       case when coalesce(a.total,0)=e.total
             and coalesce(a.must_know,0)=e.must_know
             and coalesce(a.should_know,0)=e.should_know
             and coalesce(a.unclassified,0)=0
         then 'PASS' else 'CHECK' end result
from expected e left join actual a using(grade_code)
order by e.grade_code;

-- Primary W1-W3 indicator coverage. The expected counts are the official
-- OBEC 2021 totals excluding the separately seeded W4.2 indicators:
-- P1 10, P2 12, P3 20, P4 16, P5 27, P6 26 (111 total).
-- All six grade totals should now PASS. This catches regressions and confirms
-- the corrective migrations have been applied to the connected staging database.
with expected(grade_code,expected_w1_w3) as (
  values ('P1',10),('P2',12),('P3',20),('P4',16),('P5',27),('P6',26)
), actual as (
  select g.code grade_code,count(distinct o.id)::integer actual_w1_w3
  from public.learning_objective_alignments a
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics t on t.id=o.topic_id
  join public.learning_skills s on s.id=t.skill_id
  join public.learning_subjects sub on sub.id=s.subject_id
  where c.code='TH-BASIC-CORE-2008-2017'
    and sub.code='SCI'
    and g.code in ('P1','P2','P3','P4','P5','P6')
    and o.code ~ '^P[1-6]-S[123]_'
  group by g.code
)
select e.grade_code,e.expected_w1_w3,coalesce(a.actual_w1_w3,0) actual_w1_w3,
       e.expected_w1_w3-coalesce(a.actual_w1_w3,0) remaining,
       case when coalesce(a.actual_w1_w3,0)=e.expected_w1_w3
         then 'PASS' else 'GAP' end result
from expected e left join actual a using(grade_code)
order by e.grade_code;

-- Primary Science priority integrity: verify 139 indicators, no unclassified
-- rows, and preserve the five source-documented dual-classification exceptions.
-- P4/P5/P6 Must-Know and Should-Know totals include the dual indicator in both
-- categories; the alignment table stores the second category in notes.
with expected(grade_code,total,dual_count,expected_must,expected_should_including_dual) as (
 values
 ('P1',15,1,null,null),('P2',16,1,null,null),('P3',25,1,null,null),
 ('P4',21,1,16,6),('P5',32,0,24,8),('P6',30,1,20,11)
), actual as (
 select g.code grade_code,
        count(distinct o.id)::integer total,
        count(distinct o.id) filter(where a.indicator_classification='must_know')::integer must_know,
        count(distinct o.id) filter(where a.indicator_classification='should_know')::integer should_know,
        count(distinct o.id) filter(where a.notes ilike '%dual%')::integer dual_count,
        count(distinct o.id) filter(where a.indicator_classification is null)::integer unclassified
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
select e.grade_code,e.total expected_total,coalesce(a.total,0) actual_total,
       e.dual_count expected_dual,coalesce(a.dual_count,0) actual_dual,
       coalesce(a.must_know,0) actual_must,coalesce(a.should_know,0) stored_should,
       coalesce(a.should_know,0)+coalesce(a.dual_count,0) should_including_dual,
       coalesce(a.unclassified,0) unclassified,
       case when coalesce(a.total,0)=e.total and coalesce(a.dual_count,0)=e.dual_count
              and coalesce(a.unclassified,0)=0
              and (e.expected_must is null or coalesce(a.must_know,0)=e.expected_must)
              and (e.expected_should_including_dual is null or coalesce(a.should_know,0)+coalesce(a.dual_count,0)=e.expected_should_including_dual)
         then 'PASS' else 'CHECK' end result
from expected e left join actual a using(grade_code)
order by e.grade_code;


-- Lower-secondary Science completion: exact grade totals and classification
-- integrity in both the canonical Science curriculum and draft national master.
-- M3's 10 unclassified rows are intentionally held pending source reconciliation.
with expected(curriculum_code,grade_code,total,must_know,should_know,unclassified) as (
 values
 ('TH-SCI-M1-M6','M1',52,35,17,0),('TH-SCI-M1-M6','M2',63,48,15,0),('TH-SCI-M1-M6','M3',59,35,14,10),
 ('TH-BASIC-CORE-2008-2017','M1',52,35,17,0),('TH-BASIC-CORE-2008-2017','M2',63,48,15,0),('TH-BASIC-CORE-2008-2017','M3',59,35,14,10)
), actual as (
 select c.code curriculum_code,g.code grade_code,
        count(distinct o.id)::integer total,
        count(distinct o.id) filter(where a.indicator_classification='must_know')::integer must_know,
        count(distinct o.id) filter(where a.indicator_classification='should_know')::integer should_know,
        count(distinct o.id) filter(where a.indicator_classification is null)::integer unclassified
 from public.learning_objective_alignments a
 join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills sk on sk.id=t.skill_id
 join public.learning_subjects sub on sub.id=sk.subject_id
 where c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
   and sub.code='SCI' and g.code in ('M1','M2','M3')
 group by c.code,g.code
)
select e.curriculum_code,e.grade_code,e.total expected_total,coalesce(a.total,0) actual_total,
       e.must_know expected_must,coalesce(a.must_know,0) actual_must,
       e.should_know expected_should,coalesce(a.should_know,0) actual_should,
       e.unclassified expected_unclassified,coalesce(a.unclassified,0) actual_unclassified,
       case when coalesce(a.total,0)=e.total
              and coalesce(a.must_know,0)=e.must_know
              and coalesce(a.should_know,0)=e.should_know
              and coalesce(a.unclassified,0)=e.unclassified
         then 'PASS' else 'CHECK' end result
from expected e left join actual a using(curriculum_code,grade_code)
order by e.curriculum_code,e.grade_code;


-- Upper-secondary core Science — M4 ecology indicators 1–4.
-- Expected once in each curriculum, M4 only, two Must-Know and two Should-Know.
with expected(code,classification) as (
 values ('M4-S1_1-01','should_know'),('M4-S1_1-02','must_know'),('M4-S1_1-03','must_know'),('M4-S1_1-04','should_know')
), actual as (
 select c.code curriculum_code,g.code grade_code,o.code,a.indicator_classification,count(*) alignment_rows
 from public.learning_objective_alignments a
 join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills sk on sk.id=t.skill_id
 join public.learning_subjects sub on sub.id=sk.subject_id
 where c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017') and sub.code='SCI' and o.code like 'M4-S1_1-%'
 group by c.code,g.code,o.code,a.indicator_classification
)
select e.code expected_objective,e.classification expected_classification,x.curriculum_code,
 coalesce(a.grade_code,'MISSING') actual_grade,a.indicator_classification actual_classification,
 coalesce(a.alignment_rows,0) alignment_rows,
 case when a.grade_code='M4' and a.indicator_classification=e.classification and a.alignment_rows=1 then 'PASS' else 'CHECK' end result
from expected e cross join (values ('TH-SCI-M1-M6'),('TH-BASIC-CORE-2008-2017')) x(curriculum_code)
left join actual a on a.curriculum_code=x.curriculum_code and a.code=e.code
order by e.code,x.curriculum_code;

-- Full M4 upper-secondary core Science check (22 unique indicators).
-- Expected distribution: W1.1=4, W1.2=12, W1.3=6; Must-Know=15, Should-Know=7.
with expected(code,classification) as (values
('M4-S1_1-01','should_know'),('M4-S1_1-02','must_know'),('M4-S1_1-03','must_know'),('M4-S1_1-04','should_know'),
('M4-S1_2-01','must_know'),('M4-S1_2-02','must_know'),('M4-S1_2-03','must_know'),('M4-S1_2-04','must_know'),('M4-S1_2-05','must_know'),('M4-S1_2-06','should_know'),('M4-S1_2-07','should_know'),('M4-S1_2-08','must_know'),('M4-S1_2-09','should_know'),('M4-S1_2-10','must_know'),('M4-S1_2-11','must_know'),('M4-S1_2-12','should_know'),
('M4-S1_3-01','must_know'),('M4-S1_3-02','must_know'),('M4-S1_3-03','must_know'),('M4-S1_3-04','should_know'),('M4-S1_3-05','must_know'),('M4-S1_3-06','must_know')
), actual as (
 select c.code curriculum_code,g.code grade_code,o.code,a.indicator_classification,count(*) alignment_rows
 from public.learning_objective_alignments a join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills sk on sk.id=t.skill_id join public.learning_subjects sub on sub.id=sk.subject_id
 where c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017') and sub.code='SCI' and o.code like 'M4-S1_%'
 group by c.code,g.code,o.code,a.indicator_classification
)
select x.curriculum_code,count(*)::integer expected_indicators,
 count(*) filter(where a.grade_code='M4' and a.alignment_rows=1 and a.indicator_classification=e.classification)::integer passing,
 count(*) filter(where e.classification='must_know' and a.grade_code='M4' and a.indicator_classification=e.classification and a.alignment_rows=1)::integer must_know,
 count(*) filter(where e.classification='should_know' and a.grade_code='M4' and a.indicator_classification=e.classification and a.alignment_rows=1)::integer should_know,
 count(*) filter(where a.grade_code is null or a.grade_code<>'M4' or a.alignment_rows<>1 or a.indicator_classification<>e.classification)::integer exceptions,
 case when count(*)=22 and count(*) filter(where a.grade_code='M4' and a.alignment_rows=1)=22
 and count(*) filter(where a.grade_code='M4' and a.indicator_classification='must_know')=15
 and count(*) filter(where a.grade_code='M4' and a.indicator_classification='should_know')=7 then 'PASS' else 'CHECK' end result
from expected e cross join (values ('TH-SCI-M1-M6'),('TH-BASIC-CORE-2008-2017')) x(curriculum_code)
left join actual a on a.curriculum_code=x.curriculum_code and a.code=e.code
group by x.curriculum_code order by x.curriculum_code;


-- M5 W2.1 complete verification: M5/1–25, including page-151 recovered indicators 11–13.
-- Expected: 25 indicators, 20 Must-Know, 5 Should-Know.
with expected(code,classification) as (values
('M5-S2_1-01','must_know'),('M5-S2_1-02','should_know'),('M5-S2_1-03','must_know'),('M5-S2_1-04','must_know'),('M5-S2_1-05','must_know'),('M5-S2_1-06','must_know'),('M5-S2_1-07','must_know'),('M5-S2_1-08','must_know'),('M5-S2_1-09','must_know'),('M5-S2_1-10','must_know'),('M5-S2_1-11','must_know'),('M5-S2_1-12','must_know'),('M5-S2_1-13','must_know'),('M5-S2_1-14','must_know'),('M5-S2_1-15','must_know'),('M5-S2_1-16','must_know'),('M5-S2_1-17','must_know'),('M5-S2_1-18','must_know'),('M5-S2_1-19','should_know'),('M5-S2_1-20','must_know'),('M5-S2_1-21','must_know'),('M5-S2_1-22','should_know'),('M5-S2_1-23','should_know'),('M5-S2_1-24','must_know'),('M5-S2_1-25','should_know')
), actual as (
 select c.code curriculum_code,g.code grade_code,o.code,a.indicator_classification,count(*) alignment_rows
 from public.learning_objective_alignments a join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills sk on sk.id=t.skill_id join public.learning_subjects sub on sub.id=sk.subject_id
 where c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017') and sub.code='SCI' and o.code like 'M5-S2_1-%'
 group by c.code,g.code,o.code,a.indicator_classification
)
select x.curriculum_code,count(*)::integer expected_indicators,
 count(*) filter(where a.grade_code='M5' and a.alignment_rows=1 and a.indicator_classification=e.classification)::integer passing,
 count(*) filter(where e.classification='must_know' and a.grade_code='M5' and a.indicator_classification=e.classification and a.alignment_rows=1)::integer must_know,
 count(*) filter(where e.classification='should_know' and a.grade_code='M5' and a.indicator_classification=e.classification and a.alignment_rows=1)::integer should_know,
 count(*) filter(where a.grade_code is null or a.grade_code<>'M5' or a.alignment_rows<>1 or a.indicator_classification<>e.classification)::integer exceptions,
 case when count(*)=25 and count(*) filter(where a.grade_code='M5' and a.alignment_rows=1)=25
 and count(*) filter(where a.grade_code='M5' and a.indicator_classification='must_know')=20
 and count(*) filter(where a.grade_code='M5' and a.indicator_classification='should_know')=5 then 'PASS' else 'CHECK' end result
from expected e cross join (values ('TH-SCI-M1-M6'),('TH-BASIC-CORE-2008-2017')) x(curriculum_code)
left join actual a on a.curriculum_code=x.curriculum_code and a.code=e.code
group by x.curriculum_code order by x.curriculum_code;
