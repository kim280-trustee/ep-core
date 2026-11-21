with seed(grade_code,standard_code,objective_code,indicator_text,sequence_no,required,source_detail) as (values
('P1','ง 1.1','CAREER-P1-01','บอกวิธีการทำงานเพื่อช่วยเหลือตนเอง',1,false,'ทักษะการทำงานอย่างกระตือรือร้น ตรงเวลา และปลอดภัย เพื่อช่วยเหลือตนเอง โดยใช้วัสดุ อุปกรณ์ และเครื่องมือง่าย ๆ ในการดำรงชีวิต'),
('P1','ง 1.1','CAREER-P1-02','ใช้วัสดุ อุปกรณ์ และเครื่องมือง่าย ๆ ในการทำงานอย่างปลอดภัย',2,true,'การใช้วัสดุ อุปกรณ์ และเครื่องมือง่าย ๆ อย่างปลอดภัย'),
('P1','ง 1.1','CAREER-P1-03','ทำงานเพื่อช่วยเหลือตนเองอย่างกระตือรือร้นและตรงเวลา',3,true,'ฝึกปฏิบัติผ่านงาน เช่น รดน้ำต้นไม้ ประดิษฐ์ของเล่นจากวัสดุในท้องถิ่น ใช้อุปกรณ์ในการรับประทานอาหาร จัดเก็บอุปกรณ์การเรียนและของใช้ส่วนตัว และดูแลตนเองในการแต่งกาย'),
('P2','ง 1.1','CAREER-P2-01','บอกวิธีการและประโยชน์การทำงานเพื่อช่วยเหลือตนเองและครอบครัว',1,false,'ทักษะการใช้วัสดุ อุปกรณ์ และเครื่องมือเพื่อช่วยเหลือตนเองและครอบครัว เพื่อสร้างลักษณะนิสัยด้านความประหยัด ปลอดภัย และสะอาด'),
('P2','ง 1.1','CAREER-P2-02','ใช้วัสดุ อุปกรณ์ และเครื่องมือในการทำงานอย่างเหมาะสมกับงานและประหยัด',2,true,'การเลือกใช้วัสดุ อุปกรณ์ และเครื่องมือให้เหมาะสมกับงานและประหยัด'),
('P2','ง 1.1','CAREER-P2-03','ทำงานเพื่อช่วยเหลือตนเองและครอบครัวอย่างปลอดภัย',3,true,'ฝึกปฏิบัติผ่านงาน เช่น ปลูกและดูแลผักสวนครัว ประดิษฐ์ของเล่นหรือของใช้ส่วนตัวจากวัสดุเหลือใช้ ช่วยครอบครัวเตรียมประกอบอาหารและจัดโต๊ะอาหาร และแยกประเภทอุปกรณ์การเรียนและของใช้ส่วนตัว'),
('P3','ง 1.1','CAREER-P3-01','อธิบายวิธีการและประโยชน์การทำงานเพื่อช่วยเหลือตนเอง ครอบครัว และส่วนรวม',1,true,'ทักษะการใช้วัสดุ อุปกรณ์ และเครื่องมือให้ตรงกับลักษณะงานอย่างเป็นขั้นตอน เพื่อช่วยเหลือตนเอง ครอบครัว และส่วนรวม โดยคำนึงถึงความสะอาด รอบคอบ และอนุรักษ์สิ่งแวดล้อม'),
('P3','ง 1.1','CAREER-P3-02','ใช้วัสดุ อุปกรณ์ และเครื่องมือตรงกับลักษณะงาน',2,true,'เลือกวัสดุ อุปกรณ์ และเครื่องมือให้ตรงกับลักษณะงาน'),
('P3','ง 1.1','CAREER-P3-03','ทำงานอย่างเป็นขั้นตอนตามกระบวนการทำงาน ด้วยความสะอาด ความรอบคอบ และอนุรักษ์สิ่งแวดล้อม',3,true,'ฝึกปฏิบัติผ่านงาน เช่น ปลูกและดูแลไม้ดอกไม้ประดับ บำรุงรักษาหรือซ่อมแซมของเล่นหรือของใช้ ประดิษฐ์ของใช้จากวัสดุในท้องถิ่น และดูแลทำความสะอาดตกแต่งห้องเรียน')
),
resolved as (
 select s.*, t.id topic_id, g.id grade_id, c.id curriculum_id
 from seed s
 join public.learning_subjects sub on sub.code='CAREER'
 join public.learning_skills sk on sk.subject_id=sub.id and sk.code='CAREER'
 join public.learning_topics t on t.skill_id=sk.id and t.code=s.standard_code
 join public.learning_curricula c on c.id='a366b931-63be-49b5-8433-dbea2691a055'
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=s.grade_code
),
upserted as (
 insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
 select topic_id,objective_code,indicator_text,source_detail,sequence_no,'active' from resolved
 on conflict(topic_id,code) do update
 set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,updated_at=now()
 returning id,topic_id,code
)
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,indicator_classification,notes)
select o.id,r.curriculum_id,r.grade_id,r.sequence_no,r.required,
 case when r.required then 'must_know' else 'should_know' end,
 'OBEC 2021 must-know/should-know indicator list; source: official Basic Education Core Curriculum 2551 indicator companion.'
from resolved r
join public.learning_objectives o on o.topic_id=r.topic_id and o.code=r.objective_code
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,
 indicator_classification=excluded.indicator_classification,notes=excluded.notes,updated_at=now();