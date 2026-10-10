# E&P Learning — V1 and Post-V1 Feature Register

**Repository:** `kim280-trustee/ep-core`  
**Branch:** `paul/integrate-edna-content`  
**Purpose:** Keep V1 launch scope separate from later product capabilities. This is a planning register, not evidence that every listed capability is already implemented or tested.

## Status definitions

- **Code present — runtime unverified:** relevant route/page/service is present in the inspected branch, but the complete authenticated workflow has not yet been verified.
- **Audit required:** implementation status has not yet been established from the current branch and its migrations/services.
- **Deferred by plan:** intentionally excluded from V1 unless the pilot's acceptance criteria prove it is essential.
- **Future:** planned for a later release after dependencies are satisfied.

Do not mark a feature “complete” based on a route or UI alone. Completion requires persistence, tenant/RLS checks, error handling, and a working end-to-end acceptance test.

## V1 — pilot foundation

| Capability | Current evidence/status | V1 acceptance criteria |
|---|---|---|
| Authentication and tenant membership | Existing Core foundation; end-to-end verification required | Authorized users can access only their tenant and permitted classes/data. |
| Academic setup and class membership | Existing academic/class runtime areas; verify against pilot configuration | Teacher and student memberships resolve to the correct class, subject, and term. |
| Teacher content library and authoring | Code present — runtime unverified | Teacher can create/edit content, publish a version, and see only publishable content in student runtime. |
| Question bank and assessments | Code present — runtime unverified | Teacher can create/publish an assessment and student answers are validated and scored correctly. |
| Assignment creation, publishing, history | Code present — runtime unverified | Teacher can assign content and/or assessments to the intended class/students and inspect status/history. |
| Student assignment/content runtime | Code present — runtime unverified | Student opens assigned published content, records responses, completes the work, and sees safe errors when content is unavailable. |
| Assessment attempt and results | Code present — runtime unverified | Start, answer, submit, score, result, and progress state persist and remain consistent after refresh. |
| Student progress and recommendations | Routes/pages exist in the inspected application; verify data correctness | Progress derives from real completed work and recommendations are explainable from persisted learning data. |
| Teacher gradebook | Code present — runtime unverified | Scores and statuses agree with assignment/assessment records; teacher permissions are enforced. |
| Gradebook settings and reports | Code present — runtime unverified; reporting coverage is limited/needs validation | Exported results match selected class, term, subject, and inclusion rules. Pilot school confirms required columns and format. |
| Parent links/progress access | Teacher parent-links page exists; secure parent-facing experience requires audit | A guardian can be linked and authorized only for the correct student; no public or guessable access to child data. |
| Essential accessibility, localization, privacy, backups and operational monitoring | Audit required | Mobile use, Thai/English needs, child-data protection, recovery, and support procedures meet agreed pilot requirements. |

### V1 release gate

Do not call V1 pilot-ready until the following real-data journey passes:

1. Teacher signs in and opens the pilot class.
2. Teacher creates or selects published content and a published assessment.
3. Teacher publishes an assignment for the intended class.
4. Student signs in, opens the assignment, completes the content, answers the assessment, and submits.
5. Results, assignment completion, progress, recommendations, and gradebook agree after refresh.
6. An unauthorized user cannot read or change another tenant's or student's data.
7. Errors such as missing/unpublished content are visible and actionable; runtime must never silently substitute an unpublished version.

Use the existing pilot records where possible. Do not create duplicate seed records just to make the test pass.

## Post-V1 roadmap

| Feature | Release target | Status | Dependencies / acceptance criteria |
|---|---|---|---|
| Basic points and achievements | V1.x | Deferred by plan; audit existing code before implementation | Define eligible learning events, prevent duplicate awards, persist award history, and let teachers/schools configure whether rewards are enabled. |
| Badges and milestone awards | V1.x | Deferred by plan; audit required | Badge criteria are explicit, awards are idempotent, and students can see why a badge was earned. |
| Learning streaks and daily/weekly challenges | V1.x or V2 | Deferred by plan | Use timezone-aware dates, avoid penalizing school holidays or lack of connectivity, and avoid manipulative engagement loops. |
| Levels, experience points, class/team challenges and leaderboards | V2 | Future | School-controlled settings, privacy protections, age-appropriate defaults, and non-public alternatives. |
| Parent-facing progress experience | V1.x | Partial scope / audit required | Secure guardian-student relationship, multilingual progress, clear last-updated time, and consent/notification preferences. |
| LINE OA messaging and webhook integration | V2 | Audit required; do not assume it exists | Account linking, webhook signature verification, retries/idempotency, delivery logs, opt-in/opt-out, and no sensitive details in unsafe messages. |
| Attendance and absence notifications | V1.x only if pilot schools require it; otherwise V2 | Audit required | Class-session attendance, authorized corrections, audit history, and parent notification preferences. |
| Official school reporting templates | V1.x pilot-specific, then V2 expansion | Audit required | Obtain the school's actual template and rules; verify exported values against gradebook records. Do not claim official compliance without school validation. |
| Advanced topic/subject mastery analytics | V2 | Partial foundations may exist; audit required | Defined mastery model, sufficient evidence thresholds, time-based trends, and clear distinction between scores and proficiency. |
| AI teacher assistant | V2 | Deferred by plan; audit required | Teacher review before publishing, curriculum alignment, source/quality checks, usage controls, and student-data safeguards. |
| AI student coach / personalized practice | V2 | Deferred by plan; audit required | Age-appropriate outputs, grounded explanations, teacher controls, privacy safeguards, and evaluation for educational quality. |
| Offline learning and synchronization | V2+ | Deferred by plan | Explicit offline scope, safe conflict resolution, duplicate-submission prevention, and visible sync state. |
| School subscriptions, licensed seats and billing | V3 | Deferred by plan; audit required | Tenant-level plans, seat counting rules, billing history, payment reconciliation, and entitlement enforcement. |
| Multi-curriculum, multilingual and multi-country expansion | V2–V3 | Foundation exists in product direction; coverage audit required | Curriculum-specific grading/reporting configuration, localization, time zones, currencies, and country-specific privacy requirements. |
| Content marketplace and third-party integrations | V3 | Deferred by plan | Content licensing/ownership, tenant isolation, integration permissions, monitoring, and support responsibilities. |

