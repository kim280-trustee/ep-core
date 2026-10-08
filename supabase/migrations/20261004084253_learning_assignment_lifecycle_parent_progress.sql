create schema if not exists private;

alter table public.learning_assignments
  add column if not exists parent_assignment_id uuid references public.learning_assignments(id) on delete set null,
  add column if not exists lifecycle_type text not null default 'original';

alter table public.learning_assignments
  drop constraint if exists learning_assignments_lifecycle_type_check;

alter table public.learning_assignments
  add constraint learning_assignments_lifecycle_type_check
  check (lifecycle_type in ('original','reassigned','reopened'));

create index if not exists learning_assignments_parent_assignment_idx
  on public.learning_assignments(parent_assignment_id);

create table if not exists public.learning_parent_student_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  parent_user_id uuid not null references public.users(id) on delete cascade,
  student_user_id uuid not null references public.users(id) on delete cascade,
  relationship text not null default 'parent',
  status text not null default 'active' check (status in ('active','inactive')),
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id,parent_user_id,student_user_id)
);

create index if not exists learning_parent_student_links_parent_idx
  on public.learning_parent_student_links(parent_user_id,status);

create index if not exists learning_parent_student_links_student_idx
  on public.learning_parent_student_links(student_user_id,status);

alter table public.learning_parent_student_links enable row level security;

revoke all on public.learning_parent_student_links from anon;
grant select on public.learning_parent_student_links to authenticated;
grant insert,update,delete on public.learning_parent_student_links to authenticated;

create or replace function private.learning_parent_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select l.student_user_id
  from public.learning_parent_student_links l
  join public.users p on p.id = l.parent_user_id
  where p.auth_user_id = (select auth.uid())
    and l.status = 'active'
$$;

revoke execute on function private.learning_parent_student_ids() from public;
revoke execute on function private.learning_parent_student_ids() from anon;
grant execute on function private.learning_parent_student_ids() to authenticated;

drop policy if exists learning_parent_links_select on public.learning_parent_student_links;
create policy learning_parent_links_select
on public.learning_parent_student_links
for select
to authenticated
using (
  parent_user_id = (select id from public.users where auth_user_id = (select auth.uid()) limit 1)
  or is_organization_member(organization_id)
);

drop policy if exists learning_parent_links_manage on public.learning_parent_student_links;
create policy learning_parent_links_manage
on public.learning_parent_student_links
for all
to authenticated
using (learning_can_manage_academic_records(organization_id))
with check (
  learning_can_manage_academic_records(organization_id)
  and exists (
    select 1 from public.users p
    where p.id = parent_user_id
      and p.tenant_id = (select o.tenant_id from public.organizations o where o.id = organization_id)
  )
  and exists (
    select 1 from public.users s
    where s.id = student_user_id
      and s.tenant_id = (select o.tenant_id from public.organizations o where o.id = organization_id)
  )
);

drop policy if exists learning_parent_student_user_view on public.users;
create policy learning_parent_student_user_view
on public.users
for select
to authenticated
using (id in (select private.learning_parent_student_ids()));

drop policy if exists learning_parent_assignments_view on public.learning_assignments;
create policy learning_parent_assignments_view
on public.learning_assignments
for select
to authenticated
using (
  exists (
    select 1
    from public.learning_assignment_targets t
    where t.assignment_id = learning_assignments.id
      and t.status = 'active'
      and (
        t.student_user_id in (select private.learning_parent_student_ids())
        or (
          t.class_group_id is not null
          and exists (
            select 1 from public.learning_class_memberships cm
            where cm.class_group_id = t.class_group_id
              and cm.membership_type = 'student'
              and cm.status = 'active'
              and cm.user_id in (select private.learning_parent_student_ids())
          )
        )
      )
  )
);

drop policy if exists learning_parent_assignment_targets_view on public.learning_assignment_targets;
create policy learning_parent_assignment_targets_view
on public.learning_assignment_targets
for select
to authenticated
using (
  student_user_id in (select private.learning_parent_student_ids())
  or (
    class_group_id is not null
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.class_group_id = learning_assignment_targets.class_group_id
        and cm.membership_type = 'student'
        and cm.status = 'active'
        and cm.user_id in (select private.learning_parent_student_ids())
    )
  )
);

drop policy if exists learning_parent_assignment_progress_view on public.learning_assignment_progress;
create policy learning_parent_assignment_progress_view
on public.learning_assignment_progress
for select
to authenticated
using (student_user_id in (select private.learning_parent_student_ids()));

drop policy if exists learning_parent_gradebook_view on public.learning_gradebook_entries;
create policy learning_parent_gradebook_view
on public.learning_gradebook_entries
for select
to authenticated
using (student_user_id in (select private.learning_parent_student_ids()));

drop policy if exists learning_parent_term_grade_view on public.learning_term_grades;
create policy learning_parent_term_grade_view
on public.learning_term_grades
for select
to authenticated
using (student_user_id in (select private.learning_parent_student_ids()));

drop policy if exists learning_parent_mastery_view on public.learning_student_mastery;
create policy learning_parent_mastery_view
on public.learning_student_mastery
for select
to authenticated
using (student_user_id in (select private.learning_parent_student_ids()));

drop policy if exists learning_parent_mastery_events_view on public.learning_mastery_events;
create policy learning_parent_mastery_events_view
on public.learning_mastery_events
for select
to authenticated
using (student_user_id in (select private.learning_parent_student_ids()));

drop policy if exists learning_parent_recommendations_view on public.learning_recommendations;
create policy learning_parent_recommendations_view
on public.learning_recommendations
for select
to authenticated
using (student_user_id in (select private.learning_parent_student_ids()));

drop policy if exists learning_parent_activity_view on public.learning_activity_events;
create policy learning_parent_activity_view
on public.learning_activity_events
for select
to authenticated
using (student_user_id in (select private.learning_parent_student_ids()));

drop policy if exists learning_parent_class_subject_view on public.learning_class_subjects;
create policy learning_parent_class_subject_view
on public.learning_class_subjects
for select
to authenticated
using (
  exists (
    select 1
    from public.learning_class_memberships cm
    where cm.class_group_id = learning_class_subjects.class_group_id
      and cm.membership_type = 'student'
      and cm.status = 'active'
      and cm.user_id in (select private.learning_parent_student_ids())
  )
);

drop policy if exists learning_parent_terms_view on public.learning_terms;
create policy learning_parent_terms_view
on public.learning_terms
for select
to authenticated
using (
  exists (
    select 1
    from public.learning_term_grades tg
    where tg.term_id = learning_terms.id
      and tg.student_user_id in (select private.learning_parent_student_ids())
  )
);
