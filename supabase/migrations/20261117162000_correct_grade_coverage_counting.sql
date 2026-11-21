drop view if exists public.learning_curriculum_subject_rollout_summary;
drop view if exists public.learning_curriculum_grade_coverage;

create view public.learning_curriculum_grade_coverage as
select
  c.id as curriculum_id,
  c.code as curriculum_code,
  c.name as curriculum_name,
  c.status as curriculum_status,
  cs.id as curriculum_subject_id,
  s.id as subject_id,
  s.code as subject_code,
  cs.name as curriculum_subject_name,
  g.id as grade_level_id,
  g.code as grade_code,
  g.sequence_no as grade_sequence,
  count(distinct o.id) as subject_total_objective_count,
  count(distinct a.objective_id) as objective_count,
  count(distinct a.id) as alignment_count,
  count(distinct a.id) filter (where a.indicator_classification = 'must_know') as must_know_alignment_count,
  count(distinct a.id) filter (where a.indicator_classification = 'should_know') as should_know_alignment_count,
  count(distinct a.id) filter (where a.indicator_classification = 'between_learning') as between_learning_alignment_count,
  count(distinct a.id) filter (where a.indicator_classification = 'terminal') as terminal_alignment_count,
  count(distinct a.id) filter (where a.indicator_classification is null) as unclassified_alignment_count
from public.learning_curricula c
join public.learning_curriculum_subjects cs on cs.curriculum_id = c.id and cs.status = 'active'
join public.learning_subjects s on s.id = cs.subject_id
join public.learning_grade_levels g on g.curriculum_id = c.id and g.status = 'active'
left join public.learning_skills sk on sk.subject_id = s.id and sk.status = 'active'
left join public.learning_topics t on t.skill_id = sk.id and t.status = 'active'
left join public.learning_objectives o on o.topic_id = t.id and o.status = 'active'
left join public.learning_objective_alignments a
  on a.objective_id = o.id
 and a.curriculum_id = c.id
 and a.grade_level_id = g.id
group by c.id, c.code, c.name, c.status, cs.id, s.id, s.code, cs.name, g.id, g.code, g.sequence_no;

create view public.learning_curriculum_subject_rollout_summary as
select
  curriculum_id,
  curriculum_code,
  curriculum_name,
  curriculum_status,
  subject_id,
  subject_code,
  curriculum_subject_name,
  count(distinct grade_level_id) as active_grade_count,
  max(subject_total_objective_count) as subject_total_objective_count,
  sum(objective_count) as grade_objective_count,
  sum(alignment_count) as grade_alignment_count,
  sum(must_know_alignment_count) as must_know_alignment_count,
  sum(should_know_alignment_count) as should_know_alignment_count,
  sum(between_learning_alignment_count) as between_learning_alignment_count,
  sum(terminal_alignment_count) as terminal_alignment_count,
  sum(unclassified_alignment_count) as unclassified_alignment_count
from public.learning_curriculum_grade_coverage
group by curriculum_id, curriculum_code, curriculum_name, curriculum_status, subject_id, subject_code, curriculum_subject_name;