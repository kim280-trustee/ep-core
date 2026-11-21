-- Apply OBEC between-learning / terminal pathway labels for Social Studies M1.
-- Source: OBEC, Indicators between-learning and terminal, Social Studies,
-- Basic Education Core Curriculum B.E. 2551; grade summary confirms 45 total,
-- 27 between-learning and 18 terminal.
with terminal_codes(code) as (values
('SO1.1-M1-05'),('SO1.1-M1-08'),('SO1.1-M1-10'),
('SO1.2-M1-03'),('SO1.2-M1-04'),
('SO2.1-M1-03'),('SO2.1-M1-04'),('SO2.2-M1-03'),
('SO3.2-M1-01'),('SO3.2-M1-04'),
('SO4.1-M1-03'),('SO4.2-M1-01'),('SO4.2-M1-02'),
('SO4.3-M1-01'),('SO4.3-M1-02'),('SO4.3-M1-03'),
('SO5.2-M1-02'),('SO5.2-M1-04')
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
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SOCIAL-STUDIES' and g.code='M1'
)
update public.learning_objective_alignments a
set pathway_classification=case when exists(select 1 from terminal_codes x join grade_rows r on r.code=x.code where r.alignment_id=a.id) then 'terminal' else 'between_learning' end,
 updated_at=now()
where a.id in (select alignment_id from grade_rows);
