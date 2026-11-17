with seed(grade_code,standard_code,objective_code,indicator_text,sequence_no,required,source_detail) as (values
('P4','ง 1.1','CAREER-P4-01','อธิบายเหตุผลในการทำงานให้บรรลุเป้าหมาย',1,false,'อธิบายเหตุผลและประโยชน์ของการทำงานให้บรรลุเป้าหมาย โดยวางแผนและทำงานตามขั้นตอน'),
('P4','ง 1.1','CAREER-P4-02','ทำงานบรรลุเป้าหมายที่วางไว้อย่างเป็นขั้นตอนด้วยความขยัน อดทน รับผิดชอบ และซื่อสัตย์',2,true,'วางแผนและทำงานอย่างเป็นขั้นตอน ขยัน อดทน รับผิดชอบ และซื่อสัตย์'),
('P4','ง 1.1','CAREER-P4-03','ปฏิบัติตนอย่างมีมารยาทในการทำงาน',3,false,'มารยาทในการทำงานร่วมกับผู้อื่น'),
('P4','ง 1.1','CAREER-P4-04','ใช้พลังงานและทรัพยากรในการทำงานอย่างประหยัดและคุ้มค่า',4,true,'ใช้พลังงานและทรัพยากรอย่างประหยัดและคุ้มค่า'),
('P4','ง 2.1','CAREER-P4-05','อธิบายความหมายและความสำคัญของอาชีพ',5,false,'ความหมาย ความสำคัญ และคุณค่าของอาชีพต่อบุคคลและสังคม'),
('P5','ง 1.1','CAREER-P5-01','อธิบายเหตุผลในการทำงานแต่ละขั้นตอนถูกต้องตามกระบวนการทำงาน',1,true,'อธิบายเหตุผลของแต่ละขั้นตอนตามกระบวนการทำงาน'),
('P5','ง 1.1','CAREER-P5-02','ใช้ทักษะการจัดการในการทำงานอย่างเป็นระบบ ประณีต และมีความคิดสร้างสรรค์',2,true,'ใช้ทักษะการจัดการ วางแผน จัดลำดับ และทำงานอย่างประณีตสร้างสรรค์'),
('P5','ง 1.1','CAREER-P5-03','ปฏิบัติตนอย่างมีมารยาทในการทำงานกับสมาชิกในครอบครัว',3,false,'สื่อสารและทำงานร่วมกับสมาชิกในครอบครัวอย่างมีมารยาท'),
('P5','ง 1.1','CAREER-P5-04','มีจิตสำนึกในการใช้พลังงานและทรัพยากรอย่างประหยัดและคุ้มค่า',4,true,'ตระหนักและปฏิบัติในการใช้พลังงานและทรัพยากรอย่างประหยัด'),
('P5','ง 2.1','CAREER-P5-05','สำรวจข้อมูลที่เกี่ยวกับอาชีพต่าง ๆ ในชุมชน',5,false,'สำรวจและรวบรวมข้อมูลอาชีพในชุมชนจากแหล่งข้อมูลที่เหมาะสม'),
('P5','ง 2.1','CAREER-P5-06','ระบุความแตกต่างของอาชีพ',6,false,'เปรียบเทียบลักษณะงาน ความรู้ ทักษะ และเครื่องมือที่ใช้ในอาชีพต่าง ๆ')
), resolved as (
 select s.*,t.id topic_id,g.id grade_id,c.id curriculum_id
 from seed s join public.learning_subjects sub on sub.code='CAREER'
 join public.learning_skills sk on sk.subject_id=sub.id and sk.code='CAREER'
 join public.learning_topics t on t.skill_id=sk.id and t.code=s.standard_code
 join public.learning_curricula c on c.id='a366b931-63be-49b5-8433-dbea2691a055'
 join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=s.grade_code
)
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select topic_id,objective_code,indicator_text,source_detail,sequence_no,'active' from resolved
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,updated_at=now();