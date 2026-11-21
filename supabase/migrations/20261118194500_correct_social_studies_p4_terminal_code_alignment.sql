-- The source indicator S 2.1 P.4/5 is represented by the fourth
-- normalized objective in this database's P4 S2.1 sequence.
update public.learning_objective_alignments a
set pathway_classification='terminal',updated_at=now()
from public.learning_curricula c, public.learning_grade_levels g, public.learning_objectives o, public.learning_topics t, public.learning_skills s, public.learning_subjects sub
where a.curriculum_id=c.id and a.grade_level_id=g.id and g.curriculum_id=c.id and a.objective_id=o.id and o.topic_id=t.id and t.skill_id=s.id and s.subject_id=sub.id
and c.code='TH-BASIC-CORE-2008-2017' and sub.code='SOCIAL-STUDIES' and g.code='P4' and o.code='SO2.1-P4-04';