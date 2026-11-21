begin;

-- Add the primary-grade W4.2 Computing Science indicators to the Thai
-- national Science and Technology learning area. These are OBEC indicators,
-- not the separate Click Start international Computer Studies course.

with tech_skill as (
  select sk.id skill_id
  from public.learning_skills sk
  join public.learning_subjects sub on sub.id=sk.subject_id
  where sub.code='SCI' and sk.code='TECH'
),
grade_topics(grade_code,topic_code,topic_name,sequence_no) as (
 values
 ('P1','P1-W4.2','P1 — Technology and Computational Thinking (4.2)',1),
 ('P2','P2-W4.2','P2 — Technology and Computational Thinking (4.2)',2),
 ('P3','P3-W4.2','P3 — Technology and Computational Thinking (4.2)',3),
 ('P4','P4-W4.2','P4 — Technology and Computational Thinking (4.2)',4),
 ('P5','P5-W4.2','P5 — Technology and Computational Thinking (4.2)',5),
 ('P6','P6-W4.2','P6 — Technology and Computational Thinking (4.2)',6)
)
insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select ts.skill_id,gt.topic_code,gt.topic_name,
       'Thai Basic Education Core Curriculum B.E. 2551, revised 2017; Science and Technology standard ว 4.2.',
       gt.sequence_no,'active'
from grade_topics gt cross join tech_skill ts
where not exists(select 1 from public.learning_topics t where t.skill_id=ts.skill_id and t.code=gt.topic_code);

