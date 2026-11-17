with seed(standard_code,code,name,seq,required,classification,grade_group) as (values
('พ 4.1','HPE-M2-16','เลือกใช้บริการทางสุขภาพอย่างมีเหตุผล',16,true,'must_know','M2'),
('พ 4.1','HPE-M2-17','วิเคราะห์ผลของการใช้เทคโนโลยีที่มีต่อสุขภาพ',17,false,'should_know','M2'),
('พ 4.1','HPE-M2-18','วิเคราะห์ความเจริญก้าวหน้าทางการแพทย์ที่มีผลต่อสุขภาพ',18,false,'should_know','M2'),
('พ 4.1','HPE-M2-19','วิเคราะห์ความสัมพันธ์ของภาวะสมดุลระหว่างสุขภาพกายและสุขภาพจิต',19,true,'must_know','M2'),
('พ 4.1','HPE-M2-20','อธิบายลักษณะอาการเบื้องต้นของผู้มีปัญหาสุขภาพจิต',20,true,'must_know','M2'),
('พ 4.1','HPE-M2-21','เสนอแนะวิธีปฏิบัติตนเพื่อจัดการกับอารมณ์และความเครียด',21,false,'should_know','M2'),
('พ 4.1','HPE-M2-22','พัฒนาสมรรถภาพทางกายตนเองให้เป็นไปตามเกณฑ์ที่กำหนด',22,true,'must_know','M2'),
('พ 5.1','HPE-M2-23','ระบุวิธีการ ปัจจัย และแหล่งที่ช่วยเหลือฟื้นฟูผู้ติดสารเสพติด',23,false,'should_know','M2'),
('พ 5.1','HPE-M2-24','อธิบายวิธีการหลีกเลี่ยงพฤติกรรมเสี่ยงและสถานการณ์เสี่ยง',24,false,'should_know','M2'),
('พ 5.1','HPE-M2-25','ใช้ทักษะชีวิตในการป้องกันตนเองและหลีกเลี่ยงสถานการณ์คับขันที่อาจนำไปสู่อันตราย',25,false,'should_know','M2'),
('พ 3.2','HPE-M46-13','อธิบายและปฏิบัติเกี่ยวกับสิทธิ กฎ กติกา กลวิธีต่าง ๆ ในระหว่างการเล่น การแข่งขันกีฬากับผู้อื่นและนำไปสรุปเป็นแนวปฏิบัติและใช้ในชีวิตประจำวันอย่างต่อเนื่อง',13,false,'should_know','M46'),
('พ 3.2','HPE-M46-14','แสดงออกถึงการมีมารยาทในการดู การเล่น และการแข่งขันกีฬาด้วยความมีน้ำใจนักกีฬา และนำไปใช้ปฏิบัติทุกโอกาสจนเป็นบุคลิกภาพที่ดี',14,false,'should_know','M46'),
('พ 3.2','HPE-M46-15','ร่วมกิจกรรมทางกายและเล่นกีฬาอย่างมีความสุข ชื่นชมในคุณค่าและความงามของการกีฬา',15,false,'should_know','M46'),
('พ 4.1','HPE-M46-16','วิเคราะห์บทบาทและความรับผิดชอบของบุคคลที่มีต่อการสร้างเสริมสุขภาพและการป้องกันโรคในชุมชน',16,true,'must_know','M46'),
('พ 4.1','HPE-M46-17','วิเคราะห์อิทธิพลของสื่อโฆษณาเกี่ยวกับสุขภาพเพื่อการเลือกบริโภค',17,false,'should_know','M46'),
('พ 4.1','HPE-M46-18','ปฏิบัติตนตามสิทธิของผู้บริโภค',18,true,'must_know','M46'),
('พ 4.1','HPE-M46-19','วิเคราะห์สาเหตุและเสนอแนวทางการป้องกันการเจ็บป่วยและการตายของคนไทย',19,true,'must_know','M46'),
('พ 4.1','HPE-M46-20','วางแผนและปฏิบัติตามแผนการพัฒนาสุขภาพของตนเองและครอบครัว',20,false,'should_know','M46'),
('พ 4.1','HPE-M46-23','วางแผนและปฏิบัติตามแผนการพัฒนาสมรรถภาพกายและสมรรถภาพกลไก',23,false,'should_know','M46'),
('พ 5.1','HPE-M46-25','วิเคราะห์ปัจจัยที่มีผลต่อสุขภาพหรือความรุนแรงของคนไทยและเสนอแนวทางป้องกัน',25,true,'must_know','M46')
)
insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select t.id,s.code,s.name,null,s.seq,'active' from seed s join public.learning_subjects sub on sub.code='HEALTH-PE' join public.learning_skills sk on sk.subject_id=sub.id and sk.code='HEALTH-PE' join public.learning_topics t on t.skill_id=sk.id and t.code=s.standard_code
on conflict(topic_id,code) do update set name=excluded.name,sequence_no=excluded.sequence_no,updated_at=now();
with seed(standard_code,code,name,seq,required,classification,grade_group) as (values
('พ 4.1','HPE-M2-16','เลือกใช้บริการทางสุขภาพอย่างมีเหตุผล',16,true,'must_know','M2'),
('พ 4.1','HPE-M2-17','วิเคราะห์ผลของการใช้เทคโนโลยีที่มีต่อสุขภาพ',17,false,'should_know','M2'),
('พ 4.1','HPE-M2-18','วิเคราะห์ความเจริญก้าวหน้าทางการแพทย์ที่มีผลต่อสุขภาพ',18,false,'should_know','M2'),
('พ 4.1','HPE-M2-19','วิเคราะห์ความสัมพันธ์ของภาวะสมดุลระหว่างสุขภาพกายและสุขภาพจิต',19,true,'must_know','M2'),
('พ 4.1','HPE-M2-20','อธิบายลักษณะอาการเบื้องต้นของผู้มีปัญหาสุขภาพจิต',20,true,'must_know','M2'),
('พ 4.1','HPE-M2-21','เสนอแนะวิธีปฏิบัติตนเพื่อจัดการกับอารมณ์และความเครียด',21,false,'should_know','M2'),
('พ 4.1','HPE-M2-22','พัฒนาสมรรถภาพทางกายตนเองให้เป็นไปตามเกณฑ์ที่กำหนด',22,true,'must_know','M2'),
('พ 5.1','HPE-M2-23','ระบุวิธีการ ปัจจัย และแหล่งที่ช่วยเหลือฟื้นฟูผู้ติดสารเสพติด',23,false,'should_know','M2'),
('พ 5.1','HPE-M2-24','อธิบายวิธีการหลีกเลี่ยงพฤติกรรมเสี่ยงและสถานการณ์เสี่ยง',24,false,'should_know','M2'),
('พ 5.1','HPE-M2-25','ใช้ทักษะชีวิตในการป้องกันตนเองและหลีกเลี่ยงสถานการณ์คับขันที่อาจนำไปสู่อันตราย',25,false,'should_know','M2'),
('พ 3.2','HPE-M46-13','อธิบายและปฏิบัติเกี่ยวกับสิทธิ กฎ กติกา กลวิธีต่าง ๆ ในระหว่างการเล่น การแข่งขันกีฬากับผู้อื่นและนำไปสรุปเป็นแนวปฏิบัติและใช้ในชีวิตประจำวันอย่างต่อเนื่อง',13,false,'should_know','M46'),
('พ 3.2','HPE-M46-14','แสดงออกถึงการมีมารยาทในการดู การเล่น และการแข่งขันกีฬาด้วยความมีน้ำใจนักกีฬา และนำไปใช้ปฏิบัติทุกโอกาสจนเป็นบุคลิกภาพที่ดี',14,false,'should_know','M46'),
('พ 3.2','HPE-M46-15','ร่วมกิจกรรมทางกายและเล่นกีฬาอย่างมีความสุข ชื่นชมในคุณค่าและความงามของการกีฬา',15,false,'should_know','M46'),
('พ 4.1','HPE-M46-16','วิเคราะห์บทบาทและความรับผิดชอบของบุคคลที่มีต่อการสร้างเสริมสุขภาพและการป้องกันโรคในชุมชน',16,true,'must_know','M46'),
('พ 4.1','HPE-M46-17','วิเคราะห์อิทธิพลของสื่อโฆษณาเกี่ยวกับสุขภาพเพื่อการเลือกบริโภค',17,false,'should_know','M46'),
('พ 4.1','HPE-M46-18','ปฏิบัติตนตามสิทธิของผู้บริโภค',18,true,'must_know','M46'),
('พ 4.1','HPE-M46-19','วิเคราะห์สาเหตุและเสนอแนวทางการป้องกันการเจ็บป่วยและการตายของคนไทย',19,true,'must_know','M46'),
('พ 4.1','HPE-M46-20','วางแผนและปฏิบัติตามแผนการพัฒนาสุขภาพของตนเองและครอบครัว',20,false,'should_know','M46'),
('พ 4.1','HPE-M46-23','วางแผนและปฏิบัติตามแผนการพัฒนาสมรรถภาพกายและสมรรถภาพกลไก',23,false,'should_know','M46'),
('พ 5.1','HPE-M46-25','วิเคราะห์ปัจจัยที่มีผลต่อสุขภาพหรือความรุนแรงของคนไทยและเสนอแนวทางป้องกัน',25,true,'must_know','M46')
)
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,indicator_classification,notes)
select o.id,c.id,g.id,s.seq,s.required,s.classification,'OBEC 2021 must-know/should-know prioritisation; official OBEC indicator wording; Thai Basic Education Core Curriculum B.E.2551.'
from seed s join public.learning_subjects sub on sub.code='HEALTH-PE' join public.learning_skills sk on sk.subject_id=sub.id and sk.code='HEALTH-PE' join public.learning_topics t on t.skill_id=sk.id and t.code=s.standard_code join public.learning_objectives o on o.topic_id=t.id and o.code=s.code join public.learning_curricula c on c.id='a366b931-63be-49b5-8433-dbea2691a055'
join lateral (select unnest(case when s.grade_group='M46' then array['M4','M5','M6']::text[] else array[s.grade_group]::text[] end) grade_code) x on true
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=x.grade_code
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,indicator_classification=excluded.indicator_classification,notes=excluded.notes,updated_at=now();