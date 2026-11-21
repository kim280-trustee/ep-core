-- All official 2008/2017 subject indicators belong in the curriculum catalogue.
-- Must-Know / Should-Know is a teaching and assessment priority classification;
-- it does not determine whether an official indicator is part of the curriculum.
-- Social Studies also has official pathway-only indicators without a priority label.
-- Preserve all classifications and mark every official indicator alignment required.

do $$
declare
  rows_updated integer;
  unique_indicators integer;
  grade_alignments integer;
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
    and alignment.required = false
    and (
      alignment.indicator_classification in ('must_know','should_know')
      or (
        subject.code = 'SOCIAL-STUDIES'
        and alignment.pathway_classification in ('between_learning','terminal')
      )
    );

  get diagnostics rows_updated = row_count;
  if rows_updated not in (0, 839) then
    raise exception 'Expected to correct 839 official curriculum alignments, updated %; inspect the target rows before proceeding.', rows_updated;
  end if;

  select count(distinct objective.id), count(distinct alignment.id)
    into unique_indicators, grade_alignments
  from public.learning_objective_alignments alignment
  join public.learning_curricula curriculum on curriculum.id = alignment.curriculum_id
  join public.learning_objectives objective on objective.id = alignment.objective_id
  join public.learning_topics topic on topic.id = objective.topic_id
  join public.learning_skills skill on skill.id = topic.skill_id
  join public.learning_subjects subject on subject.id = skill.subject_id
  where curriculum.code = 'TH-BASIC-CORE-2008-2017'
    and alignment.required = true
    and subject.code in (
      'THAI-LANGUAGE','MATH','SCI','SOCIAL-STUDIES',
      'HEALTH-PE','ARTS','CAREER','FOREIGN-LANGUAGES'
    );

  if unique_indicators <> 1940 or grade_alignments <> 2334 then
    raise exception 'National core verification failed: expected 1940 unique indicators / 2334 alignments; found % / %.',
      unique_indicators, grade_alignments;
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
      and alignment.required = true
      and objective.code like 'M3-S3_2-%'
      and alignment.indicator_classification is null
  ) then
    raise exception 'Legacy M3 W3.2 supplementary Science outcomes must remain non-required.';
  end if;
end $$;
