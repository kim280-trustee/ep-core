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

  if exists (
    select 1
    from public.learning_objective_alignments alignment
    join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
    join public.learning_objectives objective on objective.id = alignment.objective_id
    join public.learning_topics topic on topic.id = objective.topic_id
    join public.learning_skills skill on skill.id = topic.skill_id
    join public.learning_subjects subject on subject.id = skill.subject_id
    where curriculum.code = 'TH-BASIC-CORE-2008-2017'
      and subject.code in (
        'THAI-LANGUAGE','SOCIAL-STUDIES','HEALTH-PE',
        'ARTS','CAREER','FOREIGN-LANGUAGES'
      )
      and alignment.required = false
  ) then
    raise exception 'Some official subject alignments remain non-required after correction.';
  end if;

  if exists (
    select 1
    from public.learning_objective_alignments alignment
    join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
    join public.learning_objectives objective on objective.id = alignment.objective_id
    join public.learning_topics topic on topic.id = objective.topic_id
    join public.learning_skills skill on skill.id = topic.skill_id
    join public.learning_subjects subject on subject.id = skill.subject_id
    where curriculum.code = 'TH-BASIC-CORE-2008-2017'
      and subject.code = 'SCI'
      and curriculum.code in ('TH-SCI-M1-M6', 'TH-BASIC-CORE-2008-2017')
      and alignment.grade_level_id in (
        select id from public.learning_grade_levels where code = 'M3'
      )
      and alignment.required = true
      and objective.code between 'M3-S3_2-01' and 'M3-S3_2-09'
      and alignment.indicator_classification is null
  ) then
    raise exception 'Legacy M3 W3.2 supplementary Science outcomes must remain non-required.';
  end if;
end $$;
