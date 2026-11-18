-- OBEC 2021 must-know / should-know classification for the
-- M3 biological and physical-science indicator groups.
-- M3-S1_3-01..11 map to ว 1.3 ม.3/1..11.
-- M3-S2_1-01..08 map to ว 2.1 ม.3/1..8.
with classification(code,value) as (values
('M3-S1_3-01','must_know'),('M3-S1_3-02','must_know'),('M3-S1_3-03','must_know'),('M3-S1_3-04','must_know'),('M3-S1_3-05','must_know'),('M3-S1_3-06','should_know'),('M3-S1_3-07','must_know'),('M3-S1_3-08','must_know'),('M3-S1_3-09','must_know'),('M3-S1_3-10','must_know'),('M3-S1_3-11','should_know'),
('M3-S2_1-01','must_know'),('M3-S2_1-02','should_know'),('M3-S2_1-03','must_know'),('M3-S2_1-04','must_know'),('M3-S2_1-05','must_know'),('M3-S2_1-06','must_know'),('M3-S2_1-07','should_know'),('M3-S2_1-08','should_know')
)
update public.learning_objective_alignments a
set indicator_classification=cl.value,updated_at=now()
from public.learning_curricula c,public.learning_grade_levels g,public.learning_objectives o,public.learning_topics t,public.learning_skills s,public.learning_subjects sub,classification cl
where a.curriculum_id=c.id and a.grade_level_id=g.id and g.curriculum_id=c.id and a.objective_id=o.id and o.topic_id=t.id and t.skill_id=s.id and s.subject_id=sub.id and o.code=cl.code and c.code='TH-SCI-M1-M6' and sub.code='SCI' and g.code='M3';