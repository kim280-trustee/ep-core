# E&P Learning — V1 and Post-V1 Feature Register

**Branch reviewed:** `paul/integrate-edna-content`  
**Purpose:** Keep V1 launch scope stable while tracking deferred capabilities.  
**Status note:** This is an initial source-code register, not a runtime acceptance report. A clean build confirms compilation, not production behavior. Items marked “not verified” require a focused code/database/browser check before being called complete or absent.

## Status definitions

- **Implemented — source evidence:** Relevant route or implementation was found; end-to-end behavior still needs verification.
- **Partial / limited:** Some capability exists, but scope or workflow is incomplete.
- **Not found in reviewed scope:** No supporting implementation was identified in the files reviewed. This is not a claim that the entire repository has been exhaustively searched.
- **Deferred:** Intentionally outside the first pilot unless school requirements make it a blocker.

## V1 — pilot learning workflow

| Capability | Initial status | Evidence / remaining acceptance check | Release |
|---|---|---|---|
| Teacher dashboard and class workspace | Implemented — source evidence | Teacher routes include dashboard and class workspace; verify with a real teacher account and assigned class. | V1 |
| Content library and authoring | Implemented — source evidence | Teacher content list/create/detail and authoring routes exist; verify save, publish, and published-version behavior. | V1 |
| Question bank and assessment authoring | Implemented — source evidence | Question bank route exists; verify create/edit/reuse and publishing. | V1 |
| Assignment creation, publication and history | Implemented — source evidence | Assignment creation and class assignment history routes exist; verify publish, targets, due dates, reopen/reassign behavior. | V1 |
| Student assignment and content runtime | Implemented — source evidence | Student routes include assignment list/detail and content runtime; verify only published content is served. | V1 |
| Assessment attempt, submission and results | Implemented — source evidence | Assessment runtime route exists; verify answers persist, scoring is correct, duplicate submissions are handled, and results are visible. | V1 |
| Student progress and mastery | Implemented — source evidence | Progress page reads mastery, events, assignments, progress and assessment results; verify calculations against known records. | V1 |
| Learning recommendations | Implemented — source evidence | Recommendations page supports completion/dismissal and links to relevant activities; verify recommendation generation and access controls. | V1 |
| Teacher gradebook | Implemented — source evidence | Gradebook and student performance routes exist; verify calculations and teacher grading persistence. | V1 |
| Gradebook report and CSV export | Partial / limited | Report page supports print and CSV export, but currently selects the first term and first subject rather than offering explicit selectors. Verify exported values and school requirements before pilot sign-off. | V1 essentials; broader reporting later |
| Gradebook settings | Implemented — source evidence | Settings route exists; verify saved configuration and its effect on grades. | V1 |
| Parent/student relationship links | Partial / limited | Teacher page supports parent links and invitations through the parent service. Verify invitation delivery, guardian consent/identity checks, access boundaries and revocation. LINE OA integration is not verified. | Basic access V1; advanced communication later |
| Thai official report templates | Not verified | Confirm the exact pilot school's required forms, grading conventions, academic-year handling and export formats with school staff. | V1 only if required by pilot |
| Authentication, tenancy and RLS | Not verified by this UI review | Review policies and repositories, then test teacher/student/guardian access using separate authenticated accounts. Never treat a clean build as proof of isolation. | V1 blocker |
| Error, loading and empty states | Partially reviewed | Some reviewed pages include loading/error states; conduct a route-by-route failure and empty-data pass. | V1 |
| Mobile and low-bandwidth usability | Not verified | Test actual phone viewport, slow network, retries and large content. | V1 baseline |

## Post-V1 roadmap

| Capability | Initial status | Scope | Target |
|---|---|---|---|
| Gamification — points and badges | Not found in reviewed scope; confirm with repo-wide audit | Award rules tied to verified learning events, achievement history, teacher/school controls and anti-duplication rules. | V1.x |
| Gamification — streaks, levels and challenges | Deferred | Personal goals, weekly challenges and experience levels; avoid rewarding empty app opens or excessive screen time. | V1.x / V2 |
| Class/school leaderboards | Deferred | Optional and teacher-controlled; privacy-safe defaults and no public exposure of children's identities. | V2 |
| Attendance | Not verified | Class attendance, late/absent status, correction audit and guardian notification. Confirm pilot requirement before deferring. | V1 if required; otherwise V1.x |
| Parent communication and LINE OA | Not verified | Verified guardian linking, opt-in, webhook verification, delivery/retry logs, multilingual messages and child-data safeguards. | V1.x / V2 |
| AI teacher assistant | Not found in reviewed scope; confirm with repo-wide audit | Lesson plans, question generation and assessment drafts with teacher review and source/quality controls. | V2 |
| AI student learning coach | Not found in reviewed scope; confirm with repo-wide audit | Age-appropriate guided practice and explanations grounded in approved learning content. | V2 |
| Advanced proficiency analytics | Partial foundation may exist through mastery; full scope not verified | Define proficiency standards, trends by topic/subject/class and evidence behind every metric. | V2 |
| School director dashboards | Not verified | Cross-class performance, participation, intervention needs and exportable summaries with role-based access. | V2 |
| Billing and seat licensing | Not found in reviewed scope; confirm with repo-wide audit | Subscription plans, licensed-seat counts, school invoices, payment status and entitlement enforcement. | V3 |
| Offline learning and sync | Not found in reviewed scope; confirm with repo-wide audit | Explicit offline-capable activity scope, queued writes, conflict handling and sync visibility. | V3 |
| Multi-country expansion | Foundation needs audit | Configurable country, curriculum, grade, language, currency, academic calendar and grading/report rules. | V3 |
| Content quality and licensing governance | Not verified | Ownership/licensing metadata, review/publish workflow, accessibility, age appropriateness and content version lifecycle. | V1 baseline; expand later |
| Privacy, safeguarding and retention | Not verified by this UI review | Guardian consent, data minimization, retention/deletion, auditability and child-safe defaults. | V1 blocker |

## Recommended order

1. Complete the repository-wide inventory for gamification, attendance, LINE/notifications, AI, director analytics, billing, offline support and privacy/retention.
2. Verify the V1 teacher → publish assignment → student completes content/assessment → results/progress → gradebook path with separate authenticated accounts.
3. Confirm the pilot school's mandatory Thai reports and attendance requirements; promote any true launch blockers into V1.
4. Freeze V1 scope once acceptance checks pass. Implement post-V1 work as separately scoped features with migrations only when justified by a concrete data requirement.
5. Start gamification with points/badges based on idempotent, verified learning events; design the event and award rules before building leaderboard UI.

## Definition of done for this register

For every row, record: implementation links, database tables/policies if applicable, runtime test evidence, owner, dependencies, acceptance criteria, and target release. Change a feature to “complete” only after its acceptance criteria are verified—not merely because its route exists or the build passes.
