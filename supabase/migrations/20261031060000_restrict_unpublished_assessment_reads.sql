-- Prevent students and ordinary organization members from reading unpublished assessment material.
-- Authors retain access to their own drafts; academic managers retain review access.
begin;

drop policy if exists learning_questions_read on public.learning_questions;
create policy learning_questions_read on public.learning_questions
for select to authenticated
using (
  (organization_id is null and status = 'published')
  or (
    organization_id is not null
    and status = 'published'
    and public.is_organization_member(organization_id)
  )
  or (
    organization_id is not null
    and public.learning_can_manage_academic_records(organization_id)
  )
  or (
    organization_id is not null
    and created_by = public.learning_current_user_id()
    and public.learning_is_active_teacher(organization_id)
  )
);

drop policy if exists learning_question_versions_read on public.learning_question_versions;
create policy learning_question_versions_read on public.learning_question_versions
for select to authenticated
using (
  exists (
    select 1
    from public.learning_questions q
    where q.id = question_id
      and (
        (
          q.organization_id is null
          and q.status = 'published'
          and published_at is not null
        )
        or (
          q.organization_id is not null
          and q.status = 'published'
          and published_at is not null
          and public.is_organization_member(q.organization_id)
        )
        or (
          q.organization_id is not null
          and public.learning_can_manage_academic_records(q.organization_id)
        )
        or (
          q.organization_id is not null
          and q.created_by = public.learning_current_user_id()
          and public.learning_is_active_teacher(q.organization_id)
        )
      )
  )
);

drop policy if exists learning_question_objectives_read on public.learning_question_objectives;
create policy learning_question_objectives_read on public.learning_question_objectives
for select to authenticated
using (
  exists (
    select 1
    from public.learning_question_versions v
    join public.learning_questions q on q.id = v.question_id
    where v.id = question_version_id
      and (
        (
          q.organization_id is null
          and q.status = 'published'
          and v.published_at is not null
        )
        or (
          q.organization_id is not null
          and q.status = 'published'
          and v.published_at is not null
          and public.is_organization_member(q.organization_id)
        )
        or (
          q.organization_id is not null
          and public.learning_can_manage_academic_records(q.organization_id)
        )
        or (
          q.organization_id is not null
          and q.created_by = public.learning_current_user_id()
          and public.learning_is_active_teacher(q.organization_id)
        )
      )
  )
);

drop policy if exists learning_assessments_read on public.learning_assessments;
create policy learning_assessments_read on public.learning_assessments
for select to authenticated
using (
  (organization_id is null and status = 'published' and published_at is not null)
  or (
    organization_id is not null
    and status = 'published'
    and published_at is not null
    and public.is_organization_member(organization_id)
  )
  or (
    organization_id is not null
    and public.learning_can_manage_academic_records(organization_id)
  )
  or (
    organization_id is not null
    and created_by = public.learning_current_user_id()
    and public.learning_is_active_teacher(organization_id)
  )
);

drop policy if exists learning_assessment_questions_read on public.learning_assessment_questions;
create policy learning_assessment_questions_read on public.learning_assessment_questions
for select to authenticated
using (
  exists (
    select 1
    from public.learning_assessments a
    where a.id = assessment_id
      and (
        (
          a.organization_id is null
          and a.status = 'published'
          and a.published_at is not null
        )
        or (
          a.organization_id is not null
          and a.status = 'published'
          and a.published_at is not null
          and public.is_organization_member(a.organization_id)
        )
        or (
          a.organization_id is not null
          and public.learning_can_manage_academic_records(a.organization_id)
        )
        or (
          a.organization_id is not null
          and a.created_by = public.learning_current_user_id()
          and public.learning_is_active_teacher(a.organization_id)
        )
      )
  )
);

commit;
