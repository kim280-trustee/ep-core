-- Restrict direct Learning assignment/content writes to school managers and
-- the teacher who owns the draft and is actively assigned to the relevant class.
-- This closes organization-membership-only write paths without changing read access.
begin;

create or replace function private.learning_organization_tenant_matches(
  p_organization_id uuid,
  p_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.organizations o
    where o.id = p_organization_id
      and o.tenant_id = p_tenant_id
  );
$function$;

create or replace function private.learning_assignment_target_scope_matches(
  p_assignment_id uuid,
  p_organization_id uuid,
  p_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_assignments a
    join public.organizations o
      on o.id = a.organization_id
     and o.tenant_id = a.tenant_id
    where a.id = p_assignment_id
      and a.organization_id = p_organization_id
      and a.tenant_id = p_tenant_id
  );
$function$;

create or replace function private.learning_assignment_item_scope_matches(
  p_assignment_id uuid,
  p_organization_id uuid,
  p_item_type text,
  p_content_item_id uuid,
  p_assessment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_assignments a
    where a.id = p_assignment_id
      and a.organization_id = p_organization_id
      and (
        (
          p_item_type = 'content'
          and p_content_item_id is not null
          and p_assessment_id is null
          and exists (
            select 1
            from public.learning_content_items ci
            where ci.id = p_content_item_id
              and (
                ci.organization_id = p_organization_id
                or (ci.organization_id is null and ci.status = 'published')
              )
          )
        )
        or (
          p_item_type = 'assessment'
          and p_assessment_id is not null
          and p_content_item_id is null
          and exists (
            select 1
            from public.learning_assessments assessment
            where assessment.id = p_assessment_id
              and (
                assessment.organization_id = p_organization_id
                or (assessment.organization_id is null and assessment.status = 'published')
              )
          )
        )
      )
  );
$function$;

