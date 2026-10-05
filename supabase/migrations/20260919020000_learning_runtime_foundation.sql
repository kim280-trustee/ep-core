-- E&P Learning operational runtime: class enrollment, assignments, progress and activity tracking.

create table public.learning_class_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  user_id uuid not null,
  membership_type text not null check (membership_type in ('student','teacher')),
  status text not null default 'active' check (status in ('invited','active','suspended','inactive')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id,id) on delete cascade,
  foreign key (organization_id, class_group_id) references public.learning_class_groups(organization_id,id) on delete cascade,
  foreign key (tenant_id, user_id) references public.users(tenant_id,id) on delete cascade,
  unique (class_group_id, user_id, membership_type),
  unique (organization_id, id)
);
create index learning_class_memberships_user_idx on public.learning_class_memberships(tenant_id,user_id,status);
create index learning_class_memberships_class_idx on public.learning_class_memberships(organization_id,class_group_id,status);

create table public.learning_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_subject_id uuid,
  code text not null,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','published','closed','archived')),
  available_from timestamptz,
  due_at timestamptz,
  max_attempts integer check (max_attempts is null or max_attempts > 0),
  instructions jsonb not null default '{}'::jsonb,
  created_by uuid not null,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id,id) on delete cascade,
  foreign key (organization_id, class_subject_id) references public.learning_class_subjects(organization_id,id) on delete set null,
  foreign key (tenant_id, created_by) references public.users(tenant_id,id) on delete restrict,
  foreign key (tenant_id, updated_by) references public.users(tenant_id,id) on delete restrict,
  unique (organization_id,id),
  unique (tenant_id,id),
  unique (organization_id,code)
);
create index learning_assignments_org_status_idx on public.learning_assignments(organization_id,status,updated_at desc);
create index learning_assignments_due_idx on public.learning_assignments(organization_id,due_at);

create table public.learning_assignment_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  assignment_id uuid not null,
  item_type text not null check (item_type in ('content','assessment')),
  content_item_id uuid,
  assessment_id uuid,
  sequence_no integer not null check (sequence_no > 0),
  required boolean not null default true,
  created_at timestamptz not null default now(),
  foreign key (organization_id, assignment_id) references public.learning_assignments(organization_id,id) on delete cascade,
  foreign key (content_item_id) references public.learning_content_items(id) on delete restrict,
  foreign key (assessment_id) references public.learning_assessments(id) on delete restrict,
  unique (assignment_id,sequence_no),
  unique (assignment_id,content_item_id),
  unique (assignment_id,assessment_id),
  check (
    (item_type='content' and content_item_id is not null and assessment_id is null)
    or (item_type='assessment' and assessment_id is not null and content_item_id is null)
  )
);
create index learning_assignment_items_assignment_idx on public.learning_assignment_items(organization_id,assignment_id,sequence_no);

create table public.learning_assignment_targets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  assignment_id uuid not null,
  target_type text not null check (target_type in ('student','class')),
  student_user_id uuid,
  class_group_id uuid,
  due_at timestamptz,
  status text not null default 'active' check (status in ('active','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id,assignment_id) references public.learning_assignments(tenant_id,id) on delete cascade,
  foreign key (tenant_id,student_user_id) references public.users(tenant_id,id) on delete cascade,
  foreign key (organization_id,class_group_id) references public.learning_class_groups(organization_id,id) on delete cascade,
  foreign key (organization_id,assignment_id) references public.learning_assignments(organization_id,id) on delete cascade,
  unique (assignment_id,student_user_id),
  unique (assignment_id,class_group_id),
  unique (organization_id,id),
  check (
    (target_type='student' and student_user_id is not null and class_group_id is null)
    or (target_type='class' and class_group_id is not null and student_user_id is null)
  )
);
create index learning_assignment_targets_student_idx on public.learning_assignment_targets(organization_id,student_user_id,status);
create index learning_assignment_targets_class_idx on public.learning_assignment_targets(organization_id,class_group_id,status);

create table public.learning_assignment_progress (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  assignment_id uuid not null,
  assignment_target_id uuid not null,
  student_user_id uuid not null,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed','overdue')),
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id,assignment_id) references public.learning_assignments(organization_id,id) on delete cascade,
  foreign key (organization_id,assignment_target_id) references public.learning_assignment_targets(organization_id,id) on delete cascade,
  foreign key (organization_id,student_user_id) references public.users(tenant_id,id) on delete cascade,
  unique (assignment_target_id,student_user_id)
);
create index learning_assignment_progress_student_idx on public.learning_assignment_progress(organization_id,student_user_id,status,last_activity_at desc);
create index learning_assignment_progress_assignment_idx on public.learning_assignment_progress(assignment_id,status);

create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid,
  student_user_id uuid not null,
  context_type text not null check (context_type in ('learning','assessment','assignment','classroom','other')),
  context_id uuid,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (tenant_id,student_user_id) references public.users(tenant_id,id) on delete cascade,
  foreign key (tenant_id,organization_id) references public.organizations(tenant_id,id) on delete cascade
);
create index learning_sessions_student_idx on public.learning_sessions(student_user_id,started_at desc);
create index learning_sessions_context_idx on public.learning_sessions(organization_id,context_type,context_id);

