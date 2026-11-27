-- All official 2008/2017 subject indicators belong in the curriculum catalogue.
-- Must-Know / Should-Know is a teaching and assessment priority classification;
-- it does not determine whether an official indicator is part of the curriculum.
-- Social Studies also has official pathway-only indicators without a priority label.
-- Preserve all classifications and mark every official indicator alignment required.

do $$
declare
  rows_updated integer;
begin
  update public.learning_objective_alignments alignment
  set required = true,
      updated_at = now()
  from public.learning_curricula curriculum,
       public.learning_objectives objective,
       public.learning_topics topic,
       public.learning_skills skill,
       public.learning_subjects subject
  where alignment.curriculum_id = curriculum.id
    and alignment.objective_id = objective.id
    and objective.topic_id = topic.id
    and topic.skill_id = skill.id
    and skill.subject_id = subject.id
    and curriculum.code = 'TH-BASIC-CORE-2008-2017'
    and subject.code in (
      'THAI-LANGUAGE',
      'SOCIAL-STUDIES',
      'HEALTH-PE',
      'ARTS',
      'CAREER',
      'FOREIGN-LANGUAGES'
    )
    and alignment.required = false;

  get diagnostics rows_updated = row_count;
  -- Earlier curriculum migrations already marked 401 alignments required;
  -- this correction should therefore update the remaining 438 rows.
  if rows_updated not in (0, 438) then
    raise exception 'Expected to correct 438 remaining official curriculum alignments, updated %; inspect the target rows before proceeding.', rows_updated;
  end if;

  -- Do not assert a repository-wide indicator total here. This migration's
  -- contract is limited to the six learning areas corrected above; Maths and
  -- Science have independent grade/track catalogues and their own alignment
  -- history. Their global totals are validated by the curriculum rollout
  -- checks, not by this required-flag correction.

  -- Keep the legacy supplementary M3 W3.2 Science entries outside the
  -- required curriculum indicator set. These are unclassified additions,
  -- not the official classified indicator rows.
  update public.learning_objective_alignments alignment
  set required = false,
      updated_at = now()
  from public.learning_curricula curriculum,
       public.learning_objectives objective,
       public.learning_topics topic,
       public.learning_skills skill,
       public.learning_subjects subject
  where alignment.curriculum_id = curriculum.id
    and alignment.objective_id = objective.id
    and objective.topic_id = topic.id
    and topic.skill_id = skill.id
    and skill.subject_id = subject.id
    and curriculum.code = 'TH-BASIC-CORE-2008-2017'
    and subject.code = 'SCI'
    and alignment.grade_level_id in (
      select id from public.learning_grade_levels where code = 'M3'
    )
    and objective.code between 'M3-S3_2-01' and 'M3-S3_2-09'
    and alignment.indicator_classification is null
    and alignment.required = true;

end $$