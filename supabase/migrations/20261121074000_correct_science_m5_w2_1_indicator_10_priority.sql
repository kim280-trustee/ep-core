-- Correct OBEC 2021 priority for ว 2.1 ม.5/10.
-- The official page 150 marks this indicator as Should-Know, not Must-Know.
update public.learning_objective_alignments a
set indicator_classification='should_know',
    notes='OBEC 2021 source; exact indicator ว 2.1 ม.5/10. Grade-specific M5 alignment only. Corrected to Should-Know from official page 150.',
    updated_at=now()
from public.learning_objectives o
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where a.objective_id=o.id and a.curriculum_id=c.id and a.grade_level_id=g.id
and o.code='M5-S2_1-10' and s.code='SCI';