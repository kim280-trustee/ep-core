-- Read-only national curriculum coverage summary.
-- Run against the connected E&P Learning Supabase project.
-- This script reports catalogue coverage; it does not mutate data.

select sub.code subject,c.code curriculum,
       count(distinct o.id)::integer unique_objectives,
       count(a.id)::integer grade_alignments,
       count(*) filter(where a.indicator_classification='must_know')::integer must_know_alignment_rows,
       count(*) filter(where a.indicator_classification='should_know')::integer should_know_alignment_rows,
       count(*) filter(where a.pathway_classification='between_learning')::integer between_learning_rows,
       count(*) filter(where a.pathway_classification='terminal')::integer terminal_rows,
       count(*) filter(where a.indicator_classification is null and a.pathway_classification is null)::integer unclassified_rows
from public.learning_subjects sub
left join public.learning_skills sk on sk.subject_id=sub.id
left join public.learning_topics t on t.skill_id=sk.id
left join public.learning_objectives o on o.topic_id=t.id
left join public.learning_objective_alignments a on a.objective_id=o.id
left join public.learning_curricula c on c.id=a.curriculum_id
where sub.code in ('THAI-LANGUAGE','MATH','SCI','SOCIAL-STUDIES','HEALTH-PE','ARTS','CAREER','FOREIGN-LANGUAGES')
group by sub.code,c.code
order by sub.code,c.code;

-- Social Studies pathway coverage must be zero-missing once grouped by grade.
select g.code grade,count(*)::integer alignments,
       count(*) filter(where a.pathway_classification='between_learning')::integer between_learning,
       count(*) filter(where a.pathway_classification='terminal')::integer terminal,
       count(*) filter(where a.pathway_classification is null)::integer missing_pathway
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id
join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
join public.learning_objectives o on o.id=a.objective_id
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id
where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SOCIAL-STUDIES'
group by g.code order by g.code;

-- Science and Technology official core totals are validated separately by
-- docs/learning/science/SCIENCE-STAGING-VERIFICATION.sql. The current core
-- catalogue is intentionally incomplete; do not interpret specialist
-- Biology/Chemistry/Physics/Earth-Space outcomes as the missing M4-M6 core.
