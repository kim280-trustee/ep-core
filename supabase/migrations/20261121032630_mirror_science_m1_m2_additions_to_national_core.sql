begin;

-- The national master curriculum is intentionally still draft, so do not
-- filter it to status='active'. Mirror only the new official M1/M2 rows from
-- the canonical active Science curriculum into its matching draft grade levels.
insert into public.learning_objective_alignments
  (objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select source.objective_id,national.id,national_grade.id,source.sequence_no,
       source.required,source.notes,source.indicator_classification
from public.learning_objective_alignments source
join public.learning_curricula source_curriculum
  on source_curriculum.id=source.curriculum_id and source_curriculum.code='TH-SCI-M1-M6'
join public.learning_grade_levels source_grade
  on source_grade.id=source.grade_level_id and source_grade.curriculum_id=source_curriculum.id
join public.learning_objectives objective on objective.id=source.objective_id
join public.learning_topics topic on topic.id=objective.topic_id
join public.learning_skills skill on skill.id=topic.skill_id
join public.learning_subjects subject on subject.id=skill.subject_id and subject.code='SCI'
join public.learning_curricula national on national.code='TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels national_grade
  on national_grade.curriculum_id=national.id and national_grade.code=source_grade.code
where source_grade.code in ('M1','M2')
  and (objective.code like 'M1-S4_1-%' or objective.code like 'M1-S4_2-%'
       or objective.code like 'M2-S2_1-%' or objective.code like 'M2-S4_1-%'
       or objective.code like 'M2-S4_2-%')
  and not exists (
    select 1 from public.learning_objective_alignments existing
    where existing.objective_id=source.objective_id
      and existing.curriculum_id=national.id
      and existing.grade_level_id=national_grade.id
  )
on conflict(objective_id,curriculum_id,grade_level_id) do nothing;

commit;