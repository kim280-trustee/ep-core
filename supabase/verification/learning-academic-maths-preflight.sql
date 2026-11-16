-- E&P Learning academic foundation + Maths rollout preflight.
-- READ ONLY: run in the Supabase SQL Editor before applying pending migrations.
-- Every issue_count below should be zero before the integrity migrations are applied.
-- Catalogue prerequisite checks may be zero before the Maths catalogue migration runs.

with checks as (
  select
    'terms_outside_academic_year_dates'::text as check_name,
    count(*)::bigint as issue_count
  from public.learning_terms t
  join public.learning_academic_years ay
    on ay.id = t.academic_year_id
   and ay.organization_id = t.organization_id
  where t.starts_on < ay.starts_on or t.ends_on > ay.ends_on

  union all

  select
    'gradebook_entries_term_class_year_mismatch',
    count(*)::bigint
  from public.learning_gradebook_entries e
  join public.learning_terms t
    on t.id = e.term_id and t.organization_id = e.organization_id
  join public.learning_class_groups cg
    on cg.id = e.class_group_id and cg.organization_id = e.organization_id
  where t.academic_year_id <> cg.academic_year_id

  union all

  select
    'term_grades_term_class_year_mismatch',
    count(*)::bigint
  from public.learning_term_grades g
  join public.learning_terms t
    on t.id = g.term_id and t.organization_id = g.organization_id
  join public.learning_class_groups cg
    on cg.id = g.class_group_id and cg.organization_id = g.organization_id
  where t.academic_year_id <> cg.academic_year_id

  union all

  select
    'gradebook_entries_class_subject_mismatch',
    count(*)::bigint
  from public.learning_gradebook_entries e
  join public.learning_class_subjects cs
    on cs.id = e.class_subject_id and cs.organization_id = e.organization_id
  where cs.class_group_id <> e.class_group_id

  union all

  select
    'term_grades_class_subject_mismatch',
    count(*)::bigint
  from public.learning_term_grades g
  join public.learning_class_subjects cs
    on cs.id = g.class_subject_id and cs.organization_id = g.organization_id
  where cs.class_group_id <> g.class_group_id

  union all

  select
    'gradebook_entries_without_student_membership',
    count(*)::bigint
  from public.learning_gradebook_entries e
  where not exists (
    select 1
    from public.learning_class_memberships cm
    where cm.organization_id = e.organization_id
      and cm.class_group_id = e.class_group_id
      and cm.user_id = e.student_user_id
      and cm.membership_type = 'student'
  )

  union all

  select
    'term_grades_without_student_membership',
    count(*)::bigint
  from public.learning_term_grades g
  where not exists (
    select 1
    from public.learning_class_memberships cm
    where cm.organization_id = g.organization_id
      and cm.class_group_id = g.class_group_id
      and cm.user_id = g.student_user_id
      and cm.membership_type = 'student'
  )

  union all

  select
    'content_items_linked_to_multiple_subjects',
    count(*)::bigint
  from (
    select co.content_item_id
    from public.learning_content_objectives co
    join public.learning_objectives o on o.id = co.objective_id
    join public.learning_topics t on t.id = o.topic_id
    join public.learning_skills s on s.id = t.skill_id
    group by co.content_item_id
    having count(distinct s.subject_id) > 1
  ) multi_subject_content

  union all

  select
    'content_objectives_without_active_curriculum_grade_subject_alignment',
    count(*)::bigint
  from public.learning_content_objectives co
  join public.learning_objectives o on o.id = co.objective_id
  join public.learning_topics t on t.id = o.topic_id
  join public.learning_skills s on s.id = t.skill_id
  where o.status <> 'active'
     or t.status <> 'active'
     or s.status <> 'active'
     or not exists (
       select 1
       from public.learning_objective_alignments a
       join public.learning_grade_levels g
         on g.id = a.grade_level_id
        and g.curriculum_id = a.curriculum_id
        and g.status = 'active'
       join public.learning_curricula c
         on c.id = a.curriculum_id and c.status = 'active'
       join public.learning_curriculum_subjects cs
         on cs.curriculum_id = a.curriculum_id
        and cs.subject_id = s.subject_id
        and cs.status = 'active'
       join public.learning_subjects sub
         on sub.id = s.subject_id and sub.status = 'active'
       where a.objective_id = o.id
     )
)
select check_name, issue_count,
       case when issue_count = 0 then 'PASS' else 'REVIEW REQUIRED' end as result
from checks
order by check_name;

-- Snapshot of the live Maths catalogue prerequisites.
select
  (select count(*) from public.learning_subjects where code = 'MATH' and status = 'active') as active_maths_subjects,
  (select count(*) from public.learning_curricula where code = 'TH-MATH-M1-M6' and status = 'active') as active_thai_maths_curricula,
  (select count(*)
   from public.learning_grade_levels g
   join public.learning_curricula c on c.id = g.curriculum_id
   where c.code = 'TH-MATH-M1-M6'
     and g.status = 'active'
     and g.code in ('M1','M2','M3','M4','M5','M6')) as active_maths_grade_levels;
