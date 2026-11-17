-- Backfill the source-specific OBEC 2021 classification for existing Social Studies
-- alignments. The legacy required flag represents must-know vs should-know for
-- the rows imported from the 2021 OBEC guidance.

update public.learning_objective_alignments a
set indicator_classification = case
  when a.required then 'must_know'
  else 'should_know'
end,
updated_at = now()
from public.learning_objectives o
join public.learning_topics t on t.id = o.topic_id
join public.learning_skills s on s.id = t.skill_id
where a.objective_id = o.id
  and s.code = 'SOCIAL-STUDIES'
  and a.indicator_classification is null;
