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
