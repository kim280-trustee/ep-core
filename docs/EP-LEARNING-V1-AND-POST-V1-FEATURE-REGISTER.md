# E&P Learning — V1 and Post-V1 Feature Register

**Repository:** `kim280-trustee/ep-core`  
**Branch reviewed:** `paul/integrate-edna-content`  
**Review date:** 2026-10-10  
**Canonical roadmap:** This is the single source of truth for V1 scope and post-V1 features.

## Status definitions

- **Code present — verify:** source/schema exists; end-to-end behavior is not yet proven.
- **Partial:** some capability exists, but required behavior or integration is not established.
- **Not found in reviewed tree:** no dedicated implementation was found in this branch tree. This is not a claim about unreviewed branches or external systems.
- **Deferred:** intentionally outside V1 unless the pilot school identifies a launch blocker.
- **Verified:** only use after the acceptance test passes in the running app with the expected authenticated role and real persisted data.

## V1 — pilot learning foundation

| Capability | Repository evidence | Current status | Acceptance gate |
|---|---|---|---|
| Authentication, tenant and memberships | Core auth/tenant modules and organization membership migrations | Code present — verify | Teacher, student and guardian can access only authorized tenant/class/student records |
| Academic structure and enrollment | Learning academic/enrollment features and schema | Code present — verify | Pilot curriculum, term, class, subjects and memberships resolve correctly |
| Content library and authoring | Learning content pages/services/repository and content migrations | Code present — verify | Save/edit/publish/reuse works; student runtime never serves an unpublished version |
| Question bank and assessment authoring | Assessment feature and publication/security migrations | Code present — verify | Questions and assessments can be authored, validated and published |
| Assignment lifecycle | Teacher assignment creation/history, runtime and lifecycle migrations | Code present — verify | Class/student targets, due dates, publish, reopen and reassign rules persist correctly |
| Student content/assessment runtime | Learning dashboard/runtime and assessment attempt/result migrations | Code present — verify | Student can start, answer, submit and see a persisted result after refresh; attempt limits apply |
| Progress, mastery and recommendations | Learning activity/mastery services and dashboard pages | Code present — verify | Persisted evidence drives consistent progress/recommendations; no invented progress |
| Teacher gradebook and grading | Gradebook service/repository/pages and academic-record migrations | Code present — verify | Assessment and teacher-entered grades reconcile; finalization/reopen and audit history behave correctly |
| Gradebook reports/export | Gradebook report page and CSV export | Partial; report selection/export hardening added in this branch | Term and subject are selectable; only finalized grades are ranked/averaged; CSV is correctly escaped; school format still needs approval |
| Parent links and progress | Parent feature, invitations, progress page and security migrations | Code present — verify | Invitation acceptance, revocation and parent-child access boundaries are tested with separate accounts |
| Content response and teacher grading | Student response and teacher grading migrations/features | Code present — verify | Responses and feedback persist and appear only to authorized teacher/student |
| Thai localization and official reports | Parent portal includes EN/TH copy; no approved official school template established | Partial / school validation required | Confirm Thai/English coverage, academic calendar/date conventions, grade calculations and actual school forms |
| Security, RLS and data integrity | Recent hardening migrations for attempts, responses, publication, lifecycle and parent invitations | Code present — verify | Apply migrations safely and run positive/negative authorization tests in the target Supabase project |
| Accessibility, mobile, recovery and operations | Not established by source-tree inspection alone | Unverified | Test phone viewport/slow network; document backup/restore, support and incident handling before real student use |

### V1 acceptance journey

1. Teacher signs in and opens the correct pilot class.
2. Teacher selects published content and a published assessment and publishes the assignment to the intended students.
3. Student signs in, opens the assignment, completes the content, answers and submits the assessment.
4. Refresh the student session and confirm the result and completion state remain persisted.
5. Verify progress, recommendations and gradebook agree with the persisted result and the configured grading policy.
6. Verify teacher content-response grading is saved and correctly scoped.
7. Test denied access: another student, unrelated guardian and unrelated tenant must not read or change the record.
8. Accept a parent invitation with the invited account, view only linked children, and verify invitation replay/revocation behavior.
9. Compare CSV/print outputs against school-approved sample data and requirements.
10. Confirm target Supabase migrations and policies are applied; a source commit or successful build alone does not apply database changes.

Use existing pilot data and the complete existing assignment `EN-M1-SELF-INTRO-A1` where appropriate. Do not duplicate seed data just to make the test pass.

## Post-V1 feature roadmap

