-- School attendance register: one register per class and school-local date.
begin;

create table public.learning_attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  attendance_date date not null,
  status text not null default 'open' check (status in ('open','submitted')),
  notes text,
  taken_by uuid not null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, class_group_id) references public.learning_class_groups(organization_id, id) on delete cascade,
  foreign key (tenant_id, taken_by) references public.users(tenant_id, id) on delete restrict,
  unique (class_group_id, attendance_date),
  unique (organization_id, id)
);

create table public.learning_attendance_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  attendance_session_id uuid not null,
  student_user_id uuid not null,
  attendance_status text not null check (attendance_status in ('present','absent','late','excused')),
  note text,
  marked_by uuid not null,
  marked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, attendance_session_id) references public.learning_attendance_sessions(organization_id, id) on delete cascade,
  foreign key (tenant_id, student_user_id) references public.users(tenant_id, id) on delete cascade,
  foreign key (tenant_id, marked_by) references public.users(tenant_id, id) on delete restrict,
  unique (attendance_session_id, student_user_id)
);

create index learning_attendance_sessions_org_date_idx
  on public.learning_attendance_sessions(organization_id, attendance_date desc);
create index learning_attendance_records_student_idx
  on public.learning_attendance_records(organization_id, student_user_id, marked_at desc);

alter table public.learning_attendance_sessions enable row level security;
alter table public.learning_attendance_records enable row level security;

revoke all on public.learning_attendance_sessions from public, anon;
revoke all on public.learning_attendance_records from public, anon;
grant select, insert, update on public.learning_attendance_sessions to authenticated;
grant select, insert, update on public.learning_attendance_records to authenticated;

-- Align with the current school-admin permission model: only active organization
-- members may access attendance for that organization. Class-level teacher-only
-- enforcement can be tightened when school role capabilities are centralized.
create policy learning_attendance_sessions_select
  on public.learning_attendance_sessions for select to authenticated
  using (public.is_organization_member(organization_id));
create policy learning_attendance_sessions_insert
  on public.learning_attendance_sessions for insert to authenticated
  with check (
    public.is_organization_member(organization_id)
    and taken_by = public.learning_current_user_id()
  );
create policy learning_attendance_sessions_update
  on public.learning_attendance_sessions for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create policy learning_attendance_records_select
  on public.learning_attendance_records for select to authenticated
  using (public.is_organization_member(organization_id));
create policy learning_attendance_records_insert
  on public.learning_attendance_records for insert to authenticated
  with check (
    public.is_organization_member(organization_id)
    and marked_by = public.learning_current_user_id()
    and exists (
      select 1 from public.learning_attendance_sessions s
      where s.id = attendance_session_id
        and s.organization_id = learning_attendance_records.organization_id
        and s.tenant_id = learning_attendance_records.tenant_id
        and s.class_group_id is not null
    )
    and exists (
      select 1 from public.learning_class_memberships cm
      where cm.user_id = student_user_id
        and cm.tenant_id = learning_attendance_records.tenant_id
        and cm.organization_id = learning_attendance_records.organization_id
        and cm.membership_type = 'student'
        and cm.status = 'active'
        and cm.class_group_id = (
          select s.class_group_id from public.learning_attendance_sessions s
          where s.id = attendance_session_id
        )
    )
  );
create policy learning_attendance_records_update
  on public.learning_attendance_records for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (
    public.is_organization_member(organization_id)
    and marked_by = public.learning_current_user_id()
    and exists (
      select 1 from public.learning_attendance_sessions s
      join public.learning_class_memberships cm
        on cm.class_group_id = s.class_group_id
       and cm.organization_id = s.organization_id
       and cm.tenant_id = s.tenant_id
       and cm.user_id = learning_attendance_records.student_user_id
       and cm.membership_type = 'student'
       and cm.status = 'active'
      where s.id = attendance_session_id
        and s.organization_id = learning_attendance_records.organization_id
        and s.tenant_id = learning_attendance_records.tenant_id
    )
  );

commit;
