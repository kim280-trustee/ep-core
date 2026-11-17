-- E&P Learning: Cambridge Click Start International Edition chapter knowledge graph.
-- 29 textbook chapters: M1 Book 4 (8), M2 Book 5 (9), M3 Book 6 (12).
-- Sample-paper chapters are assessment resources and are not learning objectives.
-- Chapter names are taken from the published contents; detailed lesson content remains in teacher packs.

begin;

do $$
begin
  if not exists (
    select 1 from public.learning_subjects s
    join public.learning_curricula c on c.code='CLICK-START-M1-M3'
    join public.learning_education_systems es on es.id=c.education_system_id
    join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M1'
    where s.code='TECH' and es.code='TH_BASIC'
      and s.status='active' and c.status='active' and g.status='active'
  ) then
    raise exception 'Active Computer Studies subject, CLICK-START-M1-M3 curriculum and M1 grade are required.';
  end if;
end;
$$;

insert into public.learning_skills (subject_id, code, name, description, status)
select s.id, 'COMPUTER-STUDIES', 'Computer Studies',
 'Computer systems, operating systems, productivity software, digital art, algorithms, block-based and text-based programming, spreadsheets, internet and email.',
 'active'
from public.learning_subjects s where s.code='TECH'
on conflict (subject_id, code) do update
set name=excluded.name, description=excluded.description, status='active', updated_at=now();

insert into public.learning_topics (skill_id, code, name, description, sequence_no, status)
select sk.id, t.code, t.name, t.description, t.sequence_no, 'active'
from public.learning_skills sk
join public.learning_subjects s on s.id=sk.subject_id and s.code='TECH'
join (values
 ('M1','M1','M1 — Cambridge Click Start Learner''s Book 4','Cambridge Click Start International Edition Learner''s Book 4 chapter sequence.',1),
 ('M2','M2','M2 — Cambridge Click Start Learner''s Book 5','Cambridge Click Start International Edition Learner''s Book 5 chapter sequence.',2),
 ('M3','M3','M3 — Cambridge Click Start Learner''s Book 6','Cambridge Click Start International Edition Learner''s Book 6 chapter sequence.',3)
) as t(grade_code,code,name,description,sequence_no) on true
where sk.code='COMPUTER-STUDIES'
on conflict (skill_id, code) do update
set name=excluded.name, description=excluded.description, sequence_no=excluded.sequence_no,
    status='active', updated_at=now();

insert into public.learning_objectives (topic_id, code, name, description, sequence_no, status)
select topic.id, obj.code, obj.name, obj.description, obj.sequence_no, 'active'
from public.learning_topics topic
join public.learning_skills sk on sk.id=topic.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='TECH'
join (values
    ('M1-01','Know Your Computer','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',1,'M1'),
    ('M1-02','Using Windows','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',2,'M1'),
    ('M1-03','MS Word 2010 — Formatting Text','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',3,'M1'),
    ('M1-04','Fun with Tux Paint','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',4,'M1'),
    ('M1-05','MSWLogo — Drawing Polygons and Circles','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',5,'M1'),
    ('M1-06','MSWLogo — Using PenColors and PenSizes','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',6,'M1'),
    ('M1-07','MSWLogo — Text Commands and Arithmetic Operations','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',7,'M1'),
    ('M1-08','Introduction to MS PowerPoint 2010','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',8,'M1'),
    ('M2-01','Know Your Computer','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',9,'M2'),
    ('M2-02','Using Windows','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',10,'M2'),
    ('M2-03','MS Office at a Glance','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',11,'M2'),
    ('M2-04','MS Word 2010 — Inserting Objects and Drawing','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',12,'M2'),
    ('M2-05','MS PowerPoint 2010 — Editing and Formatting Slides','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',13,'M2'),
    ('M2-06','Introduction to MS Excel 2010','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',14,'M2'),
    ('M2-07','The Internet','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',15,'M2'),
    ('M2-08','Learning Algorithms','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',16,'M2'),
    ('M2-09','Introduction to Scratch','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',17,'M2'),
    ('M3-01','Know Your Computer','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',18,'M3'),
    ('M3-02','Operating System','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',19,'M3'),
    ('M3-03','MS Word 2010 — Advanced Features','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',20,'M3'),
    ('M3-04','MS Word 2010 — Mail Merge','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',21,'M3'),
    ('M3-05','MS PowerPoint 2010 — Advanced Features','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',22,'M3'),
    ('M3-06','More About MS Excel 2010','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',23,'M3'),
    ('M3-07','More About Scratch','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',24,'M3'),
    ('M3-08','Introduction to QB64','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',25,'M3'),
    ('M3-09','QB64 — Statements','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',26,'M3'),
    ('M3-10','QB64 — Programming Statements','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',27,'M3'),
    ('M3-11','Introduction to Macromedia Flash','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',28,'M3'),
    ('M3-12','Introduction to Email','Learners study and practise the skills and concepts in the corresponding Cambridge Click Start International Edition Learner''s Book chapter.',29,'M3')
) as obj(code,name,description,sequence_no,grade_code)
on topic.code=obj.grade_code
where sk.code='COMPUTER-STUDIES'
on conflict (topic_id, code) do update
set name=excluded.name, description=excluded.description, sequence_no=excluded.sequence_no,
    status='active', updated_at=now();

insert into public.learning_objective_alignments
 (objective_id, curriculum_id, grade_level_id, sequence_no, required, notes)
select o.id, c.id, g.id, o.sequence_no, true,
 'Cambridge Click Start International Edition: ' || g.code || ' uses Learner''s Book ' ||
 case g.code when 'M1' then '4' when 'M2' then '5' else '6' end || '. Chapter title from published contents.'
from public.learning_objectives o
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='TECH'
join public.learning_curricula c on c.code='CLICK-START-M1-M3'
join public.learning_education_systems es on es.id=c.education_system_id and es.code='TH_BASIC'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=t.code
where sk.code='COMPUTER-STUDIES'
on conflict (objective_id, curriculum_id, grade_level_id) do update
set sequence_no=excluded.sequence_no, required=excluded.required, notes=excluded.notes,
    updated_at=now();

commit;
