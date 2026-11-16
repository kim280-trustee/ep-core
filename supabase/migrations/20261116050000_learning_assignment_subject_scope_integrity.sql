-- Enforce subject/class alignment for assignments, targets and attached learning items.
-- This closes the gap between teacher-side selectors and direct authenticated writes.

begin;

create or replace function private.guard_learning_assignment_class_subject_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.class_subject_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.learning_class_subjects class_subject
    join public.learning_class_groups class_group
      on class_group.id = class_subject.class_group_id
     and class_group.organization_id = class_subject.organization_id
    join public.organizations organization
      on organization.id = class_subject.organization_id
     and organization.tenant_id = new.tenant_id
    where class_subject.id = new.class_subject_id
      and class_subject.organization_id = new.organization_id
      and class_subject.status = 'active'
      and class_group.status = 'active'
  ) then
    raise exception 'The assignment subject must belong to an active class in the assignment organization and tenant.';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assignment_class_subject_scope()
  from public, anon, authenticated;

drop trigger if exists learning_assignment_class_subject_scope_guard
  on public.learning_assignments;
create trigger learning_assignment_class_subject_scope_guard
before insert or update of class_subject_id, organization_id, tenant_id
on public.learning_assignments
for each row
execute function private.guard_learning_assignment_class_subject_scope();


create or replace function private.guard_learning_assignment_target_subject_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if exists (
    select 1
    from public.learning_assignments assignment
    join public.learning_class_subjects class_subject
      on class_subject.id = assignment.class_subject_id
    where assignment.id = new.assignment_id
      and assignment.class_subject_id is not null
      and (
        class_subject.status <> 'active'
        or (new.class_group_id is not null and class_subject.class_group_id <> new.class_group_id)
        or (new.class_group_id is null and not exists (
          select 1
          from public.learning_class_memberships student_membership
          where student_membership.user_id = new.student_user_id
            and student_membership.class_group_id = class_subject.class_group_id
            and student_membership.organization_id = assignment.organization_id
            and student_membership.membership_type = 'student'
            and student_membership.status = 'active'
        ))
      )
  ) then
    raise exception 'A subject-specific assignment can only target students enrolled in the class that owns its selected subject.';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assignment_target_subject_scope()
  from public, anon, authenticated;

drop trigger if exists learning_assignment_target_subject_scope_guard
  on public.learning_assignment_targets;
create trigger learning_assignment_target_subject_scope_guard
before insert or update of assignment_id, class_group_id, student_user_id
on public.learning_assignment_targets
for each row
execute function private.guard_learning_assignment_target_subject_scope();


create or replace function private.guard_learning_assignment_item_subject_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_assignment_subject_id uuid;
  v_subject_id uuid;
  v_curriculum_id uuid;
  v_grade_level_id uuid;
begin
  select assignment.class_subject_id, class_subject.subject_id, class_group.curriculum_id, class_group.grade_level_id
    into v_assignment_subject_id, v_subject_id, v_curriculum_id, v_grade_level_id
  from public.learning_assignments assignment
  left join public.learning_class_subjects class_subject
    on class_subject.id = assignment.class_subject_id
   and class_subject.organization_id = assignment.organization_id
   and class_subject.status = 'active'
  left join public.learning_class_groups class_group
    on class_group.id = class_subject.class_group_id
   and class_group.organization_id = class_subject.organization_id
   and class_group.status = 'active'
  where assignment.id = new.assignment_id
    and assignment.organization_id = new.organization_id;

  if v_assignment_subject_id is null then
    return new;
  end if;

  if v_subject_id is null then
    raise exception 'The assignment subject must remain active and linked to an active class.';
  end if;

  if new.item_type = 'content' then
    if not exists (
      select 1
      from public.learning_content_items content_item
      where content_item.id = new.content_item_id
        and (content_item.organization_id is null or content_item.organization_id = new.organization_id)
        and content_item.status = 'published'
        and exists (
          select 1 from public.learning_content_objectives mapping
          where mapping.content_item_id = content_item.id
        )
        and not exists (
          select 1
          from public.learning_content_objectives mapping
          join public.learning_objectives objective on objective.id = mapping.objective_id
          join public.learning_topics topic on topic.id = objective.topic_id
          join public.learning_skills skill on skill.id = topic.skill_id
          where mapping.content_item_id = content_item.id
            and (
              objective.status <> 'active'
              or topic.status <> 'active'
              or skill.status <> 'active'
              or skill.subject_id is distinct from v_subject_id
              or not exists (
                select 1
                from public.learning_objective_alignments alignment
                join public.learning_grade_levels grade
                  on grade.id = alignment.grade_level_id
                 and grade.curriculum_id = alignment.curriculum_id
                 and grade.status = 'active'
                join public.learning_curricula curriculum
                  on curriculum.id = alignment.curriculum_id
                 and curriculum.status = 'active'
                where alignment.objective_id = objective.id
                  and alignment.curriculum_id = v_curriculum_id
                  and alignment.grade_level_id = v_grade_level_id
              )
            )
        )
    ) then
      raise exception 'Content attached to a subject-specific assignment must have active objective mappings for that same subject.';
    end if;
  elsif new.item_type = 'assessment' then
    if not exists (
      select 1
      from public.learning_assessments assessment
      where assessment.id = new.assessment_id
        and (assessment.organization_id is null or assessment.organization_id = new.organization_id)
        and assessment.status = 'published'
        and assessment.subject_id = v_subject_id
        and (assessment.curriculum_id is null or assessment.curriculum_id = v_curriculum_id)
        and (assessment.grade_level_id is null or assessment.grade_level_id = v_grade_level_id)
    ) then
      raise exception 'An assessment attached to a subject-specific assignment must match its subject, curriculum and grade.';
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assignment_item_subject_scope()
  from public, anon, authenticated;

