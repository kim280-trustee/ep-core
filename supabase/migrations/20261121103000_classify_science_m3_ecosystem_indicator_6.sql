-- Reconcile M3 ecosystem indicator ว 1.1 ม.3/6 with the OBEC 2021 source.
-- The official M3 table marks this indicator as Should-Know.
-- Apply only to the two intended Thai Science curriculum catalogues.
update public.learning_objective_alignments a
set indicator_classification = 'should_know',
    notes = 'OBEC/IPST 2021 official indicator ว 1.1 ม.3/6; classified Should-Know (✓ in Should-Know column), Science and Technology, M3 page 127. Source: https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf',
    updated_at = now()
where a.indicator_classification is null
and a.objective_id in (
  select o.id
  from public.learning_objectives o
  join public.learning_topics t on t.id = o.topic_id
  join public.learning_skills sk on sk.id = t.skill_id
  join public.learning_subjects s on s.id = sk.subject_id
  where o.code = 'M3-S1_1-06'
    and s.code = 'SCI'
)
and a.grade_level_id in (
  select id from public.learning_grade_levels where code = 'M3'
)
and a.curriculum_id in (
  select id from public.learning_curricula
  where code in ('TH-SCI-M1-M6', 'TH-BASIC-CORE-2008-2017')
);
