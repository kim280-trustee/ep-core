begin;

-- Official OBEC 2021 lower-secondary additions: M1 technology (9),
-- M2 matter W2.1 (6), M2 design technology W4.1 (5), M2 computing W4.2 (4).
-- Seed the canonical Science curriculum and mirror the same objectives into
-- the national master curriculum; do not create school or learner records.

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.sequence_no,'active'
from (values
('M1-DESIGN-TECHNOLOGY','Design and Technology — M1','Technology concepts, problem identification, design, testing and safe tool use.','TECH',1),
('M1-COMPUTATIONAL-THINKING','Computational Thinking — M1','Algorithms, simple programming, data processing and safe information technology use.','TECH',2),
('M2-MATTER-AND-SOLUTIONS','Mixtures and Solutions — M2','Separation of mixtures, solubility, concentration and safe use of solutions.','MATTER',1),
('M2-DESIGN-TECHNOLOGY','Design and Technology — M2','Technology impacts, local problem-solving, design evaluation and safe practical work.','TECH',3),
('M2-COMPUTATIONAL-THINKING','Computational Thinking — M2','Algorithms, logic, functions, computer systems and responsible digital citizenship.','TECH',4)
) v(code,name,description,skill_code,sequence_no)
join public.learning_skills sk on sk.code=v.skill_code
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

