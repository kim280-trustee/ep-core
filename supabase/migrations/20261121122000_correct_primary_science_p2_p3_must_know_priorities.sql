-- OBEC 2021 source tables classify both rows as Must-Know:
-- page 65: ว 4.2 ป.2/3
-- page 68: ว 3.2 ป.3/2
-- P2/P3 priority summaries include other dual-classified indicators; these
-- two rows are not dual-classified and must be stored as Must-Know.
update public.learning_objective_alignments a
set indicator_classification='must_know',
    notes=concat_ws(' ',
      nullif(case when o.code='P3-S3_2-02'
        then regexp_replace(a.notes,'OBEC 2021 priority: should_know','OBEC 2021 priority: must_know')
        else a.notes end,''),
      case o.code
        when 'P2-S4_2-03' then 'Priority correction: OBEC 2021 printed page 65 classifies ว 4.2 ป.2/3 as Must-Know.'
        when 'P3-S3_2-02' then 'Priority correction: OBEC 2021 printed page 68 classifies ว 3.2 ป.3/2 as Must-Know.'
      end)
from public.learning_objectives o
join public.learning_topics t on t.id=o.topic_id
join public.learning_skills sk on sk.id=t.skill_id
join public.learning_subjects s on s.id=sk.subject_id
join public.learning_grade_levels g on g.code=case when o.code='P2-S4_2-03' then 'P2' else 'P3' end
join public.learning_curricula c on c.code in ('TH-SCI-M1-M6','TH-BASIC-CORE-2008-2017')
where a.objective_id=o.id
  and a.grade_level_id=g.id
  and a.curriculum_id=c.id
  and s.code='SCI'
  and o.code in ('P2-S4_2-03','P3-S3_2-02')
  and a.required=true
  and a.indicator_classification='should_know';
