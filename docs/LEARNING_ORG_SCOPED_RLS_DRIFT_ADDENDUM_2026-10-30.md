# E&P Learning — Organization-Scoped RLS Drift Addendum

Date: 2026-10-30
Branch: `paul/integrate-edna-content`
Supabase project: `ep-core`

## Verified live catalog result

A fresh read-only query of `pg_policies` searched all `public.learning_%` policies for direct references to `get_current_user_permissions()` or `has_permission(...)`. It returned 29 policies across nine Learning tables:

| Table | Live policies still using tenant-wide permission helper |
|---|---:|
| `learning_academic_years` | 3 |
| `learning_attendance_records` | 4 |
| `learning_attendance_sessions` | 3 |
| `learning_class_groups` | 3 |
| `learning_class_memberships` | 3 |
| `learning_class_subjects` | 3 |
| `learning_terms` | 3 |
| `learning_timetable_entries` | 3 |
| `learning_vocabulary_entries` | 4 |
| **Total** | **29** |

The exact policy names are the table's INSERT, UPDATE, and DELETE policies for the first seven tables (with attendance record CRUD and attendance session INSERT/SELECT/UPDATE), all three timetable write policies, and all four vocabulary-entry policies.

## Source comparison

The canonical source migration `supabase/migrations/20261030170000_scope_learning_rls_admin_permissions.sql` contains 29 `ALTER POLICY` statements covering these same nine tables. It replaces the tenant-wide permission predicates with `public.learning_can_manage_academic_records(organization_id)` (or the referenced attendance session's organization), while preserving teacher class-membership and other non-admin access branches.

The live catalog query still finds the old helper references in all 29 policies. Therefore this source migration is not reflected in the current production policy definitions. This extends the earlier drift finding beyond attendance and timetable to academic years, class groups, class memberships, class subjects, terms, and vocabulary entries.

## Release consequence

- Treat the full 29-policy source migration as **not deployed**.
- Do not mark organization-scoped Learning RLS remediation complete.
- Do not deploy it directly to production until the migration ledger is reconciled and staging tests verify OWNER/MANAGER/STAFF/teacher/student/parent behavior across two organizations.
- Preserve the source migration unchanged pending staging validation; do not patch production policies manually.

## Scope and safety

This check queried `pg_policies` only. No DDL, data, grants, Auth settings, or migration ledger rows were changed.


## Permission-helper root cause and callable surface

A separate read-only catalog inspection retrieved the live definition and ACL of `public.get_current_user_permissions()`:

- It is `SECURITY DEFINER` and executable by `authenticated`.
- `anon` does not have EXECUTE.
- Its ACL is limited to owner and `authenticated`; it is not granted to PUBLIC.
- Its configured search path is `public` (rather than the empty search path used by the newer hardened Learning routines).
- Its body resolves permissions through `users` → `user_roles` → `roles` → `role_permissions` → `permissions`, keyed by the user's tenant. It does not accept or verify a target organization ID.

This is a tenant-level permission-list helper, not an organization authorization decision. A caller must independently bind the permission to an active membership and the specific target organization. The 29 live policies identified above do not do that: they combine the tenant-wide permission result with a generic organization-membership predicate. The current source migration replaces those policy branches with the organization-scoped `learning_can_manage_academic_records(organization_id)` helper.

The helper itself should not be blindly revoked or rewritten: other application areas may intentionally rely on tenant-level permission lookup. The required fix is to ensure each Learning authorization decision is scoped to its target organization, then separately assess whether this legacy helper can be narrowed or retired after caller inventory and regression testing.

## Privileged-function audit — 2026-10-30 continuation

Read-only catalog inspection of live PostgreSQL 17.6.1:

- `public`: 117 `SECURITY DEFINER` functions; 105 executable by `authenticated`; none executable by `anon` or `PUBLIC`.
- `private`: 30 `SECURITY DEFINER` functions; 9 executable by `authenticated`; none executable by `anon` or `PUBLIC`.
- Authenticated and anon have no CREATE privilege on either `public` or `private`; authenticated has USAGE but not CREATE on `private`.
- Four authenticated-callable private definer helpers use non-empty search paths: `learning_assignment_target_assignment_matches_org`, `learning_assignment_visible`, `learning_content_visible`, and `learning_student_has_assignment_target`. Their definitions and unqualified references need source-level review and hardening assessment. The lack of CREATE privileges reduces the immediate object-shadowing risk but does not remove the value of using an empty path and fully qualified references.
- Five public definer helpers use non-empty paths: `get_current_user_permissions`, `get_current_user_tenant_id`, `has_permission`, `is_organization_member`, and `learning_school_admin_can_view_user`. Their search paths and tenant/organization semantics require source comparison.
- A static body scan of the 105 authenticated-callable public definer functions found 79 direct `auth.uid()` references, 24 references to application identity/authorization helpers without a direct `auth.uid()` reference, and two functions with no obvious direct identity or authorization helper reference. The two exceptions were inspected: `get_learning_school_attendance_report` and `revoke_learning_student_invitation`; both delegate authorization to `learning_can_manage_academic_records`.

### Confirmed live authorization defect and source correction already prepared

The live definition of `public.learning_can_manage_academic_records(target_organization_id)` currently returns true when the caller is an active organization member and is not an active student in that organization. It does not check the organization membership's `role_id`, `learning.academic.manage` permission, or an OWNER/MANAGER role.

The live role-permission catalogue shows:

- OWNER: has `learning.academic.manage`.
- MANAGER: has `learning.academic.manage`.
- STAFF: does not have `learning.academic.manage`.

The `organization_memberships` table contains `role_id`, so the role context exists in the live schema, but the helper does not consult it. Therefore STAFF (and any other non-student active organization member) can satisfy this helper. This is inconsistent with the role-permission catalogue and the intended OWNER/MANAGER/STAFF authorization boundary.

This is not limited to the proposed 29 policies: 19 authenticated-callable public `SECURITY DEFINER` RPCs call this helper, including gradebook, assignment lifecycle, invitation, content grading/publication, and school attendance-report operations. The two RPCs with no obvious direct identity/helper references both rely on it. These RPCs inherit the helper's authorization weakness.

**Source correction already exists:** `supabase/migrations/20261030130000_harden_learning_academic_record_permission.sql` replaces the helper with the required organization-membership role/permission check, using `organization_memberships.role_id` and `learning.academic.manage`. It sets an empty search path and retains the active-student exclusion. The live helper remains the older weak implementation because this migration is not present in the production migration ledger. The correction is therefore prepared in source but not deployed.

**Release consequence:** do not deploy the 29-policy migration alone or unchanged as an isolated release. The required sequence is `20261030130000` (helper correction), then the dependent RPC hardening migrations `20261030140000`, `20261030150000`, `20261030160000`, and finally `20261030170000` (29 RLS policies). Audit the 19 dependent RPC callers and preserve explicitly intended teacher/class-membership branches. Do not infer that a generic organization membership is sufficient authorization.

### Supabase security advisor snapshot

The security advisor reported:

- 19 tables with RLS enabled and no policies. Classify each as intentionally RPC-only or as a missing direct-access policy before changing anything.
- 105 authenticated-callable public `SECURITY DEFINER` functions. This is a review queue, not proof that all 105 are vulnerable; each callable routine needs an authorization contract.
- Leaked-password protection is disabled in Supabase Auth. An administrator must enable and verify this setting.

The advisor output is not a substitute for reviewing each function body. No production DDL, data, grants, migration ledger entries, or Auth settings were changed during this audit.


## Correction — source migration state

The live helper defect described above is real, but the source fix was already committed before this audit continuation. The earlier wording suggesting that a new source fix still needed to be authored was inaccurate. The remaining work is staging validation and migration-ledger reconciliation for the existing five migrations dated 2026-10-30, not authoring a duplicate helper replacement.


### Additional verified privilege dependency

The live database grants `authenticated` no SELECT privilege on `public.role_permissions`. Therefore the organization-scoped helper must execute with carefully constrained definer rights (or use a separate privileged helper); an invoker-rights implementation that directly queries `role_permissions` is not viable. The updated pending migration preserves definer rights, uses an empty search path, and limits EXECUTE to authenticated users. This was source-verified after commit `113eb5c5b1138d657469308a8742fd350bfa76e1`; it has not been applied to production or tested in staging.

### RLS-enabled tables with no policies

A live catalog/grant query enumerated all 19 public tables reported by the security advisor as RLS-enabled with no policies. None grants SELECT/INSERT/UPDATE/DELETE to `authenticated`, and none grants SELECT/INSERT to `anon`. They are therefore not directly accessible through ordinary authenticated/anonymous table API grants in the current catalog. Treat them as internal/RPC-only tables pending owner confirmation; do not add permissive policies merely to silence the advisor.
