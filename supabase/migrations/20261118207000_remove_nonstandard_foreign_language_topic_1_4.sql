-- Remove the unused non-standard Foreign Languages topic.
-- OBEC lists eight Foreign Languages standards; there is no ต 1.4 standard.
-- Guard the delete so no topic with attached objectives can be removed.
delete from public.learning_topics t
using public.learning_skills s, public.learning_subjects sub
where t.skill_id=s.id
  and s.subject_id=sub.id
  and sub.code='FOREIGN-LANGUAGES'
  and t.code='ต 1.4'
  and not exists (
    select 1 from public.learning_objectives o where o.topic_id=t.id
  );