-- Thai Language P1 official indicators, transcribed from OBEC 2021 "must know / should know" table.
-- Source: OBEC Basic Education Core Curriculum B.E.2551, Thai Language, P1, printed pages 2-3.
-- Store each indicator under its semantic Thai Language standard; retain must/should classification.
begin;
with src(grade_code,standard_code,indicator_no,name,required) as (values
('P1','TH1.1',1,'อ่านออกเสียงคำ คำคล้องจอง และข้อความสั้น ๆ',true),
('P1','TH1.1',2,'บอกความหมายของคำและข้อความที่อ่าน',true),
('P1','TH1.1',3,'ตอบคำถามเกี่ยวกับเรื่องที่อ่าน',true),
('P1','TH1.1',4,'เล่าเรื่องย่อจากเรื่องที่อ่าน',true),
('P1','TH1.1',5,'คาดคะเนเหตุการณ์จากเรื่องที่อ่าน',true),
('P1','TH1.1',6,'อ่านหนังสือตามความสนใจอย่างสม่ำเสมอและนำเสนอเรื่องที่อ่าน',true),
('P1','TH1.1',7,'บอกความหมายของเครื่องหมายหรือสัญลักษณ์สำคัญที่มักพบเห็นในชีวิตประจำวัน',true),
('P1','TH1.1',8,'มีมารยาทในการอ่าน',false),
('P1','TH2.1',1,'คัดลายมือตัวบรรจงเต็มบรรทัด',true),
('P1','TH2.1',2,'เขียนสื่อสารด้วยคำและประโยคง่าย ๆ',true),
('P1','TH2.1',3,'มีมารยาทในการเขียน',false),
('P1','TH3.1',1,'ฟังคำแนะนำ คำสั่งง่าย ๆ และปฏิบัติตาม',false),
('P1','TH3.1',2,'ตอบคำถามและเล่าเรื่องที่ฟังและดูทั้งที่เป็นความรู้และความบันเทิง',true),
('P1','TH3.1',3,'พูดแสดงความคิดเห็นและความรู้สึกจากเรื่องที่ฟังและดู',true),
('P1','TH3.1',4,'พูดสื่อสารได้ตามวัตถุประสงค์',true),
('P1','TH3.1',5,'มีมารยาทในการฟัง การดู และการพูด',false),
('P1','TH4.1',1,'บอกและเขียนพยัญชนะ สระ วรรณยุกต์ และเลขไทย',true),
('P1','TH4.1',2,'เขียนสะกดคำและบอกความหมายของคำ',true),
('P1','TH4.1',3,'เรียบเรียงคำเป็นประโยคง่าย ๆ',true),
('P1','TH4.1',4,'ต่อคำคล้องจองง่าย ๆ',false),
('P1','TH5.1',1,'บอกข้อคิดที่ได้จากการอ่านหรือการฟังวรรณกรรมร้อยแก้วและร้อยกรองสำหรับเด็ก',true),
('P1','TH5.1',2,'ท่องจำบทอาขยานตามที่กำหนด และบทร้อยกรองตามความสนใจ',true)
),
target as (
 select c.id curriculum_id,gl.id grade_id,t.id topic_id,t.code standard_code
 from public.learning_curricula c
 join public.learning_grade_levels gl on gl.curriculum_id=c.id and gl.code='P1'
 join public.learning_curriculum_subjects cs on cs.curriculum_id=c.id
 join public.learning_subjects s on s.id=cs.subject_id and s.code='THAI-LANGUAGE'
 join public.learning_skills sk on sk.subject_id=s.id and sk.code='THAI-LANGUAGE'
 join public.learning_topics t on t.skill_id=sk.id
 where c.code='TH-BASIC-CORE-2008-2017' and t.code in ('TH1.1','TH2.1','TH3.1','TH4.1','TH5.1')
),
upserted as (
 insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
 select target.topic_id,
   'THAI-'||src.standard_code||'-P1-'||lpad(src.indicator_no::text,2,'0'),
   src.name,
   'Official Thai Language indicator, Prathom 1 (P1), OBEC Basic Education Core Curriculum B.E.2551 (2008); transcribed from OBEC 2021 must-know/should-know indicator table, printed pages 2-3.',
   src.indicator_no,'active'
 from src join target on target.standard_code=src.standard_code
 on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now()
 returning id,code
)
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select u.id,target.curriculum_id,target.grade_id,src.indicator_no,src.required,
 case when src.required then 'Official OBEC classification: ต้องรู้ (must know).' else 'Official OBEC classification: ควรรู้ (should know).' end
from upserted u
join src on u.code='THAI-'||src.standard_code||'-P1-'||lpad(src.indicator_no::text,2,'0')
join target on target.standard_code=src.standard_code
on conflict(objective_id,curriculum_id,grade_level_id) do update
 set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;