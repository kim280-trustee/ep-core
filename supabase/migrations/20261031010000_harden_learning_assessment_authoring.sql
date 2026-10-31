-- Restrict assessment/question authoring to managers and active class teachers.
-- Teachers may edit only records they created; academic managers may manage all.
begin;

create or replace function public.learning_is_active_teacher(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_class_memberships cm
    join public.organizations o
      on o.id = cm.organization_id
     and o.tenant_id = cm.tenant_id
    where cm.organization_id = target_organization_id
      and cm.user_id = public.learning_current_user_id()
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
      and o.status = 'active'
  );
$function$;

revoke all on function public.learning_is_active_teacher(uuid) from public, anon;
grant execute on function public.learning_is_active_teacher(uuid) to authenticated;

-- Questions
drop policy if exists learning_questions_write on public.learning_questions;
drop policy if exists learning_questions_insert on public.learning_questions;
drop policy if exists learning_questions_update on public.learning_questions;
drop policy if exists learning_questions_delete on public.learning_questions;

create policy learning_questions_insert on public.learning_questions
for insert to authenticated
with check (
  organization_id is not null
  and created_by = public.learning_current_user_id()
  and (
    public.learning_can_manage_academic_records(organization_id)
    or public.learning_is_active_teacher(organization_id)
  )
);

create policy learning_questions_update on public.learning_questions
for update to authenticated
using (
  organization_id is not null
  and (
    public.learning_can_manage_academic_records(organization_id)
    or (created_by = public.learning_current_user_id()
        and public.learning_is_active_teacher(organization_id))
  )
)
with check (
  organization_id is not null
  and (
    public.learning_can_manage_academic_records(organization_id)
    or (created_by = public.learning_current_user_id()
        and public.learning_is_active_teacher(organization_id))
  )
);

create policy learning_questions_delete on public.learning_questions
for delete to authenticated
using (
  organization_id is not null
  and (
    public.learning_can_manage_academic_records(organization_id)
    or (created_by = public.learning_current_user_id()
        and public.learning_is_active_teacher(organization_id))
  )
);

-- Versioned questions
drop policy if exists learning_question_versions_write on public.learning_question_versions;
drop policy if exists learning_question_versions_insert on public.learning_question_versions;
drop policy if exists learning_question_versions_update on public.learning_question_versions;
drop policy if exists learning_question_versions_delete on public.learning_question_versions;

create policy learning_question_versions_insert on public.learning_question_versions
for insert to authenticated
with check (
  created_by = public.learning_current_user_id()
  and exists (
    select 1 from public.learning_questions q
    where q.id = question_id
      and q.organization_id is not null
      and learning_question_versions.published_at is null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (q.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(q.organization_id))
      )
  )
);

create policy learning_question_versions_update on public.learning_question_versions
for update to authenticated
using (
  exists (
    select 1 from public.learning_questions q
    where q.id = question_id
      and q.organization_id is not null
      and learning_question_versions.published_at is null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (learning_question_versions.created_by = public.learning_current_user_id()
            and q.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(q.organization_id))
      )
  )
)
with check (
  exists (
    select 1 from public.learning_questions q
    where q.id = question_id
      and q.organization_id is not null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (learning_question_versions.created_by = public.learning_current_user_id()
            and q.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(q.organization_id))
      )
  )
);

create policy learning_question_versions_delete on public.learning_question_versions
for delete to authenticated
using (
  exists (
    select 1 from public.learning_questions q
    where q.id = question_id
      and q.organization_id is not null
      and learning_question_versions.published_at is null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (learning_question_versions.created_by = public.learning_current_user_id()
            and q.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(q.organization_id))
      )
  )
);

-- Objectives inherit ownership from their question version.
drop policy if exists learning_question_objectives_write on public.learning_question_objectives;
drop policy if exists learning_question_objectives_insert on public.learning_question_objectives;
drop policy if exists learning_question_objectives_update on public.learning_question_objectives;
drop policy if exists learning_question_objectives_delete on public.learning_question_objectives;

create policy learning_question_objectives_insert on public.learning_question_objectives
for insert to authenticated
with check (
  exists (
    select 1
    from public.learning_question_versions v
    join public.learning_questions q on q.id = v.question_id
    where v.id = question_version_id
      and q.organization_id is not null
      and v.published_at is null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (v.created_by = public.learning_current_user_id()
            and q.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(q.organization_id))
      )
  )
);

create policy learning_question_objectives_update on public.learning_question_objectives
for update to authenticated
using (
  exists (
    select 1
    from public.learning_question_versions v
    join public.learning_questions q on q.id = v.question_id
    where v.id = question_version_id
      and q.organization_id is not null
      and v.published_at is null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (v.created_by = public.learning_current_user_id()
            and q.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(q.organization_id))
      )
  )
)
with check (
  exists (
    select 1
    from public.learning_question_versions v
    join public.learning_questions q on q.id = v.question_id
    where v.id = question_version_id
      and q.organization_id is not null
      and v.published_at is null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (v.created_by = public.learning_current_user_id()
            and q.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(q.organization_id))
      )
  )
);

create policy learning_question_objectives_delete on public.learning_question_objectives
for delete to authenticated
using (
  exists (
    select 1
    from public.learning_question_versions v
    join public.learning_questions q on q.id = v.question_id
    where v.id = question_version_id
      and q.organization_id is not null
      and v.published_at is null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (v.created_by = public.learning_current_user_id()
            and q.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(q.organization_id))
      )
  )
);

-- Assessments
drop policy if exists learning_assessments_write on public.learning_assessments;
drop policy if exists learning_assessments_insert on public.learning_assessments;
drop policy if exists learning_assessments_update on public.learning_assessments;
drop policy if exists learning_assessments_delete on public.learning_assessments;

