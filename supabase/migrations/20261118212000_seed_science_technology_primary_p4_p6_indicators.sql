-- Seed official OBEC 2021 primary Science and Technology indicators P4-P6 (W1-W3).
-- Idempotent; uses the existing SCI knowledge graph and national core curriculum.
-- Source: OBEC/IPST, Indicators and Core Learning Content: Must-Know and Should-Know,
-- Science and Technology, printed pages 71-89 (2021).
-- W4.2 is seeded separately. P4 ว 2.1 ป.4/1 and P6 ว 2.1 ป.6/1 are dual-classified.
with seed(grade_code,grade_sequence,standard_code,objective_code,indicator_name,priority,dual_priority,official_code,skill_code,topic_code,topic_name,indicator_sequence) as (
 values
('P4',1,'1.2','P4-S1_2-01','บรรยายหน้าที่ของราก ลำต้น ใบ และดอกของพืชดอก โดยใช้ข้อมูลที่รวบรวมได้','must_know',false ,'ว 1.2 ป.4/1','BIO','P4-W1.2','P4 — Life Processes and Organisms (1.2)',1),
('P4',2,'1.3','P4-S1_3-01','จำแนกสิ่งมีชีวิตโดยใช้ความเหมือนและความแตกต่างของลักษณะของสิ่งมีชีวิตออกเป็นกลุ่มพืช กลุ่มสัตว์ และกลุ่มที่ไม่ใช่พืชและสัตว์','must_know',false ,'ว 1.3 ป.4/1','BIO','P4-W1.3','P4 — Life and Classification (1.3)',1),
('P4',3,'1.3','P4-S1_3-02','จำแนกพืชออกเป็นพืชดอกและพืชไม่มีดอก โดยใช้การมีดอกเป็นเกณฑ์ โดยใช้ข้อมูลที่รวบรวมได้','must_know',false ,'ว 1.3 ป.4/2','BIO','P4-W1.3','P4 — Life and Classification (1.3)',2),
('P4',4,'1.3','P4-S1_3-03','จำแนกสัตว์ออกเป็นสัตว์มีกระดูกสันหลังและสัตว์ไม่มีกระดูกสันหลัง โดยใช้การมีกระดูกสันหลังเป็นเกณฑ์ โดยใช้ข้อมูลที่รวบรวมได้','must_know',false ,'ว 1.3 ป.4/3','BIO','P4-W1.3','P4 — Life and Classification (1.3)',3),
('P4',5,'1.3','P4-S1_3-04','บรรยายลักษณะเฉพาะที่สังเกตได้ของสัตว์มีกระดูกสันหลังในกลุ่มปลา กลุ่มสัตว์สะเทินน้ำสะเทินบก กลุ่มสัตว์เลื้อยคลาน กลุ่มนก และกลุ่มสัตว์เลี้ยงลูกด้วยน้ำนม และยกตัวอย่างสิ่งมีชีวิตในแต่ละกลุ่ม','must_know',false ,'ว 1.3 ป.4/4','BIO','P4-W1.3','P4 — Life and Classification (1.3)',4),
('P4',6,'2.1','P4-S2_1-01','เปรียบเทียบสมบัติทางกายภาพด้านความแข็ง สภาพยืดหยุ่น การนำความร้อน และการนำไฟฟ้าของวัสดุ โดยใช้หลักฐานเชิงประจักษ์จากการทดลอง และระบุการนำสมบัติเรื่องความแข็ง สภาพยืดหยุ่น การนำความร้อน และการนำไฟฟ้าของวัสดุไปใช้ในชีวิตประจำวันผ่านกระบวนการออกแบบชิ้นงาน','must_know',true ,'ว 2.1 ป.4/1','MATTER','P4-W2.1','P4 — Materials and Their Properties (2.1)',1),
('P4',7,'2.1','P4-S2_1-02','แลกเปลี่ยนความคิดกับผู้อื่น โดยการอภิปรายเกี่ยวกับสมบัติทางกายภาพของวัสดุอย่างมีเหตุผลจากการทดลอง','should_know',false ,'ว 2.1 ป.4/2','MATTER','P4-W2.1','P4 — Materials and Their Properties (2.1)',2),
('P4',8,'2.1','P4-S2_1-03','เปรียบเทียบสมบัติของสสารทั้ง 3 สถานะ จากข้อมูลที่ได้จากการสังเกตมวล การต้องการที่อยู่ รูปร่างและปริมาตรของสสาร','must_know',false ,'ว 2.1 ป.4/3','MATTER','P4-W2.1','P4 — Materials and Their Properties (2.1)',3),
('P4',9,'2.1','P4-S2_1-04','ใช้เครื่องมือเพื่อวัดมวลและปริมาตรของสสารทั้ง 3 สถานะ','must_know',false ,'ว 2.1 ป.4/4','MATTER','P4-W2.1','P4 — Materials and Their Properties (2.1)',4),
('P4',10,'2.2','P4-S2_2-01','ระบุผลของแรงโน้มถ่วงที่มีต่อวัตถุจากหลักฐานเชิงประจักษ์','must_know',false ,'ว 2.2 ป.4/1','FORCE','P4-W2.2','P4 — Forces and Motion (2.2)',1),
('P4',11,'2.2','P4-S2_2-02','ใช้เครื่องชั่งสปริงในการวัดน้ำหนักของวัตถุ','must_know',false ,'ว 2.2 ป.4/2','FORCE','P4-W2.2','P4 — Forces and Motion (2.2)',2),
('P4',12,'2.2','P4-S2_2-03','บรรยายมวลของวัตถุที่มีผลต่อการเปลี่ยนแปลงการเคลื่อนที่ของวัตถุจากหลักฐานเชิงประจักษ์','must_know',false ,'ว 2.2 ป.4/3','FORCE','P4-W2.2','P4 — Forces and Motion (2.2)',3),
('P4',13,'2.3','P4-S2_3-01','จำแนกวัตถุเป็นตัวกลางโปร่งใส ตัวกลางโปร่งแสง และวัตถุทึบแสง จากลักษณะการมองเห็นสิ่งต่าง ๆ ผ่านวัตถุนั้นเป็นเกณฑ์ โดยใช้หลักฐานเชิงประจักษ์','must_know',false ,'ว 2.3 ป.4/1','ENERGY','P4-W2.3','P4 — Energy and Waves (2.3)',1),
('P4',14,'3.1','P4-S3_1-01','อธิบายแบบรูปเส้นทางการขึ้นและตกของดวงจันทร์ โดยใช้หลักฐานเชิงประจักษ์','must_know',false ,'ว 3.1 ป.4/1','EARTH','P4-W3.1','P4 — Earth and Space (3.1)',1),
('P4',15,'3.1','P4-S3_1-02','สร้างแบบจำลองที่อธิบายแบบรูปการเปลี่ยนแปลงรูปร่างปรากฏของดวงจันทร์และพยากรณ์รูปร่างปรากฏของดวงจันทร์','should_know',false ,'ว 3.1 ป.4/2','EARTH','P4-W3.1','P4 — Earth and Space (3.1)',2),
('P4',16,'3.1','P4-S3_1-03','สร้างแบบจำลองแสดงองค์ประกอบของระบบสุริยะ และอธิบายเปรียบเทียบคาบการโคจรของดาวเคราะห์ต่าง ๆ จากแบบจำลอง','should_know',false ,'ว 3.1 ป.4/3','EARTH','P4-W3.1','P4 — Earth and Space (3.1)',3),
('P5',1,'1.1','P5-S1_1-01','บรรยายโครงสร้างและลักษณะของสิ่งมีชีวิตที่เหมาะสมกับการดำรงชีวิต ซึ่งเป็นผลมาจากการปรับตัวของสิ่งมีชีวิตในแต่ละแหล่งที่อยู่','must_know',false ,'ว 1.1 ป.5/1','BIO','P5-W1.1','P5 — Living Things and Their Environment (1.1)',1),
('P5',2,'1.1','P5-S1_1-02','อธิบายความสัมพันธ์ระหว่างสิ่งมีชีวิตกับสิ่งมีชีวิต และความสัมพันธ์ระหว่างสิ่งมีชีวิตกับสิ่งไม่มีชีวิต เพื่อประโยชน์ต่อการดำรงชีวิต','must_know',false ,'ว 1.1 ป.5/2','BIO','P5-W1.1','P5 — Living Things and Their Environment (1.1)',2),
('P5',3,'1.1','P5-S1_1-03','เขียนโซ่อาหารและระบุบทบาทหน้าที่ของสิ่งมีชีวิตที่เป็นผู้ผลิตและผู้บริโภคในโซ่อาหาร','must_know',false ,'ว 1.1 ป.5/3','BIO','P5-W1.1','P5 — Living Things and Their Environment (1.1)',3),
('P5',4,'1.1','P5-S1_1-04','ตระหนักในคุณค่าของสิ่งแวดล้อมที่มีต่อการดำรงชีวิตของสิ่งมีชีวิต โดยมีส่วนร่วมในการดูแลรักษาสิ่งแวดล้อม','should_know',false ,'ว 1.1 ป.5/4','BIO','P5-W1.1','P5 — Living Things and Their Environment (1.1)',4),
('P5',5,'1.3','P5-S1_3-01','อธิบายลักษณะทางพันธุกรรมที่มีการถ่ายทอดจากพ่อแม่สู่ลูกของพืช สัตว์ และมนุษย์','must_know',false ,'ว 1.3 ป.5/1','BIO','P5-W1.3','P5 — Life and Classification (1.3)',1),
('P5',6,'1.3','P5-S1_3-02','แสดงความอยากรู้อยากเห็น โดยการถามคำถามเกี่ยวกับลักษณะที่คล้ายคลึงกันของตนเองกับพ่อแม่','should_know',false ,'ว 1.3 ป.5/2','BIO','P5-W1.3','P5 — Life and Classification (1.3)',2),
('P5',7,'2.1','P5-S2_1-01','อธิบายการเปลี่ยนสถานะของสสาร เมื่อทำให้สสารร้อนขึ้นหรือเย็นลง โดยใช้หลักฐานเชิงประจักษ์','must_know',false ,'ว 2.1 ป.5/1','MATTER','P5-W2.1','P5 — Materials and Their Properties (2.1)',1),
('P5',8,'2.1','P5-S2_1-02','อธิบายการละลายของสารในน้ำ โดยใช้หลักฐานเชิงประจักษ์','must_know',false ,'ว 2.1 ป.5/2','MATTER','P5-W2.1','P5 — Materials and Their Properties (2.1)',2),
('P5',9,'2.1','P5-S2_1-03','วิเคราะห์การเปลี่ยนแปลงของสารเมื่อเกิดการเปลี่ยนแปลงทางเคมี โดยใช้หลักฐานเชิงประจักษ์','must_know',false ,'ว 2.1 ป.5/3','MATTER','P5-W2.1','P5 — Materials and Their Properties (2.1)',3),
('P5',10,'2.1','P5-S2_1-04','วิเคราะห์และระบุการเปลี่ยนแปลงที่ผันกลับได้และการเปลี่ยนแปลงที่ผันกลับไม่ได้','must_know',false ,'ว 2.1 ป.5/4','MATTER','P5-W2.1','P5 — Materials and Their Properties (2.1)',4),
('P5',11,'2.2','P5-S2_2-01','อธิบายวิธีการหาแรงลัพธ์ของแรงหลายแรงในแนวเดียวกันที่กระทำต่อวัตถุในกรณีที่วัตถุอยู่นิ่งจากหลักฐานเชิงประจักษ์','must_know',false ,'ว 2.2 ป.5/1','FORCE','P5-W2.2','P5 — Forces and Motion (2.2)',1),
('P5',12,'2.2','P5-S2_2-02','เขียนแผนภาพแสดงแรงที่กระทำต่อวัตถุที่อยู่ในแนวเดียวกันและแรงลัพธ์ที่กระทำต่อวัตถุ','must_know',false ,'ว 2.2 ป.5/2','FORCE','P5-W2.2','P5 — Forces and Motion (2.2)',2),
('P5',13,'2.2','P5-S2_2-03','ใช้เครื่องชั่งสปริงในการวัดแรงที่กระทำต่อวัตถุ','must_know',false ,'ว 2.2 ป.5/3','FORCE','P5-W2.2','P5 — Forces and Motion (2.2)',3),
('P5',14,'2.2','P5-S2_2-04','ระบุผลของแรงเสียดทานที่มีต่อการเปลี่ยนแปลงการเคลื่อนที่ของวัตถุจากหลักฐานเชิงประจักษ์','must_know',false ,'ว 2.2 ป.5/4','FORCE','P5-W2.2','P5 — Forces and Motion (2.2)',4),
('P5',15,'2.2','P5-S2_2-05','เขียนแผนภาพแสดงแรงเสียดทานและแรงที่อยู่ในแนวเดียวกันที่กระทำต่อวัตถุ','must_know',false ,'ว 2.2 ป.5/5','FORCE','P5-W2.2','P5 — Forces and Motion (2.2)',5),
('P5',16,'2.3','P5-S2_3-01','อธิบายการได้ยินเสียงผ่านตัวกลางจากหลักฐานเชิงประจักษ์','must_know',false ,'ว 2.3 ป.5/1','ENERGY','P5-W2.3','P5 — Energy and Waves (2.3)',1),
('P5',17,'2.3','P5-S2_3-02','ระบุตัวแปร ทดลอง และอธิบายลักษณะและการเกิดเสียงสูงเสียงต่ำ','must_know',false ,'ว 2.3 ป.5/2','ENERGY','P5-W2.3','P5 — Energy and Waves (2.3)',2),
('P5',18,'2.3','P5-S2_3-03','ออกแบบการทดลองและอธิบายลักษณะและการเกิดเสียงดังเสียงค่อย','must_know',false ,'ว 2.3 ป.5/3','ENERGY','P5-W2.3','P5 — Energy and Waves (2.3)',3),
('P5',19,'2.3','P5-S2_3-04','วัดระดับเสียงโดยใช้เครื่องมือวัดระดับเสียง','should_know',false ,'ว 2.3 ป.5/4','ENERGY','P5-W2.3','P5 — Energy and Waves (2.3)',4),
('P5',20,'2.3','P5-S2_3-05','ตระหนักในคุณค่าของความรู้เรื่องระดับเสียง โดยเสนอแนะแนวทางในการหลีกเลี่ยงและลดมลพิษทางเสียง','should_know',false ,'ว 2.3 ป.5/5','ENERGY','P5-W2.3','P5 — Energy and Waves (2.3)',5),
('P5',21,'3.1','P5-S3_1-01','เปรียบเทียบความแตกต่างของดาวเคราะห์และดาวฤกษ์จากแบบจำลอง','should_know',false ,'ว 3.1 ป.5/1','EARTH','P5-W3.1','P5 — Earth and Space (3.1)',1),
('P5',22,'3.1','P5-S3_1-02','ใช้แผนที่ดาวระบุตำแหน่งและเส้นทางการขึ้นและตกของกลุ่มดาวฤกษ์บนท้องฟ้า และอธิบายแบบรูปเส้นทางการขึ้นและตกของกลุ่มดาวฤกษ์บนท้องฟ้าในรอบปี','must_know',false ,'ว 3.1 ป.5/2','EARTH','P5-W3.1','P5 — Earth and Space (3.1)',2),
('P5',23,'3.2','P5-S3_2-01','เปรียบเทียบปริมาณน้ำในแต่ละแหล่ง และระบุปริมาณน้ำที่มนุษย์สามารถนำมาใช้ประโยชน์ได้จากข้อมูลที่รวบรวมได้','must_know',false ,'ว 3.2 ป.5/1','EARTH','P5-W3.2','P5 — Earth Systems and Natural Resources (3.2)',1),
('P5',24,'3.2','P5-S3_2-02','ตระหนักถึงคุณค่าของน้ำ โดยนำเสนอแนวทางการใช้น้ำอย่างประหยัดและการอนุรักษ์น้ำ','should_know',false ,'ว 3.2 ป.5/2','EARTH','P5-W3.2','P5 — Earth Systems and Natural Resources (3.2)',2),
('P5',25,'3.2','P5-S3_2-03','สร้างแบบจำลองที่อธิบายการหมุนเวียนของน้ำในวัฏจักรน้ำ','must_know',false ,'ว 3.2 ป.5/3','EARTH','P5-W3.2','P5 — Earth Systems and Natural Resources (3.2)',3),
('P5',26,'3.2','P5-S3_2-04','เปรียบเทียบกระบวนการเกิดเมฆ หมอก น้ำค้าง และน้ำค้างแข็งจากแบบจำลอง','must_know',false ,'ว 3.2 ป.5/4','EARTH','P5-W3.2','P5 — Earth Systems and Natural Resources (3.2)',4),
('P5',27,'3.2','P5-S3_2-05','เปรียบเทียบกระบวนการเกิดฝน หิมะ และลูกเห็บจากข้อมูลที่รวบรวมได้','must_know',false ,'ว 3.2 ป.5/5','EARTH','P5-W3.2','P5 — Earth Systems and Natural Resources (3.2)',5),
('P6',1,'1.2','P6-S1_2-01','ระบุสารอาหารและบอกประโยชน์ของสารอาหารแต่ละประเภทจากอาหารที่ตนเองรับประทาน','should_know',false ,'ว 1.2 ป.6/1','BIO','P6-W1.2','P6 — Life Processes and Organisms (1.2)',1),
('P6',2,'1.2','P6-S1_2-02','บอกแนวทางในการเลือกรับประทานอาหารให้ได้สารอาหารครบถ้วนในสัดส่วนที่เหมาะสมกับเพศและวัย รวมทั้งความปลอดภัยต่อสุขภาพ','should_know',false ,'ว 1.2 ป.6/2','BIO','P6-W1.2','P6 — Life Processes and Organisms (1.2)',2),
('P6',3,'1.2','P6-S1_2-03','ตระหนักถึงความสำคัญของสารอาหาร โดยการเลือกรับประทานอาหารที่มีสารอาหารครบถ้วนในสัดส่วนที่เหมาะสมกับเพศและวัย รวมทั้งปลอดภัยต่อสุขภาพ','should_know',false ,'ว 1.2 ป.6/3','BIO','P6-W1.2','P6 — Life Processes and Organisms (1.2)',3),
('P6',4,'1.2','P6-S1_2-04','สร้างแบบจำลองระบบย่อยอาหาร และบรรยายหน้าที่ของอวัยวะในระบบย่อยอาหาร รวมทั้งอธิบายการย่อยอาหารและการดูดซึมสารอาหาร','must_know',false ,'ว 1.2 ป.6/4','BIO','P6-W1.2','P6 — Life Processes and Organisms (1.2)',4),
('P6',5,'1.2','P6-S1_2-05','ตระหนักถึงความสำคัญของระบบย่อยอาหารโดยการบอกแนวทางในการดูแลรักษาอวัยวะในระบบย่อยอาหารให้ทำงานเป็นปกติ','should_know',false ,'ว 1.2 ป.6/5','BIO','P6-W1.2','P6 — Life Processes and Organisms (1.2)',5),
('P6',6,'2.1','P6-S2_1-01','อธิบายและเปรียบเทียบการแยกสารผสมโดยการหยิบออก การร่อน การใช้แม่เหล็กดึงดูด การรินออก การกรอง และการตกตะกอน โดยใช้หลักฐานเชิงประจักษ์ รวมทั้งระบุวิธีแก้ปัญหาในชีวิตประจำวันเกี่ยวกับการแยกสาร','must_know',true ,'ว 2.1 ป.6/1','MATTER','P6-W2.1','P6 — Materials and Their Properties (2.1)',1),
('P6',7,'2.2','P6-S2_2-01','อธิบายการเกิดและผลของแรงไฟฟ้าซึ่งเกิดจากวัตถุที่ผ่านการขัดถู โดยใช้หลักฐานเชิงประจักษ์','must_know',false ,'ว 2.2 ป.6/1','FORCE','P6-W2.2','P6 — Forces and Motion (2.2)',1),
('P6',8,'2.3','P6-S2_3-01','ระบุส่วนประกอบและบรรยายหน้าที่ของแต่ละส่วนประกอบของวงจรไฟฟ้าอย่างง่ายจากหลักฐานเชิงประจักษ์','must_know',false ,'ว 2.3 ป.6/1','ENERGY','P6-W2.3','P6 — Energy and Waves (2.3)',1),
('P6',9,'2.3','P6-S2_3-02','เขียนแผนภาพและต่อวงจรไฟฟ้าอย่างง่าย','must_know',false ,'ว 2.3 ป.6/2','ENERGY','P6-W2.3','P6 — Energy and Waves (2.3)',2),
('P6',10,'2.3','P6-S2_3-03','ออกแบบการทดลองและทดลองด้วยวิธีที่เหมาะสมในการอธิบายวิธีการและผลของการต่อเซลล์ไฟฟ้าแบบอนุกรม','must_know',false ,'ว 2.3 ป.6/3','ENERGY','P6-W2.3','P6 — Energy and Waves (2.3)',3),
('P6',11,'2.3','P6-S2_3-04','ตระหนักถึงประโยชน์ของความรู้ของการต่อเซลล์ไฟฟ้าแบบอนุกรม โดยบอกประโยชน์และการประยุกต์ใช้ในชีวิตประจำวัน','should_know',false ,'ว 2.3 ป.6/4','ENERGY','P6-W2.3','P6 — Energy and Waves (2.3)',4),
('P6',12,'2.3','P6-S2_3-05','ออกแบบการทดลองและทดลองด้วยวิธีที่เหมาะสมในการอธิบายการต่อหลอดไฟฟ้าแบบอนุกรมและแบบขนาน','must_know',false ,'ว 2.3 ป.6/5','ENERGY','P6-W2.3','P6 — Energy and Waves (2.3)',5),
('P6',13,'2.3','P6-S2_3-06','ตระหนักถึงประโยชน์ของความรู้ของการต่อหลอดไฟฟ้าแบบอนุกรมและแบบขนาน โดยบอกประโยชน์ ข้อจำกัด และการประยุกต์ใช้ในชีวิตประจำวัน','should_know',false ,'ว 2.3 ป.6/6','ENERGY','P6-W2.3','P6 — Energy and Waves (2.3)',6),
('P6',14,'2.3','P6-S2_3-07','อธิบายการเกิดเงามืดเงามัวจากหลักฐานเชิงประจักษ์','must_know',false ,'ว 2.3 ป.6/7','ENERGY','P6-W2.3','P6 — Energy and Waves (2.3)',7),
('P6',15,'2.3','P6-S2_3-08','เขียนแผนภาพรังสีของแสงแสดงการเกิดเงามืดเงามัว','must_know',false ,'ว 2.3 ป.6/8','ENERGY','P6-W2.3','P6 — Energy and Waves (2.3)',8),
('P6',16,'3.1','P6-S3_1-01','สร้างแบบจำลองที่อธิบายการเกิดและเปรียบเทียบปรากฏการณ์สุริยุปราคาและจันทรุปราคา','must_know',false ,'ว 3.1 ป.6/1','EARTH','P6-W3.1','P6 — Earth and Space (3.1)',1),
('P6',17,'3.1','P6-S3_1-02','อธิบายพัฒนาการของเทคโนโลยีอวกาศ และยกตัวอย่างการนำเทคโนโลยีอวกาศมาใช้ประโยชน์ในชีวิตประจำวันจากข้อมูลที่รวบรวมได้','should_know',false ,'ว 3.1 ป.6/2','EARTH','P6-W3.1','P6 — Earth and Space (3.1)',2),
('P6',18,'3.2','P6-S3_2-01','เปรียบเทียบกระบวนการเกิดหินอัคนี หินตะกอน และหินแปร และอธิบายวัฏจักรหินจากแบบจำลอง','must_know',false ,'ว 3.2 ป.6/1','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',1),
('P6',19,'3.2','P6-S3_2-02','บรรยายและยกตัวอย่างการใช้ประโยชน์ของหินและแร่ในชีวิตประจำวันจากข้อมูลที่รวบรวมได้','should_know',false ,'ว 3.2 ป.6/2','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',2),
('P6',20,'3.2','P6-S3_2-03','สร้างแบบจำลองที่อธิบายการเกิดซากดึกดำบรรพ์และคาดคะเนสภาพแวดล้อมในอดีตของซากดึกดำบรรพ์','must_know',false ,'ว 3.2 ป.6/3','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',3),
('P6',21,'3.2','P6-S3_2-04','เปรียบเทียบการเกิดลมบก ลมทะเล และมรสุม รวมทั้งอธิบายผลที่มีต่อสิ่งมีชีวิตและสิ่งแวดล้อมจากแบบจำลอง','must_know',false ,'ว 3.2 ป.6/4','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',4),
('P6',22,'3.2','P6-S3_2-05','อธิบายผลของมรสุมต่อการเกิดฤดูของประเทศไทยจากข้อมูลที่รวบรวมได้','must_know',false ,'ว 3.2 ป.6/5','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',5),
('P6',23,'3.2','P6-S3_2-06','บรรยายลักษณะและผลกระทบของน้ำท่วม การกัดเซาะชายฝั่ง ดินถล่ม แผ่นดินไหว สึนามิ','must_know',false ,'ว 3.2 ป.6/6','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',6),
('P6',24,'3.2','P6-S3_2-07','ตระหนักถึงผลกระทบของภัยธรรมชาติและธรณีพิบัติภัย โดยนำเสนอแนวทางในการเฝ้าระวังและปฏิบัติตนให้ปลอดภัยจากภัยธรรมชาติและธรณีพิบัติภัยที่อาจเกิดในท้องถิ่น','should_know',false ,'ว 3.2 ป.6/7','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',7),
('P6',25,'3.2','P6-S3_2-08','สร้างแบบจำลองที่อธิบายการเกิดปรากฏการณ์เรือนกระจกและผลของปรากฏการณ์เรือนกระจกต่อสิ่งมีชีวิต','must_know',false ,'ว 3.2 ป.6/8','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',8),
('P6',26,'3.2','P6-S3_2-09','ตระหนักถึงผลกระทบของปรากฏการณ์เรือนกระจก โดยนำเสนอแนวทางการปฏิบัติตนเพื่อลดกิจกรรมที่ก่อให้เกิดแก๊สเรือนกระจก','must_know',false ,'ว 3.2 ป.6/9','EARTH','P6-W3.2','P6 — Earth Systems and Natural Resources (3.2)',9)
),
skills as (
 select sk.id,sk.subject_id,sk.code
 from public.learning_skills sk
 join public.learning_subjects sub on sub.id=sk.subject_id
 where sub.code='SCI'
),
topics as (
 insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
 select sk.id,s.topic_code,s.topic_name,
        'Official OBEC Science and Technology indicators for primary grade '||s.grade_code||', standard ว '||s.standard_code||'.',
        dense_rank() over(order by s.grade_code,s.standard_code),'active'
 from (select distinct grade_code,standard_code,topic_code,topic_name,skill_code from seed) s
 join skills sk on sk.code=s.skill_code
 on conflict(skill_id,code) do update
 set name=excluded.name,description=excluded.description,status='active',updated_at=now()
 returning id,skill_id,code
),
objective_upsert as (
 insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
 select t.id,s.objective_code,s.indicator_name,
        'Official Thai indicator '||s.official_code||'. OBEC 2021 priority: '||
        case when s.dual_priority then 'must_know and should_know (dual-classified)' else s.priority end||'.',
        s.indicator_sequence,'active'
 from seed s
 join skills sk on sk.code=s.skill_code
 join public.learning_topics t on t.skill_id=sk.id and t.code=s.topic_code
 on conflict(topic_id,code) do update
 set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now()
 returning id,topic_id,code
)
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,indicator_classification,notes)
select u.id,c.id,g.id,s.grade_sequence,(s.priority='must_know'),s.priority,
       'Official indicator: '||s.official_code||'. OBEC 2021 priority: '||
       case when s.dual_priority then 'must_know and should_know (dual-classified); stored as must_know because the alignment schema permits one classification.' else s.priority end||'.'
from seed s
join skills sk on sk.code=s.skill_code
join public.learning_topics t on t.skill_id=sk.id and t.code=s.topic_code
join objective_upsert u on u.topic_id=t.id and u.code=s.objective_code
join public.learning_curricula c on c.code='TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=s.grade_code and g.status='active'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,
    indicator_classification=excluded.indicator_classification,notes=excluded.notes,updated_at=now();
