-- Read-only verification for the complete Thai national curriculum rollout.
-- This script reports coverage only; it does not insert, update or delete data.

-- 2008/2017 national master: all eight learning areas.
with expected(subject_code, expected_unique, expected_alignments) as (
  values
    ('THAI-LANGUAGE',319,391),
    ('MATH',41,41),
    ('SCI',415,415),
    ('SOCIAL-STUDIES',418,540),
    ('HEALTH-PE',221,279),
    ('ARTS',279,357),
    ('CAREER',54,76),
    ('FOREIGN-LANGUAGES',193,235)
),
actual as (
  select sub.code subject_code,
         count(distinct o.id) filter(where a.required)::integer unique_objectives,
         count(distinct a.id) filter(where a.required)::integer grade_alignments,
         count(distinct a.id) filter(where a.required and a.indicator_classification is null and a.pathway_classification is null)::integer unclassified_alignments,
         count(distinct o.id) filter(where a.required and sub.code='SOCIAL-STUDIES' and a.pathway_classification='between_learning')::integer between_learning,
         count(distinct o.id) filter(where a.required and sub.code='SOCIAL-STUDIES' and a.pathway_classification='terminal')::integer terminal
  from public.learning_subjects sub
  join public.learning_skills sk on sk.subject_id=sub.id
  join public.learning_topics t on t.skill_id=sk.id
  join public.learning_objectives o on o.topic_id=t.id
  join public.learning_objective_alignments a on a.objective_id=o.id
  join public.learning_curricula c on c.id=a.curriculum_id
  where c.code='TH-BASIC-CORE-2008-2017'
    and sub.code in ('THAI-LANGUAGE','MATH','SCI','SOCIAL-STUDIES','HEALTH-PE','ARTS','CAREER','FOREIGN-LANGUAGES')
  group by sub.code
)
select e.subject_code,e.expected_unique,coalesce(a.unique_objectives,0) actual_unique,
       e.expected_alignments,coalesce(a.grade_alignments,0) actual_alignments,
       coalesce(a.unclassified_alignments,0) unclassified_alignments,
       coalesce(a.between_learning,0) social_between_learning,
       coalesce(a.terminal,0) social_terminal,
       case when coalesce(a.unique_objectives,0)=e.expected_unique
              and coalesce(a.grade_alignments,0)=e.expected_alignments
              and coalesce(a.unclassified_alignments,0)=0
              and (e.subject_code<>'SOCIAL-STUDIES'
                   or (coalesce(a.between_learning,0)=278 and coalesce(a.terminal,0)=140))
            then 'PASS' else 'CHECK' end result
from expected e
left join actual a using(subject_code)
order by e.subject_code;

-- National-master aggregate: 1,940 unique indicators and 2,334 grade alignments.
select count(distinct o.id) filter(where a.required)::integer unique_required_indicators,
       count(distinct a.id) filter(where a.required)::integer required_grade_alignments,
       count(distinct a.id) filter(where a.required and a.indicator_classification is null and a.pathway_classification is null)::integer unclassified,
       case when count(distinct o.id) filter(where a.required)=1940
              and count(distinct a.id) filter(where a.required)=2334
              and count(distinct a.id) filter(where a.required and a.indicator_classification is null and a.pathway_classification is null)=0
            then 'PASS' else 'CHECK' end result
from public.learning_objective_alignments a
join public.learning_objectives o on o.id=a.objective_id
join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=a.curriculum_id
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id
where c.code='TH-BASIC-CORE-2008-2017'
  and a.required
  and sub.code in ('THAI-LANGUAGE','MATH','SCI','SOCIAL-STUDIES','HEALTH-PE','ARTS','CAREER','FOREIGN-LANGUAGES');

-- Mathematics-specific catalogue remains a separate 41-objective / 41-alignment view.
select c.code curriculum,count(distinct o.id) filter(where a.required)::integer unique_objectives,
       count(distinct a.id) filter(where a.required)::integer grade_alignments,
       case when count(distinct o.id) filter(where a.required)=41
              and count(distinct a.id) filter(where a.required)=41
            then 'PASS' else 'CHECK' end result
from public.learning_objective_alignments a
join public.learning_objectives o on o.id=a.objective_id
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id
where c.code='TH-MATH-M1-M6' and sub.code='MATH'
group by c.code;

-- Canonical secondary Science core: 276 required M1-M6 indicators.
select c.code curriculum,count(distinct o.id) filter(where a.required)::integer unique_indicators,
       count(distinct a.id) filter(where a.required)::integer grade_alignments,
       count(distinct a.id) filter(where a.required and a.indicator_classification is null)::integer unclassified,
       case when count(distinct o.id) filter(where a.required)=276
              and count(distinct a.id) filter(where a.required)=276
              and count(distinct a.id) filter(where a.required and a.indicator_classification is null)=0
            then 'PASS' else 'CHECK' end result
from public.learning_objective_alignments a
join public.learning_objectives o on o.id=a.objective_id
join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=a.curriculum_id
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id
where c.code='TH-SCI-M1-M6' and sub.code='SCI' and a.required
group by c.code;

-- Separate upper-secondary specialist outcomes: 300 across four subject tracks.
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

-- Separate B.E. 2568 (2025) P1-P3 competency-based curriculum.
-- Eight annual capability outcomes per grade; no Must-Know/Should-Know labels.
select c.code curriculum,c.status,
       count(distinct cs.id)::integer curriculum_subject_groups,
       count(distinct sk.id)::integer skills_including_cross_cutting_values,
       count(distinct t.id)::integer knowledge_topics,
       count(distinct o.id)::integer annual_outcomes,
       count(distinct a.id)::integer grade_alignments,
       count(distinct a.id) filter(where a.indicator_classification is not null or a.pathway_classification is not null)::integer incorrectly_classified,
       case when count(distinct sk.id)=9 and count(distinct t.id)=25
              and count(distinct o.id)=24 and count(distinct a.id)=24
              and count(distinct a.id) filter(where a.indicator_classification is not null or a.pathway_classification is not null)=0
            then 'PASS' else 'CHECK' end result
from public.learning_curricula c
left join public.learning_curriculum_subjects cs on cs.curriculum_id=c.id
left join public.learning_subjects s on s.id=cs.subject_id
left join public.learning_skills sk on sk.subject_id=s.id
left join public.learning_topics t on t.skill_id=sk.id
left join public.learning_objectives o on o.topic_id=t.id
left join public.learning_objective_alignments a on a.objective_id=o.id and a.curriculum_id=c.id
where c.code='TH-PRIMARY-2025-P1-P3'
group by c.code,c.status;

-- Each grade in the 2025 competency framework must have exactly eight outcomes.
select g.code grade_code,count(a.id)::integer annual_outcomes,
       case when count(a.id)=8 then 'PASS' else 'CHECK' end result
from public.learning_curricula c
join public.learning_grade_levels g on g.curriculum_id=c.id
left join public.learning_objective_alignments a on a.curriculum_id=c.id and a.grade_level_id=g.id
where c.code='TH-PRIMARY-2025-P1-P3'
group by g.code
order by g.code;