create table public.learning_activity_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid,
  student_user_id uuid not null,
  session_id uuid,
  activity_type text not null check (activity_type in ('content_started','content_viewed','practice_started','practice_completed','assessment_started','assessment_submitted','assignment_started','assignment_completed','speaking_practice','listening_practice','writing_practice','other')),
  content_item_id uuid,
  assessment_id uuid,
  assignment_id uuid,
  objective_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  foreign key (tenant_id,student_user_id) references public.users(tenant_id,id) on delete cascade,
  foreign key (tenant_id,organization_id) references public.organizations(tenant_id,id) on delete cascade,
  foreign key (session_id) references public.learning_sessions(id) on delete set null,
  foreign key (content_item_id) references public.learning_content_items(id) on delete set null,
  foreign key (assessment_id) references public.learning_assessments(id) on delete set null,
  foreign key (assignment_id) references public.learning_assignments(id) on delete set null,
  foreign key (objective_id) references public.learning_objectives(id) on delete set null
);
create index learning_activity_events_student_idx on public.learning_activity_events(student_user_id,occurred_at desc);
create index learning_activity_events_org_idx on public.learning_activity_events(organization_id,occurred_at desc);
create index learning_activity_events_context_idx on public.learning_activity_events(assignment_id,assessment_id,content_item_id);
create index learning_activity_events_objective_idx on public.learning_activity_events(objective_id,occurred_at desc);

alter table public.learning_class_memberships enable row level security;
alter table public.learning_assignments enable row level security;
alter table public.learning_assignment_items enable row level security;
alter table public.learning_assignment_targets enable row level security;
alter table public.learning_assignment_progress enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.learning_activity_events enable row level security;

grant select,insert,update,delete on public.learning_class_memberships to authenticated;
grant select,insert,update,delete on public.learning_assignments to authenticated;
grant select,insert,update,delete on public.learning_assignment_items to authenticated;
grant select,insert,update,delete on public.learning_assignment_targets to authenticated;
grant select,insert,update on public.learning_assignment_progress to authenticated;
grant select,insert,update on public.learning_sessions to authenticated;
grant select,insert on public.learning_activity_events to authenticated;

create policy learning_class_memberships_select on public.learning_class_memberships for select to authenticated using (
  user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  or public.is_organization_member(organization_id)
);
create policy learning_class_memberships_manage on public.learning_class_memberships for all to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy learning_assignments_select on public.learning_assignments for select to authenticated using (
  public.is_organization_member(organization_id)
  or (status='published' and exists (
    select 1 from public.learning_assignment_targets t
    where t.assignment_id=learning_assignments.id and t.status='active'
      and (
        t.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
        or exists (
          select 1 from public.learning_class_memberships cm
          where cm.class_group_id=t.class_group_id
            and cm.user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
            and cm.membership_type='student' and cm.status='active'
        )
      )
  ))
);
create policy learning_assignments_manage on public.learning_assignments for all to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy learning_assignment_items_select on public.learning_assignment_items for select to authenticated using (
  exists (select 1 from public.learning_assignments a where a.id=assignment_id and (
    public.is_organization_member(a.organization_id)
    or (a.status='published' and exists (
      select 1 from public.learning_assignment_targets t
      where t.assignment_id=a.id and t.status='active'
        and (
          t.student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
          or exists (
            select 1 from public.learning_class_memberships cm
            where cm.class_group_id=t.class_group_id
              and cm.user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
              and cm.membership_type='student' and cm.status='active'
          )
        )
    ))
  ))
);
create policy learning_assignment_items_manage on public.learning_assignment_items for all to authenticated
using (exists (select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)))
with check (exists (select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)));

create policy learning_assignment_targets_select on public.learning_assignment_targets for select to authenticated using (
  exists (select 1 from public.learning_assignments a where a.id=assignment_id and (
    public.is_organization_member(a.organization_id)
    or (a.status='published' and status='active' and (
      student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
      or exists (
        select 1 from public.learning_class_memberships cm
        where cm.class_group_id=learning_assignment_targets.class_group_id
          and cm.user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
          and cm.membership_type='student' and cm.status='active'
      )
    ))
  ))
);
create policy learning_assignment_targets_manage on public.learning_assignment_targets for all to authenticated
using (exists (select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)))
with check (exists (select 1 from public.learning_assignments a where a.id=assignment_id and public.is_organization_member(a.organization_id)));

create policy learning_assignment_progress_select on public.learning_assignment_progress for select to authenticated using (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  or public.is_organization_member(organization_id)
);
create policy learning_assignment_progress_insert on public.learning_assignment_progress for insert to authenticated with check (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
);
create policy learning_assignment_progress_update on public.learning_assignment_progress for update to authenticated
using (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())))
with check (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())));

create policy learning_sessions_select on public.learning_sessions for select to authenticated using (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_sessions_insert on public.learning_sessions for insert to authenticated with check (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  and tenant_id in (select u.tenant_id from public.users u where u.auth_user_id=(select auth.uid()))
);
create policy learning_sessions_update on public.learning_sessions for update to authenticated
using (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())) and ended_at is null)
with check (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())));

create policy learning_activity_events_select on public.learning_activity_events for select to authenticated using (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_activity_events_insert on public.learning_activity_events for insert to authenticated with check (
  student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
  and tenant_id in (select u.tenant_id from public.users u where u.auth_user_id=(select auth.uid()))
);
