-- Correct two Thai Language indicator transcriptions against OBEC's official M1 indicator reference.
begin;
update public.learning_objectives o
set name='เขียนสื่อสารโดยใช้ถ้อยคำถูกต้อง ชัดเจน เหมาะสมและสละสลวย', updated_at=now()
from public.learning_topics t
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
where o.topic_id=t.id and s.code='THAI-LANGUAGE' and t.code='TH2.1'
  and o.code='TH2.1-M1-02';
update public.learning_objectives o
set name='จำแนกและใช้สำนวนที่เป็นคำพังเพยและสุภาษิต', updated_at=now()
from public.learning_topics t
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
where o.topic_id=t.id and s.code='THAI-LANGUAGE' and t.code='TH4.1'
  and o.code='TH4.1-M1-06';
commit;