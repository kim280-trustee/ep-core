-- E&P Learning mastery and recommendation foundation

create table if not exists public.learning_student_mastery (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid,
  student_user_id uuid not null,
  objective_id uuid not null references public.learning_objectives(id) on delete cascade,
  mastery_score numeric(6,3) not null default 0 check (mastery_score >= 0 and mastery_score <= 100),
  confidence_score numeric(6,3) not null default 0 check (confidence_score >= 0 and confidence_score <= 100),
  state text not null default 'not_started' check (state in ('not_started','developing','proficient','mastered','needs_review')),
  attempts_count integer not null default 0 check (attempts_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0 and correct_count <= attempts_count),
  last_assessed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(tenant_id, student_user_id) references public.users(tenant_id,id) on delete cascade,
  foreign key(tenant_id, organization_id) references public.organizations(tenant_id,id) on delete cascade
);

create unique index if not exists learning_student_mastery_scope_uidx
on public.learning_student_mastery(student_user_id, objective_id, coalesce(organization_id,'00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists learning_student_mastery_student_idx on public.learning_student_mastery(tenant_id,student_user_id);
create index if not exists learning_student_mastery_objective_idx on public.learning_student_mastery(objective_id);
create index if not exists learning_student_mastery_review_idx on public.learning_student_mastery(student_user_id,next_review_at);

create table if not exists public.learning_mastery_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid,
  student_user_id uuid not null,
  objective_id uuid not null references public.learning_objectives(id) on delete cascade,
  attempt_id uuid references public.learning_attempts(id) on delete set null,
  previous_score numeric(6,3),
  new_score numeric(6,3) not null check (new_score >= 0 and new_score <= 100),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key(tenant_id,student_user_id) references public.users(tenant_id,id) on delete cascade,
  foreign key(tenant_id,organization_id) references public.organizations(tenant_id,id) on delete cascade
);
create index if not exists learning_mastery_events_student_idx on public.learning_mastery_events(student_user_id,created_at desc);
create index if not exists learning_mastery_events_objective_idx on public.learning_mastery_events(objective_id,created_at desc);
create index if not exists learning_mastery_events_attempt_idx on public.learning_mastery_events(attempt_id);

create table if not exists public.learning_recommendations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid,
  student_user_id uuid not null,
  recommendation_type text not null check (recommendation_type in ('learn','practice','review','retest','assessment','intervention')),
  objective_id uuid references public.learning_objectives(id) on delete set null,
  content_item_id uuid references public.learning_content_items(id) on delete set null,
  assessment_id uuid references public.learning_assessments(id) on delete set null,
  priority integer not null default 50 check (priority between 1 and 100),
  reason jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','completed','dismissed','expired')),
  generated_at timestamptz not null default now(),
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(tenant_id,student_user_id) references public.users(tenant_id,id) on delete cascade,
  foreign key(tenant_id,organization_id) references public.organizations(tenant_id,id) on delete cascade
);
create index if not exists learning_recommendations_student_status_idx on public.learning_recommendations(student_user_id,status,priority desc);
create index if not exists learning_recommendations_objective_idx on public.learning_recommendations(objective_id);
create index if not exists learning_recommendations_expires_idx on public.learning_recommendations(expires_at);

alter table public.learning_student_mastery enable row level security;
alter table public.learning_mastery_events enable row level security;
alter table public.learning_recommendations enable row level security;

grant select, insert, update on public.learning_student_mastery, public.learning_mastery_events, public.learning_recommendations to authenticated;

create policy learning_student_mastery_read on public.learning_student_mastery for select to authenticated using (
 student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
 or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_student_mastery_insert on public.learning_student_mastery for insert to authenticated with check (
 student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
 and tenant_id in (select u.tenant_id from public.users u where u.auth_user_id=(select auth.uid()))
);
create policy learning_student_mastery_update on public.learning_student_mastery for update to authenticated
 using (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())))
 with check (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())));

create policy learning_mastery_events_read on public.learning_mastery_events for select to authenticated using (
 student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
 or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_recommendations_read on public.learning_recommendations for select to authenticated using (
 student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid()))
 or (organization_id is not null and public.is_organization_member(organization_id))
);
create policy learning_recommendations_update on public.learning_recommendations for update to authenticated
 using (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())))
 with check (student_user_id in (select u.id from public.users u where u.auth_user_id=(select auth.uid())));