with seed(grade_code,seq,code,name,official_indicator,classification) as (
 values
 ('P1',1,'P1-S4_2-01','Solve a simple problem through trial and comparison','แก้ปัญหาอย่างง่าย โดยใช้การลองผิดลองถูก การเปรียบเทียบ','must_know'),
 ('P1',2,'P1-S4_2-02','Show the steps of a task or simple solution','แสดงลำดับขั้นตอนการทำงานหรือการแก้ปัญหาอย่างง่าย โดยใช้ภาพ สัญลักษณ์ หรือข้อความ','must_know'),
 ('P1',3,'P1-S4_2-03','Write a simple program using software or media','เขียนโปรแกรมอย่างง่าย โดยใช้ซอฟต์แวร์หรือสื่อ','must_know'),
 ('P1',4,'P1-S4_2-04','Create, store and retrieve information using technology','ใช้เทคโนโลยีในการสร้าง จัดเก็บ เรียกใช้ข้อมูลตามวัตถุประสงค์','must_know'),
 ('P1',5,'P1-S4_2-05','Use information technology safely and care for devices','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ปฏิบัติตามข้อตกลงในการใช้คอมพิวเตอร์ร่วมกัน ดูแลรักษาอุปกรณ์เบื้องต้น ใช้งานอย่างเหมาะสม','should_know'),

 ('P2',1,'P2-S4_2-01','Represent the steps of a task or simple solution','แสดงลำดับขั้นตอนการทำงานหรือการแก้ปัญหาอย่างง่าย โดยใช้ภาพ สัญลักษณ์ หรือข้อความ','must_know'),
 ('P2',2,'P2-S4_2-02','Write and debug a simple program','เขียนโปรแกรมอย่างง่าย โดยใช้ซอฟต์แวร์หรือสื่อ และตรวจหาข้อผิดพลาดของโปรแกรม','must_know'),
 ('P2',3,'P2-S4_2-03','Create, categorize, search, store and retrieve information','ใช้เทคโนโลยีในการสร้าง จัดหมวดหมู่ ค้นหา จัดเก็บ เรียกใช้ข้อมูลตามวัตถุประสงค์','should_know'),
 ('P2',4,'P2-S4_2-04','Use information technology safely and maintain devices','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ปฏิบัติตามข้อตกลงในการใช้คอมพิวเตอร์ร่วมกัน ดูแลรักษาอุปกรณ์เบื้องต้น ใช้งานอย่างเหมาะสม','should_know'),

 ('P3',1,'P3-S4_2-01','Represent an algorithm for a simple task or problem','แสดงอัลกอริทึมในการทำงานหรือการแก้ปัญหาอย่างง่าย โดยใช้ภาพ สัญลักษณ์ หรือข้อความ','must_know'),
 ('P3',2,'P3-S4_2-02','Write and debug a simple program','เขียนโปรแกรมอย่างง่าย โดยใช้ซอฟต์แวร์หรือสื่อ และตรวจหาข้อผิดพลาดของโปรแกรม','must_know'),
 ('P3',3,'P3-S4_2-03','Search the internet for knowledge','ใช้อินเทอร์เน็ตค้นหาความรู้','must_know'),
 ('P3',4,'P3-S4_2-04','Collect, process and present data with software','รวบรวม ประมวลผล และนำเสนอข้อมูล โดยใช้ซอฟต์แวร์ตามวัตถุประสงค์','must_know'),
 ('P3',5,'P3-S4_2-05','Use information technology safely and follow internet agreements','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ปฏิบัติตามข้อตกลงในการใช้บริการอินเทอร์เน็ต','should_know'),

 ('P4',1,'P4-S4_2-01','Use logical reasoning to solve and explain simple problems','ใช้เหตุผลเชิงตรรกะในการแก้ปัญหา การอธิบายการทำงาน การคาดการณ์ผลลัพธ์จากปัญหาอย่างง่าย','must_know'),
 ('P4',2,'P4-S4_2-02','Design, write and debug a simple program','ออกแบบและเขียนโปรแกรมอย่างง่าย โดยใช้ซอฟต์แวร์หรือสื่อ และตรวจหาข้อผิดพลาดและแก้ไข','must_know'),
 ('P4',3,'P4-S4_2-03','Search online and evaluate the reliability of information','ใช้อินเทอร์เน็ตค้นหาข้อมูล และประเมินความน่าเชื่อถือของข้อมูล','should_know'),
 ('P4',4,'P4-S4_2-04','Collect, evaluate and present information to solve daily problems','รวบรวม ประเมิน นำเสนอข้อมูลและสารสนเทศ โดยใช้ซอฟต์แวร์ที่หลากหลาย เพื่อแก้ปัญหาในชีวิตประจำวัน','must_know'),
 ('P4',5,'P4-S4_2-05','Use information technology safely and respect others’ rights','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย เข้าใจสิทธิและหน้าที่ของตน เคารพในสิทธิของผู้อื่น แจ้งผู้เกี่ยวข้องเมื่อพบข้อมูลหรือบุคคลที่ไม่เหมาะสม','should_know'),

 ('P5',1,'P5-S4_2-01','Use logical reasoning to solve and predict simple outcomes','ใช้เหตุผลเชิงตรรกะในการแก้ปัญหา การอธิบายการทำงาน การคาดการณ์ผลลัพธ์จากปัญหาอย่างง่าย','must_know'),
 ('P5',2,'P5-S4_2-02','Design and debug a program using simple logical reasoning','ออกแบบและเขียนโปรแกรมที่มีการใช้เหตุผลเชิงตรรกะอย่างง่าย ตรวจหาข้อผิดพลาดและแก้ไข','must_know'),
 ('P5',3,'P5-S4_2-03','Search, communicate and collaborate online; evaluate information','ใช้อินเทอร์เน็ตค้นหาข้อมูล ติดต่อสื่อสารและทำงานร่วมกัน ประเมินความน่าเชื่อถือของข้อมูล','should_know'),
 ('P5',4,'P5-S4_2-04','Collect, evaluate and present information to solve daily problems','รวบรวม ประเมิน นำเสนอข้อมูลและสารสนเทศตามวัตถุประสงค์ โดยใช้ซอฟต์แวร์หรือบริการบนอินเทอร์เน็ตที่หลากหลาย เพื่อแก้ปัญหาในชีวิตประจำวัน','must_know'),
 ('P5',5,'P5-S4_2-05','Use information technology safely, with good manners and respect for rights','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย มีมารยาท เข้าใจสิทธิและหน้าที่ของตน เคารพในสิทธิของผู้อื่น แจ้งผู้เกี่ยวข้องเมื่อพบข้อมูลหรือบุคคลที่ไม่เหมาะสม','should_know'),

 ('P6',1,'P6-S4_2-01','Use logical reasoning to explain and design daily solutions','ใช้เหตุผลเชิงตรรกะในการอธิบายและออกแบบวิธีการแก้ปัญหาที่พบในชีวิตประจำวัน','must_know'),
 ('P6',2,'P6-S4_2-02','Design, write and debug a program for daily problems','ออกแบบและเขียนโปรแกรมอย่างง่าย เพื่อใช้แก้ปัญหาในชีวิตประจำวัน ตรวจหาข้อผิดพลาดของโปรแกรมและแก้ไข','must_know'),
 ('P6',3,'P6-S4_2-03','Search for information efficiently on the internet','ใช้อินเทอร์เน็ตในการค้นหาข้อมูลอย่างมีประสิทธิภาพ','must_know'),
 ('P6',4,'P6-S4_2-04','Collaborate safely using information technology and respect rights','ใช้เทคโนโลยีสารสนเทศทำงานร่วมกันอย่างปลอดภัย เข้าใจสิทธิและหน้าที่ของตน เคารพในสิทธิของผู้อื่น แจ้งผู้เกี่ยวข้องเมื่อพบข้อมูลหรือบุคคลที่ไม่เหมาะสม','should_know')
),
objective_rows as (
 select s.*,t.id topic_id
 from seed s
 join public.learning_skills sk on sk.code='TECH'
 join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
 join public.learning_topics t on t.skill_id=sk.id and t.code=s.grade_code||'-W4.2'
)
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select topic_id,code,name,
       'Official Thai indicator ว 4.2 '||
       case when grade_code like 'P%' then 'ป.'||substr(grade_code,2) else 'ม.'||substr(grade_code,2) end||'/'||seq||
       ': '||official_indicator||' Source: OBEC 2021 must-know / should-know indicator table.',
       seq,'active'
