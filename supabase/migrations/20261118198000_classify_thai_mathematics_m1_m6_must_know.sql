-- OBEC's 2021 must-know / should-know summary classifies every
-- secondary Mathematics indicator (M1-M6) as must-know:
-- M1=9/9, M2=12/12, M3=12/12, M4-M6=8/8.
-- Apply to both the national core curriculum and the Mathematics-specific
-- curriculum catalog, which intentionally share the same 41 objectives.
update public.learning_objective_alignments a
set indicator_classification='must_know',updated_at=now()
from public.learning_curricula c,
     public.learning_objectives o,
     public.learning_topics t,
     public.learning_skills s,
     public.learning_subjects sub
where a.curriculum_id=c.id
  and a.objective_id=o.id
  and o.topic_id=t.id
  and t.skill_id=s.id
  and s.subject_id=sub.id
  and sub.code='MATH'
  and c.code in ('TH-BASIC-CORE-2008-2017','TH-MATH-M1-M6')
  and a.indicator_classification is distinct from 'must_know';