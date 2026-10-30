# E&P Learning — Security Release Gate and Migration Reconciliation

Date: 2026-10-30
Repository: `kim280-trustee/ep-core`
Branch: `paul/integrate-edna-content`
Production Supabase project: `ep-core` (`zcutsqbzvydyosfgrbdi`)
Database: PostgreSQL 17.6.1

## Executive decision

**Production deployment remains blocked.** The source authorization fix has been corrected and committed, and the live catalog audit is substantially complete. However, the five new security migrations have not been applied, the source-to-ledger reconciliation has unresolved aliases, and no staging role-matrix test has been run.

No production DDL, data, grants, policies, function definitions, migration history, or Auth settings were changed during this work.

## 1. Organization-scoped academic authorization — source fix committed

The live helper `public.learning_can_manage_academic_records(uuid)` is currently too permissive. Its live body checks active organization membership and excludes active students, but does not check the role assigned to that organization membership.

The role-permission catalogue confirms:
- OWNER has `learning.academic.manage`.
- MANAGER has `learning.academic.manage`.
- STAFF does not have `learning.academic.manage`.

The live `organization_memberships` table has `role_id`. The helper must evaluate that organization's role, not tenant-wide `user_roles`.

### Source correction

File: `supabase/migrations/20261030130000_harden_learning_academic_record_permission.sql`

The migration now:
- checks the caller using `auth.uid()`;
- joins the caller's active membership to the active target organization;
- resolves the role through `organization_memberships.role_id`;
- requires `learning.academic.manage`;
- preserves the existing active-student exclusion;
- runs as `SECURITY DEFINER` with an empty search path and fully qualified relations;
- revokes EXECUTE from PUBLIC and anon, and grants it only to authenticated.

**Important second-order correction:** authenticated has no SELECT privilege on `public.role_permissions`. The first draft of migration 1300 used invoker rights and would fail when it attempted to read that table. The source file was corrected to retain carefully constrained definer rights and an explicit ACL.

Source commit: `113eb5c5b1138d657469308a8742fd350bfa76e1`.

This is source-verified, not yet runtime-tested. Production still has the old helper.

## 2. Dependent privileged RPCs

A live catalog scan found 19 authenticated-callable public SECURITY DEFINER RPCs that call `learning_can_manage_academic_records`:

- `calculate_learning_term_grade`
- `close_learning_assignment`
- `create_learning_gradebook_bulk_entries`
- `create_learning_manual_gradebook_entry`
- `create_learning_parent_invitation`
- `create_learning_student_invitation`
- `delete_learning_manual_gradebook_entry`
- `finalize_learning_term_grade`
- `get_learning_school_attendance_report`
- `grade_learning_content_response`
- `override_learning_term_grade`
- `reassign_learning_assignment`
- `reopen_learning_assignment`
- `reopen_learning_term_grade`
- `revoke_learning_student_invitation`
- `set_learning_gradebook_entry_included`
- `transition_learning_content_status`
- `transition_learning_content_version_status`
- `update_learning_manual_gradebook_entry`

The two RPCs with no obvious direct `auth.uid()` or identity-helper reference (`get_learning_school_attendance_report` and `revoke_learning_student_invitation`) delegate to the academic-management helper. The other callers use direct identity checks or application identity helpers. The reviewed caller definitions use empty search paths.

The pending source migrations also update related administrative functions while preserving intended teacher/class-membership branches:
- `20261030140000`: 11 calendar, intervention and attendance functions.
- `20261030150000`: 9 competition, staff, vocabulary analytics and marketplace functions.
- `20261030160000`: 3 school-announcement functions.
- `20261030170000`: 29 RLS policy alterations across nine Learning tables.

The 29-policy migration must not be deployed without the corrected helper and the dependent RPC updates.

## 3. Broader privileged-function inventory

Live catalog snapshot:
- `public`: 117 SECURITY DEFINER functions; 105 executable by authenticated.
- `private`: 30 SECURITY DEFINER functions; 9 executable by authenticated.
- No reviewed public/private SECURITY DEFINER function is executable by anon or PUBLIC.
- Authenticated and anon have no CREATE privilege on public or private; authenticated has USAGE but not CREATE on private.

Exclusive static classification of the 105 authenticated-callable public definer functions:
- 79 contain a direct `auth.uid()` reference.
- 24 delegate identity/permission checks to application helpers.
- 2 have no obvious direct identity/helper check; both were inspected and delegate to `learning_can_manage_academic_records`.

This is a structured first-pass inventory, not a claim that every function's business authorization has been fully penetration-tested.