from objective_rows
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

with seed(grade_code,seq,code,classification) as (
 values
 ('P1',1,'P1-S4_2-01','must_know'),('P1',2,'P1-S4_2-02','must_know'),('P1',3,'P1-S4_2-03','must_know'),('P1',4,'P1-S4_2-04','must_know'),('P1',5,'P1-S4_2-05','should_know'),
 ('P2',1,'P2-S4_2-01','must_know'),('P2',2,'P2-S4_2-02','must_know'),('P2',3,'P2-S4_2-03','should_know'),('P2',4,'P2-S4_2-04','should_know'),
 ('P3',1,'P3-S4_2-01','must_know'),('P3',2,'P3-S4_2-02','must_know'),('P3',3,'P3-S4_2-03','must_know'),('P3',4,'P3-S4_2-04','must_know'),('P3',5,'P3-S4_2-05','should_know'),
 ('P4',1,'P4-S4_2-01','must_know'),('P4',2,'P4-S4_2-02','must_know'),('P4',3,'P4-S4_2-03','should_know'),('P4',4,'P4-S4_2-04','must_know'),('P4',5,'P4-S4_2-05','should_know'),
 ('P5',1,'P5-S4_2-01','must_know'),('P5',2,'P5-S4_2-02','must_know'),('P5',3,'P5-S4_2-03','should_know'),('P5',4,'P5-S4_2-04','must_know'),('P5',5,'P5-S4_2-05','should_know'),
 ('P6',1,'P6-S4_2-01','must_know'),('P6',2,'P6-S4_2-02','must_know'),('P6',3,'P6-S4_2-03','must_know'),('P6',4,'P6-S4_2-04','should_know')
),
target as (
 select s.grade_code,s.seq,s.classification,o.id objective_id
 from seed s
 join public.learning_objectives o on o.code=s.code
 join public.learning_topics t on t.id=o.topic_id
 join public.learning_skills sk on sk.id=t.skill_id
 join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
)
insert into public.learning_objective_alignments
 (objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select target.objective_id,c.id,g.id,target.seq,target.classification='must_know',
       'OBEC 2021 priority classification for Science and Technology standard ว 4.2.',
       target.classification
from target
join public.learning_curricula c on c.code='TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=target.grade_code
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,
    indicator_classification=excluded.indicator_classification,updated_at=now();

commit;