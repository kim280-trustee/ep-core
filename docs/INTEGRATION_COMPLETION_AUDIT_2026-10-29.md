# E&P Learning Integration Completion Audit — 2026-10-29

Repository: `kim280-trustee/ep-core`  
Target integration branch: `paul/integrate-edna-content`  
Audited integration commit: `294858eae888e422c3356cbdd26d706b3f365bbc`  
Connected Supabase project: `ep-core` (`zcutsqbzvydyosfgrbdi`)

## Executive status

This is an evidence-based audit, not a claim that the product has passed end-to-end acceptance. Repository and Supabase checks were read-only. No production schema, data, grants, Auth settings, migration history, or Edge Functions were changed.

| Workstream | Finding | Status |
|---|---|---|
| Integration baseline | Current integration head identified as `294858e`; latest merged audit PRs #145 and #146 are present in the integration history | Reviewed |
| Edna branch reconciliation | The calendar, intervention, and parent-announcements branches are heavily divergent; do not merge them wholesale | Selective port only |
| School admin / bulk enrollment | Current integration contains `bulkAddMembers`, selection UI/state, partial-failure reporting, and selection clearing on organization changes. The closed PR #111 is unmerged, but its core bulk-enrollment behavior is present in the current integration file. The integration page also contains newer school-wide attendance reporting absent from the older PR branch | Code present; authenticated tests pending |
| Vocabulary | The current vocabulary analytics migration includes an explicit empty search path, authenticated actor resolution, organization membership/permission checks, class-scoped student aggregation for teachers, explicit function grants, and the corrected due-review calculation | Source reviewed; migration parity and runtime tests pending |
| GitHub Actions | The audited integration commit returned no combined status entries and no PR-triggered workflow runs from the available queries. This is not evidence of a green build | CI result not established |
| Supabase security and performance | Current advisor snapshot recorded below. Function bodies and role-scoped behavior still need targeted review/testing | Release blocker |
| Authenticated end-to-end acceptance | No authenticated browser session or role-separated test run was available during this audit; no claim of E2E completion is made | Pending |

## 1. Branch reconciliation evidence

The following branch comparisons are against `paul/integrate-edna-content`:

- `edna/academic-calendar-exams-v1`: 277 commits ahead, 128 behind.
- `edna/learning-intervention-v1`: 265 commits ahead, 128 behind.
- `edna/parent-school-announcements-v1`: 271 commits ahead, 128 behind.
- `paul/ai-teacher-assistant-integration-20261026`: 2 commits ahead, 27 behind.
- `paul/edna-sync-ui-completion-20261026`: 3 commits ahead, 26 behind.

These counts are divergence indicators, not a recommendation to merge. File-level comparisons show overlapping edits against the current implementation. In particular, the current school-admin page has 698 lines and includes school-wide attendance reporting that is absent from the old bulk-enrollment branch (654 lines). The current AI teacher assistant has a curriculum/grade/subject/skill/topic/objective hierarchy and objective-alignment validation not present in the older AI-assistant branch (354 versus 271 lines). The Edge Function source for `generate-teaching-material` is identical between that older branch and the integration branch. Port only a specifically reviewed missing capability, not the branch history or whole files.

PR #147 was closed without merging after a 135-file, 128-commit conflict. Keep it closed; it is not a completed synchronization.

## 2. School-admin bulk enrollment review

The current integration source at `src/features/learning-school-admin/pages/SchoolAdministrationPage.tsx` contains the bulk handler and selection UI. The reviewed implementation:
- filters selected IDs against accounts eligible for the selected class role;
- uses per-account settled results so one failure does not hide other successes;
- leaves failed IDs selected for retry;
- clears selection when the organization changes and at relevant academic-year/class edit boundaries.

PR #111 is closed and unmerged; its metadata must not be treated as proof of merge. The implementation's presence in the current integration source is the relevant evidence. Remaining acceptance tests must confirm that only an authorized school manager can perform the operation, accounts cannot be enrolled across tenants/organizations, duplicate membership is handled safely, partial failure is reported accurately, and retry succeeds without duplicating memberships.

## 3. Vocabulary migration review

Reviewed source: `supabase/migrations/20261026100000_learning_vocabulary_relations_analytics.sql`.

