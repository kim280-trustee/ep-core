begin;

create table public.learning_timetable_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  subject_id uuid not null,
  teacher_user_id uuid,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  starts_at time not null,
  ends_at time not null,
  room text,
  notes text,
  status text not null default 'active' check (status in ('active','cancelled')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_timetable_time_order check (ends_at > starts_at),
  constraint learning_timetable_org_class_fk
    foreign key (organization_id, class_group_id)
    references public.learning_class_groups(organization_id, id) on delete cascade,
  constraint learning_timetable_org_fk
    foreign key (tenant_id, organization_id)
    references public.organizations(tenant_id, id) on delete cascade,
  constraint learning_timetable_teacher_fk
    foreign key (tenant_id, teacher_user_id)
    references public.users(tenant_id, id) on delete set null,
  constraint learning_timetable_creator_fk
    foreign key (tenant_id, created_by)
    references public.users(tenant_id, id) on delete restrict
);

create index learning_timetable_org_day_idx
  on public.learning_timetable_entries(organization_id, day_of_week, starts_at);
create index learning_timetable_class_day_idx
  on public.learning_timetable_entries(class_group_id, day_of_week, starts_at);
create index learning_timetable_teacher_day_idx
  on public.learning_timetable_entries(teacher_user_id, day_of_week, starts_at)
  where teacher_user_id is not null;

alter table public.learning_timetable_entries enable row level security;
revoke all on public.learning_timetable_entries from public, anon;
grant select, insert, update, delete on public.learning_timetable_entries to authenticated;

create policy learning_timetable_select
  on public.learning_timetable_entries for select to authenticated
  using (public.is_organization_member(organization_id));
create policy learning_timetable_insert
  on public.learning_timetable_entries for insert to authenticated
  with check (
    public.is_organization_member(organization_id)
    and created_by = public.learning_current_user_id()
  );
create policy learning_timetable_update
  on public.learning_timetable_entries for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));
create policy learning_timetable_delete
  on public.learning_timetable_entries for delete to authenticated
  using (public.is_organization_member(organization_id));

commit;
