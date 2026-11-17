-- Staging verification for Cambridge Click Start International Edition Computer Studies.
-- Run only after applying the two curriculum migrations on a disposable/staging database.

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

select sk.code as skill_code, t.code as grade_topic, count(o.id) as chapter_objectives
from public.learning_skills sk
join public.learning_subjects s on s.id=sk.subject_id and s.code='COMPUTER-STUDIES'
join public.learning_topics t on t.skill_id=sk.id
left join public.learning_objectives o on o.topic_id=t.id
where sk.code='COMPUTER-STUDIES'
group by sk.code,t.code
order by t.code;

select g.code as grade_code, count(distinct a.objective_id) as aligned_chapters
from public.learning_objective_alignments a
join public.learning_curricula c on c.id=a.curriculum_id and c.code='CLICK-START-M1-M3'
join public.learning_grade_levels g on g.id=a.grade_level_id
group by g.code
order by g.code;

-- Expected grade objective/alignment counts: M1=8, M2=9, M3=12 (29 total).
-- Confirm obsolete Thai national Technology objectives are not part of this curriculum.
