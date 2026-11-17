-- Thai Social Studies P4 official indicators.
-- Source: OBEC 2021 must-know/should-know Social Studies table, printed pages 191-197.
-- Geography entries are assigned to revised SO5.1/SO5.2 by meaning; original source codes are retained as printed.
with seed(standard_code,objective_code,objective_name,sequence_no,is_required,source_indicator_code) as (values
('SO1.1','SO1.1-P4-01','อธิบายความสำคัญของพระพุทธศาสนาหรือศาสนาที่ตนนับถือในฐานะเป็นศูนย์รวมจิตใจของศาสนิกชน',1,false,'ส ๑.๑ ป.๔/๑'),
('SO1.1','SO1.1-P4-02','สรุปพุทธประวัติตั้งแต่บรรลุธรรมจนถึงประกาศธรรม หรือประวัติศาสดาที่ตนนับถือตามที่กำหนด',2,true,'ส ๑.๑ ป.๔/๒'),
('SO1.1','SO1.1-P4-03','เห็นคุณค่า และปฏิบัติตนตามแบบอย่างการดำเนินชีวิตและข้อคิดจากประวัติสาวก ชาดก เรื่องเล่าและศาสนิกชนตัวอย่างตามที่กำหนด',3,false,'ส ๑.๑ ป.๔/๓'),
('SO1.1','SO1.1-P4-04','แสดงความเคารพพระรัตนตรัย ปฏิบัติตามไตรสิกขาและหลักธรรมโอวาท ๓ ในพระพุทธศาสนาหรือหลักธรรมของศาสนาที่ตนนับถือตามที่กำหนด',4,true,'ส ๑.๑ ป.๔/๔'),
('SO1.1','SO1.1-P4-05','ชื่นชมการทำความดีของตนเอง บุคคลในครอบครัว โรงเรียน และชุมชนตามหลักศาสนาพร้อมทั้งบอกแนวปฏิบัติในการดำเนินชีวิต',5,false,'ส ๑.๑ ป.๔/๕'),
('SO1.1','SO1.1-P4-06','เห็นคุณค่าและสวดมนต์ แผ่เมตตา มีสติที่เป็นพื้นฐานของสมาธิ ในพระพุทธศาสนาหรือการพัฒนาจิตตามแนวทางของศาสนาที่ตนนับถือ ตามที่กำหนด',6,false,'ส ๑.๑ ป.๔/๖'),
('SO1.1','SO1.1-P4-07','ปฏิบัติตนตามหลักธรรมของศาสนาที่ตนนับถือ เพื่อการอยู่ร่วมกันเป็นชาติได้อย่างสมานฉันท์',7,false,'ส ๑.๑ ป.๔/๗'),
('SO1.1','SO1.1-P4-08','อธิบายประวัติศาสดาของศาสนาอื่น ๆ โดยสังเขป',8,true,'ส ๑.๑ ป.๔/๘'),
('SO1.2','SO1.2-P4-01','อธิบายความสำคัญและมีส่วนร่วมในการบำรุงรักษาศาสนสถานของศาสนาที่ตนนับถือ',1,false,'ส ๑.๒ ป.๔/๑'),
('SO1.2','SO1.2-P4-02','มีมรรยาทของความเป็นศาสนิกชนที่ดีตามที่กำหนด',2,false,'ส ๑.๒ ป.๔/๒'),
('SO1.2','SO1.2-P4-03','ปฏิบัติตนในศาสนพิธี พิธีกรรม และวันสำคัญทางศาสนาตามที่กำหนดได้ถูกต้อง',3,false,'ส ๑.๒ ป.๔/๓'),
('SO1.2','SO1.2-P4-04','ปฏิบัติตนเป็นพลเมืองดีตามวิถีประชาธิปไตย ในฐานะสมาชิกที่ดีของชุมชน',4,false,'ส ๑.๒ ป.๔/๔'),
('SO2.1','SO2.1-P4-01','ปฏิบัติตนในการเป็นผู้นำและผู้ตามที่ดี',1,false,'ส ๒.๑ ป.๔/๒'),
('SO2.1','SO2.1-P4-02','วิเคราะห์สิทธิพื้นฐานที่เด็กทุกคนพึงได้รับตามกฎหมาย',2,false,'ส ๒.๑ ป.๔/๓'),
('SO2.1','SO2.1-P4-03','อธิบายความแตกต่างทางวัฒนธรรมของกลุ่มคนในท้องถิ่น',3,false,'ส ๒.๑ ป.๔/๔'),
('SO2.1','SO2.1-P4-04','เสนอวิธีการที่จะอยู่ร่วมกันอย่างสันติสุขในชีวิตประจำวัน',4,true,'ส ๒.๑ ป.๔/๕'),
('SO2.2','SO2.2-P4-01','อธิบายอำนาจอธิปไตยและความสำคัญของระบบประชาธิปไตย',1,true,'ส ๒.๒ ป.๔/๑'),
('SO2.2','SO2.2-P4-02','อธิบายบทบาทหน้าที่ของพลเมืองในกระบวนการเลือกตั้ง',2,true,'ส ๒.๒ ป.๔/๒'),
('SO2.2','SO2.2-P4-03','อธิบายความสำคัญของสถาบันพระมหากษัตริย์ตามระบอบประชาธิปไตยอันมีพระมหากษัตริย์ทรงเป็นประมุข',3,true,'ส ๒.๒ ป.๔/๓'),
('SO3.1','SO3.1-P4-01','ระบุปัจจัยที่มีผลต่อการเลือกซื้อสินค้าและบริการ',1,false,'ส ๓.๑ ป.๔/๑'),
('SO3.1','SO3.1-P4-02','บอกสิทธิพื้นฐานและรักษาผลประโยชน์ของตนเองในฐานะผู้บริโภค',2,false,'ส ๓.๑ ป.๔/๒'),
('SO3.1','SO3.1-P4-03','อธิบายหลักการของเศรษฐกิจพอเพียงและนำไปใช้ในชีวิตประจำวันของตนเอง',3,true,'ส ๓.๑ ป.๔/๓'),
('SO3.2','SO3.2-P4-01','อธิบายความสัมพันธ์ทางเศรษฐกิจของคนในชุมชน',1,false,'ส ๓.๒ ป.๔/๑'),
('SO3.2','SO3.2-P4-02','อธิบายหน้าที่เบื้องต้นของเงิน',2,true,'ส ๓.๒ ป.๔/๒'),
('SO4.1','SO4.1-P4-01','นับช่วงเวลาเป็นทศวรรษ ศตวรรษ และสหัสวรรษ',1,false,'ส ๔.๑ ป.๔/๓'),
('SO4.1','SO4.1-P4-02','อธิบายยุคสมัยในการศึกษาประวัติของมนุษยชาติโดยสังเขป',2,false,'ส ๔.๑ ป.๔/๔'),
('SO4.1','SO4.1-P4-03','แยกแยะประเภทหลักฐานที่ใช้ในการศึกษาความเป็นมาของท้องถิ่น',3,false,'ส ๔.๑ ป.๔/๓ (รหัสตามเอกสาร OBEC)'),
('SO4.2','SO4.2-P4-01','อธิบายการตั้งหลักแหล่งและพัฒนาการของมนุษย์ยุคก่อนประวัติศาสตร์และยุคประวัติศาสตร์โดยสังเขป',1,false,'ส ๔.๒ ป.๔/๑'),
('SO4.2','SO4.2-P4-02','ยกตัวอย่างหลักฐานทางประวัติศาสตร์ที่พบในท้องถิ่นที่แสดงพัฒนาการของมนุษย์ชาติ',2,false,'ส ๔.๒ ป.๔/๒'),
('SO4.3','SO4.3-P4-01','อธิบายพัฒนาการของอาณาจักรสุโขทัยโดยสังเขป',1,true,'ส ๔.๓ ป.๔/๑'),
('SO4.3','SO4.3-P4-02','บอกประวัติและผลงานของบุคคลสำคัญสมัยสุโขทัย',2,true,'ส ๔.๓ ป.๔/๒'),
('SO4.3','SO4.3-P4-03','อธิบายภูมิปัญญาไทยที่สำคัญสมัยสุโขทัยที่น่าภาคภูมิใจและควรค่าแก่การอนุรักษ์',3,true,'ส ๔.๓ ป.๔/๓'),
('SO5.1','SO5.1-P4-01','สืบค้นและอธิบายข้อมูลลักษณะทางกายภาพในจังหวัดของตนด้วยแผนที่และรูปถ่าย',1,false,'ส ๕.๑ ป.๕/๑ (รหัสตามเอกสาร OBEC)'),
('SO5.1','SO5.1-P4-02','ระบุแหล่งทรัพยากรและสถานที่สำคัญในจังหวัดของตนด้วยแผนที่และรูปถ่าย',2,false,'ส ๕.๑ ป.๕/๒ (รหัสตามเอกสาร OBEC)'),
('SO5.1','SO5.1-P4-03','อธิบายลักษณะทางกายภาพที่ส่งผลต่อแหล่งทรัพยากรและสถานที่สำคัญในจังหวัด',3,false,'ส ๕.๑ ป.๕/๓ (รหัสตามเอกสาร OBEC)'),
('SO5.2','SO5.2-P4-01','วิเคราะห์สิ่งแวดล้อมทางกายภาพที่ส่งผลต่อการดำเนินชีวิตของคนในจังหวัด',1,true,'ส ๕.๒ ป.๕/๑ (รหัสตามเอกสาร OBEC)'),
('SO5.2','SO5.2-P4-02','อธิบายการเปลี่ยนแปลงสิ่งแวดล้อมในจังหวัดและผลที่เกิดจากการเปลี่ยนแปลง',2,false,'ส ๕.๒ ป.๔/๒'),
('SO5.2','SO5.2-P4-03','นำเสนอแนวทางการจัดการสิ่งแวดล้อมในจังหวัด',3,true,'ส ๕.๒ ป.๔/๓')
),
upserted as (
 insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
 select t.id,seed.objective_code,seed.objective_name,
  'OBEC indicator '||seed.source_indicator_code||'; Prathom 4. Source: OBEC 2021 must-know/should-know Social Studies table, printed pages 191-197.',
  seed.sequence_no,'active'
 from seed join public.learning_topics t on t.code=seed.standard_code
 join public.learning_skills sk on sk.id=t.skill_id
 join public.learning_subjects s on s.id=sk.subject_id and s.code='SOCIAL-STUDIES'
 on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,updated_at=now()
 returning id,topic_id,code
)
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select u.id,c.id,gl.id,seed.sequence_no,seed.is_required,
 'OBEC 2021 classification: '||case when seed.is_required then 'must know' else 'should know' end||'; source code '||seed.source_indicator_code
from seed join public.learning_topics t on t.code=seed.standard_code
join upserted u on u.topic_id=t.id and u.code=seed.objective_code
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='SOCIAL-STUDIES'
join public.learning_curricula c on c.code='TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels gl on gl.curriculum_id=c.id and gl.code='P4'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();