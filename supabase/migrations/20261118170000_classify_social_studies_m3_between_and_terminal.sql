-- Official OBEC Social Studies M3 pathway classification (33 between-learning, 17 terminal).
-- Source: OBEC indicator pathway table, Social Studies, M3 (see curriculum audit).
with classification(code,kind) as (values
  ('SO1.1-M3-01','between_learning'),
  ('SO1.1-M3-02','between_learning'),
  ('SO1.1-M3-04','between_learning'),
  ('SO1.1-M3-05','between_learning'),
  ('SO1.1-M3-06','between_learning'),
  ('SO1.1-M3-08','between_learning'),
  ('SO1.1-M3-09','between_learning'),
  ('SO1.2-M3-01','between_learning'),
  ('SO1.2-M3-02','between_learning'),
  ('SO1.2-M3-04','between_learning'),
  ('SO1.2-M3-05','between_learning'),
  ('SO1.2-M3-06','between_learning'),
  ('SO2.1-M3-01','between_learning'),
  ('SO2.1-M3-02','between_learning'),
  ('SO2.1-M3-03','between_learning'),
  ('SO2.1-M3-04','between_learning'),
  ('SO2.2-M3-02','between_learning'),
  ('SO2.2-M3-03','between_learning'),
  ('SO3.1-M3-01','between_learning'),
  ('SO3.1-M3-03','between_learning'),
  ('SO3.2-M3-01','between_learning'),
  ('SO3.2-M3-04','between_learning'),
  ('SO3.2-M3-05','between_learning'),
  ('SO3.2-M3-06','between_learning'),
  ('SO4.1-M3-01','between_learning'),
  ('SO4.1-M3-02','between_learning'),
  ('SO4.2-M3-01','between_learning'),
  ('SO4.2-M3-02','between_learning'),
  ('SO5.1-M3-01','between_learning'),
  ('SO5.1-M3-02','between_learning'),
  ('SO5.2-M3-01','between_learning'),
  ('SO5.2-M3-03','between_learning'),
  ('SO5.2-M3-05','between_learning'),
  ('SO1.1-M3-03','terminal'),
  ('SO1.1-M3-07','terminal'),
  ('SO1.1-M3-10','terminal'),
  ('SO1.2-M3-03','terminal'),
  ('SO1.2-M3-07','terminal'),
  ('SO2.1-M3-05','terminal'),
  ('SO2.2-M3-01','terminal'),
  ('SO2.2-M3-04','terminal'),
  ('SO3.1-M3-02','terminal'),
  ('SO3.2-M3-02','terminal'),
  ('SO3.2-M3-03','terminal'),
  ('SO4.3-M3-01','terminal'),
  ('SO4.3-M3-02','terminal'),
  ('SO4.3-M3-03','terminal'),
  ('SO4.3-M3-04','terminal'),
  ('SO5.2-M3-02','terminal'),
  ('SO5.2-M3-04','terminal')
)
update learning_objective_alignments a
set indicator_classification=x.kind
from learning_objectives o
join learning_topics t on t.id=o.topic_id
join learning_skills sk on sk.id=t.skill_id
join learning_subjects s on s.id=sk.subject_id
join classification x on x.code=o.code
join learning_grade_levels g on g.code='M3'
join learning_curricula c on c.id=g.curriculum_id
where a.objective_id=o.id and a.grade_level_id=g.id and a.curriculum_id=c.id
and s.code='SOCIAL-STUDIES' and c.code='TH-BASIC-CORE-2008-2017';