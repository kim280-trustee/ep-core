-- OBEC/OPEC correction: M4-M6 Social Studies Geography indicators 5.2/2 and 5.2/3
-- were added to the 2023 between-learning set; preserve /4 as the terminal indicator.
with correction(old_code,new_code,new_name) as (values
('SO5.2-M46-02','SO5.2-M46-04','วิเคราะห์แนวทางและมีส่วนร่วมในการจัดการทรัพยากรธรรมชาติและสิ่งแวดล้อมเพื่อการพัฒนาที่ยั่งยืน')
)
update public.learning_objectives o
set code=c.new_code,name=c.new_name,updated_at=now()
from correction c
join public.learning_topics t on t.code='SO5.2'
join public.learning_skills sk on sk.id=t.skill_id and sk.code='SOCIAL-STUDIES'
where o.topic_id=t.id and o.code=c.old_code;

insert into public.learning_objectives(topic_id,code,name,sequence_no,status)
select t.id,v.code,v.name,v.seq,'active'
from (values
('SO5.2','SO5.2-M46-02','วิเคราะห์สถานการณ์ สาเหตุ และผลกระทบของการเปลี่ยนแปลงด้านทรัพยากรธรรมชาติและสิ่งแวดล้อมของประเทศไทยและภูมิภาคต่าง ๆ ของโลก',2),
('SO5.2','SO5.2-M46-03','ระบุมาตรการป้องกันและแก้ไขปัญหา กฎหมายและนโยบายด้านทรัพยากรธรรมชาติและสิ่งแวดล้อม บทบาทขององค์การที่เกี่ยวข้อง และการประสานความร่วมมือทั้งในประเทศและระหว่างประเทศ',3)
) v(standard_code,code,name,seq)
join public.learning_topics t on t.code=v.standard_code
join public.learning_skills sk on sk.id=t.skill_id and sk.code='SOCIAL-STUDIES'
on conflict(topic_id,code) do update set name=excluded.name,sequence_no=excluded.sequence_no,updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,o.sequence_no,false,
'OBEC 2023 / OPEC correction: additional M4-M6 Geography indicator; source classification = between_learning.',
'between_learning'
from public.learning_objectives o
join public.learning_topics t on t.id=o.topic_id and t.code='SO5.2'
join public.learning_skills sk on sk.id=t.skill_id and sk.code='SOCIAL-STUDIES'
join public.learning_curricula c on c.id='a366b931-63be-49b5-8433-dbea2691a055'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code in ('M4','M5','M6')
where o.code in ('SO5.2-M46-02','SO5.2-M46-03')
on conflict(objective_id,curriculum_id,grade_level_id) do update
set notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();