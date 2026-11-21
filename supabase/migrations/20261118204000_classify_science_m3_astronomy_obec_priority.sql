-- OBEC 2021 priority labels for M3 astronomy/space indicators.
-- The national core curriculum places space technology under ว 3.1.
with classification(code,value) as (values
('M3-S3_1-01','must_know'),
('M3-S3_1-02','must_know'),
('M3-S3_1-03','must_know'),
('M3-S3_1-04','should_know')
)
update public.learning_objective_alignments a
set indicator_classification=cl.value,updated_at=now()
from public.learning_curricula c,public.learning_grade_levels g,public.learning_objectives o,public.learning_topics t,public.learning_skills s,public.learning_subjects sub,classification cl
where a.curriculum_id=c.id and a.grade_level_id=g.id and g.curriculum_id=c.id and a.objective_id=o.id and o.topic_id=t.id and t.skill_id=s.id and s.subject_id=sub.id and o.code=cl.code and c.code='TH-SCI-M1-M6' and sub.code='SCI' and g.code='M3';