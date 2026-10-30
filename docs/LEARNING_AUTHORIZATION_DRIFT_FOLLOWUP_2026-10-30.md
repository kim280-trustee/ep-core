# Learning Authorization Drift — Follow-up

Date: 2026-10-30
Branch: `paul/integrate-edna-content`

## Live findings

A read-only production catalog snapshot reported 105 public `SECURITY DEFINER` functions executable by `authenticated`. Thirteen still reference `get_current_user_permissions()`, and ten still reference tenant-wide `has_permission('learning.academic.manage')`. These groups may overlap.

The canonical source branch contains the following authorization hardening migrations:

- `20261030130000_harden_learning_academic_record_permission.sql`
- `20261030140000_scope_learning_admin_permissions_to_organization.sql`
- `20261030150000_scope_learning_competition_staff_marketplace_permissions.sql`
- `20261030160000_scope_learning_announcement_permissions.sql`
- `20261030170000_scope_learning_rls_admin_permissions.sql`

The helper introduced in the first migration checks the active organization membership's assigned role permission `learning.academic.manage`, and excludes active student memberships in that organization. The subsequent function and policy migrations use that organization-scoped helper while preserving separate teacher/class membership paths where applicable.

## Important interpretation

These findings establish source/live drift, not that every flagged function is exploitable. Function-level authorization must still be tested against the actual caller, target organization, target record, and role membership. Do not blanket revoke EXECUTE or add permissive RLS policies.

## Deployment gate

Production must remain unchanged until migration history is fully reconciled. Then:

1. Apply the five migrations to an isolated staging database in timestamp order.
2. Confirm the helper definition and all replaced function/policy definitions match source.
3. Test OWNER, MANAGER, STAFF, teacher, student, and parent access in two organizations, including cross-organization negative cases.
4. Re-run the read-only drift query and confirm legacy references are cleared from the intended functions.
5. Only then prepare a controlled production deployment.

No production schema, data, grants, policies, Auth settings, or migration ledger entries were changed during this follow-up.
