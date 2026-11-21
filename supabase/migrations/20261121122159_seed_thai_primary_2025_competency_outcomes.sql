-- E&P Learning: seed the separate B.E. 2568 (2025) P1-P3 competency framework.
-- Official source: OBEC, Primary Education Curriculum B.E. 2568, for ready and
-- willing schools, printed pages 6-14, sections 6-8.
--
-- IMPORTANT MODELING RULE:
-- This curriculum is competency-based, not a replacement set of eight subjects.
-- The single "Integrated Competency Outcomes" subject is an internal navigation
-- container only. The eight official capabilities are represented as skills.
-- The 24 annual P1-P3 capability outcomes are objectives. Section 8 knowledge
-- lists are illustrative; OBEC explicitly allows schools to determine content
-- scope. Five desirable characteristics are cross-cutting, not grade indicators.
-- All identifiers below are E&P internal identifiers, not official OBEC codes.
-- Curriculum status remains draft. No school, class, student, content, or progress
-- records are created or changed.

begin;

update public.learning_curricula
set description =
  'Separate B.E. 2568 (2025) early-primary competency-based framework for Prathom 1-3, published for schools that are ready and voluntarily adopt it. Official structure: three foundational capabilities (Reading Literacy, Writing Literacy, Numeracy), five functional-literacy capabilities (Science/Environment/Technology; Society/Citizenship; Economy/Finance; Physical/Mental Health; Arts/Culture), eight annual capability outcomes per grade (24 total), and five cross-cutting desirable characteristics. Section 8 knowledge foundations are illustrative examples that schools may define and adapt. This is not the 2008/2017 eight-subject curriculum. Kept draft pending review and curriculum-level rollout.',
    updated_at = now()
where code = 'TH-PRIMARY-2025-P1-P3';

insert into public.learning_subjects (code, name, description, status)
values (
  'TH68-INTEGRATED-COMPETENCIES',
  'Integrated Competency Outcomes — Thai Primary 2025',
  'Internal navigation grouping for the B.E. 2568 competency-based P1-P3 curriculum. This is not an official OBEC subject or learning area; the eight official capabilities are represented as learning skills beneath this integrated grouping.',
  'active'
)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    status = 'active',
    updated_at = now();

insert into public.learning_curriculum_subjects
  (curriculum_id, subject_id, code, name, status)
select curriculum.id,
       subject.id,
       'TH68-INTEGRATED-COMPETENCIES',
       'Integrated Competency Outcomes (internal navigation grouping; not an official subject)',
       'active'
from public.learning_curricula curriculum
join public.learning_subjects subject
  on subject.code = 'TH68-INTEGRATED-COMPETENCIES'
where curriculum.code = 'TH-PRIMARY-2025-P1-P3'
on conflict (curriculum_id, subject_id) do update
set code = excluded.code,
    name = excluded.name,
    status = 'active',
    updated_at = now();

