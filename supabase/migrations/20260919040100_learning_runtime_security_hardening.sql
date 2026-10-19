-- E&P Learning
-- Runtime security hardening and student assessment visibility

begin;

-- ============================================================
-- 1. Student-visible assessment helper
-- ============================================================

create or replace function private.learning_assessment_visible_to_student(
  p_assessment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.learning_assessments a
    join public.learning_assignment_items ai
      on ai.assessment_id = a.id
    join public.learning_assignments ass
      on ass.id = ai.assignment_id
    join public.learning_assignment_targets t
      on t.assignment_id = ass.id
    where a.id = p_assessment_id
      and a.status = 'published'
      and ass.status = 'published'
      and t.status = 'active'
      and (
        t.student_user_id = (
          select u.id
          from public.users u
          where u.auth_user_id = (select auth.uid())
        )
        or exists (
          select 1
          from public.learning_class_memberships cm
          where cm.class_group_id = t.class_group_id
            and cm.user_id = (
              select u.id
              from public.users u
              where u.auth_user_id = (select auth.uid())
            )
            and cm.status = 'active'
        )
      )
  );
$$;

revoke all on function private.learning_assessment_visible_to_student(uuid)
from public, anon, authenticated;


-- ============================================================
-- 2. Student-visible question helper
-- ============================================================

create or replace function private.learning_question_visible_to_student(
  p_question_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.learning_question_versions qv
    join public.learning_assessment_questions aq
      on aq.question_version_id = qv.id
    join public.learning_assessments a
      on a.id = aq.assessment_id
    where qv.question_id = p_question_id
      and qv.published_at is not null
      and a.status = 'published'
      and private.learning_assessment_visible_to_student(a.id)
  );
$$;

revoke all on function private.learning_question_visible_to_student(uuid)
from public, anon, authenticated;


-- ============================================================
-- 3. Replace assessment read policy
-- ============================================================

drop policy if exists learning_assessments_read
on public.learning_assessments;

create policy learning_assessments_read
on public.learning_assessments
for select
to authenticated
using (
  (
    organization_id is null
    and status = 'published'
  )
  or (
    organization_id is not null
    and public.is_organization_member(organization_id)
  )
  or private.learning_assessment_visible_to_student(id)
);


-- ============================================================
-- 4. Replace assessment-question read policy
-- ============================================================

drop policy if exists learning_assessment_questions_read
on public.learning_assessment_questions;

create policy learning_assessment_questions_read
on public.learning_assessment_questions
for select
to authenticated
using (
  exists (
    select 1
    from public.learning_assessments a
    where a.id = assessment_id
      and (
        (
          a.organization_id is null
          and a.status = 'published'
        )
        or (
          a.organization_id is not null
          and public.is_organization_member(a.organization_id)
        )
        or private.learning_assessment_visible_to_student(a.id)
      )
  )
);


-- ============================================================
-- 5. Replace question read policy
-- ============================================================

drop policy if exists learning_questions_read
on public.learning_questions;

create policy learning_questions_read
on public.learning_questions
for select
to authenticated
using (
  (
    organization_id is null
    and status = 'published'
  )
  or (
    organization_id is not null
    and public.is_organization_member(organization_id)
  )
  or private.learning_question_visible_to_student(id)
);


-- ============================================================
-- 6. Allow assigned students to read published versions only
-- ============================================================

drop policy if exists learning_question_versions_read
on public.learning_question_versions;

create policy learning_question_versions_read
on public.learning_question_versions
for select
to authenticated
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
          and public.is_organization_member(q.organization_id)
        )
        or private.learning_question_visible_to_student(q.id)
      )
  )
);


-- ============================================================
-- 7. Evaluation keys remain completely server-only
-- ============================================================

drop policy if exists learning_question_evaluation_keys_read
on public.learning_question_evaluation_keys;

create policy learning_question_evaluation_keys_read
on public.learning_question_evaluation_keys
for select
to authenticated
using (false);


-- ============================================================
-- 8. Attempt creation for assigned students
-- ============================================================

drop policy if exists learning_attempts_insert
on public.learning_attempts;

create policy learning_attempts_insert
on public.learning_attempts
for insert
to authenticated
with check (
  student_user_id = (
    select u.id
    from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and tenant_id = (
    select u.tenant_id
    from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.learning_assessments a
    where a.id = assessment_id
      and a.status = 'published'
      and (
        a.organization_id is null
        or public.is_organization_member(a.organization_id)
        or private.learning_assessment_visible_to_student(a.id)
      )
  )
);


-- ============================================================
-- 9. Remove direct student attempt updates
-- ============================================================

drop policy if exists learning_attempts_update
on public.learning_attempts;

revoke update on public.learning_attempts
from authenticated;


-- ============================================================
-- 10. Tighten attempt-answer INSERT
-- ============================================================

drop policy if exists learning_attempt_answers_insert
on public.learning_attempt_answers;

create policy learning_attempt_answers_insert
on public.learning_attempt_answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.learning_attempts a
    join public.learning_assessment_questions aq
      on aq.assessment_id = a.assessment_id
     and aq.id = assessment_question_id
    where a.id = attempt_id
      and a.student_user_id = (
        select u.id
        from public.users u
        where u.auth_user_id = (select auth.uid())
      )
      and a.status = 'in_progress'
  )
);


-- ============================================================
-- 11. Tighten attempt-answer UPDATE
-- ============================================================

drop policy if exists learning_attempt_answers_update
on public.learning_attempt_answers;

create policy learning_attempt_answers_update
on public.learning_attempt_answers
for update
to authenticated
using (
  exists (
    select 1
    from public.learning_attempts a
    join public.learning_assessment_questions aq
      on aq.assessment_id = a.assessment_id
     and aq.id = assessment_question_id
    where a.id = attempt_id
      and a.student_user_id = (
        select u.id
        from public.users u
        where u.auth_user_id = (select auth.uid())
      )
      and a.status = 'in_progress'
  )
)
with check (
  exists (
    select 1
    from public.learning_attempts a
    join public.learning_assessment_questions aq
      on aq.assessment_id = a.assessment_id
     and aq.id = assessment_question_id
    where a.id = attempt_id
      and a.student_user_id = (
        select u.id
        from public.users u
        where u.auth_user_id = (select auth.uid())
      )
      and a.status = 'in_progress'
  )
);


-- ============================================================
-- 12. Remove direct student mastery writes
-- ============================================================

drop policy if exists learning_student_mastery_insert
on public.learning_student_mastery;

drop policy if exists learning_student_mastery_update
on public.learning_student_mastery;

revoke insert, update
on public.learning_student_mastery
from authenticated;


-- ============================================================
-- 13. Keep mastery/events/recommendations readable
-- ============================================================

grant select
on public.learning_student_mastery,
   public.learning_mastery_events,
   public.learning_recommendations
to authenticated;

commit;
