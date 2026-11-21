-- Complete the two omitted M3 Reading indicators from the official OBEC Thai Language indicator table.
-- Source: OBEC "ตัวชี้วัดและสาระการเรียนรู้แกนกลางต้องรู้และควรรู้",
-- Thai Language, M3, indicators ท 1.1 ม.3/9 and ท 1.1 ม.3/10 (printed page 28).
-- Idempotent catalogue correction; no existing content or school records are changed.
begin;

with target as (
  select c.id as curriculum_id, gl.id as grade_level_id, t.id as topic_id
  from public.learning_curricula c
  join public.learning_curriculum_subjects cs on cs.curriculum_id=c.id
  join public.learning_subjects s on s.id=cs.subject_id and s.code='THAI-LANGUAGE'
  join public.learning_grade_levels gl on gl.curriculum_id=c.id and gl.code='M3'
  join public.learning_skills sk on sk.subject_id=s.id and sk.code='THAI-LANGUAGE'
  join public.learning_topics t on t.skill_id=sk.id and t.code='TH1.1'
  where c.code='TH-BASIC-CORE-2008-2017'
),
src as (
  select * from (values
    ('TH1.1-M3-09','ตีความและประเมินคุณค่าแนวคิดที่ได้จากงานเขียนอย่างหลากหลายเพื่อนำไปใช้แก้ปัญหาในชีวิต',26,9,true),
    ('TH1.1-M3-10','มีมารยาทในการอ่าน',27,10,false)
  ) v(code,name,objective_sequence,alignment_sequence,required)
),
upserted as (
  insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
  select target.topic_id,src.code,src.name,
    'Official Thai indicator from OBEC Basic Education Core Curriculum B.E. 2551 (2008), Thai Language standard TH1.1, M3. Source: OBEC "ตัวชี้วัดและสาระการเรียนรู้แกนกลางต้องรู้และควรรู้", printed page 28.',
    src.objective_sequence,'active'
  from target cross join src
  on conflict (topic_id,code) do update
    set name=excluded.name,description=excluded.description,
        sequence_no=excluded.sequence_no,status='active',updated_at=now()
  returning id,code
)
insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select u.id,target.curriculum_id,target.grade_level_id,src.alignment_sequence,src.required,
  'Official annual grade-level indicator from OBEC Basic Education Core Curriculum B.E. 2551 (2008), Thai Language standard TH1.1.'
from upserted u
join src on src.code=u.code
cross join target
on conflict (objective_id,curriculum_id,grade_level_id) do update
  set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();

commit;