create or replace function private.learning_can_create_assignment(
  p_organization_id uuid,
  p_class_subject_id uuid,
  p_created_by uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    p_created_by = public.learning_current_user_id()
    and (
      (
        public.learning_can_manage_academic_records(p_organization_id)
        and (
          p_class_subject_id is null
          or exists (
            select 1
            from public.learning_class_subjects cs
            where cs.id = p_class_subject_id
              and cs.organization_id = p_organization_id
              and cs.status = 'active'
          )
        )
      )
      or exists (
        select 1
        from public.learning_class_memberships cm
        join public.learning_class_groups cg
          on cg.id = cm.class_group_id
         and cg.organization_id = cm.organization_id
         and cg.status = 'active'
        join public.learning_class_subjects cs
          on cs.class_group_id = cm.class_group_id
         and cs.organization_id = cm.organization_id
         and cs.status = 'active'
        where cm.organization_id = p_organization_id
          and cm.user_id = public.learning_current_user_id()
          and cm.membership_type = 'teacher'
          and cm.status = 'active'
          and cs.id = p_class_subject_id
      )
      or (
        p_class_subject_id is null
        and exists (
          select 1
          from public.learning_class_memberships cm
          join public.learning_class_groups cg
            on cg.id = cm.class_group_id
           and cg.organization_id = cm.organization_id
           and cg.status = 'active'
          where cm.organization_id = p_organization_id
            and cm.user_id = public.learning_current_user_id()
            and cm.membership_type = 'teacher'
            and cm.status = 'active'
        )
      )
    );
$function$;

create or replace function private.learning_can_manage_assignment_fields(
  p_organization_id uuid,
  p_class_subject_id uuid,
  p_created_by uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    public.learning_can_manage_academic_records(p_organization_id)
    or (
      p_created_by = public.learning_current_user_id()
      and exists (
        select 1
        from public.learning_class_memberships cm
        join public.learning_class_groups cg
          on cg.id = cm.class_group_id
         and cg.organization_id = cm.organization_id
         and cg.status = 'active'
        where cm.organization_id = p_organization_id
          and cm.user_id = public.learning_current_user_id()
          and cm.membership_type = 'teacher'
          and cm.status = 'active'
          and (
            p_class_subject_id is null
            or exists (
              select 1
              from public.learning_class_subjects cs
              where cs.id = p_class_subject_id
                and cs.organization_id = p_organization_id
                and cs.class_group_id = cm.class_group_id
                and cs.status = 'active'
            )
          )
      )
    );
$function$;

create or replace function private.learning_can_manage_assignment(
  p_assignment_id uuid,
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_assignments a
    where a.id = p_assignment_id
      and a.organization_id = p_organization_id
      and exists (
        select 1 from public.organizations o
        where o.id = a.organization_id and o.tenant_id = a.tenant_id
      )
      and (
        public.learning_can_manage_academic_records(a.organization_id)
        or (
          a.created_by = public.learning_current_user_id()
          and exists (
            select 1
            from public.learning_class_memberships cm
            join public.learning_class_groups cg
              on cg.id = cm.class_group_id
             and cg.organization_id = cm.organization_id
             and cg.status = 'active'
            where cm.organization_id = a.organization_id
              and cm.user_id = public.learning_current_user_id()
              and cm.membership_type = 'teacher'
              and cm.status = 'active'
              and (
                a.class_subject_id is null
                or exists (
                  select 1
                  from public.learning_class_subjects cs
                  where cs.id = a.class_subject_id
                    and cs.organization_id = a.organization_id
                    and cs.class_group_id = cm.class_group_id
                    and cs.status = 'active'
                )
              )
          )
        )
      )
  );
$function$;

create or replace function private.learning_can_manage_assignment_target(
  p_assignment_id uuid,
  p_organization_id uuid,
  p_class_group_id uuid,
  p_student_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    (
      public.learning_can_manage_academic_records(p_organization_id)
      and (
        (
          p_class_group_id is not null
          and exists (
            select 1
            from public.learning_class_groups cg
            where cg.id = p_class_group_id
              and cg.organization_id = p_organization_id
              and cg.status = 'active'
          )
          and exists (
            select 1
            from public.learning_assignments a
            where a.id = p_assignment_id
              and a.organization_id = p_organization_id
              and (
                a.class_subject_id is null
                or exists (
                  select 1
                  from public.learning_class_subjects cs
                  where cs.id = a.class_subject_id
                    and cs.organization_id = p_organization_id
                    and cs.class_group_id = p_class_group_id
                    and cs.status = 'active'
                )
              )
          )
        )
        or (
          p_class_group_id is null
          and p_student_user_id is not null
        )
      )
      and (
        p_student_user_id is null
        or exists (
          select 1
          from public.learning_class_memberships student_cm
          where student_cm.organization_id = p_organization_id
            and student_cm.user_id = p_student_user_id
            and student_cm.membership_type = 'student'
            and student_cm.status = 'active'
            and (
              (p_class_group_id is not null and student_cm.class_group_id = p_class_group_id)
              or (
                p_class_group_id is null
                and exists (
                  select 1
                  from public.learning_assignments a
                  where a.id = p_assignment_id
                    and a.organization_id = p_organization_id
                    and (
                      a.class_subject_id is null
                      or exists (
                        select 1
                        from public.learning_class_subjects cs
                        where cs.id = a.class_subject_id
                          and cs.organization_id = p_organization_id
                          and cs.class_group_id = student_cm.class_group_id
                          and cs.status = 'active'
                      )
                    )
                )
              )
            )
        )
      )
      and exists (
        select 1
        from public.learning_assignments a
        where a.id = p_assignment_id
          and a.organization_id = p_organization_id
      )
    )
    or exists (
      select 1
      from public.learning_assignments a
      join public.learning_class_memberships teacher_cm
        on teacher_cm.organization_id = a.organization_id
       and teacher_cm.user_id = public.learning_current_user_id()
       and teacher_cm.membership_type = 'teacher'
       and teacher_cm.status = 'active'
      join public.learning_class_groups teacher_cg
        on teacher_cg.id = teacher_cm.class_group_id
       and teacher_cg.organization_id = teacher_cm.organization_id
       and teacher_cg.status = 'active'
      where a.id = p_assignment_id
        and a.organization_id = p_organization_id
        and a.created_by = public.learning_current_user_id()
        and (
          (
            p_class_group_id is not null
            and teacher_cm.class_group_id = p_class_group_id
          )
          or (
            p_class_group_id is null
            and p_student_user_id is not null
            and exists (
              select 1
              from public.learning_class_memberships student_cm
              where student_cm.organization_id = p_organization_id
                and student_cm.class_group_id = teacher_cm.class_group_id
                and student_cm.user_id = p_student_user_id
                and student_cm.membership_type = 'student'
                and student_cm.status = 'active'
            )
          )
        )
        and (
          p_student_user_id is null
          or exists (
            select 1
            from public.learning_class_memberships student_cm
            where student_cm.organization_id = p_organization_id
              and student_cm.class_group_id = teacher_cm.class_group_id
              and student_cm.user_id = p_student_user_id
              and student_cm.membership_type = 'student'
              and student_cm.status = 'active'
          )
        )
        and (
          a.class_subject_id is null
          or exists (
            select 1
            from public.learning_class_subjects cs
            where cs.id = a.class_subject_id
              and cs.organization_id = a.organization_id
              and cs.class_group_id = teacher_cm.class_group_id
              and cs.status = 'active'
          )
        )
    );
$function$;

create or replace function private.learning_can_author_organization_content(
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    public.learning_can_manage_academic_records(p_organization_id)
    or exists (
      select 1
      from public.learning_class_memberships cm
      join public.learning_class_groups cg
        on cg.id = cm.class_group_id
       and cg.organization_id = cm.organization_id
       and cg.status = 'active'
      where cm.organization_id = p_organization_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    );
$function$;

create or replace function private.learning_content_item_status_unchanged(
  p_content_item_id uuid,
  p_new_status text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_content_items ci
    where ci.id = p_content_item_id
      and ci.status = p_new_status
  );
$function$;

create or replace function private.learning_content_version_status_unchanged(
  p_content_version_id uuid,
  p_new_status text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_content_versions cv
    where cv.id = p_content_version_id
      and cv.status = p_new_status
  );
$function$;

create or replace function private.learning_can_manage_content_item(
  p_content_item_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.learning_content_items ci
    where ci.id = p_content_item_id
      and ci.organization_id is not null
      and (
        public.learning_can_manage_academic_records(ci.organization_id)
        or (
          ci.created_by = public.learning_current_user_id()
          and ci.status = 'draft'::text
          and private.learning_can_author_organization_content(ci.organization_id)
        )
      )
  );
$function$;

revoke all on function private.learning_organization_tenant_matches(uuid, uuid) from public, anon;
revoke all on function private.learning_assignment_target_scope_matches(uuid, uuid, uuid) from public, anon;
revoke all on function private.learning_assignment_item_scope_matches(uuid, uuid, text, uuid, uuid) from public, anon;
revoke all on function private.learning_can_create_assignment(uuid, uuid, uuid) from public, anon;
revoke all on function private.learning_can_manage_assignment_fields(uuid, uuid, uuid) from public, anon;
revoke all on function private.learning_can_manage_assignment(uuid, uuid) from public, anon;
revoke all on function private.learning_can_manage_assignment_target(uuid, uuid, uuid, uuid) from public, anon;
revoke all on function private.learning_can_author_organization_content(uuid) from public, anon;
revoke all on function private.learning_can_manage_content_item(uuid) from public, anon;
revoke all on function private.learning_content_item_status_unchanged(uuid, text) from public, anon;
revoke all on function private.learning_content_version_status_unchanged(uuid, text) from public, anon;
grant execute on function private.learning_organization_tenant_matches(uuid, uuid) to authenticated;
grant execute on function private.learning_assignment_target_scope_matches(uuid, uuid, uuid) to authenticated;
grant execute on function private.learning_assignment_item_scope_matches(uuid, uuid, text, uuid, uuid) to authenticated;
grant execute on function private.learning_can_create_assignment(uuid, uuid, uuid) to authenticated;
grant execute on function private.learning_can_manage_assignment_fields(uuid, uuid, uuid) to authenticated;
grant execute on function private.learning_can_manage_assignment(uuid, uuid) to authenticated;
grant execute on function private.learning_can_manage_assignment_target(uuid, uuid, uuid, uuid) to authenticated;
grant execute on function private.learning_can_author_organization_content(uuid) to authenticated;
grant execute on function private.learning_can_manage_content_item(uuid) to authenticated;
grant execute on function private.learning_content_item_status_unchanged(uuid, text) to authenticated;
grant execute on function private.learning_content_version_status_unchanged(uuid, text) to authenticated;

-- Lifecycle events are audit records. All legitimate writes are performed
-- by SECURITY DEFINER lifecycle RPCs; organization members must not be able
-- to forge actor/action history through direct table inserts.
drop policy if exists learning_assignment_lifecycle_insert
on public.learning_assignment_lifecycle_events;

-- Assignment rows: managers can manage school-wide; teachers can manage only
-- their own assignments for class subjects they are assigned to (or class-only
-- drafts that they subsequently target only to their own classes).
drop policy if exists learning_assignments_insert on public.learning_assignments;
drop policy if exists learning_assignments_update on public.learning_assignments;
drop policy if exists learning_assignments_delete on public.learning_assignments;

create policy learning_assignments_insert
on public.learning_assignments
for insert to authenticated
with check (
  private.learning_organization_tenant_matches(organization_id, tenant_id)
  and private.learning_can_create_assignment(organization_id, class_subject_id, created_by)
);

create policy learning_assignments_update
on public.learning_assignments
for update to authenticated
using (
  private.learning_organization_tenant_matches(organization_id, tenant_id)
  and private.learning_can_manage_assignment(id, organization_id)
)
with check (
  private.learning_organization_tenant_matches(organization_id, tenant_id)
  and private.learning_can_manage_assignment_fields(
    organization_id,
    class_subject_id,
    created_by
  )
);

create policy learning_assignments_delete
on public.learning_assignments
for delete to authenticated
using (
  private.learning_organization_tenant_matches(organization_id, tenant_id)
  and private.learning_can_manage_assignment(id, organization_id)
);

-- Assignment items inherit the parent assignment's manager/assigned-teacher
-- authorization rather than accepting any active organization member.
drop policy if exists learning_assignment_items_insert on public.learning_assignment_items;
drop policy if exists learning_assignment_items_update on public.learning_assignment_items;
drop policy if exists learning_assignment_items_delete on public.learning_assignment_items;

create policy learning_assignment_items_insert
on public.learning_assignment_items
for insert to authenticated
with check (
  private.learning_can_manage_assignment(assignment_id, organization_id)
  and private.learning_assignment_item_scope_matches(
    assignment_id, organization_id, item_type, content_item_id, assessment_id
  )
);

create policy learning_assignment_items_update
on public.learning_assignment_items
for update to authenticated
using (private.learning_can_manage_assignment(assignment_id, organization_id))
with check (
  private.learning_can_manage_assignment(assignment_id, organization_id)
  and private.learning_assignment_item_scope_matches(
    assignment_id, organization_id, item_type, content_item_id, assessment_id
  )
);

create policy learning_assignment_items_delete
on public.learning_assignment_items
for delete to authenticated
using (private.learning_can_manage_assignment(assignment_id, organization_id));

-- Assignment targets must remain inside the assignment's organization and,
-- for teachers, inside a class to which that teacher is actively assigned.
drop policy if exists learning_assignment_targets_insert on public.learning_assignment_targets;
drop policy if exists learning_assignment_targets_update on public.learning_assignment_targets;
drop policy if exists learning_assignment_targets_delete on public.learning_assignment_targets;

create policy learning_assignment_targets_insert
on public.learning_assignment_targets
for insert to authenticated
with check (
  private.learning_can_manage_assignment_target(
    assignment_id,
    organization_id,
    class_group_id,
    student_user_id
  )
  and private.learning_assignment_target_scope_matches(
    assignment_id,
    organization_id,
    tenant_id
  )
);

create policy learning_assignment_targets_update
on public.learning_assignment_targets
for update to authenticated
using (
  private.learning_can_manage_assignment_target(
    assignment_id,
    organization_id,
    class_group_id,
    student_user_id
  )
  and private.learning_assignment_target_scope_matches(
    assignment_id,
    organization_id,
    tenant_id
  )
)
with check (
  private.learning_can_manage_assignment_target(
    assignment_id,
    organization_id,
    class_group_id,
    student_user_id
  )
  and private.learning_assignment_target_scope_matches(
    assignment_id,
    organization_id,
    tenant_id
  )
);

create policy learning_assignment_targets_delete
on public.learning_assignment_targets
for delete to authenticated
using (
  private.learning_can_manage_assignment_target(
    assignment_id,
    organization_id,
    class_group_id,
    student_user_id
  )
  and private.learning_assignment_target_scope_matches(
    assignment_id,
    organization_id,
    tenant_id
  )
);

-- Shared content can be authored by an active class-assigned teacher, but
-- teachers can modify only content they created. School managers retain
-- organization-wide control. Published-content read policies are unchanged.
drop policy if exists learning_content_items_insert on public.learning_content_items;
drop policy if exists learning_content_items_update on public.learning_content_items;
drop policy if exists learning_content_items_delete on public.learning_content_items;

create policy learning_content_items_insert
on public.learning_content_items
for insert to authenticated
with check (
  organization_id is not null
  and created_by = public.learning_current_user_id()
  and private.learning_can_author_organization_content(organization_id)
);

create policy learning_content_items_update
on public.learning_content_items
for update to authenticated
using (private.learning_can_manage_content_item(id))
with check (
  organization_id is not null
  and private.learning_content_item_status_unchanged(id, status)
  and (
    public.learning_can_manage_academic_records(organization_id)
    or (
      created_by = public.learning_current_user_id()
      and status = 'draft'
      and private.learning_can_author_organization_content(organization_id)
    )
  )
);

create policy learning_content_items_delete
on public.learning_content_items
for delete to authenticated
using (private.learning_can_manage_content_item(id));

drop policy if exists learning_content_objectives_insert on public.learning_content_objectives;
drop policy if exists learning_content_objectives_update on public.learning_content_objectives;
drop policy if exists learning_content_objectives_delete on public.learning_content_objectives;

create policy learning_content_objectives_insert
on public.learning_content_objectives
for insert to authenticated
with check (private.learning_can_manage_content_item(content_item_id));

create policy learning_content_objectives_update
on public.learning_content_objectives
for update to authenticated
using (private.learning_can_manage_content_item(content_item_id))
with check (private.learning_can_manage_content_item(content_item_id));

create policy learning_content_objectives_delete
on public.learning_content_objectives
for delete to authenticated
using (private.learning_can_manage_content_item(content_item_id));

drop policy if exists learning_content_versions_insert on public.learning_content_versions;
drop policy if exists learning_content_versions_update on public.learning_content_versions;
drop policy if exists learning_content_versions_delete on public.learning_content_versions;

create policy learning_content_versions_insert
on public.learning_content_versions
for insert to authenticated
with check (
  created_by = public.learning_current_user_id()
  and private.learning_can_manage_content_item(content_item_id)
);

create policy learning_content_versions_update
on public.learning_content_versions
for update to authenticated
using (
  status = any (array['draft'::text, 'review'::text])
  and private.learning_can_manage_content_item(content_item_id)
)
with check (
  status = any (array['draft'::text, 'review'::text, 'published'::text])
  and (
    status <> 'published'
    or exists (
      select 1
      from public.learning_content_items ci
      where ci.id = content_item_id
        and public.learning_can_manage_academic_records(ci.organization_id)
    )
  )
  and private.learning_can_manage_content_item(content_item_id)
  and private.learning_content_version_status_unchanged(id, status)
);

create policy learning_content_versions_delete
on public.learning_content_versions
for delete to authenticated
using (
  status = any (array['draft'::text, 'review'::text])
  and private.learning_can_manage_content_item(content_item_id)
);

commit;