| Feature | Current finding in reviewed branch | Target | Dependency / release criteria |
|---|---|---|---|
| Basic gamification: points, achievement history | No dedicated gamification module or migration found | V1.x, after V1 gates | Persist an auditable reward ledger tied to verified learning events; make award writes idempotent; support reversals/corrections |
| Badges and milestones | No dedicated implementation found | V1.x | Explicit criteria, unique awards, explanation of why earned, school-controlled enablement |
| Streaks, levels and challenges | No dedicated implementation found | V1.x/V2 | Timezone-aware school days, holidays and offline behavior; never reward empty page opens or repeated submissions |
| Leaderboards and team competitions | No dedicated implementation found | V2 | Optional, teacher-controlled, private by default, age-appropriate and non-shaming alternatives |
| Attendance | No dedicated Learning attendance module found | V1.x only if pilot requires it; otherwise V2 | Session/period model, present/absent/late/excused states, authorized corrections, audit history and parent visibility |
| Parent notifications and LINE OA | Parent portal/linking exists; no dedicated LINE OA/webhook integration found | V1.x/V2 | Verified account linking, consent/preferences, signature validation, idempotency, retries, delivery logs and opt-out |
| AI teacher assistant | No dedicated AI teacher feature found | V2 | Teacher approval before publishing, curriculum alignment, content-quality evaluation, usage/cost limits and child-data controls |
| AI student coach and personalized practice | No dedicated AI coach found; rule-based recommendations already exist | V2 | Ground responses in approved material, age-appropriate safeguards, teacher/guardian controls and quality evaluation |
| School-wide analytics and proficiency trends | School Analytics V1 page and tenant-scoped summary repository added on `edna/school-analytics-v1`; active student/teacher totals are constrained to active classes, and CSV cells are guarded against spreadsheet formula injection | Implemented but unverified (draft PR #87) | Build/lint, authenticated manager access, cross-tenant denial, filter correctness, live-data calculations and CSV export must pass before verification |
| Official Thai reporting templates | Generic reports exist; official school templates not verified | V1 only for school-mandated blockers, otherwise V1.x/V2 | Obtain the actual school's forms/rules and compare formulas, labels, rounding and exports to approved examples |
| Billing and licensed seats | No dedicated Learning subscription/billing feature found | V3 | Tenant plans, seat-count rules, invoices, payment reconciliation, entitlements and support workflows |
| Offline learning/synchronization | No dedicated offline-learning implementation found | V2/V3 | Explicit offline scope, queued writes, conflict resolution, sync visibility and duplicate-submission prevention |
| Multi-country/curriculum expansion | Reusable academic and tenant foundations exist; country workflows are not established | V2/V3 | Configuration-driven curricula, language, calendars, grading, currency, local reporting and legal/privacy review |
| Content marketplace/third-party integrations | No Learning marketplace scope verified | V3 | Licensing/ownership, tenant isolation, integration permissions, monitoring and support ownership |

## Gamification implementation order

1. **Specify rules first:** eligible event types, reward amounts, duplicate/reversal behavior, school/class settings, and whether rewards are enabled.
2. **Build a ledger, not just a points total:** each award must reference the trusted learning event, student, rule/version and timestamp; protect against duplicate event delivery.
3. **Add basic points and badges:** student achievement history plus teacher/school configuration and auditability.
4. **Add streaks/challenges after the ledger is reliable:** account for timezone, holidays and legitimate offline use.
5. **Add leaderboards last and make them optional:** do not expose child rankings publicly by default.

Do not implement gamification, attendance, AI, LINE or billing as superficial UI-only features. They need their own requirements, data model, authorization, failure handling and acceptance tests. The correct V1 action is to retain them as planned scope, not to add unvalidated tables to the launch build.

## School Analytics V1 implementation note (2026-10-19)

A draft implementation adds `/school-admin/analytics` with organization, academic-year and class filters, plus a class-scoped subject filter and organisation-timezone activity date range for assignment progress; active student/teacher/class counts; published assignment counts; tracked assignment completion metrics; explicit empty/loading/error states; refresh timestamp; and CSV export of the filtered summary. Subject selection narrows published-assignment metrics to assignments linked to that class-subject record. Activity dates filter persisted progress by `last_activity_at` using the selected organisation's timezone; roster/class counts are not date-based. Completion rate excludes learners without a tracked progress row. Attendance, assessment performance and longitudinal proficiency are not included in this first slice because the reviewed base branch did not establish a reliable school-wide data contract for those metrics. This is source-implemented but not runtime-verified; do not call it verified until CI, authenticated browser and tenant-isolation checks pass.

## Edna development audit — 2026-10-19

This audit checked the canonical feature register, the existing school-admin/analytics implementation on `edna/school-analytics-v1`, and open draft pull requests discoverable in `kim280-trustee/ep-core`. A feature described in a draft PR is not considered merged into the working branch or verified at runtime.

| Priority area | Finding | Status and next action |
|---|---|---|
| School Analytics V1 | Dedicated page, service/repository queries, organisation/year/class/subject/date filters, tracked assignment completion summary, empty/loading/error states, refresh time and formula-safe CSV exist in draft PR #87. No new migration is included. | **Implemented but unverified.** Keep PR #87 in draft until current CI is green and manager/non-manager access, cross-tenant denial, live metric/filter correctness and CSV export are tested with authenticated accounts. Do not add a competing dashboard. |
| School administration | Separate draft PRs #64–#78 cover academic overview/bulk enrollment, attendance register/history/reporting, timetable and exports, parent links/admissions, and staff directory. | **Implemented across stacked drafts; unverified as an integrated chain.** Review dependency order, role checks and migration status before merge. The PR descriptions state migrations have not been applied to Supabase. |
| Curriculum and lesson planning | A teacher AI drafting slice for lessons, worksheets, quizzes and lesson plans is described in draft PR #79. The reviewed base branch does not establish a complete reusable curriculum-linked lesson-plan management workflow. | **Partial / unverified.** After Analytics verification, inspect the actual #79 route, objective linkage, save/reuse behavior, teacher/class scope, feature flags and AI quota migration before extending it. Do not build a second content system. |
| Parent–school communication | Draft PRs #80–#83 add recipient-scoped in-app notifications for booking, assignment/assessment, attendance and admissions events plus preferences. PR #86 adds a linked-child attendance summary. | **Partial / unverified.** This is not proof of a general school/class announcement board or operational email/LINE delivery. Review trigger/RPC authorization and migrations; test linked-parent isolation and preference suppression. Descriptions state migrations are not applied. |
| Learning intervention and support | No dedicated intervention case/follow-up workflow was confirmed in the reviewed canonical register or the relevant open-PR search. Existing mastery, gradebook and recommendations are foundations, not a complete intervention log. | **Gap to inspect after earlier priorities.** Reuse existing evidence and add only if teachers need a persistent, authorised follow-up record with transparent criteria. |
| Academic calendar and exam planning | Weekly timetable scheduling/export is present in draft PRs #66/#73, but a weekly timetable is not an academic calendar or exam-planning workflow. No dedicated calendar/exam planning PR was found in the search. | **Gap to inspect after intervention.** Reuse existing academic-year/term and assessment models; avoid duplicate calendar tables unless the schema audit proves they are needed. |
| Operations, notifications and integrations | Multiple drafts mention notifications and AI, but deployment/configuration, migration application, backup/restore, offline sync, email/LINE delivery and end-to-end reliability are not established by source inspection. | **Unverified or deferred.** Do not claim these integrations are operational until configuration and authenticated tests pass. |

### Audit guardrails

- Do not merge or stack additional large modules into Paul’s active testing branch without checking each PR’s base/head and dependency chain.
- Draft PR code is not available in the base branch until integrated; keep statuses separate.
- No live Supabase migration was applied as part of this audit.
- Source inspection and a successful build do not prove tenant isolation or browser behavior.

## Current known limitations / next work

- The repository contains four competing feature-register documents. This root-level document is canonical; the other three point here to prevent roadmap drift.
- Gradebook report previously hard-coded the first term and first subject and could rank draft grades. This branch now adds term/subject selection, finalized-only average/ranking, loading/error/empty states and CSV escaping/UTF-8 handling. Local build and browser verification are still required.
- Parent invitation redirect timer is now cleaned up on unmount; invitation acceptance still requires authenticated integration testing.
- The gradebook summary average versus finalized term-grade discrepancy observed during the pilot must be reconciled against category weights, included/excluded entries, overrides, missing work and the finalized-grade policy before changing the underlying calculation.
- Assignment lifecycle event panels showing no events need verification against real action history.
- The school must confirm whether attendance and any official report template are V1 blockers.
- Do not claim LINE, AI, attendance, gamification, offline sync, school billing or director analytics are implemented without dedicated code and acceptance evidence.

## Execution order

1. Pull this branch once and run `npm.cmd run build` and `npm.cmd run lint`; resolve errors before feature work.
2. Complete the authenticated teacher → student → result → progress → gradebook journey.
3. Test parent invitation/linking and negative access cases.
4. Reconcile gradebook calculations and lifecycle-event history against persisted records.
5. Get the pilot school's required report template and decide whether attendance is a launch blocker.
6. Only after V1 passes, implement basic gamification as the first engagement slice, then prioritize parent messaging/attendance from school feedback.
7. Keep AI, billing, offline synchronization and multi-country expansion behind explicit product and security gates.

**Scope rule:** Source inspection and compilation are not runtime verification. Change a status to “Verified” only with reproducible authenticated evidence. Never bypass RLS or add permissive policies just to make a workflow pass.
