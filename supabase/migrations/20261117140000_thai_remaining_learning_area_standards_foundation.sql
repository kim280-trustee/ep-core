-- Thai national curriculum standards foundation for the remaining learning areas.
-- Career uses the post-Order OBEC 921/2561 scope; former technology standards are not duplicated here.
with area(skill_code,subject_code,skill_name,description) as (values
 ('HEALTH-PE','HEALTH-PE','Health and Physical Education','Thai Basic Education Core Curriculum learning area: health, movement, fitness, safety and life skills.'),
 ('ARTS','ARTS','Arts','Thai Basic Education Core Curriculum learning area: visual arts, music and dramatic arts.'),
 ('CAREER','CAREER','Career','Thai Basic Education Core Curriculum learning area: work, career skills, management and entrepreneurship; technology standards are excluded under OBEC Order 921/2561.'),
 ('FOREIGN-LANGUAGES','FOREIGN-LANGUAGES','Foreign Languages','Thai Basic Education Core Curriculum learning area: communication, language and culture, connections and community/global relationships.')
),
skill_upsert as (
 insert into public.learning_skills(subject_id,code,name,description,status)
 select s.id,a.skill_code,a.skill_name,a.description,'active'
 from area a join public.learning_subjects s on s.code=a.subject_code
 on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,updated_at=now()
 returning id,code
),
standards(skill_code,code,name,description,sequence_no) as (values
 ('HEALTH-PE','พ 1.1','Human Growth and Development','Understanding human growth and development across life stages.',1),
 ('HEALTH-PE','พ 2.1','Life and Family','Understanding and applying skills for healthy relationships and family life.',2),
 ('HEALTH-PE','พ 3.1','Movement, Physical Activities, Games and Sports','Understanding and applying movement skills and physical activities.',3),
 ('HEALTH-PE','พ 3.2','Physical Activities, Games and Sports','Enjoyment of physical activities, games and sports with discipline and sportsmanship.',4),
 ('HEALTH-PE','พ 4.1','Health-Enhancing Capacities','Valuing and applying health promotion, disease prevention and health care.',5),
 ('HEALTH-PE','พ 5.1','Safety and Life Skills','Understanding and applying safety practices and life skills.',6),
 ('ARTS','ศ 1.1','Visual Arts: Creation and Perception','Creation, analysis and interpretation of visual artworks.',1),
 ('ARTS','ศ 1.2','Visual Arts: History and Culture','Understanding relationships between visual arts, history and culture.',2),
 ('ARTS','ศ 2.1','Music: Creation and Expression','Understanding and expressing through music.',3),
 ('ARTS','ศ 2.2','Music: History and Culture','Understanding relationships between music, history and culture.',4),
 ('ARTS','ศ 3.1','Dramatic Arts: Creation and Performance','Understanding and expressing through dramatic arts.',5),
 ('ARTS','ศ 3.2','Dramatic Arts: History and Culture','Understanding relationships between dramatic arts, history and culture.',6),
 ('CAREER','ง 1.1','Work and Career','Understanding work, applying work skills, managing resources and developing a positive attitude toward work.',1),
 ('FOREIGN-LANGUAGES','ต 1.1','Language for Communication: Comprehension','Understanding and interpreting what is heard and read from various media.',1),
 ('FOREIGN-LANGUAGES','ต 1.2','Language for Communication: Interaction','Communicating to exchange information, express feelings and opinions appropriately.',2),
 ('FOREIGN-LANGUAGES','ต 1.3','Language for Communication: Presentation','Presenting information, concepts and opinions through speaking and writing.',3),
 ('FOREIGN-LANGUAGES','ต 1.4','Language for Communication: Interpersonal Communication','Using language in different situations inside and outside the classroom.',4),
 ('FOREIGN-LANGUAGES','ต 2.1','Language and Culture: Relationship','Understanding relationships between language and culture of native speakers.',5),
 ('FOREIGN-LANGUAGES','ต 2.2','Language and Culture: Comparison','Comparing language and culture of native speakers with Thai language and culture.',6),
 ('FOREIGN-LANGUAGES','ต 3.1','Language and Connections','Using foreign languages to connect with other learning areas.',7),
 ('FOREIGN-LANGUAGES','ต 4.1','Language and Community/World Relations','Using foreign languages in different situations in school, community and society.',8),
 ('FOREIGN-LANGUAGES','ต 4.2','Language and Global Community','Using foreign languages as a basic tool for further learning, livelihood and exchange with the global community.',9)
)
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,st.code,st.name,st.description,st.sequence_no,'active'
from standards st
join public.learning_skills sk on sk.code=st.skill_code
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,updated_at=now();
