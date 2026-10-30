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
