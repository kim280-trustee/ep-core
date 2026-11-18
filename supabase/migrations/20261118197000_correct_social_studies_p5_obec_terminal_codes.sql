-- Correct P5 pathway codes against the OBEC subject and history tables.
-- The P5 terminal set is 14: 10 Social Studies indicators and 4 History indicators.
with grade_rows as (
 select a.id alignment_id,o.code
 from public.learning_objective_alignments a
 join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills s on s.id=t.skill_id
 join public.learning_subjects sub on sub.id=s.subject_id
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SOCIAL-STUDIES' and g.code='P5'
),
terminal_codes(code) as (values
('SO1.1-P5-05'),('SO1.1-P5-07'),('SO1.2-P5-02'),
('SO2.1-P5-01'),('SO2.1-P5-04'),('SO2.2-P5-03'),
('SO3.1-P5-02'),('SO3.2-P5-02'),
('SO4.1-P5-01'),('SO4.1-P5-02'),('SO4.2-P5-02'),('SO4.3-P5-01'),
('SO5.2-P5-02'),('SO5.2-P5-03')
)
update public.learning_objective_alignments a
set pathway_classification=case when exists(select 1 from terminal_codes t join grade_rows r on r.code=t.code where r.alignment_id=a.id) then 'terminal' else 'between_learning' end,
updated_at=now()
where a.id in (select alignment_id from grade_rows);