with seed(grade_code,topic_code,code,name,description,official_thai,classification,sequence_no) as (values
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-01','Explain technology in everyday life','Explain how technologies are created to solve problems or meet needs; model input, process, output and feedback in a system.','อธิบายแนวคิดหลักของเทคโนโลยีในชีวิตประจำวัน และวิเคราะห์สาเหตุหรือปัจจัยที่ส่งผลต่อการเปลี่ยนแปลงของเทคโนโลยี','must_know',1),
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-02','Identify a community problem or need','Identify a local need, define the problem, collect relevant information and respect intellectual-property rights.','ระบุปัญหาหรือความต้องการของชุมชนหรือท้องถิ่น เพื่อพัฒนางานอาชีพ สรุปกรอบของปัญหา รวบรวม วิเคราะห์ข้อมูลและแนวคิดที่เกี่ยวข้องกับปัญหา โดยคำนึงถึงความถูกต้องด้านทรัพย์สินทางปัญญา','must_know',2),
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-03','Design and plan a solution','Compare information and solution options, communicate a design, and plan steps and time for implementation.','ออกแบบวิธีการแก้ปัญหาโดยวิเคราะห์ เปรียบเทียบ และตัดสินใจเลือกข้อมูลที่จำเป็น นำเสนอแนวทางการแก้ปัญหาให้ผู้อื่นเข้าใจ วางแผนและดำเนินการแก้ปัญหา','must_know',3),
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-04','Test and improve a solution','Test a product or process, identify weaknesses, improve it and present the result.','ทดสอบ ประเมินผล และระบุข้อบกพร่องที่เกิดขึ้น พร้อมทั้งหาแนวทางการปรับปรุงแก้ไข และนำเสนอผลการแก้ปัญหา','must_know',4),
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-05','Choose and use tools safely','Select suitable materials, tools, mechanisms and electrical/electronic components and use them safely.','ใช้ความรู้และทักษะเกี่ยวกับวัสดุ อุปกรณ์ เครื่องมือ กลไก ไฟฟ้า หรืออิเล็กทรอนิกส์ เพื่อแก้ปัญหาได้อย่างถูกต้อง เหมาะสม และปลอดภัย','should_know',5),
('M1','M1-COMPUTATIONAL-THINKING','M1-S4_2-01','Design an algorithm using abstraction','Design an algorithm using computational abstraction to solve or explain a real-life task.','ออกแบบอัลกอริทึมที่ใช้แนวคิดเชิงนามธรรมเพื่อแก้ปัญหาหรืออธิบายการทำงานที่พบในชีวิตจริง','must_know',6),
('M1','M1-COMPUTATIONAL-THINKING','M1-S4_2-02','Write a simple program','Design and write a simple program using variables, conditions or loops to solve a mathematics or science problem.','ออกแบบและเขียนโปรแกรมอย่างง่ายเพื่อใช้แก้ปัญหาทางคณิตศาสตร์หรือวิทยาศาสตร์','must_know',7),
('M1','M1-COMPUTATIONAL-THINKING','M1-S4_2-03','Collect and present data digitally','Collect primary data, process and evaluate it, then present useful information with suitable software or online services.','รวบรวมข้อมูลปฐมภูมิ ประมวลผล ประเมินผล นำเสนอข้อมูลและสารสนเทศตามวัตถุประสงค์ โดยใช้ซอฟต์แวร์หรือบริการบนอินเทอร์เน็ตที่หลากหลาย','should_know',8),
('M1','M1-COMPUTATIONAL-THINKING','M1-S4_2-04','Use information technology safely','Protect privacy and identity, assess online content and follow rules for using digital media and information sources.','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ใช้สื่อและแหล่งข้อมูลตามข้อกำหนดและข้อตกลง','should_know',9),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-01','Explain methods for separating mixtures','Explain how evaporation, crystallisation, simple distillation, paper chromatography and solvent extraction separate mixtures using evidence.','อธิบายการแยกสารผสมโดยการระเหยแห้ง การตกผลึก การกลั่นอย่างง่าย โครมาโทกราฟีแบบกระดาษ การสกัดด้วยตัวทำละลาย โดยใช้หลักฐานเชิงประจักษ์','must_know',10),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-02','Separate mixtures using suitable methods','Carry out suitable mixture-separation methods and record observations safely.','แยกสารโดยการระเหยแห้ง การตกผลึก การกลั่นอย่างง่าย โครมาโทกราฟีแบบกระดาษ การสกัดด้วยตัวทำละลาย','must_know',1),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-03','Apply separation methods to daily problems','Choose and apply a separation method to solve a practical problem by integrating science, mathematics, technology and engineering.','นำวิธีการแยกสารไปใช้แก้ปัญหาในชีวิตประจำวัน โดยบูรณาการวิทยาศาสตร์ คณิตศาสตร์ เทคโนโลยีและวิศวกรรมศาสตร์','must_know',2),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-04','Investigate factors affecting solubility','Design and conduct an investigation of how solute, solvent and temperature affect solubility, and explain the effect of pressure where relevant.','ออกแบบการทดลองและทดลองในการอธิบายผลของชนิดตัวละลาย ชนิดตัวทำละลาย อุณหภูมิที่มีต่อสภาพละลายได้ของสาร รวมทั้งอธิบายผลของความดันที่มีต่อสภาพละลายได้ของสาร โดยใช้สารสนเทศ','must_know',3),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-05','Calculate concentration as a percentage','Express solute concentration as percentage volume/volume, mass/mass or mass/volume.','ระบุปริมาณตัวละลายในสารละลายในหน่วยความเข้มข้นเป็นร้อยละปริมาตรต่อปริมาตร มวลต่อมวล และมวลต่อปริมาตร','must_know',4),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-06','Use solutions safely in everyday life','Explain why concentration matters and give examples of using solutions correctly and safely.','ตระหนักถึงความสำคัญของการนำความรู้เรื่องความเข้มข้นของสารไปใช้ โดยยกตัวอย่างการใช้สารละลายในชีวิตประจำวันอย่างถูกต้องและปลอดภัย','should_know',5),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-01','Predict technology trends and impacts','Predict technology trends and compare benefits and impacts on people, society and the environment before choosing technology.','คาดการณ์แนวโน้มเทคโนโลยีที่จะเกิดขึ้น โดยพิจารณาจากสาเหตุหรือปัจจัยที่ส่งผลต่อการเปลี่ยนแปลงของเทคโนโลยี และวิเคราะห์เปรียบเทียบตัดสินใจเลือกใช้เทคโนโลยีโดยคำนึงถึงผลกระทบที่เกิดขึ้นต่อชีวิต สังคม และสิ่งแวดล้อม','must_know',6),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-02','Define a local problem or need','Identify a community problem or need, define its scope and gather relevant information and ideas.','ระบุปัญหาหรือความต้องการในชุมชนหรือท้องถิ่น สรุปกรอบของปัญหา รวบรวม วิเคราะห์ข้อมูลและแนวคิดที่เกี่ยวข้องกับปัญหา','must_know',7),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-03','Design and plan a solution within constraints','Compare options and resources, present a solution, plan the steps and carry it out systematically.','ออกแบบวิธีการแก้ปัญหาโดยวิเคราะห์เปรียบเทียบและตัดสินใจเลือกข้อมูลที่จำเป็นภายใต้เงื่อนไขและทรัพยากรที่มีอยู่ นำเสนอแนวทางการแก้ปัญหาให้ผู้อื่นเข้าใจ วางแผนขั้นตอนการทำงานและดำเนินการแก้ปัญหาอย่างเป็นขั้นตอน','must_know',8),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-04','Evaluate and improve a designed solution','Test and evaluate a solution under stated conditions, explain defects, improve it and communicate results.','ทดสอบ ประเมินผล และอธิบายปัญหาหรือข้อบกพร่องที่เกิดขึ้นภายใต้กรอบเงื่อนไข พร้อมทั้งหาแนวทางการปรับปรุงแก้ไขและนำเสนอผลการแก้ปัญหา','must_know',9),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-05','Use materials and mechanisms safely','Select and use materials, tools, mechanisms, electrical and electronic components appropriately and safely.','ใช้ความรู้และทักษะเกี่ยวกับวัสดุ อุปกรณ์ เครื่องมือ กลไก ไฟฟ้า และอิเล็กทรอนิกส์ เพื่อแก้ปัญหาหรือพัฒนางานได้อย่างถูกต้อง เหมาะสม และปลอดภัย','should_know',10),
('M2','M2-COMPUTATIONAL-THINKING','M2-S4_2-01','Design a computational algorithm','Use computational thinking to design an algorithm for a real-life problem or task.','ออกแบบอัลกอริทึมที่ใช้แนวคิดเชิงคำนวณในการแก้ปัญหาหรือการทำงานที่พบในชีวิตจริง','must_know',1),
('M2','M2-COMPUTATIONAL-THINKING','M2-S4_2-02','Write a program using logic and functions','Design and write a program that uses Boolean logic and functions to solve a problem.','ออกแบบและเขียนโปรแกรมที่ใช้ตรรกะและฟังก์ชันในการแก้ปัญหา','must_know',2),
('M2','M2-COMPUTATIONAL-THINKING','M2-S4_2-03','Explain computer systems and communication technology','Discuss the components and operating principles of computer systems and communication technology and apply them to basic tasks.','อภิปรายองค์ประกอบและหลักการทำงานของระบบคอมพิวเตอร์และเทคโนโลยีการสื่อสารเพื่อประยุกต์ใช้งานหรือแก้ปัญหาเบื้องต้น','should_know',3),
('M2','M2-COMPUTATIONAL-THINKING','M2-S4_2-04','Use information technology responsibly','Use information technology safely and responsibly, and establish and communicate ownership rights for digital work.','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย มีความรับผิดชอบ สร้างและแสดงสิทธิในการเผยแพร่ผลงาน','should_know',4)
)
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,s.code,s.name,s.description,s.sequence_no,'active'
from seed s join public.learning_topics t on t.code=s.topic_code
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