### Remaining search-path hardening queue

Four private authenticated-callable definer helpers currently use non-empty paths:
- `private.learning_assignment_target_assignment_matches_org`
- `private.learning_assignment_visible`
- `private.learning_content_visible`
- `private.learning_student_has_assignment_target`

Four shared public definer helpers also use non-empty paths:
- `public.get_current_user_permissions`
- `public.get_current_user_tenant_id`
- `public.has_permission`
- `public.is_organization_member`

The source migration 1500 replaces `public.learning_school_admin_can_view_user` with an organization-scoped implementation and empty search path, but that source migration is not yet deployed.

The inspected helper bodies use schema-qualified relation references, and authenticated/anon cannot CREATE in these schemas, reducing immediate object-shadowing risk. A follow-up migration should still move the eight remaining helpers to empty search paths after source-level dependency review and regression tests. Do not rewrite historical migrations.

## 4. Tables reported by the security advisor with RLS but no policies

All 19 tables were checked for direct grants. None grants SELECT/INSERT/UPDATE/DELETE to authenticated, and none grants SELECT/INSERT to anon:

- `learning_ai_generation_usage`
- `learning_class_gamification_settings`
- `learning_class_team_members`
- `learning_class_teams`
- `learning_intervention_cases`
- `learning_marketplace_booking_requests`
- `learning_marketplace_offerings`
- `learning_marketplace_safety_reports`
- `learning_marketplace_teacher_availability`
- `learning_marketplace_teacher_profiles`
- `learning_notification_preferences`
- `learning_notifications`
- `learning_school_announcement_reads`
- `learning_school_announcements`
- `learning_school_calendar_events`
- `learning_school_competitions`
- `learning_student_ai_coach_usage`
- `learning_student_gamification_preferences`
- `learning_team_challenges`

Current classification: internal/RPC-only by grants and RLS configuration. No permissive policies should be added to these tables merely to remove advisor notices. Confirm each table's intended access contract with its owning RPC before changing grants.

## 5. Migration-history reconciliation

Read-only comparison of the integration branch migration directory and live `supabase_migrations.schema_migrations` ledger:

- Source migration files: 183.
- Live ledger entries: 193.
- 110 source files have an exact version-prefix match in the live ledger.
- 174 source files map to a live ledger name after normalizing version prefixes and the `_reconciled` suffix.
- 186 live ledger entries map to a source migration name; repeated ledger names exist because multiple reconciliation versions were recorded.
- 21 migration-name groups have multiple ledger versions.
- 9 source files have no normalized-name match in the live ledger.
- 7 live ledger entries have no normalized-name match to a source file.

The 9 source files without a normalized-name ledger match are:

1. `20261002090000_prepare_learning_pilot_student_flow.sql`
2. `20261004100000_fix_learning_assignment_targets_select_rls_recursion.sql`
3. `20261013062000_grant_learning_assignment_target_helper.sql`
4. `20261016180000_harden_parent_link_access.sql`
5. `20261030130000_harden_learning_academic_record_permission.sql`
6. `20261030140000_scope_learning_admin_permissions_to_organization.sql`
7. `20261030150000_scope_learning_competition_staff_marketplace_permissions.sql`
8. `20261030160000_scope_learning_announcement_permissions.sql`
9. `20261030170000_scope_learning_rls_admin_permissions.sql`

Effect-level checks show the first four are already reflected in live state:
- Pilot assignment ENG-M1-002 is draft and EN-M1-SELF-INTRO-A1 has max_attempts=3, matching the pilot preparation migration.
- The live assignment-target SELECT policy no longer calls the recursive assignment-visibility helper.
- The assignment-target helper grant is authenticated-only; anon and PUBLIC do not have EXECUTE.
- The parent-link SELECT/INSERT/UPDATE policies match the organization-manager and linked-parent checks in the source migration.

These four still need a documented mapping to the ledger entry or reconciliation migration that established the live effect. Do not replay them blindly or fabricate migration-history rows.

The five source-only security migrations dated 2026-10-30 (1300–1700) are genuinely absent from the live ledger and must be applied and tested in staging before production.

The seven live-only ledger names without a matching source filename are:
- `20261002023648 learning_teacher_student_user_rls_safe`
- `20261013064537 fix_class_assignment_grading_target`
- `20261026044618 learning_content_response_integrity_hardening`
- `20261026044623 learning_timetable_access_hardening`
- `20261026044629 learning_attendance_submission_identity_hardening`
- `20261026044659 teacher_student_user_rls_recursion_fix`
- `20261026044701 assignment_targets_select_rls_recursion_fix`

