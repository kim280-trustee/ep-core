-- Official OBEC Social Studies M4-M6 shared pathway classification: 42 between-learning, 19 terminal.
-- One shared set of indicators is aligned to M4, M5 and M6.
with classification(code,kind) as (values
  ('SO1.1-M46-01','between_learning'),
  ('SO1.1-M46-02','between_learning'),
  ('SO1.1-M46-03','between_learning'),
  ('SO1.1-M46-04','between_learning'),
  ('SO1.1-M46-05','between_learning'),
  ('SO1.1-M46-06','between_learning'),
  ('SO1.1-M46-07','between_learning'),
  ('SO1.1-M46-08','between_learning'),
  ('SO1.1-M46-09','between_learning'),
  ('SO1.1-M46-10','between_learning'),
  ('SO1.1-M46-11','between_learning'),
  ('SO1.1-M46-12','between_learning'),
  ('SO1.1-M46-14','between_learning'),
  ('SO1.1-M46-15','between_learning'),
  ('SO1.1-M46-17','between_learning'),
  ('SO1.1-M46-18','between_learning'),
  ('SO1.1-M46-19','between_learning'),
  ('SO1.1-M46-20','between_learning'),
  ('SO1.1-M46-22','between_learning'),
  ('SO1.2-M46-01','between_learning'),
  ('SO1.2-M46-02','between_learning'),
  ('SO1.2-M46-03','between_learning'),
  ('SO1.2-M46-04','between_learning'),
  ('SO2.1-M46-01','between_learning'),
  ('SO2.1-M46-02','between_learning'),
  ('SO2.1-M46-04','between_learning'),
  ('SO2.2-M46-01','between_learning'),
  ('SO2.2-M46-02','between_learning'),
  ('SO3.1-M46-02','between_learning'),
  ('SO3.1-M46-04','between_learning'),
  ('SO3.2-M46-03','between_learning'),
  ('SO4.1-M46-01','between_learning'),
  ('SO4.1-M46-02','between_learning'),
  ('SO4.2-M46-01','between_learning'),
  ('SO4.2-M46-03','between_learning'),
  ('SO5.1-M46-01','between_learning'),
  ('SO5.1-M46-02','between_learning'),
  ('SO5.1-M46-03','between_learning'),
  ('SO5.2-M46-01','between_learning'),
  ('SO5.2-M46-02','between_learning'),
  ('SO5.2-M46-03','between_learning'),
  ('SO5.2-M46-04','between_learning'),
  ('SO1.1-M46-13','terminal'),
  ('SO1.1-M46-16','terminal'),
  ('SO1.1-M46-21','terminal'),
  ('SO1.2-M46-05','terminal'),
  ('SO2.1-M46-03','terminal'),
  ('SO2.1-M46-05','terminal'),
  ('SO2.2-M46-03','terminal'),
  ('SO2.2-M46-04','terminal'),
  ('SO3.1-M46-01','terminal'),
  ('SO3.1-M46-03','terminal'),
  ('SO3.2-M46-01','terminal'),
  ('SO3.2-M46-02','terminal'),
  ('SO4.2-M46-02','terminal'),
  ('SO4.2-M46-04','terminal'),
  ('SO4.3-M46-01','terminal'),
  ('SO4.3-M46-02','terminal'),
  ('SO4.3-M46-03','terminal'),
  ('SO4.3-M46-04','terminal'),
  ('SO4.3-M46-05','terminal')
)
update learning_objective_alignments a
set indicator_classification=x.kind
from learning_objectives o
join learning_topics t on t.id=o.topic_id
join learning_skills sk on sk.id=t.skill_id
join learning_subjects s on s.id=sk.subject_id
join classification x on x.code=o.code
join learning_grade_levels g on g.code in ('M4','M5','M6')
join learning_curricula c on c.id=g.curriculum_id
where a.objective_id=o.id and a.grade_level_id=g.id and a.curriculum_id=c.id
and s.code='SOCIAL-STUDIES' and c.code='TH-BASIC-CORE-2008-2017';