Positive source findings:
- `get_learning_vocabulary_analytics(uuid)` uses `SECURITY DEFINER` with `search_path = ''`.
- The function resolves the actor from `auth.uid()` and rejects an unresolved actor.
- School-wide access requires the academic-management permission and an active organization membership.
- Teacher access requires active teacher membership; student progress is limited to students sharing the teacher's active class membership in that organization.
- Execute is revoked from `public` and `anon`, and granted to `authenticated`.
- `students_due` uses `next_review_at <= now()`, including due reviews regardless of the progress status.

These checks are source review only. The function body still needs role-separated tests (unauthenticated, unrelated teacher, inactive teacher, manager without organization membership, cross-tenant organization, valid teacher, valid manager), and the vocabulary migrations must not be applied until their SQL is reconciled against the live catalog/history.

## 4. GitHub Actions / code verification

The current integration SHA returned no combined status entries and no PR-triggered workflow runs in the available queries. Therefore GitHub Actions status is **unknown**, not passing. A fresh checkout of `294858eae888e422c3356cbdd26d706b3f365bbc` completed on 2026-10-29. `npm ci` completed from the lockfile; `npm run lint` exited 0; and `npm run build` (TypeScript project build and Vite production build) exited 0. This verifies local lint/build on the exact integration SHA, but it does not establish green GitHub Actions or authenticated end-to-end acceptance. No `test` script is configured in `package.json`. `npm ci` also reported 10 dependency audit findings (2 moderate, 8 high); no automatic fix was applied.

The current integration head is `294858eae888e422c3356cbdd26d706b3f365bbc`. The current branch's feature register continues to classify features as “Code present — verify” until a role-authenticated acceptance test passes.

## 5. Live Supabase snapshot — read only

The connected project's migration history and advisors were checked on 2026-10-29.

### Migration-history reconciliation

- Repository migration files: **178**
- Remote migration records: **193**
- Repository-only versions: **68**
- Remote-only versions: **83**

The counts are not an instruction to push or repair history automatically. The exact SQL and remote catalog state must be mapped version by version, including the known same-version/name mismatch, before choosing a migration reconciliation. **Do not run a blind migration push and do not edit migration history just to make counts match.**

### Current advisor counts

Security:
- 19 RLS-enabled public tables with no policies.
- 105 `SECURITY DEFINER` functions executable by `authenticated`; all 105 were previously confirmed to have explicit function-level `search_path`, but that alone does not prove their authorization logic is correct.
- Leaked-password protection warning: 1.

Performance:
- 136 unindexed foreign keys.
- 6 auth/RLS init-plan warnings.
- 142 unused-index notices.
- 17 multiple-permissive-policy warnings.
- 4 duplicate-index warnings.

RLS-enabled tables with no policies generally deny direct access through those table policies, but any exposed RPC or privileged server-side path still requires its own authorization review. Do not blanket-add policies or revoke function execution without inspecting each intended access path.

## 6. End-to-end acceptance matrix

The following are release gates, not completed tests:

1. **School manager:** manage only their own organization; create/edit academic year, term, class, subjects; bulk-enroll eligible accounts; partial failures and retries behave correctly.
2. **Teacher:** view only assigned classes/students; create and publish content/assignments; vocabulary analytics returns only the teacher's assigned students; save AI-generated drafts only after required curriculum alignment; review before publication.
3. **Student:** open only published assigned content; complete and submit work; refresh and verify persisted result/progress; due vocabulary reviews update correctly.
4. **Parent:** linked child only; unrelated parent, inactive link, inactive student, and cross-tenant requests are denied.
5. **Negative access:** anonymous, unrelated authenticated user, inactive membership, cross-organization and cross-tenant calls to exposed RPCs are rejected.
6. **Database/migration:** reconcile migration source/history and test on a safe non-production target before any production migration action.
7. **AI runtime:** confirm JWT enforcement, provider secret/configuration, quota behavior, errors, and authenticated requests without exposing provider secrets.
8. **CI:** run lint, typecheck/build, and available automated tests against the exact integration commit and review failures.

## Release decision

**Not production-ready yet.** The codebase has substantial implementation and the integration branch already contains some work associated with closed/unmerged branches, so a wholesale merge would risk regressing newer work. The remaining blockers are exact migration reconciliation, function-by-function authorization review, leaked-password protection verification, green CI on the current commit, and role-separated E2E acceptance. No production changes were made in this audit.


## 7. Authorization issue found in live function review — 2026-10-29

