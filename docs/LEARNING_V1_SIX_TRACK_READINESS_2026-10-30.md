# E&P Core — Six-Track V1 Security and Release Readiness Check
Date: 2026-10-30
Branch: `paul/integrate-edna-content`
Supabase project: `ep-core` (`zcutsqbzvydyosfgrbdi`)

## Executive result

This pass advanced all six workstreams in parallel. It did not change the production database, migration ledger, Auth configuration, or user data. No staging Supabase project is connected: the available project list contains only the production `ep-core` project. Therefore no production migration deployment or role-matrix test was attempted.

## 1. Migration-history reconciliation

- Current inventory previously fetched: 183 repository SQL migration files and 193 production ledger rows.
- Earlier exact-version diff: 68 repo versions absent from the ledger; 83 ledger versions absent from the repository; one shared version with a different recorded name. Many other migrations align by normalized name but not timestamp.
- Inspected actual source content for six migration files across POS and Learning. Confirmed explicit no-op historical markers, timestamp/name remaps, and duplicate/reconciled ledger entries. A no-op marker is not the original migration implementation.
- This is only a content spot-check, not a complete 183-file SQL checksum/content reconciliation. Remaining live-only entries still need source recovery from Git history/deployment artifacts and live object comparison.
- Existing detailed findings: `docs/LEARNING_MIGRATION_HISTORY_RECONCILIATION_2026-10-30.md`.
- Gate: do not run `db push`, apply migrations, or edit ledger rows until every live-only and shifted entry is accounted for.

## 2. SECURITY DEFINER RPC authorization review

- Latest advisor still reports 105 SECURITY DEFINER functions executable by `authenticated`; this is an advisor warning, not proof of a vulnerability.
- Retrieved and reviewed source definitions for selected high-impact RPCs including parent/student invitation acceptance, team assignment, term-grade calculation, gradebook bulk entry, marketplace booking cancellation, and intervention case creation. Examples inspected authenticate via `auth.uid()` or `learning_current_user_id()` and apply invitation email, class membership, or organization permission checks.
- The gradebook calculation and bulk-entry functions call `learning_can_manage_academic_records(organization_id)`, which is the org-scoped helper fixed in PR #157.
- No blanket EXECUTE revocation is appropriate: these functions include legitimate authenticated application RPCs. This targeted sample does not constitute a full review of all 105; remaining functions need review against their callers and object-level authorization.
- All functions seen in this review use an empty configured search_path. Continue to inspect dynamic SQL, owner, ACL, and callsite for the remaining functions.

## 3. Staging and role-matrix validation

- Supabase project listing returns one project only: production `ep-core`, status `ACTIVE_HEALTHY`, Postgres 17.
- No separate staging project is available through the connected account. No staging environment or test identities were available to run OWNER/MANAGER/STAFF/teacher/student/parent cross-organization tests.
- No role simulation was run against production in this pass. The source migrations from the earlier remediation work remain undeployed.
- Gate: provision/connect staging, seed two organizations with deliberately conflicting role assignments, then test allowed and denied SELECT/INSERT/UPDATE/DELETE/RPC cases for every role before deployment.

## 4. Advisor findings, duplicate indexes, and permissive RLS

Latest advisor rerun at 2026-10-30 01:28 UTC:

### Security
- 19 RLS-enabled tables with no policies (INFO). Catalog inspection from the earlier pass confirmed none has direct table-level SELECT/INSERT/UPDATE/DELETE grants to `anon` or `authenticated`. Several are intentionally RPC-only; do not add broad policies simply to clear the advisor.
- 105 authenticated-callable SECURITY DEFINER functions (WARN), addressed under workstream 2.
- Remediation reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy and https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

### Duplicate indexes
Live catalog definitions confirm identical key definitions:
- `learning_content_responses`: `idx_learning_content_responses_content` and `learning_content_responses_content_status_idx`, both btree `(content_item_id, status)`.
- `learning_content_responses`: `idx_learning_content_responses_student` and `learning_content_responses_student_assignment_idx`, both btree `(student_user_id, assignment_id)`.
- `purchase_orders`: `purchase_orders_created_index` and `purchase_orders_tenant_created_index`, both btree `(tenant_id, created_at DESC)`.
- `users`: `users_auth_user_id_key` and `users_auth_user_id_unique`, both unique btree `(auth_user_id)`; both currently back constraints, so neither should be dropped without identifying and reconciling those constraints first.

Usage snapshot:
- For the first Learning pair, old names had 2 and 1 scans; newer names had 26 and 10 scans.
- Purchase-order indexes had 876 and 58 scans respectively; preserve POS behavior and investigate separately because POS is a distinct product.
- Users indexes both back constraints; no drop is proposed.
- No index was dropped. Confirm query plans, migration provenance, constraints and production usage window before creating a removal migration.

### Permissive policies
- Catalog contains 298 policies, all permissive and zero restrictive policies.
- Multiple policies per table are not automatically a vulnerability: Postgres OR-combines permissive policies. Several tables have intentionally separate SELECT/INSERT/UPDATE/DELETE policies plus parent/teacher overlays. Do not collapse or remove them without evaluating the combined expression and access matrix.
- The advisor's performance output also reports 136 unindexed foreign keys. This is a broad performance backlog; indexes must be prioritized by table size, query workload, and write overhead, not added blindly.

## 5. Leaked-password protection

- Earlier inspection found leaked-password protection disabled.
- Available connected Supabase tools expose project/migration/advisor operations but no Auth password-security configuration action.
- No change was made. An authorized project administrator must enable leaked-password protection in Supabase Dashboard Auth password/security settings and verify the setting after save. Do not claim this is enabled until verified.

## 6. Source branch and CI verification

- Canonical branch HEAD at this check: `4a2df24fcd19b81d210057b596ae1f4a55781465`.
- Latest documentation commit is present on the canonical branch.
- GitHub's connected workflow-runs wrapper returned no runs for that commit. This does not prove the branch is green; it means CI status was not established.
- Source-only authorization migrations previously committed remain un-deployed. No end-to-end build/test could be run because the local Windows project checkout is not mounted in this session.
- Keep `lint-output.txt` and other user work untouched when the local checkout is next available.

## Release decision

**Not ready for production deployment.** The immediate blockers are full migration-history reconciliation, staging role-matrix tests, complete privileged-RPC review, and administrator confirmation of leaked-password protection. Source commits are not live fixes. Keep production unchanged until those gates are satisfied.
