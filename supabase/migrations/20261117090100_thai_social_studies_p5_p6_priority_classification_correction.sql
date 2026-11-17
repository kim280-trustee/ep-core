-- Align P5/P6 priority labels with the OBEC grade summary totals.
update public.learning_objective_alignments a
set required=false,
    notes=replace(a.notes,'OBEC 2021 classification: must know','OBEC 2021 classification: should know'),
    updated_at=now()
from public.learning_objectives o, public.learning_topics t, public.learning_skills sk, public.learning_subjects s, public.learning_grade_levels gl
where a.objective_id=o.id and o.topic_id=t.id and t.skill_id=sk.id and sk.subject_id=s.id
and gl.id=a.grade_level_id and s.code='SOCIAL-STUDIES'
and ((gl.code='P5' and o.code in ('SO4.3-P5-03','SO4.3-P5-04'))
  or (gl.code='P6' and o.code='SO2.1-P6-03'));