with seed(grade_code,topic_code,code,official_thai,classification,sequence_no) as (values
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-01','อธิบายแนวคิดหลักของเทคโนโลยีในชีวิตประจำวัน และวิเคราะห์สาเหตุหรือปัจจัยที่ส่งผลต่อการเปลี่ยนแปลงของเทคโนโลยี','must_know',1),
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-02','ระบุปัญหาหรือความต้องการของชุมชนหรือท้องถิ่น เพื่อพัฒนางานอาชีพ สรุปกรอบของปัญหา รวบรวม วิเคราะห์ข้อมูลและแนวคิดที่เกี่ยวข้องกับปัญหา โดยคำนึงถึงความถูกต้องด้านทรัพย์สินทางปัญญา','must_know',2),
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-03','ออกแบบวิธีการแก้ปัญหาโดยวิเคราะห์ เปรียบเทียบ และตัดสินใจเลือกข้อมูลที่จำเป็น นำเสนอแนวทางการแก้ปัญหาให้ผู้อื่นเข้าใจ วางแผนและดำเนินการแก้ปัญหา','must_know',3),
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-04','ทดสอบ ประเมินผล และระบุข้อบกพร่องที่เกิดขึ้น พร้อมทั้งหาแนวทางการปรับปรุงแก้ไข และนำเสนอผลการแก้ปัญหา','must_know',4),
('M1','M1-DESIGN-TECHNOLOGY','M1-S4_1-05','ใช้ความรู้และทักษะเกี่ยวกับวัสดุ อุปกรณ์ เครื่องมือ กลไก ไฟฟ้า หรืออิเล็กทรอนิกส์ เพื่อแก้ปัญหาได้อย่างถูกต้อง เหมาะสม และปลอดภัย','should_know',5),
('M1','M1-COMPUTATIONAL-THINKING','M1-S4_2-01','ออกแบบอัลกอริทึมที่ใช้แนวคิดเชิงนามธรรมเพื่อแก้ปัญหาหรืออธิบายการทำงานที่พบในชีวิตจริง','must_know',6),
('M1','M1-COMPUTATIONAL-THINKING','M1-S4_2-02','ออกแบบและเขียนโปรแกรมอย่างง่ายเพื่อใช้แก้ปัญหาทางคณิตศาสตร์หรือวิทยาศาสตร์','must_know',7),
('M1','M1-COMPUTATIONAL-THINKING','M1-S4_2-03','รวบรวมข้อมูลปฐมภูมิ ประมวลผล ประเมินผล นำเสนอข้อมูลและสารสนเทศตามวัตถุประสงค์ โดยใช้ซอฟต์แวร์หรือบริการบนอินเทอร์เน็ตที่หลากหลาย','should_know',8),
('M1','M1-COMPUTATIONAL-THINKING','M1-S4_2-04','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย ใช้สื่อและแหล่งข้อมูลตามข้อกำหนดและข้อตกลง','should_know',9),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-01','อธิบายการแยกสารผสมโดยการระเหยแห้ง การตกผลึก การกลั่นอย่างง่าย โครมาโทกราฟีแบบกระดาษ การสกัดด้วยตัวทำละลาย โดยใช้หลักฐานเชิงประจักษ์','must_know',10),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-02','แยกสารโดยการระเหยแห้ง การตกผลึก การกลั่นอย่างง่าย โครมาโทกราฟีแบบกระดาษ การสกัดด้วยตัวทำละลาย','must_know',1),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-03','นำวิธีการแยกสารไปใช้แก้ปัญหาในชีวิตประจำวัน โดยบูรณาการวิทยาศาสตร์ คณิตศาสตร์ เทคโนโลยีและวิศวกรรมศาสตร์','must_know',2),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-04','ออกแบบการทดลองและทดลองในการอธิบายผลของชนิดตัวละลาย ชนิดตัวทำละลาย อุณหภูมิที่มีต่อสภาพละลายได้ของสาร รวมทั้งอธิบายผลของความดันที่มีต่อสภาพละลายได้ของสาร โดยใช้สารสนเทศ','must_know',3),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-05','ระบุปริมาณตัวละลายในสารละลายในหน่วยความเข้มข้นเป็นร้อยละปริมาตรต่อปริมาตร มวลต่อมวล และมวลต่อปริมาตร','must_know',4),
('M2','M2-MATTER-AND-SOLUTIONS','M2-S2_1-06','ตระหนักถึงความสำคัญของการนำความรู้เรื่องความเข้มข้นของสารไปใช้ โดยยกตัวอย่างการใช้สารละลายในชีวิตประจำวันอย่างถูกต้องและปลอดภัย','should_know',5),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-01','คาดการณ์แนวโน้มเทคโนโลยีที่จะเกิดขึ้น โดยพิจารณาจากสาเหตุหรือปัจจัยที่ส่งผลต่อการเปลี่ยนแปลงของเทคโนโลยี และวิเคราะห์เปรียบเทียบตัดสินใจเลือกใช้เทคโนโลยีโดยคำนึงถึงผลกระทบที่เกิดขึ้นต่อชีวิต สังคม และสิ่งแวดล้อม','must_know',6),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-02','ระบุปัญหาหรือความต้องการในชุมชนหรือท้องถิ่น สรุปกรอบของปัญหา รวบรวม วิเคราะห์ข้อมูลและแนวคิดที่เกี่ยวข้องกับปัญหา','must_know',7),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-03','ออกแบบวิธีการแก้ปัญหาโดยวิเคราะห์เปรียบเทียบและตัดสินใจเลือกข้อมูลที่จำเป็นภายใต้เงื่อนไขและทรัพยากรที่มีอยู่ นำเสนอแนวทางการแก้ปัญหาให้ผู้อื่นเข้าใจ วางแผนขั้นตอนการทำงานและดำเนินการแก้ปัญหาอย่างเป็นขั้นตอน','must_know',8),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-04','ทดสอบ ประเมินผล และอธิบายปัญหาหรือข้อบกพร่องที่เกิดขึ้นภายใต้กรอบเงื่อนไข พร้อมทั้งหาแนวทางการปรับปรุงแก้ไขและนำเสนอผลการแก้ปัญหา','must_know',9),
('M2','M2-DESIGN-TECHNOLOGY','M2-S4_1-05','ใช้ความรู้และทักษะเกี่ยวกับวัสดุ อุปกรณ์ เครื่องมือ กลไก ไฟฟ้า และอิเล็กทรอนิกส์ เพื่อแก้ปัญหาหรือพัฒนางานได้อย่างถูกต้อง เหมาะสม และปลอดภัย','should_know',10),
('M2','M2-COMPUTATIONAL-THINKING','M2-S4_2-01','ออกแบบอัลกอริทึมที่ใช้แนวคิดเชิงคำนวณในการแก้ปัญหาหรือการทำงานที่พบในชีวิตจริง','must_know',1),
('M2','M2-COMPUTATIONAL-THINKING','M2-S4_2-02','ออกแบบและเขียนโปรแกรมที่ใช้ตรรกะและฟังก์ชันในการแก้ปัญหา','must_know',2),
('M2','M2-COMPUTATIONAL-THINKING','M2-S4_2-03','อภิปรายองค์ประกอบและหลักการทำงานของระบบคอมพิวเตอร์และเทคโนโลยีการสื่อสารเพื่อประยุกต์ใช้งานหรือแก้ปัญหาเบื้องต้น','should_know',3),
('M2','M2-COMPUTATIONAL-THINKING','M2-S4_2-04','ใช้เทคโนโลยีสารสนเทศอย่างปลอดภัย มีความรับผิดชอบ สร้างและแสดงสิทธิในการเผยแพร่ผลงาน','should_know',4)
)
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select o.id,c.id,g.id,s.sequence_no,true,
 'OBEC/IPST 2021 official indicator: '||s.official_thai||' Source: Indicators and Core Learning Content: Must-Know and Should-Know (2021), Science and Technology, grade '||s.grade_code||'.',s.classification
from seed s
join public.learning_objectives o on o.code=s.code
join public.learning_topics t on t.id=o.topic_id and t.code=s.topic_code
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects sub on sub.id=sk.subject_id and sub.code='SCI'
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017') and c.status='active'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=s.grade_code and g.status='active'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,indicator_classification=excluded.indicator_classification,updated_at=now();

commit;
