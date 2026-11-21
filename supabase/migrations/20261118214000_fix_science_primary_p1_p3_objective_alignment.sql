-- Repair primary P1-P3 Science indicator seeding by sequencing topic upserts
-- before objective upserts and alignment inserts via the topics RETURNING CTE.
-- Source data and official wording are unchanged from the original OBEC 2021 migration.
with seed(grade_code,grade_sequence,standard_code,objective_code,indicator_name,priority,dual_priority,official_code,skill_code,topic_code,topic_name,indicator_sequence) as (
 values
('P1',1,'1.1','P1-S1_1-01','ระบุชื่อพืชและสัตว์ที่อาศัยอยู่บริเวณต่าง ๆ จากข้อมูลที่รวบรวมได้','should_know',false,'ว 1.1 ป.1/1','BIO','P1-W1.1','P1 — Living Things and Their Environment (1.1)',1),
('P1',2,'1.1','P1-S1_1-02','บอกสภาพแวดล้อมที่เหมาะสมกับการดำรงชีวิตของสัตว์ในบริเวณที่อาศัยอยู่','should_know',false,'ว 1.1 ป.1/2','BIO','P1-W1.1','P1 — Living Things and Their Environment (1.1)',2),
('P1',3,'1.2','P1-S1_2-01','ระบุชื่อ บรรยายลักษณะและบอกหน้าที่ของส่วนต่าง ๆ ของร่างกายมนุษย์ สัตว์ และพืช รวมทั้งบรรยายการทำหน้าที่ร่วมกันของส่วนต่าง ๆ ของร่างกายมนุษย์ในการทำกิจกรรมต่าง ๆ จากข้อมูลที่รวบรวมได้','must_know',true,'ว 1.2 ป.1/1','BIO','P1-W1.2','P1 — Life Processes and Organisms (1.2)',1),
('P1',4,'1.2','P1-S1_2-02','ตระหนักถึงความสำคัญของส่วนต่าง ๆ ของร่างกายตนเอง โดยการดูแลส่วนต่าง ๆ อย่างถูกต้อง ให้ปลอดภัย และรักษาความสะอาดอยู่เสมอ','should_know',false,'ว 1.2 ป.1/2','BIO','P1-W1.2','P1 — Life Processes and Organisms (1.2)',2),
('P1',5,'2.1','P1-S2_1-01','อธิบายสมบัติที่สังเกตได้ของวัสดุที่ใช้ทำวัตถุซึ่งทำจากวัสดุชนิดเดียวหรือหลายชนิดประกอบกัน โดยใช้หลักฐานเชิงประจักษ์','must_know',false,'ว 2.1 ป.1/1','MATTER','P1-W2.1','P1 — Materials and Their Properties (2.1)',1),
('P1',6,'2.1','P1-S2_1-02','ระบุชนิดของวัสดุและจัดกลุ่มวัสดุตามสมบัติที่สังเกตได้','must_know',false,'ว 2.1 ป.1/2','MATTER','P1-W2.1','P1 — Materials and Their Properties (2.1)',2),
('P1',7,'2.3','P1-S2_3-01','บรรยายการเกิดเสียงและทิศทางการเคลื่อนที่ของเสียงจากหลักฐานเชิงประจักษ์','must_know',false,'ว 2.3 ป.1/1','ENERGY','P1-W2.3','P1 — Energy and Waves (2.3)',1),
('P1',8,'3.1','P1-S3_1-01','ระบุดาวที่ปรากฏบนท้องฟ้าในเวลากลางวันและกลางคืนจากข้อมูลที่รวบรวมได้','should_know',false,'ว 3.1 ป.1/1','EARTH','P1-W3.1','P1 — Earth and Space (3.1)',1),
('P1',9,'3.1','P1-S3_1-02','อธิบายสาเหตุที่มองไม่เห็นดาวส่วนใหญ่ในเวลากลางวันจากหลักฐานเชิงประจักษ์','should_know',false,'ว 3.1 ป.1/2','EARTH','P1-W3.1','P1 — Earth and Space (3.1)',2),
('P1',10,'3.2','P1-S3_2-01','อธิบายลักษณะภายนอกของหินจากลักษณะเฉพาะตัวที่สังเกตได้','must_know',false,'ว 3.2 ป.1/1','EARTH','P1-W3.2','P1 — Earth Systems and Natural Resources (3.2)',1),
('P1',11,'4.2','P1-S4_2-01','แก้ปัญหาอย่างง่ายโดยใช้การลองผิดลองถูกการเปรียบเทียบ','must_know',false,'ว 4.2 ป.1/1','TECH','P1-W4.2','P1 — Technology and Computational Thinking (4.2)',1),
('P1',12,'4.2','P1-S4_2-02','แสดงลำดับขั้นตอนการทำงานหรือการแก้ปัญหาอย่างง่ายโดยใช้ภาพ สัญลักษณ์ หรือข้อความ','must_know',false,'ว 4.2 ป.1/2','TECH','P1-W4.2','P1 — Technology and Computational Thinking (4.2)',2),
('P1',13,'4.2','P1-S4_2-03','เขียนโปรแกรมอย่างง่ายโดยใช้ซอฟต์แวร์หรือสื่อ','must_know',false,'ว 4.2 ป.1/3','TECH','P1-W4.2','P1 — Technology and Computational Thinking (4.2)',3),
('P1',14,'4.2','P1-S4_2-04','ใช้เทคโนโลยีในการสร้าง จัดเก็บ เรียกใช้ข้อมูลตามวัตถุประสงค์','must_know',false,'ว 4.2 ป.1/4','TECH','P1-W4.2','P1 — Technology and Computational Thinking (4.2)',4),
('P1',15,'4.2','P1-S4_2-05','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ปฏิบัติตามข้อตกลงในการใช้คอมพิวเตอร์ร่วมกัน ดูแลรักษาอุปกรณ์เบื้องต้น ใช้งานอย่างเหมาะสม','should_know',false,'ว 4.2 ป.1/5','TECH','P1-W4.2','P1 — Technology and Computational Thinking (4.2)',5),
('P2',1,'1.2','P2-S1_2-01','ระบุว่าพืชต้องการแสงและน้ำเพื่อการเจริญเติบโตโดยใช้ข้อมูลจากหลักฐานเชิงประจักษ์','must_know',false,'ว 1.2 ป.2/1','BIO','P2-W1.2','P2 — Life Processes and Organisms (1.2)',1),
('P2',2,'1.2','P2-S1_2-02','ตระหนักถึงความจำเป็นที่พืชต้องได้รับน้ำและแสงเพื่อการเจริญเติบโต โดยดูแลพืชให้ได้รับสิ่งดังกล่าวอย่างเหมาะสม','should_know',false,'ว 1.2 ป.2/2','BIO','P2-W1.2','P2 — Life Processes and Organisms (1.2)',2),
('P2',3,'1.2','P2-S1_2-03','สร้างแบบจำลองที่บรรยายวัฏจักรชีวิตของพืชดอก','must_know',false,'ว 1.2 ป.2/3','BIO','P2-W1.2','P2 — Life Processes and Organisms (1.2)',3),
('P2',4,'1.3','P2-S1_3-01','เปรียบเทียบลักษณะของสิ่งมีชีวิตและสิ่งไม่มีชีวิตจากข้อมูลที่รวบรวมได้','must_know',false,'ว 1.3 ป.2/1','BIO','P2-W1.3','P2 — Life and Classification (1.3)',1),
('P2',5,'2.1','P2-S2_1-01','เปรียบเทียบสมบัติการดูดซับน้ำของวัสดุโดยใช้หลักฐานเชิงประจักษ์ และระบุการนำสมบัติการดูดซับน้ำของวัสดุไปประยุกต์ใช้ในการทำวัตถุในชีวิตประจำวัน','must_know',true,'ว 2.1 ป.2/1','MATTER','P2-W2.1','P2 — Materials and Their Properties (2.1)',1),
('P2',6,'2.1','P2-S2_1-02','อธิบายสมบัติที่สังเกตได้ของวัสดุที่เกิดจากการนำวัสดุมาผสมกัน โดยใช้หลักฐานเชิงประจักษ์','must_know',false,'ว 2.1 ป.2/2','MATTER','P2-W2.1','P2 — Materials and Their Properties (2.1)',2),
('P2',7,'2.1','P2-S2_1-03','เปรียบเทียบสมบัติที่สังเกตได้ของวัสดุเพื่อนำมาทำเป็นวัตถุในการใช้งานตามวัตถุประสงค์ และอธิบายการนำวัสดุที่ใช้แล้วกลับมาใช้ใหม่โดยใช้หลักฐานเชิงประจักษ์','should_know',false,'ว 2.1 ป.2/3','MATTER','P2-W2.1','P2 — Materials and Their Properties (2.1)',3),
('P2',8,'2.1','P2-S2_1-04','ตระหนักถึงประโยชน์ของการนำวัสดุที่ใช้แล้วกลับมาใช้ใหม่ โดยการนำวัสดุที่ใช้แล้วกลับมาใช้ใหม่','should_know',false,'ว 2.1 ป.2/4','MATTER','P2-W2.1','P2 — Materials and Their Properties (2.1)',4),
('P2',9,'2.3','P2-S2_3-01','บรรยายแนวการเคลื่อนที่ของแสงจากแหล่งกำเนิดแสง และอธิบายการมองเห็นวัตถุจากหลักฐานเชิงประจักษ์','must_know',false,'ว 2.3 ป.2/1','ENERGY','P2-W2.3','P2 — Energy and Waves (2.3)',1),
('P2',10,'2.3','P2-S2_3-02','ตระหนักในคุณค่าของความรู้ของการมองเห็นโดยเสนอแนะแนวทางการป้องกันอันตรายจากการมองวัตถุที่อยู่ในบริเวณที่มีแสงสว่างไม่เหมาะสม','should_know',false,'ว 2.3 ป.2/2','ENERGY','P2-W2.3','P2 — Energy and Waves (2.3)',2),
('P2',11,'3.2','P2-S3_2-01','ระบุส่วนประกอบของดิน และจำแนกชนิดของดินโดยใช้ลักษณะเนื้อดินและการจับตัวเป็นเกณฑ์','must_know',false,'ว 3.2 ป.2/1','EARTH','P2-W3.2','P2 — Earth Systems and Natural Resources (3.2)',1),
('P2',12,'3.2','P2-S3_2-02','อธิบายการใช้ประโยชน์จากดินจากข้อมูลที่รวบรวมได้','must_know',false,'ว 3.2 ป.2/2','EARTH','P2-W3.2','P2 — Earth Systems and Natural Resources (3.2)',2),
('P2',13,'4.2','P2-S4_2-01','แสดงลำดับขั้นตอนการทำงานหรือการแก้ปัญหาอย่างง่ายโดยใช้ภาพ สัญลักษณ์ หรือข้อความ','must_know',false,'ว 4.2 ป.2/1','TECH','P2-W4.2','P2 — Technology and Computational Thinking (4.2)',1),
('P2',14,'4.2','P2-S4_2-02','เขียนโปรแกรมอย่างง่ายโดยใช้ซอฟต์แวร์หรือสื่อและตรวจหาข้อผิดพลาดของโปรแกรม','must_know',false,'ว 4.2 ป.2/2','TECH','P2-W4.2','P2 — Technology and Computational Thinking (4.2)',2),
('P2',15,'4.2','P2-S4_2-03','ใช้เทคโนโลยีในการสร้าง จัดหมวดหมู่ ค้นหา จัดเก็บ เรียกใช้ข้อมูลตามวัตถุประสงค์','must_know',false,'ว 4.2 ป.2/3','TECH','P2-W4.2','P2 — Technology and Computational Thinking (4.2)',3),
('P2',16,'4.2','P2-S4_2-04','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ปฏิบัติตามข้อตกลงในการใช้คอมพิวเตอร์ร่วมกัน ดูแลรักษาอุปกรณ์เบื้องต้น ใช้งานอย่างเหมาะสม','should_know',false,'ว 4.2 ป.2/4','TECH','P2-W4.2','P2 — Technology and Computational Thinking (4.2)',4),
('P3',1,'1.2','P3-S1_2-01','บรรยายสิ่งที่จำเป็นต่อการดำรงชีวิตและการเจริญเติบโตของมนุษย์และสัตว์ โดยใช้ข้อมูลที่รวบรวมได้','must_know',false,'ว 1.2 ป.3/1','BIO','P3-W1.2','P3 — Life Processes and Organisms (1.2)',1),
('P3',2,'1.2','P3-S1_2-02','ตระหนักถึงประโยชน์ของอาหาร น้ำ และอากาศ โดยการดูแลตนเองและสัตว์ให้ได้รับสิ่งเหล่านี้อย่างเหมาะสม','should_know',false,'ว 1.2 ป.3/2','BIO','P3-W1.2','P3 — Life Processes and Organisms (1.2)',2),
('P3',3,'1.2','P3-S1_2-03','สร้างแบบจำลองที่บรรยายวัฏจักรชีวิตของสัตว์ และเปรียบเทียบวัฏจักรชีวิตของสัตว์บางชนิด','must_know',false,'ว 1.2 ป.3/3','BIO','P3-W1.2','P3 — Life Processes and Organisms (1.2)',3),
('P3',4,'1.2','P3-S1_2-04','ตระหนักถึงคุณค่าของชีวิตสัตว์ โดยไม่ทำให้วัฏจักรชีวิตของสัตว์เปลี่ยนแปลง','should_know',false,'ว 1.2 ป.3/4','BIO','P3-W1.2','P3 — Life Processes and Organisms (1.2)',4),
('P3',5,'2.1','P3-S2_1-01','อธิบายว่าวัตถุประกอบขึ้นจากชิ้นส่วนย่อย ๆ ซึ่งสามารถแยกออกจากกันและประกอบกันเป็นวัตถุชิ้นใหม่ได้ โดยใช้หลักฐานเชิงประจักษ์','must_know',false,'ว 2.1 ป.3/1','MATTER','P3-W2.1','P3 — Materials and Their Properties (2.1)',1),
('P3',6,'2.1','P3-S2_1-02','อธิบายการเปลี่ยนแปลงของวัสดุเมื่อทำให้ร้อนขึ้นหรือทำให้เย็นลง โดยใช้หลักฐานเชิงประจักษ์','must_know',false,'ว 2.1 ป.3/2','MATTER','P3-W2.1','P3 — Materials and Their Properties (2.1)',2),
('P3',7,'2.2','P3-S2_2-01','ระบุผลของแรงที่มีต่อการเปลี่ยนแปลงการเคลื่อนที่ของวัตถุจากหลักฐานเชิงประจักษ์','must_know',false,'ว 2.2 ป.3/1','FORCE','P3-W2.2','P3 — Forces and Motion (2.2)',1),
('P3',8,'2.2','P3-S2_2-02','เปรียบเทียบและยกตัวอย่างแรงสัมผัสและแรงไม่สัมผัสที่มีผลต่อการเคลื่อนที่ของวัตถุโดยใช้หลักฐานเชิงประจักษ์','must_know',false,'ว 2.2 ป.3/2','FORCE','P3-W2.2','P3 — Forces and Motion (2.2)',2),
('P3',9,'2.2','P3-S2_2-03','จำแนกวัตถุโดยใช้การดึงดูดกับแม่เหล็กเป็นเกณฑ์จากหลักฐานเชิงประจักษ์','must_know',false,'ว 2.2 ป.3/3','FORCE','P3-W2.2','P3 — Forces and Motion (2.2)',3),
('P3',10,'2.2','P3-S2_2-04','ระบุขั้วแม่เหล็กและพยากรณ์ผลที่เกิดขึ้นระหว่างขั้วแม่เหล็กเมื่อนำมาเข้าใกล้กันจากหลักฐานเชิงประจักษ์','must_know',false,'ว 2.2 ป.3/4','FORCE','P3-W2.2','P3 — Forces and Motion (2.2)',4),
('P3',11,'2.3','P3-S2_3-01','ยกตัวอย่างการเปลี่ยนพลังงานหนึ่งไปเป็นอีกพลังงานหนึ่งจากหลักฐานเชิงประจักษ์','must_know',false,'ว 2.3 ป.3/1','ENERGY','P3-W2.3','P3 — Energy and Waves (2.3)',1),
('P3',12,'2.3','P3-S2_3-02','บรรยายการทำงานของเครื่องกำเนิดไฟฟ้าและระบุแหล่งพลังงานในการผลิตไฟฟ้าจากข้อมูลที่รวบรวมได้','must_know',true,'ว 2.3 ป.3/2','ENERGY','P3-W2.3','P3 — Energy and Waves (2.3)',2),
('P3',13,'2.3','P3-S2_3-03','ตระหนักในประโยชน์และโทษของไฟฟ้า โดยนำเสนอวิธีการใช้ไฟฟ้าอย่างประหยัดและปลอดภัย','should_know',false,'ว 2.3 ป.3/3','ENERGY','P3-W2.3','P3 — Energy and Waves (2.3)',3),
('P3',14,'3.1','P3-S3_1-01','อธิบายแบบรูปเส้นทางการขึ้นและตกของดวงอาทิตย์โดยใช้หลักฐานเชิงประจักษ์','must_know',false,'ว 3.1 ป.3/1','EARTH','P3-W3.1','P3 — Earth and Space (3.1)',1),
('P3',15,'3.1','P3-S3_1-02','อธิบายสาเหตุการเกิดปรากฏการณ์การขึ้นและตกของดวงอาทิตย์ การเกิดกลางวันกลางคืน และการกำหนดทิศโดยใช้แบบจำลอง','must_know',false,'ว 3.1 ป.3/2','EARTH','P3-W3.1','P3 — Earth and Space (3.1)',2),
('P3',16,'3.1','P3-S3_1-03','ตระหนักถึงความสำคัญของดวงอาทิตย์ โดยบรรยายประโยชน์ของดวงอาทิตย์ต่อสิ่งมีชีวิต','should_know',false,'ว 3.1 ป.3/3','EARTH','P3-W3.1','P3 — Earth and Space (3.1)',3),
('P3',17,'3.2','P3-S3_2-01','ระบุส่วนประกอบของอากาศ บรรยายความสำคัญของอากาศ และผลกระทบของมลพิษทางอากาศต่อสิ่งมีชีวิต','must_know',false,'ว 3.2 ป.3/1','EARTH','P3-W3.2','P3 — Earth Systems and Natural Resources (3.2)',1),
('P3',18,'3.2','P3-S3_2-02','ตระหนักถึงความสำคัญของอากาศ โดยนำเสนอแนวทางการปฏิบัติตนในการลดการเกิดมลพิษทางอากาศ','should_know',false,'ว 3.2 ป.3/2','EARTH','P3-W3.2','P3 — Earth Systems and Natural Resources (3.2)',2),
('P3',19,'3.2','P3-S3_2-03','อธิบายการเกิดลมจากหลักฐานเชิงประจักษ์','must_know',false,'ว 3.2 ป.3/3','EARTH','P3-W3.2','P3 — Earth Systems and Natural Resources (3.2)',3),
('P3',20,'3.2','P3-S3_2-04','บรรยายประโยชน์และโทษของลมจากข้อมูลที่รวบรวมได้','should_know',false,'ว 3.2 ป.3/4','EARTH','P3-W3.2','P3 — Earth Systems and Natural Resources (3.2)',4),
('P3',21,'4.2','P3-S4_2-01','แสดงอัลกอริทึมในการทำงานหรือการแก้ปัญหาอย่างง่ายโดยใช้ภาพ สัญลักษณ์ หรือข้อความ','must_know',false,'ว 4.2 ป.3/1','TECH','P3-W4.2','P3 — Technology and Computational Thinking (4.2)',1),
('P3',22,'4.2','P3-S4_2-02','เขียนโปรแกรมอย่างง่ายโดยใช้ซอฟต์แวร์หรือสื่อและตรวจหาข้อผิดพลาดของโปรแกรม','must_know',false,'ว 4.2 ป.3/2','TECH','P3-W4.2','P3 — Technology and Computational Thinking (4.2)',2),
('P3',23,'4.2','P3-S4_2-03','ใช้อินเทอร์เน็ตค้นหาความรู้','must_know',false,'ว 4.2 ป.3/3','TECH','P3-W4.2','P3 — Technology and Computational Thinking (4.2)',3),
('P3',24,'4.2','P3-S4_2-04','รวบรวม ประมวลผล และนำเสนอข้อมูลโดยใช้ซอฟต์แวร์ตามวัตถุประสงค์','must_know',false,'ว 4.2 ป.3/4','TECH','P3-W4.2','P3 — Technology and Computational Thinking (4.2)',4),
('P3',25,'4.2','P3-S4_2-05','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ปฏิบัติตามข้อตกลงในการใช้อินเทอร์เน็ต','should_know',false,'ว 4.2 ป.3/5','TECH','P3-W4.2','P3 — Technology and Computational Thinking (4.2)',5)
),
tech_skill as (
 insert into public.learning_skills(subject_id,code,name,description,status)
 select sub.id,'TECH','Technology and Computational Thinking',
 'Official Science and Technology standard ว 4.2 and technology standards in the Thai Basic Education Core Curriculum.','active'
 from public.learning_subjects sub where sub.code='SCI'
 on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now()
 returning id,subject_id
),
skills as (
 select sk.id,sk.subject_id,sk.code from public.learning_skills sk
 join public.learning_subjects sub on sub.id=sk.subject_id
 where sub.code='SCI' and sk.code<>'TECH'
 union all
 select id,subject_id,'TECH' from tech_skill
),
topics as (
 insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
 select sk.id,s.topic_code,s.topic_name,
        'Official OBEC Science and Technology indicators for primary grade '||s.grade_code||', standard ว '||s.standard_code||'.',
        dense_rank() over(order by s.grade_code,s.standard_code),'active'
 from (select distinct grade_code,standard_code,topic_code,topic_name,skill_code from seed) s
 join skills sk on sk.code=s.skill_code
 on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now()
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
 join topics t on t.skill_id=sk.id and t.code=s.topic_code
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
join topics t on t.skill_id=sk.id and t.code=s.topic_code
join objective_upsert u on u.topic_id=t.id and u.code=s.objective_code
join public.learning_curricula c on c.code='TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=s.grade_code and g.status='active'
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,indicator_classification=excluded.indicator_classification,notes=excluded.notes,updated_at=now();