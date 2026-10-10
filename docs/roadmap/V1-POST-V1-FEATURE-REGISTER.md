# E&P Learning — V1 and Post-V1 Feature Register

**Repository:** `kim280-trustee/ep-core`  
**Branch:** `paul/integrate-edna-content`  
**Purpose:** Keep V1 launch requirements separate from deliberately deferred features and prevent duplicate implementation.

## Status definitions

- **Implemented — code present:** relevant routes or code paths were found; this is not proof of end-to-end runtime correctness.
- **Partial:** a related capability exists, but the complete workflow or required integration has not been verified.
- **Unverified:** code presence or runtime behavior has not yet been established by this audit.
- **Deferred:** intentionally excluded from V1 unless the pilot school identifies it as a launch blocker.

> This is an initial evidence-based register, not a claim that every repository file, migration, or production integration has been exhaustively inspected. Build cleanliness confirms compilation, not business-workflow correctness.

## V1 — pilot learning workflow

| Capability | Initial status | V1 acceptance requirement |
|---|---|---|
| Authentication and tenant/class access | Implemented — code present; runtime unverified | Teacher and student access is scoped correctly to their organization, membership, class and assignment. |
| Academic structure and class membership | Implemented — code present; runtime unverified | Pilot curriculum, subject, class and membership data load through normal authenticated paths. |
| Content library and authoring | Implemented — routes/pages present; runtime unverified | Teacher can create/edit content, publish it, and the student runtime only serves a published version. |
| Question bank and assessment authoring | Implemented — routes/pages present; runtime unverified | Teacher can select or create questions and publish a valid assessment. |
| Assignment creation, publishing and history | Implemented — routes/pages present; runtime unverified | Published assignment has the intended content/assessment; history, reopen and reassignment behavior is tested. |
| Student content and assessment runtime | Implemented — routes/pages present; runtime unverified | Student can open assigned content, submit answers, and receive a persisted result without duplicate submissions. |
| Results, progress and recommendations | Implemented — feature pages/services exist per project review; end-to-end unverified | A completed attempt updates progress and recommendations consistently with persisted results. |
| Teacher gradebook and student profile | Implemented — routes/pages present; runtime unverified | Assessment results and teacher-entered grades are accurate, access-controlled and auditable. |
| Gradebook CSV export and reporting | Partial | CSV export is present in the gradebook code; validate encoding, values, filters and required pilot-school report formats. |
| Parent links/progress access | Partial | Teacher parent-link page exists; verify guardian linking, authorization and what a guardian can see. |
| Security, RLS and tenant isolation | Unverified in this feature audit | Test representative allowed and denied access with real authenticated teacher, student and guardian accounts. |
| Thai localization and official school reporting | Unverified | Confirm required Thai/English labels, local academic conventions, date handling and actual school-mandated export templates with the pilot school. |
| Operational recovery and support | Unverified | Document backup/recovery responsibility, failure visibility and a basic support process before real student use. |

## Post-V1 roadmap

| Feature | Release target | Initial status | Scope / release gate |
|---|---|---|---|
| Gamification — points and badges | V1.x | Deferred; no dedicated gamification route verified in the reviewed teacher routes | Award points from trusted learning events; badge criteria, award history, idempotency and teacher controls. |
| Gamification — streaks, levels and challenges | V1.x / V2 | Deferred | Add only after event definitions and basic rewards are reliable; avoid rewarding empty page opens. |
| Class leaderboards and competitions | V2 | Deferred | Optional and teacher-controlled; include privacy and student-wellbeing safeguards. |
| Attendance management | V1.x if pilot requires it; otherwise V2 | Partial/unverified; gradebook includes absent/excused statuses, but a dedicated attendance workflow has not been verified | Attendance sessions, present/absent/late/excused states, correction history and any approved guardian notifications. |
| Parent messaging and LINE OA | V1.x / V2 | Partial/unverified; parent-link page exists, LINE integration not verified | Secure guardian identity linking, webhook verification, delivery logs, consent and multilingual message templates. |
| Advanced mastery and school analytics | V2 | Partial; progress/recommendations and class performance exist, full school analytics unverified | Define proficiency and mastery calculations before presenting comparisons or school-level conclusions. |
| AI student learning coach | V2 | Unverified; not confirmed in reviewed routes | Age-appropriate, curriculum-grounded practice with safety, privacy and teacher escalation controls. |
| AI teacher assistant | V2 | Unverified; not confirmed in reviewed routes | Generate editable lesson materials/questions with teacher review and content-quality checks. |
| Official reporting templates | V1 if required by pilot; broader configurability V2 | Unverified | Obtain real sample forms from the pilot school; validate every required field and calculation against them. |
| School billing and seat licensing | V3 | Deferred/unverified | Subscription, licensed-seat counts, billing status, school onboarding and payment reconciliation. |
| Offline learning and synchronization | V3 | Deferred/unverified | Define supported offline activities, conflict rules and secure synchronization before implementation. |
| Additional countries/curricula/languages | V2–V3 | Foundation exists; expansion not verified | Keep curriculum, grading, localization and school rules configurable; test a second curriculum before claiming portability. |

## Recommended delivery order

1. **Finish V1 verification:** teacher publishes a real content-plus-assessment assignment; student completes it; persisted results flow to progress/recommendations and gradebook.
2. **Close pilot blockers:** tenant/RLS checks, guardian access boundaries, required school reports, and operational support.
3. **Confirm feature status:** inspect actual implementations and database migrations for each unverified item; distinguish shipped code from UI placeholders and planned work.
4. **Define gamification contracts:** agree on qualifying events, points, badge rules, duplicate-event handling, resets, teacher controls and privacy before designing screens or adding tables.
5. **Implement basic gamification only after the V1 workflow is accepted.** Add streaks, competitions and leaderboards later, based on pilot feedback.

## Verification notes

- The teacher route file on this branch includes pages for the dashboard, class workspace, content library/create/detail, authoring, question bank, assignment history, parent links, gradebook, gradebook settings/reports, student performance and content responses.
- The assessment runtime imports assignment, activity and assessment services.
- The gradebook page imports the gradebook service and exposes grade-related statuses including absent and excused.
- These are code-presence findings only. A clean build does not demonstrate live database behavior, authorization correctness, external integrations, or end-to-end acceptance.
