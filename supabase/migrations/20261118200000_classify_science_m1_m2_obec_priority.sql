-- Apply the OBEC 2021 must-know / should-know classifications to
-- the verified lower-secondary core Science indicators for M1 and M2.
-- Technology (W4) is excluded.
with classification(code, value) as (values
('M1-S1_2-01','must_know'),('M1-S1_2-02','must_know'),('M1-S1_2-05','must_know'),('M1-S1_2-06','must_know'),('M1-S1_2-09','must_know'),('M1-S1_2-10','must_know'),('M1-S1_2-11','must_know'),('M1-S1_2-12','must_know'),
('M1-S2_1-01','must_know'),('M1-S2_1-02','must_know'),('M1-S2_1-04','must_know'),('M1-S2_1-05','must_know'),('M1-S2_1-06','must_know'),('M1-S2_1-07','must_know'),('M1-S2_1-08','must_know'),('M1-S2_1-09','must_know'),('M1-S2_1-10','must_know'),('M1-S2_2-01','must_know'),
('M1-S2_3-01','must_know'),('M1-S2_3-02','must_know'),('M1-S2_3-03','must_know'),('M1-S2_3-04','must_know'),('M1-S2_3-05','must_know'),('M1-S2_3-06','must_know'),('M1-S3_2-02','must_know'),('M1-S3_2-03','must_know'),('M1-S3_2-04','must_know'),('M1-S3_2-06','must_know'),('M1-S3_2-07','must_know'),
('M1-S1_2-03','should_know'),('M1-S1_2-04','should_know'),('M1-S1_2-07','should_know'),('M1-S1_2-08','should_know'),('M1-S1_2-13','should_know'),('M1-S1_2-14','should_know'),('M1-S1_2-15','should_know'),('M1-S1_2-16','should_know'),('M1-S1_2-17','should_know'),('M1-S1_2-18','should_know'),('M1-S2_1-03','should_know'),('M1-S2_3-07','should_know'),('M1-S3_2-01','should_know'),('M1-S3_2-05','should_know'),
('M2-S1_2-01','must_know'),('M2-S1_2-02','must_know'),('M2-S1_2-03','must_know'),('M2-S1_2-04','must_know'),('M2-S1_2-05','must_know'),('M2-S1_2-06','must_know'),('M2-S1_2-07','must_know'),('M2-S1_2-09','must_know'),('M2-S1_2-10','must_know'),('M2-S1_2-11','must_know'),('M2-S1_2-12','must_know'),('M2-S1_2-13','must_know'),('M2-S1_2-15','must_know'),('M2-S1_2-16','must_know'),('M2-S1_2-17','must_know'),
('M2-S2_2-01','must_know'),('M2-S2_2-03','must_know'),('M2-S2_2-04','must_know'),('M2-S2_2-06','must_know'),('M2-S2_2-07','must_know'),('M2-S2_2-08','must_know'),('M2-S2_2-09','must_know'),('M2-S2_2-10','must_know'),('M2-S2_2-14','must_know'),('M2-S2_2-15','must_know'),
('M2-S2_3-01','must_know'),('M2-S2_3-02','must_know'),('M2-S2_3-03','must_know'),('M2-S2_3-04','must_know'),('M2-S2_3-05','must_know'),
('M2-S3_2-01','must_know'),('M2-S3_2-03','must_know'),('M2-S3_2-04','must_know'),('M2-S3_2-05','must_know'),('M2-S3_2-06','must_know'),('M2-S3_2-07','must_know'),('M2-S3_2-08','must_know'),
('M2-S1_2-08','should_know'),('M2-S1_2-14','should_know'),('M2-S2_2-02','should_know'),('M2-S2_2-05','should_know'),('M2-S2_2-11','should_know'),('M2-S2_2-12','should_know'),('M2-S2_2-13','should_know'),('M2-S2_3-06','should_know'),('M2-S3_2-02','should_know'),('M2-S3_2-09','should_know'),('M2-S3_2-10','should_know')
)
update public.learning_objective_alignments a
set indicator_classification=cl.value,updated_at=now()
from public.learning_curricula c,public.learning_grade_levels g,public.learning_objectives o,public.learning_topics t,public.learning_skills s,public.learning_subjects sub,classification cl
where a.curriculum_id=c.id and a.grade_level_id=g.id and g.curriculum_id=c.id and a.objective_id=o.id and o.topic_id=t.id and t.skill_id=s.id and s.subject_id=sub.id and o.code=cl.code and c.code='TH-SCI-M1-M6' and sub.code='SCI' and g.code in ('M1','M2');