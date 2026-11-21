-- OBEC 2021 must-know / should-know classification for M3 energy,
-- electricity, waves and light indicators (ว 2.3 ม.3/1-21).
with classification(code,value) as (values
('M3-S2_3-01','must_know'),('M3-S2_3-02','must_know'),('M3-S2_3-03','must_know'),('M3-S2_3-04','must_know'),('M3-S2_3-05','must_know'),
('M3-S2_3-06','should_know'),('M3-S2_3-07','should_know'),
('M3-S2_3-08','must_know'),('M3-S2_3-09','must_know'),('M3-S2_3-10','must_know'),('M3-S2_3-11','must_know'),('M3-S2_3-12','must_know'),('M3-S2_3-13','must_know'),('M3-S2_3-14','must_know'),('M3-S2_3-15','must_know'),('M3-S2_3-16','must_know'),('M3-S2_3-17','must_know'),('M3-S2_3-18','must_know'),
('M3-S2_3-19','should_know'),('M3-S2_3-20','should_know'),('M3-S2_3-21','should_know')
)
update public.learning_objective_alignments a
set indicator_classification=cl.value,updated_at=now()
from public.learning_curricula c,public.learning_grade_levels g,public.learning_objectives o,public.learning_topics t,public.learning_skills s,public.learning_subjects sub,classification cl
where a.curriculum_id=c.id and a.grade_level_id=g.id and g.curriculum_id=c.id and a.objective_id=o.id and o.topic_id=t.id and t.skill_id=s.id and s.subject_id=sub.id and o.code=cl.code and c.code='TH-SCI-M1-M6' and sub.code='SCI' and g.code='M3';