drop trigger if exists learning_assignment_item_subject_scope_guard
  on public.learning_assignment_items;
create trigger learning_assignment_item_subject_scope_guard
before insert or update of assignment_id, organization_id, item_type, content_item_id, assessment_id
on public.learning_assignment_items
for each row
execute function private.guard_learning_assignment_item_subject_scope();


-- Re-check the full academic scope at publication time, because referenced
-- class subjects or learning mappings may have changed after draft authoring.
create or replace function private.guard_learning_assignment_subject_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_subject_id uuid;
  v_curriculum_id uuid;
  v_grade_level_id uuid;
begin
  if new.status <> 'published' or new.class_subject_id is null then
    return new;
  end if;

  select class_subject.subject_id, class_group.curriculum_id, class_group.grade_level_id
    into v_subject_id, v_curriculum_id, v_grade_level_id
  from public.learning_class_subjects class_subject
  join public.learning_class_groups class_group
    on class_group.id = class_subject.class_group_id
   and class_group.organization_id = class_subject.organization_id
  where class_subject.id = new.class_subject_id
    and class_subject.organization_id = new.organization_id
    and class_subject.status = 'active'
    and class_group.status = 'active';

  if v_subject_id is null then
    raise exception 'A subject-specific assignment requires an active class subject before publishing.';
  end if;

  if exists (
    select 1
    from public.learning_assignment_targets target
    where target.assignment_id = new.id
      and target.status = 'active'
      and (
        (target.class_group_id is not null and not exists (
          select 1
          from public.learning_class_subjects class_subject
          where class_subject.id = new.class_subject_id
            and class_subject.class_group_id = target.class_group_id
            and class_subject.status = 'active'
        ))
        or (target.class_group_id is null and not exists (
          select 1
          from public.learning_class_memberships membership
          join public.learning_class_subjects class_subject
            on class_subject.id = new.class_subject_id
          where membership.user_id = target.student_user_id
            and membership.class_group_id = class_subject.class_group_id
            and membership.organization_id = new.organization_id
            and membership.membership_type = 'student'
            and membership.status = 'active'
        ))
      )
  ) then
    raise exception 'Every active target must belong to the class that owns the assignment subject.';
  end if;

  if exists (
    select 1
    from public.learning_assignment_items item
    where item.assignment_id = new.id
      and (
        (item.item_type = 'content' and not exists (
          select 1
          from public.learning_content_items content_item
          where content_item.id = item.content_item_id
            and content_item.status = 'published'
            and exists (
              select 1 from public.learning_content_objectives mapping
              where mapping.content_item_id = content_item.id
            )
            and not exists (
              select 1
              from public.learning_content_objectives mapping
              join public.learning_objectives objective on objective.id = mapping.objective_id
              join public.learning_topics topic on topic.id = objective.topic_id
              join public.learning_skills skill on skill.id = topic.skill_id
              where mapping.content_item_id = content_item.id
                and (
                  objective.status <> 'active'
                  or topic.status <> 'active'
                  or skill.status <> 'active'
                  or skill.subject_id is distinct from v_subject_id
                  or not exists (
                    select 1
                    from public.learning_objective_alignments alignment
                    join public.learning_grade_levels grade
                      on grade.id = alignment.grade_level_id
                     and grade.curriculum_id = alignment.curriculum_id
                     and grade.status = 'active'
                    join public.learning_curricula curriculum
                      on curriculum.id = alignment.curriculum_id
                     and curriculum.status = 'active'
                    where alignment.objective_id = objective.id
                      and alignment.curriculum_id = v_curriculum_id
                      and alignment.grade_level_id = v_grade_level_id
                  )
                )
            )
        ))
        or (item.item_type = 'assessment' and not exists (
          select 1
          from public.learning_assessments assessment
          where assessment.id = item.assessment_id
            and assessment.status = 'published'
            and assessment.subject_id = v_subject_id
            and (assessment.curriculum_id is null or assessment.curriculum_id = v_curriculum_id)
            and (assessment.grade_level_id is null or assessment.grade_level_id = v_grade_level_id)
        ))
      )
  ) then
    raise exception 'Every assignment item must remain aligned to the assignment subject, curriculum and grade before publishing.';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assignment_subject_publication()
  from public, anon, authenticated;

drop trigger if exists learning_assignment_subject_publication_guard
  on public.learning_assignments;
create trigger learning_assignment_subject_publication_guard
before insert or update of status
on public.learning_assignments
for each row
execute function private.guard_learning_assignment_subject_publication();

commit;
