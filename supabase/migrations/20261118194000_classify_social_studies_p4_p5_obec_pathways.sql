-- Classify P4 and P5 Social Studies indicators using the OBEC pathway table.
-- Official totals: P4 38 (26 between, 12 terminal); P5 36 (22 between, 14 terminal).
with terminal_codes(grade,code) as (values
('P4','SO1.1-P4-04'),('P4','SO1.1-P4-05'),('P4','SO1.2-P4-03'),('P4','SO2.1-P4-05'),('P4','SO2.2-P4-01'),('P4','SO2.2-P4-03'),('P4','SO3.1-P4-03'),('P4','SO3.2-P4-01'),('P4','SO4.2-P4-01'),('P4','SO4.3-P4-01'),('P4','SO5.2-P4-01'),('P4','SO5.2-P4-03'),
('P5','SO1.1-P5-05'),('P5','SO1.1-P5-07'),('P5','SO1.2-P5-03'),('P5','SO2.1-P5-01'),('P5','SO2.1-P5-04'),('P5','SO2.2-P5-03'),('P5','SO3.1-P5-02'),('P5','SO3.2-P5-02'),('P5','SO4.2-P5-02'),('P5','SO4.3-P5-02'),('P5','SO4.3-P5-03'),('P5','SO4.3-P5-04'),('P5','SO5.2-P5-02'),('P5','SO5.2-P5-03')
),
grade_rows as (
 select a.id alignment_id,g.code grade,o.code
 from public.learning_objective_alignments a
 join public.learning_curricula c on c.id=a.curriculum_id
 join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
 join public.learning_objectives o on o.id=a.objective_id
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills s on s.id=t.skill_id
 join public.learning_subjects sub on sub.id=s.subject_id
 where c.code='TH-BASIC-CORE-2008-2017' and sub.code='SOCIAL-STUDIES' and g.code in ('P4','P5')
)
update public.learning_objective_alignments a
set pathway_classification=case when exists(select 1 from terminal_codes x join grade_rows r on r.grade=x.grade and r.code=x.code where r.alignment_id=a.id) then 'terminal' else 'between_learning' end,
updated_at=now()
where a.id in (select alignment_id from grade_rows);
