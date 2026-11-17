-- Thai Social Studies, Religion and Culture standards foundation.
-- Based on Basic Education Core Curriculum B.E.2551 (2008), standards SO1.1-SO5.2.
-- Geography indicators and curriculum details are governed by the 2017 revision.
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'SOCIAL-STUDIES','Social Studies, Religion and Culture',
 'Thai national learning area comprising religion, civics, economics, history and geography. Geography indicators follow the 2017 revision.',
 'active'
from public.learning_subjects s where s.code='SOCIAL-STUDIES'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,updated_at=now();

with standards(code,name,description,sequence_no) as (values
 ('SO1.1','Religion, Morality and Ethics','Knowledge and understanding of religion, moral principles and ethical conduct for peaceful coexistence.',1),
 ('SO1.2','Religious Practices','Understanding, awareness and personal conduct of devout believers and furtherance of one’s faith.',2),
 ('SO2.1','Civics, Culture and Living in Society','Good citizenship, rights, duties, Thai traditions and culture, and peaceful coexistence.',3),
 ('SO2.2','Political and Administrative Systems','Understanding political and administrative systems and democracy under a constitutional monarchy.',4),
 ('SO3.1','Economics and Sufficiency Economy','Resource management, production, consumption, economic decision-making and Sufficiency Economy.',5),
 ('SO3.2','Economic Systems and Cooperation','Economic systems, institutions, relationships and international economic cooperation.',6),
 ('SO4.1','Historical Time and Methodology','Historical time, periods, evidence and systematic historical methodology.',7),
 ('SO4.2','World History and Human Development','Human development, historical change, relationships and effects of important events.',8),
 ('SO4.3','Thai History and Heritage','Development of Thailand, Thai culture, wisdom and national heritage.',9),
 ('SO5.1','Physical Geography','Earth systems, physical characteristics, maps, geographical tools and spatial information.',10),
 ('SO5.2','Human-Environment Relationships','Human-environment relationships, resource conservation and sustainable development.',11)
)
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,st.code,st.name,st.description,st.sequence_no,'active'
from standards st
join public.learning_skills sk on sk.code='SOCIAL-STUDIES'
join public.learning_subjects s on s.id=sk.subject_id and s.code='SOCIAL-STUDIES'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,updated_at=now();