A read-only catalog review compared the deployed authorization helper with the role model in the integration migrations. The live definition of `public.learning_can_manage_academic_records(uuid)` returns true for any active organization member unless that user also has an active student membership in the same organization. It does not require `learning.academic.manage`, a staff role, or an assigned class.

This is materially broader than the permission model documented in `20261014130000_learning_school_admin_permissions.sql`, which says organization membership is insufficient for academic mutations and assigns `learning.academic.manage` to OWNER/MANAGER. The staff administration flow also permits active STAFF organization memberships, while the live helper does not exclude STAFF or require an assigned teacher class.

The helper is called by authenticated-accessible SECURITY DEFINER functions and RLS policies. Live examples include `get_learning_school_attendance_report` (school-wide attendance aggregates), `revoke_learning_student_invitation`, manual gradebook writes and gradebook inclusion, plus assignment, parent-link, admissions and timetable operations. Those callers inherit the broad helper rule unless they add a separate authorization check. Newer attendance and school-admin hardening migrations show more specific manager-permission and assigned-teacher checks, so authorization behavior varies by feature.

**Release severity: high.** An active non-student STAFF/teacher membership may satisfy the helper without the academic-management permission or class assignment. This enables school-wide reporting and mutation paths beyond the stated role model. We have not used a real account to confirm exploitability, and we have not changed the database.

**Required remediation before V1:**
1. Inventory every live function, policy, and trigger that calls this helper; classify allowed OWNER/MANAGER, assigned-teacher, student, and parent actions.
2. Require active organization membership plus `learning.academic.manage` for school-wide management/reporting.
3. Give teacher workflows separate helpers that verify active teacher membership and the specific class/assignment/record in the requested operation.
4. Update the callers and policies in a new, reviewed migration after mapping local SQL to the live migration ledger. Do not tighten this shared helper alone; that could break teacher workflows while leaving other call paths inconsistent.
5. Add role-separated positive and negative database tests for owner, manager, assigned teacher, unassigned teacher, staff, student, parent, inactive member and cross-tenant user. Confirm direct table writes and SECURITY DEFINER RPC calls enforce the same boundary.

The local repository checkout used for this review is based on `294858eae888e422c3356cbdd26d706b3f365bbc`. GitHub now confirms canonical integration commit `75596d28dc5266592b09b0d1a4e2650c3793d20f`; it preserves the same source tree SHA `4e65dd08f563c050e622e443e59ef0c3259b0656`, so the reviewed application/migration files are unchanged. A local `git fetch` could not refresh refs because GitHub DNS/network access failed. GitHub API read confirmed both the canonical merge commit and its tree. Fresh npm audit also could not reach registry.npmjs.org; the previous `npm ci` result remains 10 findings (2 moderate, 8 high), and needs a networked rerun before dependency remediation.

No production database or Auth setting was changed. V1 remains blocked pending the authorization remediation and authenticated role tests, exact migration reconciliation, Auth leaked-password protection decision/configuration, and dependency/CI verification.


## 8. RLS caller inventory and validation environment — 2026-10-29

A fresh live catalog query counted **19 SECURITY DEFINER functions** and **25 RLS policies** that reference `learning_can_manage_academic_records`. The functions include gradebook calculation and mutation, assignment close/reopen/reassign, content status transitions, parent/student invitation handling, and school-wide attendance reporting. The policies cover gradebook entries/grades and audit history, grade scales, parent invitations/links, student invitations, content responses, and timetable reads. This confirms the issue spans multiple feature areas; changing the helper alone could remove intended teacher workflows or leave parallel policies unaffected.

The same read-only policy scan found organization-membership-only writes in the live policies for:
- `learning_assignments`: insert, update, delete;
- `learning_assignment_items`: insert, update, delete;
- `learning_assignment_targets`: insert, update, delete;
- `learning_content_items`: insert, update, delete;
- `learning_content_versions`: insert, update, delete;
- `learning_content_objectives`: insert, update, delete.

Some functions add additional checks, but direct authenticated table writes are a separate route. The review has not yet established which of these policies are intentionally available to assigned teachers, whether every direct write path preserves lifecycle/audit invariants, or whether any app server route further restricts access. Treat these as **high-priority RLS review findings**, not as proof every listed path is exploitable.

The current repo workflow `.github/workflows/learning-branch-validation.yml` runs only `npm ci`, `npm run build`, and `npm run lint`; it contains no database/RLS tests. Supabase advertises pgTAP, but it is not installed in the production project. Creating a Supabase development branch failed because project branching requires the Pro plan or above. Local Docker is installed but this environment is denied access to its engine. Therefore no disposable database is currently available for a migration dry run or role tests.

