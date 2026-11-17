insert into public.learning_objective_alignments
(objective_id,curriculum_id,grade_level_id,sequence_no,required,indicator_classification,notes)
select
 o.id,
 c.id,
 g.id,
 o.sequence_no,
 case when o.code in ('CAREER-P1-01','CAREER-P2-01') then false else true end,
 case when o.code in ('CAREER-P1-01','CAREER-P2-01') then 'should_know' else 'must_know' end,
 'OBEC 2021 must-know/should-know indicator list; official Basic Education Core Curriculum 2551 indicator companion.'
from public.learning_objectives o
join public.learning_topics t on t.id=o.topic_id and t.code='ง 1.1'
join public.learning_skills sk on sk.id=t.skill_id and sk.code='CAREER'
join public.learning_subjects s on s.id=sk.subject_id and s.code='CAREER'
join public.learning_curricula c on c.id='a366b931-63be-49b5-8433-dbea2691a055'
join public.learning_grade_levels g on g.curriculum_id=c.id
 and g.code=case
   when o.code like 'CAREER-P1-%' then 'P1'
   when o.code like 'CAREER-P2-%' then 'P2'
   when o.code like 'CAREER-P3-%' then 'P3'
 end
where o.code in ('CAREER-P1-01','CAREER-P1-02','CAREER-P1-03','CAREER-P2-01','CAREER-P2-02','CAREER-P2-03','CAREER-P3-01','CAREER-P3-02','CAREER-P3-03')
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,
 required=excluded.required,
 indicator_classification=excluded.indicator_classification,
 notes=excluded.notes,
 updated_at=now();