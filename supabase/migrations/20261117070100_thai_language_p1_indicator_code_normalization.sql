update public.learning_objectives o
set code=replace(o.code,'THAI-',''),updated_at=now()
from public.learning_topics t
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
where o.topic_id=t.id and s.code='THAI-LANGUAGE'
and o.code like 'THAI-TH_.%';