A fresh lint/build attempt on the Windows host did not produce verification results: the lint Node process failed with a native out-of-memory error, and the build was stopped while running alongside it to avoid further resource exhaustion. Earlier lint/build checks passed on the identical source tree SHA `4e65dd08f563c050e622e443e59ef0c3259b0656`; those earlier results remain evidence for the current application source, but do not validate SQL authorization. A later serial build attempt also remained silent for over six minutes and was interrupted; the current host did not produce a fresh build result. No files in the canonical source tree were changed during this review.


## 9. Effective authenticated table grants confirmed — 2026-10-29

A read-only `has_table_privilege('authenticated', ...)` check confirms the affected policies are reachable through PostgREST, not merely dormant policy definitions. RLS is enabled on all listed tables.

| Tables | Authenticated privileges | Policy gate observed |
|---|---|---|
| `learning_assignments`, `learning_assignment_items`, `learning_assignment_targets` | SELECT, INSERT, UPDATE, DELETE | Active organization membership |
| `learning_content_items`, `learning_content_objectives` | SELECT, INSERT, UPDATE, DELETE | Active organization membership |
| `learning_content_versions` | SELECT, INSERT, DELETE (no UPDATE grant) | Active organization membership, with draft/review state checks on writes |
| `learning_gradebook_categories`, `learning_gradebook_entries`, `learning_term_grades` | SELECT, INSERT, UPDATE, DELETE | Organization membership and/or `learning_can_manage_academic_records` |
| `learning_parent_student_links` | SELECT, INSERT, UPDATE, DELETE | `learning_can_manage_academic_records` for writes; parents may select their own links |
| `learning_parent_invitations` | SELECT, INSERT, UPDATE | `learning_can_manage_academic_records` |
| `learning_timetable_entries` | SELECT, INSERT, UPDATE, DELETE | Writes check `learning.academic.manage`; SELECT currently uses the broad helper |
| `learning_student_invitations` | SELECT only | `learning_can_manage_academic_records`; invitation writes use RPCs |

Authenticated users have SELECT but no direct INSERT/UPDATE/DELETE grants on `learning_content_responses`. Gradebook audit/history and grade scale tables also have no direct authenticated table privileges in this check; their writes/reads are through security-definer paths or remain denied by grants/RLS.

**Confirmed impact:** an active organization member can directly create, edit or delete assignments and assignment targets/items; create, edit or delete shared content; edit class-wide gradebook records; and create/change parent/student links where the policy uses the broad helper. For helper-guarded paths, any active non-student organization member can pass the current helper. This goes beyond the originally identified report/RPC concern and is a direct authorization blocker for V1. Existing triggers may protect selected state transitions, but do not replace row- and role-scoped authorization or protect every direct DML operation.

The effective-grant query does not establish which specific app roles are assigned these organization memberships in production. The migrations explicitly create active STAFF memberships and active teacher class memberships. Validate the behavior with separate manager, assigned-teacher, unassigned-teacher, and STAFF accounts on an isolated target before rollout.


## 10. Client-to-policy path mapping — 2026-10-29

The canonical client source confirms these are production application paths:

- `CreateTeacherAssignmentPage` calls the repository to insert a draft in `learning_assignments`, then inserts a class target and assignment item directly. The selected class comes from `learningTeacherService.listTeacherClasses`, but the database write policies currently check organization membership and do not verify that the actor teaches the selected class.
- `TeacherContentCreatePage` inserts a content item, first version, and objective directly, with a direct delete for cleanup after a partial save failure. It verifies curriculum/objective alignment in the client; database authorization must separately ensure teacher identity, authorship, and allowed organization.
- The parent repository directly upserts and updates `learning_parent_student_links`. The school parent-links page checks `learning.academic.manage` in the UI, while the live database helper does not require it.
- Gradebook category creation/update uses direct table writes. Manual grade entries, bulk imports, term grade finalization, overrides and inclusion changes use SECURITY DEFINER RPCs; those RPCs still rely on the broad helper unless their own code adds a class-specific teacher check.

This narrows remediation requirements: enforce manager permission for school-wide administration and parent links; enforce active teacher membership in the specific target class for assignment and gradebook workflows; enforce teacher authorship or manager permission for shared content and version/objective edits. Validate RPC and direct-table paths together so client-side class selection is not the only guard.
