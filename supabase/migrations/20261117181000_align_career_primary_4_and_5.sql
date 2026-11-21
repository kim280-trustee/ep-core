insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,indicator_classification,notes)
select o.id,c.id,g.id,
 case o.code when 'CAREER-P4-01' then 1 when 'CAREER-P4-02' then 2 when 'CAREER-P4-03' then 3 when 'CAREER-P4-04' then 4 when 'CAREER-P4-05' then 5 when 'CAREER-P5-01' then 1 when 'CAREER-P5-02' then 2 when 'CAREER-P5-03' then 3 when 'CAREER-P5-04' then 4 when 'CAREER-P5-05' then 5 when 'CAREER-P5-06' then 6 end,
 o.code in ('CAREER-P4-02','CAREER-P4-04','CAREER-P5-01','CAREER-P5-02','CAREER-P5-04'),
 case when o.code in ('CAREER-P4-02','CAREER-P4-04','CAREER-P5-01','CAREER-P5-02','CAREER-P5-04') then 'must_know' else 'should_know' end,
 'OBEC 2021 must-know/should-know indicator list; Thai Basic Education Core Curriculum B.E.2551.'
from public.learning_objectives o
join public.learning_curricula c on c.id='a366b931-63be-49b5-8433-dbea2691a055'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code=substring(o.code from 'CAREER-(P[45])')
where o.code like 'CAREER-P4-%' or o.code like 'CAREER-P5-%'
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,indicator_classification=excluded.indicator_classification,notes=excluded.notes,updated_at=now();