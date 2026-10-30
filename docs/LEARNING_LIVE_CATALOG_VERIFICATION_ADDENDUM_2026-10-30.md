# E&P Learning — Live Catalog Verification Addendum

Date: 2026-10-30
Branch: `paul/integrate-edna-content`
Supabase project: `ep-core`

This addendum records read-only production catalog checks performed after the migration inventory comparison. It does not authorize or perform deployment.

## Seven live-only migration entries: source correlation

The seven ledger entries without same-name files were compared against current migration filenames and source SQL.

| Live ledger entry | Current source candidate | Assessment |
|---|---|---|
| `20261002023648 learning_teacher_student_user_rls_safe` | `20261002023342_learning_teacher_student_user_visibility.sql` and `20261002024000_fix_learning_teacher_student_user_rls_recursion.sql` | Related policy/function implementation exists in source; exact live migration body unavailable |
| `20261013064537 fix_class_assignment_grading_target` | No exact filename found; nearby assignment-target migrations exist | Unresolved |
| `20261026044618 learning_content_response_integrity_hardening` | `20261010000000_harden_learning_content_response_integrity.sql` | Strong same-domain candidate; exact live body unavailable |
| `20261026044623 learning_timetable_access_hardening` | `20261016230000_harden_learning_timetable_access.sql` | Strong same-domain candidate; exact live body unavailable |
| `20261026044629 learning_attendance_submission_identity_hardening` | `20261019110000_learning_attendance_submission_and_identity_hardening.sql` | Strong same-domain candidate; exact live body unavailable |
| `20261026044659 teacher_student_user_rls_recursion_fix` | `20261002024000_fix_learning_teacher_student_user_rls_recursion.sql` | Strong same-domain candidate; exact live body unavailable |
| `20261026044701 assignment_targets_select_rls_recursion_fix` | `20261004100000_fix_learning_assignment_targets_select_rls_recursion.sql` | Strong same-domain candidate; exact live body unavailable |

The repository does not retain these seven live migration files under their live versions, and GitHub path history/search returned no commit history for those exact paths. Similar source files are candidates only, not proof of equivalent SQL.

## Production catalog checks

Read-only `pg_catalog` queries confirmed the following live definitions:

### Present objects

- `public.learning_teacher_can_view_student(uuid)` exists as SECURITY DEFINER with empty search_path. Its body checks that the target user has an active student membership in a class where the signed-in user has an active teacher membership.
- `public.learning_teacher_can_manage_content_response(uuid, uuid)` exists as SECURITY DEFINER with empty search_path.
- `public.learning_guard_attendance_session_update()` exists as SECURITY DEFINER with empty search_path.
- Attendance identity/marker trigger functions exist with empty search_path and are not SECURITY DEFINER.
- The `learning_assignment_targets_select` policy currently matches the recursion-safe source implementation in `20261004100000_fix_learning_assignment_targets_select_rls_recursion.sql`, including student, parent, and organization-member branches.

### Confirmed live/source drift

The live policy definitions for attendance still contain tenant-wide permission checks:

- `learning_attendance_sessions_insert/select/update`
- `learning_attendance_records_delete/insert/select/update`

Their live expressions still call `get_current_user_permissions()` and combine it with `is_organization_member(...)`. The source migration `20261030170000_scope_learning_rls_admin_permissions.sql` replaces those branches with `learning_can_manage_academic_records(organization_id)` while preserving teacher class-membership access. The live catalog does not yet show that source change.

The attendance session trigger function `learning_guard_attendance_session_update()` also still calls `get_current_user_permissions()` plus `is_organization_member(new.organization_id)`. The source migration `20261030140000_scope_learning_admin_permissions_to_organization.sql` is intended to scope this authorization to the target organization. The live function body remains on the old predicate.

Timetable policies are partially drifted:

- `learning_timetable_select` uses `learning_can_manage_academic_records(organization_id)`.
- `learning_timetable_insert/update/delete` still use `get_current_user_permissions()` plus `is_organization_member(organization_id)`.

The source policy migration replaces all four policy predicates with organization-scoped checks. The live catalog shows only the SELECT policy updated.

Content-response policies and the teacher-view-student helper exist in the live catalog and broadly match the current source design; this is a structural comparison, not a full byte-for-byte or role-matrix test.

## Security and release consequence

This confirms that migration-ledger presence or similar migration names cannot be treated as proof that the latest source authorization changes are active in production. At least the attendance and timetable authorization hardening remains absent from the live catalog.

Do not expose this as a fully resolved security posture. Keep the source fixes committed but undeployed until migration history is reconciled and an isolated staging environment passes the role matrix.

## Actions taken

- Read-only Supabase catalog queries only.
- Read-only GitHub source retrieval only.
- No production DDL, data, grants, RLS policies, Auth configuration, or migration ledger changes.
