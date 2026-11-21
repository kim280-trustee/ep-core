update public.learning_objective_alignments a
set indicator_classification = case
  when a.required then 'must_know'
  else 'should_know'
end,
updated_at = now()
from public.learning_objectives o
join public.learning_topics t on t.id = o.topic_id
join public.learning_skills sk on sk.id = t.skill_id
join public.learning_subjects s on s.id = sk.subject_id
where a.objective_id = o.id
  and s.code = 'THAI-LANGUAGE'
  and a.curriculum_id = 'a366b931-63be-49b5-8433-dbea2691a055'
  and a.indicator_classification is null;

-- Keep the legacy required flag and the explicit classification in sync for Thai-language indicators.
comment on column public.learning_objective_alignments.indicator_classification is
  'Explicit curriculum indicator class: must_know, should_know, between_learning, or terminal. For Thai-language indicators, required=true maps to must_know and required=false maps to should_know.';
