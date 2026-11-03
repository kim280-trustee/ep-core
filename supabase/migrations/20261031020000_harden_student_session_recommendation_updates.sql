begin;

-- Students may end their own active learning session, but cannot rewrite
-- its identity, tenant, organisation, context, start time, or metadata.
drop policy if exists learning_sessions_update on public.learning_sessions;
create policy learning_sessions_update
on public.learning_sessions
for update
to authenticated
using (
  student_user_id in (
    select u.id
    from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and ended_at is null
)
with check (
  student_user_id in (
    select u.id
    from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and ended_at is not null
);

revoke update on table public.learning_sessions from authenticated;
revoke update (
  id, tenant_id, organization_id, student_user_id, context_type,
  context_id, started_at, ended_at, metadata, created_at
) on public.learning_sessions from authenticated;
grant update (ended_at) on public.learning_sessions to authenticated;

-- Students may transition only their own active recommendation to completed
-- or dismissed. Recommendation content, priority, ownership, scope and dates
-- remain server-managed. Completion requires a completion timestamp;
-- dismissal does not set one.
drop policy if exists learning_recommendations_update on public.learning_recommendations;
create policy learning_recommendations_update
on public.learning_recommendations
for update
to authenticated
using (
  student_user_id in (
    select u.id
    from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and status = 'active'
)
with check (
  student_user_id in (
    select u.id
    from public.users u
    where u.auth_user_id = (select auth.uid())
  )
  and (
    (status = 'completed' and completed_at is not null)
    or
    (status = 'dismissed' and completed_at is null)
  )
);

revoke update on table public.learning_recommendations from authenticated;
revoke update (
  id, tenant_id, organization_id, student_user_id, recommendation_type,
  objective_id, content_item_id, assessment_id, priority, reason, status,
  generated_at, expires_at, completed_at, created_at, updated_at
) on public.learning_recommendations from authenticated;
grant update (status, completed_at)
on public.learning_recommendations to authenticated;

commit;
