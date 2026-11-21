-- Classify Social Studies P6 indicators using the OBEC pathway table.
-- Official total: 39 indicators (24 between-learning, 15 terminal).
with terminal_codes(code) as (values
('SO1.1-P6-05'),('SO1.1-P6-07'),('SO1.1-P6-08'),('SO1.1-P6-09'),
('SO1.2-P6-03'),('SO2.1-P6-04'),('SO2.2-P6-02'),
('SO3.1-P6-03'),('SO3.2-P6-01'),
('SO4.1-P6-02'),('SO4.2-P6-02'),('SO4.3-P6-01'),('SO4.3-P6-02'),
('SO5.2-P6-01'),('SO5.2-P6-03')
),
grade_rows as (
 select a.id alignment_id,o.code
 from public.learning_objective_alignments a
 join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills s on s.id=t.skill_id
 join public.learning_subjects sub on sub.id=s.subject_id
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SOCIAL-STUDIES' and g.code='P6'
)
update public.learning_objective_alignments a
set pathway_classification=case when exists(select 1 from terminal_codes x join grade_rows r on r.code=x.code where r.alignment_id=a.id) then 'terminal' else 'between_learning' end,
updated_at=now()
where a.id in (select alignment_id from grade_rows);