create policy learning_assessments_insert on public.learning_assessments
for insert to authenticated
with check (
  organization_id is not null
  and created_by = public.learning_current_user_id()
  and (
    public.learning_can_manage_academic_records(organization_id)
    or public.learning_is_active_teacher(organization_id)
  )
);

create policy learning_assessments_update on public.learning_assessments
for update to authenticated
using (
  organization_id is not null
  and (
    public.learning_can_manage_academic_records(organization_id)
    or (created_by = public.learning_current_user_id()
        and public.learning_is_active_teacher(organization_id))
  )
)
with check (
  organization_id is not null
  and (
    public.learning_can_manage_academic_records(organization_id)
    or (created_by = public.learning_current_user_id()
        and public.learning_is_active_teacher(organization_id))
  )
);

create policy learning_assessments_delete on public.learning_assessments
for delete to authenticated
using (
  organization_id is not null
  and (
    public.learning_can_manage_academic_records(organization_id)
    or (created_by = public.learning_current_user_id()
        and public.learning_is_active_teacher(organization_id))
  )
);

-- Questions attached to an assessment inherit its authoring scope.
drop policy if exists learning_assessment_questions_write on public.learning_assessment_questions;
drop policy if exists learning_assessment_questions_insert on public.learning_assessment_questions;
drop policy if exists learning_assessment_questions_update on public.learning_assessment_questions;
drop policy if exists learning_assessment_questions_delete on public.learning_assessment_questions;

create policy learning_assessment_questions_insert on public.learning_assessment_questions
for insert to authenticated
with check (
  exists (
    select 1 from public.learning_assessments a
    where a.id = assessment_id
      and a.organization_id is not null
      and (
        public.learning_can_manage_academic_records(a.organization_id)
        or (a.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(a.organization_id))
      )
  )
);

create policy learning_assessment_questions_update on public.learning_assessment_questions
for update to authenticated
using (
  exists (
    select 1 from public.learning_assessments a
    where a.id = assessment_id
      and a.organization_id is not null
      and (
        public.learning_can_manage_academic_records(a.organization_id)
        or (a.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(a.organization_id))
      )
  )
)
with check (
  exists (
    select 1 from public.learning_assessments a
    where a.id = assessment_id
      and a.organization_id is not null
      and (
        public.learning_can_manage_academic_records(a.organization_id)
        or (a.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(a.organization_id))
      )
  )
);

create policy learning_assessment_questions_delete on public.learning_assessment_questions
for delete to authenticated
using (
  exists (
    select 1 from public.learning_assessments a
    where a.id = assessment_id
      and a.organization_id is not null
      and (
        public.learning_can_manage_academic_records(a.organization_id)
        or (a.created_by = public.learning_current_user_id()
            and public.learning_is_active_teacher(a.organization_id))
      )
  )
);

-- Direct writes to the key table must follow the same ownership rule as the RPC.
drop policy if exists learning_question_evaluation_keys_insert on public.learning_question_evaluation_keys;
create policy learning_question_evaluation_keys_insert on public.learning_question_evaluation_keys
for insert to authenticated
with check (
  exists (
    select 1
    from public.learning_question_versions v
    join public.learning_questions q on q.id = v.question_id
    where v.id = question_version_id
      and q.organization_id is not null
      and v.published_at is null
      and (
        public.learning_can_manage_academic_records(q.organization_id)
        or (
          v.created_by = public.learning_current_user_id()
          and q.created_by = public.learning_current_user_id()
          and public.learning_is_active_teacher(q.organization_id)
        )
      )
  )
);

-- Keep evaluation keys write-only, but restrict the RPC to the question's author
-- or an academic manager. Published versions remain immutable.
create or replace function public.save_learning_question_evaluation_key(
  p_question_version_id uuid,
  p_evaluation_key jsonb,
  p_scoring_rules jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid := (select auth.uid());
  v_actor uuid := public.learning_current_user_id();
  v_organization_id uuid;
  v_question_created_by uuid;
  v_version_created_by uuid;
  v_published_at timestamptz;
begin
  if v_auth_user_id is null or v_actor is null then
    raise exception 'Authentication is required';
  end if;

  select q.organization_id, q.created_by, qv.created_by, qv.published_at
  into v_organization_id, v_question_created_by, v_version_created_by, v_published_at
  from public.learning_question_versions qv
  join public.learning_questions q on q.id = qv.question_id
  where qv.id = p_question_version_id;

  if v_organization_id is null then
    raise exception 'Question version was not found';
  end if;

  if not (
    public.learning_can_manage_academic_records(v_organization_id)
    or (
      v_question_created_by = v_actor
      and v_version_created_by = v_actor
      and public.learning_is_active_teacher(v_organization_id)
    )
  ) then
    raise exception 'You do not have permission to edit this question';
  end if;

  if v_published_at is not null then
    raise exception 'Published question versions are immutable; create a new version';
  end if;

  if coalesce(p_scoring_rules->>'method', '') not in ('exact_option', 'manual_review') then
    raise exception 'Unsupported scoring method';
  end if;

  insert into public.learning_question_evaluation_keys (
    question_version_id, evaluation_key, scoring_rules, updated_at
  )
  values (
    p_question_version_id,
    coalesce(p_evaluation_key, '{}'::jsonb),
    coalesce(p_scoring_rules, '{}'::jsonb),
    now()
  )
  on conflict (question_version_id) do update set
    evaluation_key = excluded.evaluation_key,
    scoring_rules = excluded.scoring_rules,
    updated_at = now();
end;
$function$;

revoke all on function public.save_learning_question_evaluation_key(uuid,jsonb,jsonb)
  from public, anon;
grant execute on function public.save_learning_question_evaluation_key(uuid,jsonb,jsonb)
  to authenticated;

commit;
