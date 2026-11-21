-- OBEC pathway classifications for Social Studies P1-P2.
-- Terminal codes are taken from the OBEC-authored indicator classification tables.
-- All remaining indicators in these two grades are between-learning indicators.
with terminal(grade_code, indicator_code) as (
  values
  ('P1','SO1.1-P1-03'),('P1','SO1.2-P1-03'),('P1','SO2.2-P1-03'),
  ('P1','SO3.1-P1-02'),('P1','SO3.1-P1-03'),('P1','SO4.2-P1-02'),
  ('P1','SO4.3-P1-03'),('P1','SO5.2-P1-01'),('P1','SO5.2-P1-03'),
  ('P2','SO1.1-P2-04'),('P2','SO1.1-P2-05'),('P2','SO1.2-P2-02'),
  ('P2','SO2.1-P2-01'),('P2','SO2.1-P2-03'),('P2','SO3.1-P2-04'),
  ('P2','SO3.2-P2-02'),('P2','SO4.2-P2-02'),('P2','SO4.3-P2-02'),
  ('P2','SO5.1-P2-01'),('P2','SO5.2-P2-03'),('P2','SO5.2-P2-04')
),
targets as (
  select a.id alignment_id, case when t.indicator_code is not null then 'terminal' else 'between_learning' end pathway
  from public.learning_objective_alignments a
  join public.learning_objectives o on o.id=a.objective_id
  join public.learning_topics tp on tp.id=o.topic_id
  join public.learning_skills sk on sk.id=tp.skill_id
  join public.learning_subjects s on s.id=sk.subject_id
  join public.learning_curricula c on c.id=a.curriculum_id
  join public.learning_grade_levels g on g.id=a.grade_level_id and g.curriculum_id=c.id
  left join terminal t on t.grade_code=g.code and t.indicator_code=o.code
  where s.code='SOCIAL-STUDIES' and c.code='TH-BASIC-CORE-2008-2017' and g.code in ('P1','P2')
)
update public.learning_objective_alignments a
set pathway_classification=targets.pathway, updated_at=now()
from targets where a.id=targets.alignment_id and a.pathway_classification is null;
