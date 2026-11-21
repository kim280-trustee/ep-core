begin;
-- OBEC page 127's final W 1.1 M3/6 row is ambiguously parsed in the PDF text.
-- Keep the official indicator aligned, but do not assert a Must/Should label
-- until the source table is visually checked.
update public.learning_objective_alignments a
set indicator_classification=null,
    notes='OBEC/IPST 2021 official indicator: ว 1.1 ม.3/6. Priority classification intentionally pending visual confirmation of page 127 source table.',
    updated_at=now()
from public.learning_objectives o,public.learning_curricula c,public.learning_grade_levels g
where a.objective_id=o.id and o.code='M3-S1_1-06'
  and a.curriculum_id=c.id and c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
  and a.grade_level_id=g.id and g.curriculum_id=c.id and g.code='M3';
commit;