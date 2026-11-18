-- Official OBEC 2021 Arts P5 indicators (26 total; 13 must-know, 13 should-know).
with seed(standard_code,code,name,seq,classification) as (values
('ศ 1.1','ARTS-P5-01','บรรยายเกี่ยวกับจังหวะ ตำแหน่งของสิ่งต่าง ๆ ที่ปรากฏในสิ่งแวดล้อมและงานทัศนศิลป์',1,'should_know'),
('ศ 1.1','ARTS-P5-02','เปรียบเทียบความแตกต่างระหว่างงานทัศนศิลป์ ที่สร้างสรรค์ด้วยวัสดุอุปกรณ์และวิธีการที่ต่างกัน',2,'should_know'),
('ศ 1.1','ARTS-P5-03','วาดภาพ โดยใช้เทคนิคของแสงเงา น้ำหนัก และวรรณะสี',3,'must_know'),
('ศ 1.1','ARTS-P5-04','สร้างสรรค์งานปั้นจากดินน้ำมันหรือดินเหนียว โดยเน้นการถ่ายทอดจินตนาการ',4,'should_know'),
('ศ 1.1','ARTS-P5-05','สร้างสรรค์งานพิมพ์ภาพ โดยเน้นการจัดวางตำแหน่งของสิ่งต่าง ๆ ในภาพ',5,'should_know'),
('ศ 1.1','ARTS-P5-06','ระบุปัญหาในการจัดองค์ประกอบศิลป์และการสื่อความหมายในงานทัศนศิลป์ของตนเอง และบอกวิธีการปรับปรุงงานให้ดีขึ้น',6,'must_know'),
('ศ 1.1','ARTS-P5-07','บรรยายประโยชน์และคุณค่าของงานทัศนศิลป์ที่มีผลต่อชีวิตของคนในสังคม',7,'must_know'),
('ศ 1.2','ARTS-P5-08','ระบุ และบรรยายเกี่ยวกับลักษณะรูปแบบของงานทัศนศิลป์ในแหล่งเรียนรู้หรืออินทรรศการศิลปะ',8,'should_know'),
('ศ 1.2','ARTS-P5-09','อภิปรายเกี่ยวกับงานทัศนศิลป์ที่สะท้อนวัฒนธรรมและภูมิปัญญาในท้องถิ่น',9,'must_know'),
('ศ 2.1','ARTS-P5-10','ระบุองค์ประกอบดนตรีในเพลงที่ใช้ในการสื่ออารมณ์',10,'should_know'),
('ศ 2.1','ARTS-P5-11','จำแนกลักษณะของเสียงขับร้องและเครื่องดนตรีที่อยู่ในวงดนตรีประเภทต่าง ๆ',11,'must_know'),
('ศ 2.1','ARTS-P5-12','อ่าน เขียนโน้ตดนตรีไทยและสากล ๕ ระดับเสียง',12,'should_know'),
('ศ 2.1','ARTS-P5-13','ใช้เครื่องดนตรีบรรเลงจังหวะและทำนอง',13,'must_know'),
('ศ 2.1','ARTS-P5-14','ร้องเพลงไทยหรือเพลงสากลหรือเพลงไทยสากลที่เหมาะสมกับวัย',14,'must_know'),
('ศ 2.1','ARTS-P5-15','ด้นสดง่าย ๆ โดยใช้ประโยคเพลงแบบถาม - ตอบ',15,'must_know'),
('ศ 2.1','ARTS-P5-16','ใช้ดนตรีร่วมกับกิจกรรมในการแสดงออกตามจินตนาการ',16,'must_know'),
('ศ 2.2','ARTS-P5-17','อธิบายความสัมพันธ์ระหว่างดนตรีกับประเพณีในวัฒนธรรมต่าง ๆ',17,'must_know'),
('ศ 2.2','ARTS-P5-18','อธิบายคุณค่าของดนตรีที่มาจากวัฒนธรรมที่ต่างกัน',18,'must_know'),
('ศ 3.1','ARTS-P5-19','บรรยายองค์ประกอบนาฏศิลป์',19,'must_know'),
('ศ 3.1','ARTS-P5-20','แสดงท่าทางประกอบเพลงหรือเรื่องราวตามความคิดของตน',20,'must_know'),
('ศ 3.1','ARTS-P5-21','แสดงนาฏศิลป์ โดยเน้นการใช้ภาษาท่าและนาฏยศัพท์ในการสื่อความหมายและการแสดงออก',21,'must_know'),
('ศ 3.1','ARTS-P5-22','มีส่วนร่วมในกลุ่มกับการเขียนเค้าโครงเรื่องหรือบทละครสั้น ๆ',22,'should_know'),
('ศ 3.1','ARTS-P5-23','เปรียบเทียบการแสดงนาฏศิลป์ชุดต่าง ๆ',23,'must_know'),
('ศ 3.1','ARTS-P5-24','บอกประโยชน์ที่ได้รับจากการชมการแสดง',24,'should_know'),
('ศ 3.2','ARTS-P5-25','เปรียบเทียบการแสดงประเภทต่าง ๆ ของไทยในแต่ละท้องถิ่น',25,'should_know'),
('ศ 3.2','ARTS-P5-26','ระบุหรือแสดงนาฏศิลป์ นาฏศิลป์พื้นบ้านที่สะท้อนถึงวัฒนธรรมและประเพณี',26,'must_know')
), subject as (
 select t.id topic_id,t.code standard_code from learning_subjects s
 join learning_skills sk on sk.subject_id=s.id join learning_topics t on t.skill_id=sk.id
 where s.code='ARTS' and sk.code='ARTS'
), upserted as (
 insert into learning_objectives(topic_id,code,name,sequence_no)
 select subject.topic_id,seed.code,seed.name,seed.seq from seed join subject using(standard_code)
 on conflict(topic_id,code) do update set name=excluded.name,sequence_no=excluded.sequence_no
 returning id,code
)
insert into learning_objective_alignments(objective_id,curriculum_id,grade_level_id,required,indicator_classification)
select o.id,c.id,g.id,(seed.classification='must_know'),seed.classification
from seed join upserted o on o.code=seed.code
join learning_curricula c on c.code='TH-BASIC-CORE-2008-2017'
join learning_grade_levels g on g.curriculum_id=c.id and g.code='P5'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set required=excluded.required,indicator_classification=excluded.indicator_classification;