-- Eight annual capabilities plus one cross-cutting values container.
insert into public.learning_skills (subject_id, code, name, description, status)
select subject.id, capability.code, capability.name, capability.description, 'active'
from public.learning_subjects subject
cross join (values
  ('TH68-READ','Reading Literacy','Foundational learning capability. End-of-stage P3 outcome (official Thai): เข้าใจความหมายของคำ ข้อความ ภาพ สัญลักษณ์ แผนภูมิ แผนภาพ แผนผัง และเรื่องราวในชีวิตประจำวัน สามารถสรุปสาระสำคัญจากการอ่าน และสื่อสารได้ทั้งภาษาไทยและภาษาอังกฤษ ด้วยวิธีการต่าง ๆ อย่างเหมาะสม มีประสิทธิภาพ และรับผิดชอบ. Source: OBEC B.E. 2568, section 6.1.'),
  ('TH68-WRITE','Writing Literacy','Foundational learning capability. End-of-stage P3 outcome (official Thai): เขียนเพื่อถ่ายทอดข้อมูล ความคิด และความรู้สึก โดยใช้คำพื้นฐานและจัดเรียงเนื้อหาทั้งภาษาไทยและภาษาอังกฤษ ได้ถูกต้องตามหลักไวยากรณ์ มีความชัดเจน เหมาะสมกับสถานการณ์และกาลเทศะ. Source: OBEC B.E. 2568, section 6.1.'),
  ('TH68-NUM','Numeracy','Foundational learning capability. End-of-stage P3 outcome (official Thai): ใช้ความรู้เบื้องต้นทางคณิตศาสตร์แก้ปัญหาในชีวิตประจำวันด้วยความเชื่อมั่น รวมถึงสื่อสารด้วยภาษาและสัญลักษณ์ทางคณิตศาสตร์อย่างสมเหตุสมผล. Source: OBEC B.E. 2568, section 6.1.'),
  ('TH68-SCI-ENV-TECH','Science, Environment and Technology','Functional-literacy capability. End-of-stage P3 outcome (official Thai): รับรู้และเข้าใจปรากฏการณ์ทางธรรมชาติ สิ่งแวดล้อม และเทคโนโลยี และใช้เป็นข้อมูลประกอบการตัดสินใจในการแก้ปัญหาและสร้างสรรค์สิ่งใหม่อย่างเหมาะสม เพื่อการดำเนินชีวิตด้วยความรับผิดชอบตามบริบทและสภาพแวดล้อม. Source: OBEC B.E. 2568, section 6.2.'),
  ('TH68-SOCIETY-CITIZEN','Society and Citizenship','Functional-literacy capability. End-of-stage P3 outcome (official Thai): รับรู้และปฏิบัติตนในฐานะพลเมืองดี เห็นคุณค่าของตนเอง มีเป้าหมายในชีวิต รับผิดชอบต่อตนเอง ครอบครัว โรงเรียน ชุมชนและสังคม มีทักษะในการทำงานเป็นทีม มีส่วนร่วมในกิจกรรมทางสังคม. Source: OBEC B.E. 2568, section 6.2.'),
  ('TH68-ECON-FIN','Economy and Finance','Functional-literacy capability. End-of-stage P3 outcome (official Thai): รับรู้และเข้าใจสภาพทางเศรษฐกิจของครอบครัว เข้าใจถึงกระบวนการทำงานที่ทำให้เกิดรายได้ โดยน้อมนำหลักปรัชญาของเศรษฐกิจพอเพียงมาใช้ในการดำเนินชีวิต และมีทัศนคติที่ดีต่อการประกอบอาชีพสุจริต. Source: OBEC B.E. 2568, section 6.2.'),
  ('TH68-HEALTH','Physical and Mental Health','Functional-literacy capability. End-of-stage P3 outcome (official Thai): รับรู้และเข้าใจเกี่ยวกับการดูแลรักษาสุขภาพกายและจิต ตระหนักและเห็นความสำคัญของการปฏิบัติตนเป็นผู้มีสุขนิสัย ควบคุมอารมณ์ จัดการความเครียด และนำพาตนเองออกจากภาวะเสี่ยงหรืออันตรายรอบด้าน. Source: OBEC B.E. 2568, section 6.2.'),
  ('TH68-ARTS-CULTURE','Arts and Culture for Aesthetics','Functional-literacy capability. End-of-stage P3 outcome (official Thai): รับรู้และเห็นคุณค่าทางสุนทรียภาพของศิลปะและวัฒนธรรม เข้าร่วมกิจกรรมในท้องถิ่น และสื่อสารด้วยความภาคภูมิใจ. Source: OBEC B.E. 2568, section 6.2.'),
  ('TH68-VALUES','Desirable Characteristics','Cross-cutting characteristics from section 5.3 and 6.3, not a ninth annual capability and not a grade-coded indicator: (1) รักชาติ ศาสน์ กษัตริย์; (2) ซื่อสัตย์สุจริต; (3) มีวินัย; (4) อยู่อย่างพอเพียง; (5) มีจิตสาธารณะ. Develop through learning and school context; do not score as separate subject indicators.')
) as capability(code,name,description)
where subject.code = 'TH68-INTEGRATED-COMPETENCIES'
on conflict (subject_id, code) do update
set name = excluded.name,
    description = excluded.description,
    status = 'active',
    updated_at = now();

