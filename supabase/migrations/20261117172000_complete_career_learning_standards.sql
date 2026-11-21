-- The 2017 OBEC revision retains Career standards ง 1.1 and ง 2.1.
-- Technology standards formerly grouped under Career were cancelled and moved to Science.

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select
  sk.id,
  'ง 2.1',
  'Careers and Occupational Skills',
  'Understanding careers, exploring occupational information, developing career skills and applying knowledge to employment and livelihood.',
  2,
  'active'
from public.learning_skills sk
join public.learning_subjects s on s.id = sk.subject_id
where s.code = 'CAREER'
on conflict(skill_id,code) do update
set name = excluded.name,
    description = excluded.description,
    sequence_no = excluded.sequence_no,
    status = 'active',
    updated_at = now();

update public.learning_topics
set name = 'Work and Career',
    description = 'Understanding work and applying work skills, resource management, career development and a positive attitude toward work.',
    sequence_no = 1,
    updated_at = now()
where code = 'ง 1.1'
  and skill_id = (select sk.id from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id where s.code='CAREER');