Several appear to be consolidated/reconciled equivalents of older source migrations, but the exact source-to-ledger mapping is not yet proven. Recover or identify the canonical SQL for each and compare object definitions before any history repair. Never insert ledger rows merely to make counts line up, and never delete historical ledger entries to hide drift.

Latest live ledger version: `20261026044704`.

## 6. Staging role-matrix test plan

No dedicated staging project exists. No authorization matrix has been run. The required staging tests must use two organizations and cover:

| Actor | Organization A | Organization B | Expected manager helper |
|---|---|---|---|
| Owner | OWNER | no membership | true in A; false in B |
| Manager | no membership | MANAGER | false in A; true in B |
| Staff | STAFF | STAFF | false in both |
| Teacher | teacher class membership only | teacher class membership only | false for manager-only helper; teacher-specific class actions remain allowed |
| Student | active student membership | active student membership | false |
| Parent | linked parent only | linked parent only | false; only linked child data remains visible |

Also test:
- An actor who is OWNER in A but STAFF in B cannot manage B.
- An actor cannot read or mutate rows belonging to a second organization by changing an organization ID.
- Each of the 29 RLS policy branches behaves as intended for OWNER, MANAGER, STAFF, teacher, student and parent.
- The 19 dependent RPCs reject STAFF/student/parent and cross-organization attempts where manager authorization is required.
- Teacher attendance/intervention/class-scoped branches still work after the admin predicate changes.
- UPDATE operations enforce both USING and WITH CHECK behavior.
- anon cannot execute the helper or privileged RPCs.
- authenticated can execute only the intended functions.

A Supabase development branch can provide an isolated staging database, but branch creation requires a cost estimate and explicit user approval because it can incur hourly charges. No branch was created.

## 7. Leaked-password protection

The Supabase security advisor reports leaked-password protection disabled. The setting was not changed.

Supabase documentation states that leaked-password protection uses the HaveIBeenPwned Pwned Passwords API and is available on the Pro plan and above:
https://supabase.com/docs/guides/auth/password-security

A project administrator must enable it under the project's Authentication/Auth settings and verify the setting is active. If the project is below Pro, the feature requires an eligible plan. This cannot be completed through the available project/database tools in this session.

## 8. Production release gate

Production deployment remains blocked until all of the following are complete:

1. Create/approve an isolated staging branch or project.
2. Reconcile the seven ledger-only entries and map the four effect-verified source-only migrations.
3. Apply the five security migrations to staging in order: 1300 → 1400 → 1500 → 1600 → 1700.
4. Verify the helper's role behavior, ACL and search path in staging.
5. Pass the two-organization role matrix and the 29-policy/19-RPC regression tests.
6. Complete the remaining eight-helper search-path review and decide whether to include a follow-up migration.
7. Enable and verify leaked-password protection with an administrator.
8. Re-run Supabase security and performance advisors after staging changes, then obtain production deployment approval.

## Work completed in this continuation

- Read-only live catalog and grants inventory completed.
- 19 helper-dependent privileged RPCs identified.
- The two RPCs without direct identity checks inspected; both delegate to the academic authorization helper.
- The 19 no-policy tables classified by grants as not directly API-accessible to anon/authenticated.
- Source migration 1300 corrected to preserve definer rights and an authenticated-only ACL.
- Existing audit addendum corrected to distinguish live defect from source fix.
- No production or staging database changes made.

## Additional search-path hardening — 2026-10-30 continuation

A further read-only catalog inspection identified eight authenticated-callable SECURITY DEFINER helpers whose configured search paths were not empty:

- Private: `learning_assignment_target_assignment_matches_org`, `learning_assignment_visible`, `learning_content_visible`, `learning_student_has_assignment_target`.
- Public: `get_current_user_permissions`, `get_current_user_tenant_id`, `has_permission`, `is_organization_member`.

A source-only follow-up migration was added:

- `supabase/migrations/20261030180000_harden_learning_definer_search_paths.sql`
- Commit: `bbd5a7344b2670287bbfe757c020e4c71e81a581`
- Recreates all eight functions with `SET search_path = ''` and schema-qualified relation/function references.
- Uses `CREATE OR REPLACE`, preserving existing function ownership and ACLs; no grants were broadened.
- Live catalog confirms all eight currently remain on their previous non-empty paths, callable by authenticated and not callable by anon. This migration has **not** been applied to production.

The pending source security migration sequence is now 1300, 1400, 1500, 1600, 1700, then 1800. The six migrations remain staging-only until the migration-history and authorization gates are cleared.
