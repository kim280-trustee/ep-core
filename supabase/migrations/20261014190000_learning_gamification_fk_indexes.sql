-- Add covering indexes for gamification foreign keys introduced by the leaderboard, competition, team, and goal migrations.
begin;

create index if not exists learning_class_teams_tenant_org_fk_idx
  on public.learning_class_teams(tenant_id, organization_id);
create index if not exists learning_class_teams_org_class_fk_idx
  on public.learning_class_teams(organization_id, class_group_id);
create index if not exists learning_class_teams_tenant_creator_fk_idx
  on public.learning_class_teams(tenant_id, created_by);

create index if not exists learning_class_team_members_tenant_org_fk_idx
  on public.learning_class_team_members(tenant_id, organization_id);
create index if not exists learning_class_team_members_org_class_fk_idx
  on public.learning_class_team_members(organization_id, class_group_id);
create index if not exists learning_class_team_members_tenant_student_fk_idx
  on public.learning_class_team_members(tenant_id, student_user_id);
create index if not exists learning_class_team_members_tenant_assigner_fk_idx
  on public.learning_class_team_members(tenant_id, assigned_by);

create index if not exists learning_school_competitions_tenant_org_fk_idx
  on public.learning_school_competitions(tenant_id, organization_id);
create index if not exists learning_school_competitions_tenant_creator_fk_idx
  on public.learning_school_competitions(tenant_id, created_by);

create index if not exists learning_team_challenges_tenant_org_fk_idx
  on public.learning_team_challenges(tenant_id, organization_id);
create index if not exists learning_team_challenges_org_class_fk_idx
  on public.learning_team_challenges(organization_id, class_group_id);
create index if not exists learning_team_challenges_tenant_creator_fk_idx
  on public.learning_team_challenges(tenant_id, created_by);

create index if not exists learning_student_gamification_preferences_tenant_student_fk_idx
  on public.learning_student_gamification_preferences(tenant_id, student_user_id);

comment on table public.learning_class_gamification_settings is
  'RPC-only class gamification settings. RLS is enabled and direct client privileges are intentionally revoked.';
comment on table public.learning_class_teams is
  'RPC-only class teams. RLS is enabled and direct client privileges are intentionally revoked.';
comment on table public.learning_class_team_members is
  'RPC-only team membership history. RLS is enabled and direct client privileges are intentionally revoked.';
comment on table public.learning_team_challenges is
  'RPC-only team challenges. RLS is enabled and direct client privileges are intentionally revoked.';
comment on table public.learning_school_competitions is
  'RPC-only school competitions. RLS is enabled and direct client privileges are intentionally revoked.';
comment on table public.learning_student_gamification_preferences is
  'RPC-only learner preferences. RLS is enabled and direct client privileges are intentionally revoked.';

commit;