-- Grade-specific illustrative knowledge foundations from official section 8.
-- OBEC says schools may determine and adapt these knowledge sets to context.
insert into public.learning_topics (skill_id, code, name, description, sequence_no, status)
select skill.id, topic.code, topic.name, topic.description, topic.sequence_no, 'active'
from public.learning_skills skill
join public.learning_subjects subject on subject.id = skill.subject_id
cross join (values
  ('TH68-READ','P1-TH68-READ-KNOWLEDGE','P1 illustrative reading knowledge','Official illustrative scope: read words, texts, pictures, symbols, charts, plans, maps and short stories; listen, view and speak using everyday vocabulary of at least 600 Thai words and at least 150 English words. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 9-10.',1),
  ('TH68-READ','P2-TH68-READ-KNOWLEDGE','P2 illustrative reading knowledge','Official illustrative scope: read words, texts, pictures, symbols, charts, plans, maps and short stories; listen, view and speak using everyday vocabulary of at least 800 Thai words and at least 250 English words. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 9-10.',2),
  ('TH68-READ','P3-TH68-READ-KNOWLEDGE','P3 illustrative reading knowledge','Official illustrative scope: read words, texts, pictures, symbols, charts, plans, maps and short stories; listen, view and speak using everyday vocabulary of at least 1,200 Thai words and at least 350 English words. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 9-10.',3),

  ('TH68-WRITE','P1-TH68-WRITE-KNOWLEDGE','P1 illustrative writing knowledge','Official illustrative scope: basic declarative, question and command sentences; foundational vocabulary related to family, school and surroundings; arranging a simple sentence to communicate meaning. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 9-10.',1),
  ('TH68-WRITE','P2-TH68-WRITE-KNOWLEDGE','P2 illustrative writing knowledge','Official illustrative scope: more complex sentences using conjunctions and added details; wider vocabulary related to school subjects and daily activities; arranging ideas into paragraphs with correct punctuation. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 9-10.',2),
  ('TH68-WRITE','P3-TH68-WRITE-KNOWLEDGE','P3 illustrative writing knowledge','Official illustrative scope: short articles with a main topic, supporting details and a conclusion; varied context-appropriate vocabulary; paragraph organization, conjunctions and correct punctuation. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 9-10.',3),

  ('TH68-NUM','P1-TH68-NUM-KNOWLEDGE','P1 illustrative numeracy knowledge','Official illustrative scope includes counting and representing small whole numbers (up to 10 and zero), basic addition and subtraction, simple number patterns, measurement, familiar two-dimensional shapes and reading simple picture information. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 10-11.',1),
  ('TH68-NUM','P2-TH68-NUM-KNOWLEDGE','P2 illustrative numeracy knowledge','Official illustrative scope includes whole numbers up to 1,000 and zero, reading and writing numerals, addition/subtraction/multiplication/division, patterns, fractions, length and weight, time, money, geometric forms and picture charts. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 10-11.',2),
  ('TH68-NUM','P3-TH68-NUM-KNOWLEDGE','P3 illustrative numeracy knowledge','Official illustrative scope includes whole numbers up to 100,000 and zero, operations and fractions, measurement of length/weight/volume/time/money, geometric solids and symmetry, and reading/writing picture charts and one-way tables. Schools may adapt the knowledge scope. Source: OBEC B.E. 2568, section 8.1, printed pp. 10-11.',3),

  ('TH68-SCI-ENV-TECH','P1-TH68-SCI-KNOWLEDGE','P1 illustrative science and technology knowledge','Official illustrative scope: surroundings and everyday materials; sound and direction of sound; use of information technology; participation in environmental care at home and in the classroom. Source: OBEC B.E. 2568, section 8.2.1, printed p. 12.',1),
  ('TH68-SCI-ENV-TECH','P2-TH68-SCI-KNOWLEDGE','P2 illustrative science and technology knowledge','Official illustrative scope: plant life cycles; living and non-living things; reuse of materials; eye safety and suitable lighting; uses of soil; responsible technology use and simple step-by-step programming for everyday problems; environmental care at school. Source: OBEC B.E. 2568, section 8.2.1, printed p. 12.',2),
  ('TH68-SCI-ENV-TECH','P3-TH68-SCI-KNOWLEDGE','P3 illustrative science and technology knowledge','Official illustrative scope: animal life cycles; changes in objects; magnetic force; generators; sunrise and sunset; air pollution; wind and its effects; safe internet use and simple programming to solve everyday problems; environmental care in the community. Source: OBEC B.E. 2568, section 8.2.1, printed p. 12.',3),

  ('TH68-SOCIETY-CITIZEN','P1-TH68-SOCIETY-KNOWLEDGE','P1 illustrative society and citizenship knowledge','Official illustrative scope: religious teachings, ceremonies and important days observed by the learner in family and school; democratic processes; rights, roles and duties in family and school; participation in school activities; Thai culture and traditions; daily timelines; personal and family history. Source: OBEC B.E. 2568, section 8.2.2, printed pp. 12-13.',1),
  ('TH68-SOCIETY-CITIZEN','P2-TH68-SOCIETY-KNOWLEDGE','P2 illustrative society and citizenship knowledge','Official illustrative scope: religious practices in school and community; democratic processes; rights, roles and duties in school and community; respect for national institutions; Thai culture and local wisdom; timelines from past to present; changes in school and community life. Source: OBEC B.E. 2568, section 8.2.2, printed pp. 12-13.',2),
  ('TH68-SOCIETY-CITIZEN','P3-TH68-SOCIETY-KNOWLEDGE','P3 illustrative society and citizenship knowledge','Official illustrative scope: rights, roles and duties in community and society; democratic participation; Thai culture and local wisdom; cultural differences between communities; timelines and changes in community life; comparing one’s own community with others. Source: OBEC B.E. 2568, section 8.2.2, printed pp. 12-13.',3),

  ('TH68-ECON-FIN','P1-TH68-ECON-KNOWLEDGE','P1 illustrative economy and finance knowledge','Official illustrative scope: sufficiency-economy principles for self and family; value and functions of money; sources of income; spending wisely; helping oneself; safe use of simple materials, tools and equipment. Source: OBEC B.E. 2568, section 8.2.3, printed p. 13.',1),
  ('TH68-ECON-FIN','P2-TH68-ECON-KNOWLEDGE','P2 illustrative economy and finance knowledge','Official illustrative scope: sufficiency-economy principles at school; planning and saving money; family income and expenses; calculating receipts and expenses; helping oneself and family; safe, appropriate and economical use of tools. Source: OBEC B.E. 2568, section 8.2.3, printed p. 13.',2),
  ('TH68-ECON-FIN','P3-TH68-ECON-KNOWLEDGE','P3 illustrative economy and finance knowledge','Official illustrative scope: sufficiency-economy principles in the community; needs for goods and services; honest ways to create supplementary family income; choosing tools suitable for a task; careful work and environmental care. Source: OBEC B.E. 2568, section 8.2.3, printed p. 13.',3),

  ('TH68-HEALTH','P1-TH68-HEALTH-KNOWLEDGE','P1 illustrative health knowledge','Official illustrative scope: growth and development; being a good family member; simple games; national health recommendations; accidents and seeking help; recognizing emotions and relaxing through play. Source: OBEC B.E. 2568, section 8.2.4, printed p. 14.',1),
  ('TH68-HEALTH','P2-TH68-HEALTH-KNOWLEDGE','P2 illustrative health knowledge','Official illustrative scope: age-related development, sex and family; exercise; national health recommendations; substance misuse and violence in family and school; emotional self-regulation through activities. Source: OBEC B.E. 2568, section 8.2.4, printed p. 14.',2),
  ('TH68-HEALTH','P3-TH68-HEALTH-KNOWLEDGE','P3 illustrative health knowledge','Official illustrative scope: age-related development, sex and family; traditional games; national health recommendations; substance misuse, violence and accidents; managing emotions through thinking and action. Source: OBEC B.E. 2568, section 8.2.4, printed p. 14.',3),

  ('TH68-ARTS-CULTURE','P1-TH68-ARTS-KNOWLEDGE','P1 illustrative arts and culture knowledge','Official illustrative scope: imaginative participation in arts and cultural activities within the family. Source: OBEC B.E. 2568, section 8.2.5, printed p. 14.',1),
  ('TH68-ARTS-CULTURE','P2-TH68-ARTS-KNOWLEDGE','P2 illustrative arts and culture knowledge','Official illustrative scope: stories about arts and culture in school and community; imaginative participation in and appreciation of local artistic and cultural work. Source: OBEC B.E. 2568, section 8.2.5, printed p. 14.',2),
  ('TH68-ARTS-CULTURE','P3-TH68-ARTS-KNOWLEDGE','P3 illustrative arts and culture knowledge','Official illustrative scope: local arts and culture stories; participation, appreciation and pride; presenting work and exchanging opinions about local art and culture. Source: OBEC B.E. 2568, section 8.2.5, printed p. 14.',3),

  ('TH68-VALUES','TH68-VALUES-CHARACTERISTICS','Cross-cutting desirable characteristics','Five official desirable characteristics from sections 5.3 and 6.3: love of nation, religion and monarchy (รักชาติ ศาสน์ กษัตริย์); honesty and integrity (ซื่อสัตย์สุจริต); discipline and responsibility (มีวินัย); moderation and sufficiency (อยู่อย่างพอเพียง); public-mindedness and helping others (มีจิตสาธารณะ). These are developed across learning, not grade-coded subject indicators. Source: OBEC B.E. 2568, printed pp. 5-6.',1)
) as topic(skill_code,code,name,description,sequence_no)
on true
where subject.code = 'TH68-INTEGRATED-COMPETENCIES'
  and skill.subject_id = subject.id
  and skill.code = topic.skill_code
