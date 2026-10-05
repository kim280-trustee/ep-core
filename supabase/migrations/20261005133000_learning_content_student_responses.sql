-- Student responses for interactive learning content, beginning with writing activities.
create table if not exists public.learning_content_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assignment_id uuid not null references public.learning_assignments(id) on delete cascade,
  content_item_id uuid not null references public.learning_content_items(id) on delete cascade,
  content_version_id uuid references public.learning_content_versions(id) on delete set null,
  student_user_id uuid not null references public.users(id) on delete cascade,
  response_text text not null default '',
  status text not null default 'draft' check (status in ('draft','submitted')),
  score numeric check (score is null or score >= 0),
  max_score numeric check (max_score is null or max_score > 0),
  teacher_feedback text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, content_item_id, student_user_id)
);

alter table public.learning_content_responses enable row level security;

grant select, insert, update on public.learning_content_responses to authenticated;

create or replace function private.learning_student_has_assignment_target(
  p_assignment_id uuid,
  p_student_user_id uuid
) returns boolean
language sql stable security definer
set search_path=public,private
as $$
  select exists (
    select 1 from public.learning_assignment_targets t
    where t.assignment_id=p_assignment_id and t.status='active'
      and (
        t.student_user_id=p_student_user_id
        or (
          t.class_group_id is not null
          and exists (
            select 1 from public.learning_class_memberships cm
            where cm.class_group_id=t.class_group_id
              and cm.user_id=p_student_user_id
              and cm.membership_type='student'
              and cm.status='active'
          )
        )
      )
  );
$$;

revoke all on function private.learning_student_has_assignment_target(uuid,uuid) from public;

drop policy if exists learning_content_responses_student_select on public.learning_content_responses;
create policy learning_content_responses_student_select
on public.learning_content_responses for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or student_user_id in (select private.learning_parent_student_ids())
  or public.is_organization_member(organization_id)
);

drop policy if exists learning_content_responses_student_insert on public.learning_content_responses;
create policy learning_content_responses_student_insert
on public.learning_content_responses for insert to authenticated
with check (
  student_user_id = public.learning_current_user_id()
  and private.learning_student_has_assignment_target(assignment_id,student_user_id)
);

drop policy if exists learning_content_responses_student_update on public.learning_content_responses;
create policy learning_content_responses_student_update
on public.learning_content_responses for update to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or public.is_organization_member(organization_id)
)
with check (
  student_user_id = public.learning_current_user_id()
  or public.is_organization_member(organization_id)
);

create index if not exists idx_learning_content_responses_student
  on public.learning_content_responses(student_user_id,assignment_id);
create index if not exists idx_learning_content_responses_content
  on public.learning_content_responses(content_item_id,status);
