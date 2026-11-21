-- OBEC 2021 printed page 146 explicitly places ว 1.2 ม.4/11 in the Should-Know column.
-- Correct the row in both the canonical secondary catalogue and draft national master.
update public.learning_objective_alignments a
set indicator_classification = 'should_know',
    notes = concat_ws(' ', nullif(a.notes, ''),
      'Priority correction: OBEC 2021 printed page 146 explicitly classifies ว 1.2 ม.4/11 as Should-Know.')
from public.learning_objectives o
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join public.learning_grade_levels g on g.code='M4'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
where a.objective_id=o.id
  and a.grade_level_id=g.id
  and a.curriculum_id=c.id
  and s.code='SCI'
  and o.code='M4-S1_2-11'
  and a.required=true
  and a.indicator_classification='must_know';
