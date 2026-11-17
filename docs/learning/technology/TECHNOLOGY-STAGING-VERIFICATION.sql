-- Verification for Cambridge Click Start International Edition Computer Studies.
-- Safe to run as a read-only check after the Computer Studies migrations.

select c.code as curriculum_code, c.name, c.status
from public.learning_curricula c
where c.code='CLICK-START-M1-M3';

select cs.code as curriculum_subject_code, s.name as subject_name, cs.status
from public.learning_curriculum_subjects cs
join public.learning_curricula c on c.id=cs.curriculum_id
join public.learning_subjects s on s.id=cs.subject_id
where c.code='CLICK-START-M1-M3';

select g.code as grade_code, g.name, g.sequence_no
from public.learning_grade_levels g
join public.learning_curricula c on c.id=g.curriculum_id
where c.code='CLICK-START-M1-M3'
order by g.sequence_no;

select
  g.code as grade_code,
  count(distinct o.id) as chapter_objectives,
  count(distinct a.id) as grade_alignments
from public.learning_grade_levels g
join public.learning_curricula c on c.id=g.curriculum_id and c.code='CLICK-START-M1-M3'
left join public.learning_topics t on t.code=g.code
left join public.learning_skills sk on sk.id=t.skill_id
  and sk.code='COMPUTER-STUDIES'
  and sk.subject_id=(select id from public.learning_subjects where code='COMPUTER-STUDIES')
left join public.learning_objectives o on o.topic_id=t.id and o.status='active'
left join public.learning_objective_alignments a
  on a.objective_id=o.id and a.curriculum_id=c.id and a.grade_level_id=g.id
group by g.code,g.sequence_no
order by g.sequence_no;

-- Expected: M1=8, M2=9, M3=12; total=29 objectives and 29 alignments.
-- After the teacher import, check organization-scoped lesson/question draft counts
-- in the Teacher Content Library and Question Bank. Drafts must remain unpublished.
