
-- Correct OBEC 2021 must-know/should-know classification for Thai Language M1-M3.
-- Counts reconcile with the official summary: M1 31/4, M2 26/6, M3 30/6.
update public.learning_objective_alignments a
set required = not (o.code in (
 'TH1.1-M1-07','TH1.1-M1-09','TH2.1-M1-09','TH3.1-M1-06',
 'TH1.1-M2-08','TH2.1-M2-01','TH2.1-M2-05','TH2.1-M2-08','TH3.1-M2-05','TH3.1-M2-06',
 'TH1.1-M3-10','TH2.1-M3-01','TH2.1-M3-03','TH2.1-M3-09','TH2.1-M3-10','TH3.1-M3-06'
)),
notes = case when o.code in (
 'TH1.1-M1-07','TH1.1-M1-09','TH2.1-M1-09','TH3.1-M1-06',
 'TH1.1-M2-08','TH2.1-M2-01','TH2.1-M2-05','TH2.1-M2-08','TH3.1-M2-05','TH3.1-M2-06',
 'TH1.1-M3-10','TH2.1-M3-01','TH2.1-M3-03','TH2.1-M3-09','TH2.1-M3-10','TH3.1-M3-06'
) then 'OBEC 2021 classification: should know' else 'OBEC 2021 classification: must know' end,
updated_at=now()
from public.learning_objectives o
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join public.learning_curricula c on c.code='TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels gl on gl.curriculum_id=c.id
where a.objective_id=o.id and a.curriculum_id=c.id and a.grade_level_id=gl.id
and s.code='THAI-LANGUAGE' and gl.code in ('M1','M2','M3');
