-- An active organisation membership alone does not prove current student enrolment.
-- Require at least one active student class membership in the same active organisation
-- before a student can create an assessment attempt.
begin;

drop policy if exists learning_attempts_insert
on public.learning_attempts;

create policy learning_attempts_insert
on public.learning_attempts
for insert
to authenticated
with check (
  student_user_id in (
    select u.id
    from public.users u
    where u.auth_user_id = (select auth.uid())
      and u.tenant_id = learning_attempts.tenant_id
  )
  and tenant_id = (
    select u.tenant_id
    from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and status = 'in_progress'
  and submitted_at is null
  and score is null
  and max_score is null
  and percentage is null
  and previous_attempt_id is null
  and (
    (
      organization_id is null
      and exists (
        select 1
        from public.learning_assessments a
        where a.id = assessment_id
          and a.organization_id is null
          and a.status = 'published'
          and a.published_at is not null
      )
    )
    or
    (
      organization_id is not null
      and exists (
        select 1
        from public.organizations o
        join public.learning_class_memberships cm
          on cm.organization_id = o.id
         and cm.tenant_id = o.tenant_id
         and cm.user_id = learning_attempts.student_user_id
         and cm.membership_type = 'student'
         and cm.status = 'active'
        where o.id = learning_attempts.organization_id
          and o.tenant_id = learning_attempts.tenant_id
          and o.status = 'active'
      )
      and exists (
        select 1
        from public.learning_assessments a
        where a.id = assessment_id
          and a.organization_id = learning_attempts.organization_id
          and a.status = 'published'
          and a.published_at is not null
      )
    )
  )
);

commit;
