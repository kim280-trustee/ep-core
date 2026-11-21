begin;

-- Keep the national core catalogue aligned with the complete lower-secondary
-- Science catalogue. The M3 greenhouse-effect indicators were added to the
-- SCI track after the original national-core seed and need the same grade links.
insert into public.learning_objective_alignments
  (objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification)
select
  source_alignment.objective_id,
  national_curriculum.id,
  national_grade.id,
  source_alignment.sequence_no,
  source_alignment.required,
  source_alignment.notes,
  source_alignment.indicator_classification
from public.learning_objective_alignments source_alignment
join public.learning_curricula source_curriculum
  on source_curriculum.id=source_alignment.curriculum_id
join public.learning_grade_levels source_grade
  on source_grade.id=source_alignment.grade_level_id
 and source_grade.curriculum_id=source_curriculum.id
join public.learning_objectives objective
  on objective.id=source_alignment.objective_id
join public.learning_topics topic on topic.id=objective.topic_id
join public.learning_skills skill on skill.id=topic.skill_id
join public.learning_subjects subject on subject.id=skill.subject_id
join public.learning_curricula national_curriculum
  on national_curriculum.code='TH-BASIC-CORE-2008-2017'
join public.learning_grade_levels national_grade
  on national_grade.curriculum_id=national_curriculum.id
 and national_grade.code=source_grade.code
where source_curriculum.code='TH-SCI-M1-M6'
  and subject.code='SCI'
  and source_grade.code in ('M1','M2','M3')
  and not exists (
    select 1
    from public.learning_objective_alignments existing
    where existing.objective_id=source_alignment.objective_id
      and existing.curriculum_id=national_curriculum.id
      and existing.grade_level_id=national_grade.id
  )
on conflict(objective_id,curriculum_id,grade_level_id) do nothing;

-- Reconcile priority labels from the canonical lower-secondary Science
-- track into the national-core catalogue for the same indicator and grade.
update public.learning_objective_alignments national_alignment
set indicator_classification=source_alignment.indicator_classification,
    updated_at=now()
from public.learning_curricula national_curriculum,
     public.learning_grade_levels national_grade,
     public.learning_objectives objective,
     public.learning_topics topic,
     public.learning_skills skill,
     public.learning_subjects subject,
     public.learning_objective_alignments source_alignment,
     public.learning_curricula source_curriculum,
     public.learning_grade_levels source_grade
where national_alignment.curriculum_id=national_curriculum.id
  and national_alignment.grade_level_id=national_grade.id
  and national_grade.curriculum_id=national_curriculum.id
  and national_alignment.objective_id=objective.id
  and objective.topic_id=topic.id
  and topic.skill_id=skill.id
  and skill.subject_id=subject.id
  and subject.code='SCI'
  and national_curriculum.code='TH-BASIC-CORE-2008-2017'
  and national_grade.code in ('M1','M2','M3')
  and source_alignment.objective_id=national_alignment.objective_id
  and source_alignment.grade_level_id=source_grade.id
  and source_alignment.curriculum_id=source_curriculum.id
  and source_grade.curriculum_id=source_curriculum.id
  and source_curriculum.code='TH-SCI-M1-M6'
  and source_grade.code=national_grade.code;

commit;