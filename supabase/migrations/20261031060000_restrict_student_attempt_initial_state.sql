-- Students must start an attempt in a clean, unevaluated state.
-- Evaluation fields are server-managed and cannot be forged at creation time.
begin;

drop policy if exists learning_attempts_insert on public.learning_attempts;
create policy learning_attempts_insert
on public.learning_attempts
for insert
to authenticated
with check (
  student_user_id in (
    select u.id from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and tenant_id in (
    select u.tenant_id from public.users u
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
      and public.is_organization_member(organization_id)
      and exists (
        select 1
        from public.learning_assessments a
        where a.id = assessment_id
          and a.organization_id = organization_id
          and a.status = 'published'
          and a.published_at is not null
      )
    )
  )
);

commit;