on conflict (skill_id, code) do update
set name = excluded.name,
    description = excluded.description,
    sequence_no = excluded.sequence_no,
    status = 'active',
    updated_at = now();

-- The 24 annual capability outcomes in official section 7.1 and 7.2.
-- Thai text is the official outcome. English text is an E&P working translation.
insert into public.learning_objectives (topic_id, code, name, description, sequence_no, status)
select topic.id, outcome.code, outcome.name, outcome.description, 1, 'active'
from public.learning_topics topic
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id
cross join (values
  ('TH68-READ','P1-TH68-READ-KNOWLEDGE','P1-TH68-READ-01','P1 Reading Literacy Annual Outcome','Official Thai: เข้าใจความหมายของคำ ข้อความ ภาพ สัญลักษณ์ที่พบเห็น พร้อมทั้งสรุปสาระสำคัญ เพื่อนำไปใช้ในชีวิตประจำวัน และสื่อสารให้ผู้อื่นเข้าใจได้ ด้วยการพูดเป็นประโยคง่าย ๆ อย่างเหมาะสม. E&P working translation: Understand words, texts, pictures and symbols encountered in daily life; summarize key meaning for practical use; and communicate clearly to others using appropriate simple spoken sentences. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),
  ('TH68-READ','P2-TH68-READ-KNOWLEDGE','P2-TH68-READ-01','P2 Reading Literacy Annual Outcome','Official Thai: เข้าใจความหมายของคำ ข้อความ ภาพ สัญลักษณ์ แผนภูมิ แผนภาพ แผนผัง เรื่องสั้น ๆ พร้อมทั้งสรุปสาระสำคัญ เพื่อนำไปใช้ในชีวิตประจำวัน และสื่อสารให้ผู้อื่นเข้าใจ ด้วยการพูดเป็นประโยคง่าย ๆ อย่างเหมาะสม. E&P working translation: Understand words, texts, pictures, symbols, charts, diagrams, plans and short stories; summarize key meaning for daily use; and communicate it using appropriate simple spoken sentences. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),
  ('TH68-READ','P3-TH68-READ-KNOWLEDGE','P3-TH68-READ-01','P3 Reading Literacy Annual Outcome','Official Thai: เข้าใจความหมายของคำ ข้อความ ภาพ สัญลักษณ์ แผนภูมิ แผนภาพ แผนผัง เรื่องราว พร้อมทั้งสรุปสาระสำคัญ เพื่อนำไปใช้ในชีวิตประจำวัน และสื่อสารให้ผู้อื่นเข้าใจ ด้วยวิธีการต่าง ๆ อย่างเหมาะสม มีประสิทธิภาพและรับผิดชอบ. E&P working translation: Understand words, texts, pictures, symbols, charts, diagrams, plans and stories; summarize key meaning for daily use; and communicate effectively and responsibly through appropriate methods. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),

  ('TH68-WRITE','P1-TH68-WRITE-KNOWLEDGE','P1-TH68-WRITE-01','P1 Writing Literacy Annual Outcome','Official Thai: เขียนประโยคง่าย ๆ ที่เกี่ยวข้องกับชีวิตประจำวันและสิ่งรอบตัว โดยใช้คำพื้นฐาน เพื่อถ่ายทอดความคิดและความรู้สึก. E&P working translation: Write simple sentences about daily life and surroundings, using basic vocabulary to express ideas and feelings. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),
  ('TH68-WRITE','P2-TH68-WRITE-KNOWLEDGE','P2-TH68-WRITE-01','P2 Writing Literacy Annual Outcome','Official Thai: เขียนประโยคที่ซับซ้อนโดยใช้คำพื้นฐานที่หลากหลาย และจัดเรียงเนื้อหาให้สื่อความหมายได้ชัดเจนและถูกต้อง เพื่อถ่ายทอดข้อมูล ความคิดและความรู้สึก. E&P working translation: Write more complex sentences with varied basic vocabulary and organize content clearly and accurately to communicate information, ideas and feelings. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),
  ('TH68-WRITE','P3-TH68-WRITE-KNOWLEDGE','P3-TH68-WRITE-01','P3 Writing Literacy Annual Outcome','Official Thai: เขียนเล่าเรื่องโดยจัดเรียงเนื้อหาให้สื่อความหมายได้ชัดเจนและถูกต้อง เพื่อถ่ายทอดข้อมูล ความคิดและความรู้สึก เหมาะสมกับสถานการณ์และกาลเทศะ. E&P working translation: Write narratives with clearly and accurately organized content to communicate information, ideas and feelings appropriate to the situation and social context. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),

  ('TH68-NUM','P1-TH68-NUM-KNOWLEDGE','P1-TH68-NUM-01','P1 Numeracy Annual Outcome','Official Thai: ใช้แนวคิดพื้นฐานทางคณิตศาสตร์เพื่อแก้ปัญหาในชีวิตประจำวันด้วยความเชื่อมั่น และสื่อสารด้วยภาษาและสัญลักษณ์ทางคณิตศาสตร์อย่างสมเหตุสมผล. E&P working translation: Use foundational mathematical ideas confidently to solve everyday problems and communicate with mathematical language and symbols reasonably. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),
  ('TH68-NUM','P2-TH68-NUM-KNOWLEDGE','P2-TH68-NUM-01','P2 Numeracy Annual Outcome','Official Thai: ประยุกต์ใช้แนวคิดพื้นฐานทางคณิตศาสตร์เพื่อแก้ปัญหาที่ซับซ้อนด้วยความเชื่อมั่น และสื่อสารด้วยภาษาและสัญลักษณ์ทางคณิตศาสตร์อย่างสมเหตุสมผล. E&P working translation: Apply foundational mathematical ideas confidently to solve more complex problems and communicate with mathematical language and symbols reasonably. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),
  ('TH68-NUM','P3-TH68-NUM-KNOWLEDGE','P3-TH68-NUM-01','P3 Numeracy Annual Outcome','Official Thai: ประยุกต์ใช้แนวคิดพื้นฐานทางคณิตศาสตร์เพื่อแก้ปัญหาที่ไม่คุ้นเคย สถานการณ์ใหม่ ด้วยความเชื่อมั่น และสื่อสารด้วยภาษาและสัญลักษณ์ทางคณิตศาสตร์อย่างสมเหตุสมผล. E&P working translation: Apply foundational mathematical ideas confidently to solve unfamiliar problems and new situations, communicating with mathematical language and symbols reasonably. Source: OBEC B.E. 2568, section 7.1, printed p. 7.'),

  ('TH68-SCI-ENV-TECH','P1-TH68-SCI-KNOWLEDGE','P1-TH68-SCI-01','P1 Science, Environment and Technology Annual Outcome','Official Thai: เข้าใจแนวคิดพื้นฐานของปรากฏการณ์ทางธรรมชาติ สิ่งแวดล้อม และนำเทคโนโลยีไปใช้ในชีวิตประจำวันด้วยความรับผิดชอบ. E&P working translation: Understand basic ideas about natural phenomena and the environment, and use technology responsibly in everyday life. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),
  ('TH68-SCI-ENV-TECH','P2-TH68-SCI-KNOWLEDGE','P2-TH68-SCI-01','P2 Science, Environment and Technology Annual Outcome','Official Thai: เข้าใจแนวคิดพื้นฐานของปรากฏการณ์ทางธรรมชาติ สิ่งแวดล้อม รู้จักการใช้เครื่องมือพื้นฐานและประยุกต์ใช้เทคโนโลยีในชีวิตประจำวันตามบริบทและสภาพแวดล้อมด้วยความรับผิดชอบ และคำนึงถึงผลกระทบที่เกิดขึ้น. E&P working translation: Understand basic natural and environmental phenomena, use basic tools, and apply technology in daily life responsibly according to context while considering its effects. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),
  ('TH68-SCI-ENV-TECH','P3-TH68-SCI-KNOWLEDGE','P3-TH68-SCI-01','P3 Science, Environment and Technology Annual Outcome','Official Thai: เข้าใจแนวคิดพื้นฐานของปรากฏการณ์ทางธรรมชาติ สิ่งแวดล้อม รู้จักการใช้เครื่องมือพื้นฐานและประยุกต์ใช้เทคโนโลยีในการแก้ปัญหาและสร้างสรรค์สิ่งใหม่อย่างเหมาะสมตามบริบทและสภาพแวดล้อม ด้วยความรับผิดชอบและคำนึงถึงผลกระทบที่เกิดขึ้น. E&P working translation: Understand basic natural and environmental phenomena, use basic tools, and apply technology responsibly to solve problems and create suitable innovations while considering their effects. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),

  ('TH68-SOCIETY-CITIZEN','P1-TH68-SOCIETY-KNOWLEDGE','P1-TH68-SOCIETY-01','P1 Society and Citizenship Annual Outcome','Official Thai: ปฏิบัติตนในฐานะสมาชิกที่ดีของครอบครัวและโรงเรียน ด้วยความรับผิดชอบ ทำงานร่วมกับผู้อื่นอย่างมีประสิทธิภาพ และมีส่วนร่วมในกิจกรรมทางวัฒนธรรมและประเพณีของโรงเรียน. E&P working translation: Act responsibly as a good family and school member, work effectively with others, and participate in school cultural activities and traditions. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),
  ('TH68-SOCIETY-CITIZEN','P2-TH68-SOCIETY-KNOWLEDGE','P2-TH68-SOCIETY-01','P2 Society and Citizenship Annual Outcome','Official Thai: ปฏิบัติตนในฐานะสมาชิกที่ดีของโรงเรียนและชุมชน ด้วยความรับผิดชอบ ทำงานร่วมกับผู้อื่นอย่างมีประสิทธิภาพ และมีส่วนร่วมในกิจกรรมทางวัฒนธรรมและประเพณีของชุมชน. E&P working translation: Act responsibly as a good school and community member, work effectively with others, and participate in community cultural activities and traditions. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),
  ('TH68-SOCIETY-CITIZEN','P3-TH68-SOCIETY-KNOWLEDGE','P3-TH68-SOCIETY-01','P3 Society and Citizenship Annual Outcome','Official Thai: ปฏิบัติตนในฐานะสมาชิกที่ดีของชุมชนและสังคม ด้วยความรับผิดชอบ ทำงานร่วมกับผู้อื่นอย่างมีประสิทธิภาพ และมีส่วนร่วมในกิจกรรมทางวัฒนธรรมและประเพณีของสังคม. E&P working translation: Act responsibly as a good community and society member, work effectively with others, and participate in wider cultural activities and traditions. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),

  ('TH68-ECON-FIN','P1-TH68-ECON-KNOWLEDGE','P1-TH68-ECON-01','P1 Economy and Finance Annual Outcome','Official Thai: รู้ที่มาของรายรับ รายจ่ายของตนเองในชีวิตประจำวันและใช้จ่ายอย่างพอเพียง มีทัศนคติที่ดีต่อการทำงานและการช่วยเหลือครอบครัว. E&P working translation: Recognize personal sources of income and expenses in daily life, spend sufficiently, and develop a positive attitude toward work and helping the family. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),
  ('TH68-ECON-FIN','P2-TH68-ECON-KNOWLEDGE','P2-TH68-ECON-01','P2 Economy and Finance Annual Outcome','Official Thai: รู้ที่มาของรายรับรายจ่ายและวางแผนใช้จ่ายเงินให้สอดคล้องกับสภาพเศรษฐกิจของตนเองและครอบครัว เข้าใจกระบวนการทำงานที่ทำให้เกิดรายได้ เห็นความสำคัญของการประกอบอาชีพสุจริต. E&P working translation: Identify income and expenses, plan spending for personal and family circumstances, understand how work generates income, and value honest occupations. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),
  ('TH68-ECON-FIN','P3-TH68-ECON-KNOWLEDGE','P3-TH68-ECON-01','P3 Economy and Finance Annual Outcome','Official Thai: รู้ที่มาของรายรับ รายจ่าย และวางแผนใช้จ่ายเงินอย่างเห็นคุณค่า และรู้วิธีสร้างรายได้เสริมให้ครอบครัว เข้าใจกระบวนการทำงานที่ทำให้เกิดรายได้ เห็นความสำคัญของการประกอบอาชีพสุจริต และรู้จักอาชีพที่สนใจ มีทัศนคติที่ดีต่อการทำงาน. E&P working translation: Identify income and expenses, plan worthwhile spending, understand ways to supplement family income, understand how work generates income, value honest occupations, and develop a positive attitude toward work. Source: OBEC B.E. 2568, section 7.2, printed p. 8.'),

  ('TH68-HEALTH','P1-TH68-HEALTH-KNOWLEDGE','P1-TH68-HEALTH-01','P1 Physical and Mental Health Annual Outcome','Official Thai: ดูแลรักษาสุขภาพกายโดยเลือกรับประทานอาหารและออกกำลังกายอย่างเหมาะสม ควบคุมอารมณ์ของตนเองได้ และรู้จักขอความช่วยเหลือเมื่อเกิดเหตุร้ายกับตนเองหรือผู้อื่น. E&P working translation: Care for physical health through suitable food and exercise, regulate one’s emotions, and seek help when an unsafe event affects oneself or others. Source: OBEC B.E. 2568, section 7.2, printed p. 9.'),
  ('TH68-HEALTH','P2-TH68-HEALTH-KNOWLEDGE','P2-TH68-HEALTH-01','P2 Physical and Mental Health Annual Outcome','Official Thai: ดูแลรักษาสุขภาพกายโดยเลือกรับประทานอาหารและออกกำลังกายอย่างสม่ำเสมอ ควบคุมอารมณ์ของตนเองและรับรู้อารมณ์ของผู้อื่น รู้จักหลีกเลี่ยงภาวะเสี่ยงและป้องกันอันตรายที่อาจเกิดขึ้นกับตนเอง. E&P working translation: Maintain physical health through regular healthy food and exercise, regulate one’s emotions, recognize others’ emotions, avoid risk situations and prevent possible harm. Source: OBEC B.E. 2568, section 7.2, printed p. 9.'),
  ('TH68-HEALTH','P3-TH68-HEALTH-KNOWLEDGE','P3-TH68-HEALTH-01','P3 Physical and Mental Health Annual Outcome','Official Thai: ปฏิบัติตนเป็นผู้มีสุขนิสัยที่ดี จัดการอารมณ์และความเครียด และนำพาตนเองออกจากภาวะเสี่ยงหรืออันตรายรอบด้านอย่างรู้เท่าทัน. E&P working translation: Practise healthy habits, manage emotions and stress, and recognize and move away from risks and dangers in one’s surroundings. Source: OBEC B.E. 2568, section 7.2, printed p. 9.'),

  ('TH68-ARTS-CULTURE','P1-TH68-ARTS-KNOWLEDGE','P1-TH68-ARTS-01','P1 Arts and Culture Annual Outcome','Official Thai: ปฏิบัติกิจกรรมทางศิลปะและวัฒนธรรมท้องถิ่นด้วยความกระตือรือร้น. E&P working translation: Participate enthusiastically in local arts and cultural activities. Source: OBEC B.E. 2568, section 7.2, printed p. 9.'),
  ('TH68-ARTS-CULTURE','P2-TH68-ARTS-KNOWLEDGE','P2-TH68-ARTS-01','P2 Arts and Culture Annual Outcome','Official Thai: ปฏิบัติกิจกรรมทางศิลปะและวัฒนธรรมในท้องถิ่นอย่างเห็นคุณค่า และแสดงความชื่นชมต่องานศิลปะอย่างสร้างสรรค์. E&P working translation: Participate in local arts and cultural activities with appreciation and express thoughtful appreciation of artworks. Source: OBEC B.E. 2568, section 7.2, printed p. 9.'),
  ('TH68-ARTS-CULTURE','P3-TH68-ARTS-KNOWLEDGE','P3-TH68-ARTS-01','P3 Arts and Culture Annual Outcome','Official Thai: ปฏิบัติกิจกรรมทางศิลปะและวัฒนธรรมในท้องถิ่นอย่างเห็นคุณค่าและถ่ายทอดเรื่องราวผ่านงานศิลปะอย่างสร้างสรรค์ด้วยความภาคภูมิใจ. E&P working translation: Participate in local arts and cultural activities with appreciation and creatively communicate stories through art with pride. Source: OBEC B.E. 2568, section 7.2, printed p. 9.')
) as outcome(skill_code,topic_code,code,name,description)
on true
where subject.code = 'TH68-INTEGRATED-COMPETENCIES'
  and skill.subject_id = subject.id
  and skill.code = outcome.skill_code
  and topic.skill_id = skill.id
  and topic.code = outcome.topic_code
on conflict (topic_id, code) do update
set name = excluded.name,
    description = excluded.description,
    sequence_no = excluded.sequence_no,
    status = 'active',
    updated_at = now();

-- Align each annual outcome to exactly one grade in the separate 2025 curriculum.
insert into public.learning_objective_alignments
  (objective_id, curriculum_id, grade_level_id, sequence_no, required, notes)
select objective.id,
       curriculum.id,
       grade.id,
       alignment.sequence_no,
       true,
       'Annual capability outcome from OBEC B.E. 2568 section 7.1/7.2. E&P internal code; OBEC does not assign a numeric indicator code. This is not a 2008/2017 subject indicator and receives no Must-Know/Should-Know classification. Official source: https://academic.obec.go.th/web/images/document/1760950927_d_1.pdf, printed pp. 7-9.'
from public.learning_curricula curriculum
join public.learning_grade_levels grade
  on grade.curriculum_id = curriculum.id
join (values
  ('P1-TH68-READ-01','P1',1),('P2-TH68-READ-01','P2',1),('P3-TH68-READ-01','P3',1),
  ('P1-TH68-WRITE-01','P1',2),('P2-TH68-WRITE-01','P2',2),('P3-TH68-WRITE-01','P3',2),
  ('P1-TH68-NUM-01','P1',3),('P2-TH68-NUM-01','P2',3),('P3-TH68-NUM-01','P3',3),
  ('P1-TH68-SCI-01','P1',4),('P2-TH68-SCI-01','P2',4),('P3-TH68-SCI-01','P3',4),
  ('P1-TH68-SOCIETY-01','P1',5),('P2-TH68-SOCIETY-01','P2',5),('P3-TH68-SOCIETY-01','P3',5),
  ('P1-TH68-ECON-01','P1',6),('P2-TH68-ECON-01','P2',6),('P3-TH68-ECON-01','P3',6),
  ('P1-TH68-HEALTH-01','P1',7),('P2-TH68-HEALTH-01','P2',7),('P3-TH68-HEALTH-01','P3',7),
  ('P1-TH68-ARTS-01','P1',8),('P2-TH68-ARTS-01','P2',8),('P3-TH68-ARTS-01','P3',8)
) as alignment(objective_code,grade_code,sequence_no) on true
join public.learning_objectives objective on objective.code = alignment.objective_code
join public.learning_topics topic on topic.id = objective.topic_id
join public.learning_skills skill on skill.id = topic.skill_id
join public.learning_subjects subject on subject.id = skill.subject_id
where curriculum.code = 'TH-PRIMARY-2025-P1-P3'
  and grade.code = alignment.grade_code
  and subject.code = 'TH68-INTEGRATED-COMPETENCIES'
on conflict (objective_id, curriculum_id, grade_level_id) do update
set sequence_no = excluded.sequence_no,
    required = true,
    notes = excluded.notes,
    updated_at = now();

commit;
