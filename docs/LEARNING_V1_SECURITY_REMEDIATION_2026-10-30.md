# Learning V1 security remediation — 30 October 2026

## Current verified production snapshot

Project: `zcutsqbzvydyosfgrbdi`
Canonical code branch: `paul/integrate-edna-content`

The Supabase Security Advisor snapshot at 2026-10-30 00:45 UTC reports:
- 19 RLS-enabled tables with no policies. These must be classified as RPC-only or direct-client tables; do not add blanket policies.
- Authenticated execution is granted to numerous SECURITY DEFINER RPCs. This is not automatically a vulnerability, but each callable function must prove caller identity, tenant/organization scope, and the correct teacher/manager/parent/student role in its body.
- Leaked-password protection is disabled.
- The advisor flags privileged RPC exposure including assignment reassignment/reopening, grade reopening, AI usage reservation, marketplace booking/profile/report review, staff membership changes, content status transitions, and manual gradebook updates.

The existing integration readiness audit (PR #148) records a particularly important defect: 19 privileged functions and 25 RLS policies depend on a helper that accepts active non-student organization membership without independently requiring academic-management permission. Direct DML grants make some policies reachable through the API. Treat assignment, shared-content, gradebook and parent-link writes as high-priority review areas.

## Work committed with this audit

`supabase/audits/20261030_learning_security_inventory.sql` is a read-only catalog inventory. It reports exposed SECURITY DEFINER function bodies and grants, policy predicates, RLS tables without policies, exposed views, and migration history. It makes no production changes.

## Required remediation rules

1. Preserve the platform authorization model: OWNER/MANAGER/STAFF remain organization roles; teacher/student access remains class-membership based.
2. Every privileged write must derive the actor from `auth.uid()`, resolve the E&P profile, verify active tenant and organization membership, then check the required role and/or assigned class membership. Never trust caller-supplied user or tenant IDs as proof of identity.
3. A manager-only operation must require an active OWNER or MANAGER membership in the target organization plus the required permission. A teacher operation must require active teacher membership in the exact target class. Parent operations must prove the active parent-child link. Student operations must prove the authenticated student membership.
4. For each direct-DML policy, test both `USING` and `WITH CHECK`; UPDATE also needs an appropriate SELECT policy. Review permissive policies as OR combinations.
5. Keep RPC-only tables without direct policies only when authenticated/anon table privileges are revoked and every intended RPC is individually authorized. Do not silence the advisor by granting table access.
6. Keep SECURITY DEFINER only where required. Set an empty/explicit safe search_path, fully qualify objects, validate auth.uid(), and revoke PUBLIC/anon execution where not intended. Do not mass-revoke authenticated RPCs without mapping client call sites.
7. Use `security_invoker=true` for views where caller RLS must apply (PostgreSQL 15+), or explicitly restrict access and document why owner semantics are required.
8. Add SQL tests for OWNER, MANAGER, STAFF, assigned teacher, unassigned teacher, linked parent, unrelated parent, student, and anonymous callers. Include cross-tenant and cross-organization IDs.
9. Reconcile migration history by comparing exact SQL and catalog state. Never delete/insert migration history rows or apply a bulk migration push to make version counts match.
10. Enable leaked-password protection after confirming the project's Auth configuration and rollout implications.

## Release gates

- [ ] Inventory every advisor finding and map it to its migration and application call sites.
- [ ] Fix helper/policy and RPC authorization defects in reviewed migrations.
- [ ] Run migrations on a disposable database matching the live schema.
- [ ] Run role-matrix SQL tests, including negative cross-tenant tests.
- [ ] Reconcile migration versions with exact content, not version-number guesses.
- [ ] Run TypeScript, lint, production build, and CI.
- [ ] Run authenticated browser journeys for school manager, assigned teacher, unassigned teacher, student, and linked parent.
- [ ] Re-run Supabase security/performance advisors and verify no new findings.
- [ ] Deploy reviewed migrations and function changes only after staging evidence is attached.

## Explicitly not done

No production grants, RLS policies, SECURITY DEFINER bodies, Auth settings, or migration history were changed by this audit commit. A source inventory is not a remediation, and a successful build is not authorization verification.


## Verified follow-up — 30 October 2026

### Academic-record authorization fix

PR #157 was merged into `paul/integrate-edna-content` after CI passed (workflow run 725). The migration changes `learning_can_manage_academic_records(uuid)` to require:
- an active membership in the target organization;
- `learning.academic.manage` on that membership's assigned role via `organization_memberships.role_id`, `roles`, `role_permissions`, and `permissions`;
- no active student membership in that organization.

The function no longer relies on `has_permission()` for this check because that helper evaluates tenant-wide `user_roles`, which could let a privileged tenant role leak authority into a school where the same person is STAFF.

Read-only role simulation against live membership records returned MANAGER = allowed and STAFF = denied. This exercised the proposed predicate using test JWT-sub claims; it did not execute the migration or alter production. The PR migration is merged in source control but remains unapplied in production pending migration reconciliation and staging tests.

### SECURITY DEFINER execution inventory

A fresh catalog query found 117 SECURITY DEFINER functions in `public`:
- 105 executable by `authenticated`;
- 0 executable by `anon`;
- 0 executable by `PUBLIC`;
- all 117 have an explicit configured search_path.

A static triage of the 105 authenticated-callable functions found 2 without an obvious direct `auth.uid()` / `learning_current_user_id()` reference. Both route authorization through `learning_can_manage_academic_records`; they remain in the manual authorization review. This scan is triage only, not a proof of function safety.

### Exact migration-ledger comparison

The live Supabase ledger contains 193 rows; the canonical branch currently contains 178 timestamped migration files. Comparing exact versions yields:
- 68 repository versions absent from the live ledger;
- 83 live versions absent from the repository;
- 1 shared version with a different recorded name.

Comparing names separately shows 47 migration names represented on both sides but recorded under different versions. The remaining unmatched sets are 21 repository migration names absent from the live ledger and 36 live migration names absent from the repository. This confirms substantial historical version/name drift, not simply a small pending migration queue.

Do not push migrations, rewrite timestamps, or edit the ledger to force counts to match. The 47 same-name pairs and the 21/36 unmatched sets require content-level comparison against the live schema and repository SQL. The new PR #157 migration must remain pending until this is resolved.

### Updated release state

- [x] Academic permission helper fix merged to the canonical branch and CI passed.
- [x] Read-only manager/staff predicate simulation: manager allowed, staff denied.
- [ ] Validate active-student, inactive-member, non-member, and cross-organization negative cases in staging.
- [ ] Complete function-by-function authorization review of authenticated SECURITY DEFINER RPCs.
- [ ] Reconcile migration history using exact SQL/catalog evidence.
- [ ] Enable leaked-password protection in Auth configuration.
- [ ] Complete full role-based browser E2E and rerun advisors after staged remediation.

No production database schema, function body, grant, policy, Auth setting, or migration ledger was changed during this follow-up.


### Additional organization-scoped permission findings — 30 October 2026

A second read-only review found 14 SECURITY DEFINER routines/triggers in the live catalog that reference `get_current_user_permissions()`. That helper derives permissions from tenant-wide `user_roles`, not the user's role assigned to the target organization. Several callers combine that global permission result with active organization membership or an OWNER/MANAGER role-name check. This does not prove the target organization's assigned role has the permission, so it can recreate the cross-organization privilege leakage addressed by PR #157.

Confirmed affected routines:
- Calendar: `create_learning_school_calendar_event`, `publish_learning_school_calendar_event`, `cancel_learning_school_calendar_event`, `list_manageable_learning_calendar_organizations`, `list_manageable_learning_calendar_events`, and `list_learning_school_calendar_events`.
- Announcements: `create_learning_school_announcement`, `list_manageable_learning_school_announcements`, and `publish_learning_school_announcement`.
- Intervention cases: `create_learning_intervention_case`, `list_learning_intervention_cases`, and `update_learning_intervention_case`.
- Attendance: `submit_learning_attendance_register` and trigger function `learning_guard_attendance_session_update`.

The attendance paths use the tenant-wide permission together with `is_organization_member(organization_id)`; calendar, announcement, and intervention manager paths similarly consult the tenant-wide permission helper. The teacher-specific class-membership branches in intervention and attendance routines are separate and should be preserved when correcting manager authorization.

The relevant source migrations were inspected:
- `20261026200000_learning_school_calendar_events.sql`
- `20261020210000_learning_intervention_cases.sql`
- `20261019110000_learning_attendance_submission_and_identity_hardening.sql`

This is a source/catalog finding, not an executed exploit. No production changes were made. The next remediation should replace these tenant-wide permission checks with target-organization role-permission checks, preserve teacher class-membership access, add a role matrix including cross-organization STAFF, and verify on a disposable/staging database before deployment. Migration-history reconciliation remains a hard gate; do not apply the new migration to production yet.


### Expanded global-permission reference scan

A broader catalog scan found 9 additional SECURITY DEFINER routines that call tenant-wide `has_permission('learning.academic.manage')`:
- `create_learning_school_competition`
- `set_learning_school_competition_status`
- `get_learning_vocabulary_analytics`
- `learning_school_admin_can_view_user`
- `set_learning_staff_membership_status`
- `list_learning_marketplace_profiles_for_review`
- `list_learning_marketplace_safety_reports`
- `review_learning_marketplace_safety_report`
- `review_learning_marketplace_teacher_profile`

The first five do not consistently verify that the target organization's assigned role carries the permission. In particular, competition creation/status and staff membership status combine tenant-wide permission with organization membership; vocabulary analytics and school-admin user visibility do likewise; these are high-priority cross-organization authorization candidates. Marketplace moderation routines additionally check OWNER/MANAGER role names in the target organization, which reduces the direct STAFF escalation path, but still does not prove the target role's permission assignment. They remain in scope for correction to a single organization-scoped permission predicate.

This brings the catalog review set to 23 SECURITY DEFINER routines/triggers using tenant-wide permission helpers. The next patch must inspect each caller's intended access model and replace only privileged manager branches; teacher, student, parent, and ordinary organization-member read paths must remain intact. This scan is static catalog review; it has not changed production.


### Learning RLS policy scan — tenant-wide permission references

A read-only `pg_policies` scan found 29 policies across 9 `learning_*` tables whose predicates still reference tenant-wide `has_permission()` or `get_current_user_permissions()`:
- `learning_academic_years` (3 policies)
- `learning_attendance_records` (4)
- `learning_attendance_sessions` (3)
- `learning_class_groups` (3)
- `learning_class_memberships` (3)
- `learning_class_subjects` (3)
- `learning_terms` (3)
- `learning_timetable_entries` (3)
- `learning_vocabulary_entries` (4)

These predicates require individual review against each table's organization key and teacher/class access branches. The presence of a tenant-wide permission reference is not by itself proof that every policy is exploitable: some policies may correctly scope to the user's tenant and others may OR a privileged manager branch with teacher membership. However, it means the new organization-assigned permission helper has not yet been propagated to all learning RLS authorization paths. Do not mass-replace policies; preserve legitimate teacher workflows and validate both USING and WITH CHECK behavior with cross-organization role tests.

The catalog now identifies three distinct remediation surfaces: 23 SECURITY DEFINER routines/triggers using tenant-wide permission helpers, 29 learning RLS policies using those helpers, and the 25 academic-record policies already routed through the corrected helper in PR #157. Confirm overlap before counting unique policies or drafting the migration.


### Final advisor rerun and deployment blockers — 30 October 2026

Supabase security and performance advisors were rerun against project `zcutsqbzvydyosfgrbdi` after the read-only review. The security advisor still reports:
- 19 RLS-enabled tables without policies (INFO). Direct grants were previously checked and no direct authenticated/anon table privileges were found, but RPC access and ownership paths still require verification.
- 105 authenticated-executable SECURITY DEFINER functions (WARN). This is a broad warning, not proof that all 105 are vulnerable; each function requires an authorization/callsite decision.

The performance advisor continues to report duplicate indexes (4 findings) and multiple permissive policies on several tables. These are not automatically safe to remove: index usage and policy semantics must be checked before cleanup. Preserve this as a separate performance/authorization review.

The live migration listing still contains 193 entries, including repeated migration names and timestamp/name divergence. The repository has 178 migration files. This listing alone is not sufficient to decide which SQL has or has not been applied; the earlier exact-version and normalized-name comparison demonstrates substantial drift. No ledger edits or migration pushes were performed.

Completion status:
- Organization-scoped academic-record helper: source change merged in PR #157; not deployed to production.
- Broader RPC/RLS authorization remediation: findings catalogued, but no safe blanket replacement is possible; individual function/policy definitions and UI callsites remain to be remediated and tested.
- Cross-organization role matrix E2E: not run; current production data is insufficient to establish all OWNER/MANAGER/STAFF combinations.
- Migration reconciliation: not complete. Requires content-level comparison of all 178 repository migration files against live schema effects and live ledger aliases. Production migration deployment remains blocked.
- Leaked-password protection: still disabled. The available Supabase connector exposes no Auth configuration update action; this setting must be enabled in Supabase Dashboard Auth settings by an authorized project administrator.
- Advisor rerun: completed; findings remain as recorded above.

No production schema, Auth configuration, migration ledger, or data was changed in this pass. This document is an audit record, not a V1 security sign-off.


## 2026-10-30 follow-on source remediation

Committed additive migration `20261030140000_scope_learning_admin_permissions_to_organization.sql` (commit `300753663088325e33c2741e3e2e5c41503f8c0f`). It updates 11 SECURITY DEFINER functions/triggers covering school calendar administration, intervention cases, and attendance submission/guarding to use `learning_can_manage_academic_records(target_organization_id)` rather than tenant-wide permission lookup. Teacher class-membership branches and parent/student calendar visibility branches are retained.

Static source verification: 11 function definitions present; no direct get_current_user_permissions() references remain in these 11 definitions. The migration is source-only and is **not applied to the live database** because migration-ledger/schema reconciliation is still blocked. No production schema, data, Auth settings, or migration ledger changes were made. This commit was written directly to the canonical integration branch; the PR-only workflow lookup returned no runs, so CI status for this commit is not established.


## 2026-10-30 second follow-on source remediation

Committed additive migration `20261030150000_scope_learning_competition_staff_marketplace_permissions.sql` (commit `4d13ae0800115502cd403185f2d2317d0ae45efe`). It updates 9 SECURITY DEFINER functions:
- School competition creation and status changes
- Vocabulary analytics administrator scope (teacher class visibility remains)
- School-admin user visibility helper
- Staff membership status changes
- Marketplace teacher-profile review queue and review action
- Marketplace safety-report list and review action

Administrator checks now use the organization-scoped `learning_can_manage_academic_records(target_organization_id)` helper. Marketplace role-name checks, participant exclusions, teacher class-membership branches, and existing data filters are retained. Static verification of the committed migration: 9 function definitions and zero remaining `has_permission('learning.academic.manage')` or `get_current_user_permissions()` references.

This is source-only; the migration has not been applied to production pending migration-history reconciliation and role-matrix verification. No live schema/data/Auth/migration-ledger changes were made.