## Gamification — implementation sequence

1. **Define the rules before building UI:** eligible events, points, reversals, duplicate prevention, school/class configuration, and whether rewards are enabled.
2. **Persist the reward ledger:** awards should be traceable to the learning event that earned them; do not store only a mutable total.
3. **Deliver basic points and badges:** student view plus teacher/school configuration and an auditable award history.
4. **Add challenges and streaks only after the ledger is reliable.**
5. **Add leaderboards last and make them optional.** Avoid exposing sensitive student data or using public rankings as the default.

Gamification must reward verified learning activity rather than opening pages or repeatedly submitting the same work. Do not award points for failed, duplicate, or unverified events.

## Decisions still needed before locking the release plan

- Which official gradebook/export format does the pilot school actually require?
- Is attendance mandatory for the first pilot, or can it wait?
- Does V1 require a parent-facing portal, or are teacher-managed parent links enough for the initial test?
- Which reward rules, if any, should be enabled for the first student cohort?
- Which languages must be supported at pilot launch, and where is Thai/English switching required?
- What is the minimum backup, restore, incident-response, and child-data deletion procedure for the pilot?

## Working rule

The feature register is not a license to start every roadmap item. First verify the V1 workflow and the current implementation. For each deferred capability, inspect the active branch, migrations, services, and RLS policies before labeling it absent or planning new schema. Then implement one prioritized slice at a time and verify it end to end.


## Findings from the 2026-10-10 pilot UI walkthrough

These are observations from the teacher pages shared during manual testing. They are not substitutes for repository or database verification.

| Observation | Action |
|---|---|
| The pilot workflow's Student step is not clickable. | Improve the step so it either navigates to an existing valid student route or clearly instructs the teacher to switch to the student account. Do not add a made-up route or expose student access through teacher navigation without a security review. |
| Gradebook summary shows a 90.0% record average, while the visible finalized term grade is 95.00% and visible individual scores include 90/100 and 80/100. | Audit the calculation path before changing code. Confirm which records/categories are included, category weights, excluded or missing records, term-grade formula, rounding, and whether the summary average and finalized term grade intentionally measure different sets of records. Add a regression test for the confirmed rule. |
| Gradebook includes CSV template download, upload, export, filters, finalized state, and reopen control. | Test import validation, export/filter consistency, finalized-grade protections, reopen reason requirements, and audit history with controlled test records. |
| Assignment History contains multiple drafts and published assignments; lifecycle event panels report no events. | Verify that lifecycle events are created for actions that have occurred, and that “no events” is accurate rather than a persistence or query defect. Preserve historical attempts and results. |
| Content Library shows draft, retired, and published materials, including temporary/test content. | Confirm status filters and ensure only eligible published versions are available to students/assignments. Keep test/retired content distinguishable; do not delete records solely to clean up the view. |
| Parent links are available in teacher navigation. | Verify guardian linkage, access restrictions, and what a parent can actually view before describing the parent portal as launch-ready. |

### Immediate verification order

1. Inspect the active branch's gradebook calculation and finalization/reopen code, related services/repositories, schema/migrations, and tests.
2. Reconcile the displayed 90.0% summary and 95.00% finalized term grade against the actual records and configured calculation rules. Do not assume the difference is a bug until the definitions are known.
3. Inspect assignment lifecycle event writes and reads.
4. Inspect the pilot workflow's Student step and implement a safe, truthful navigation/help affordance using existing routes.
5. Build and run focused tests; then verify the affected pages using authenticated teacher/student accounts.
