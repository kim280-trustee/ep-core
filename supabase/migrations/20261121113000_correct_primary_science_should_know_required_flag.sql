-- Should-Know is a priority classification, not an optional curriculum alignment.
-- All official OBEC 2021 primary indicators are required curriculum outcomes,
-- including the 42 Should-Know indicators across P1-P6.
update public.learning_objective_alignments a
set required=true, updated_at=now()
where a.required=false
and a.indicator_classification='should_know'
and a.grade_level_id in (
 select id from public.learning_grade_levels where code in ('P1','P2','P3','P4','P5','P6')
)
and a.curriculum_id in (
 select id from public.learning_curricula where code in ('TH-BASIC-CORE-2008-2017','TH-SCI-M1-M6')
)
and a.objective_id in (
 select o.id from public.learning_objectives o
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills sk on sk.id=t.skill_id
 join public.learning_subjects s on s.id=sk.subject_id
 where s.code='SCI'
);
