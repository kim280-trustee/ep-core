# E&P Learning — V1 and Post-V1 Feature Register

**Repository:** `kim280-trustee/ep-core`  
**Branch reviewed:** `paul/dictionary-graded-assignments-and-admin-hardening`  
**Review date:** 2026-10-17  
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
| Daily Learning Hub | Student `/learning/today` page combines due vocabulary, unfinished published assignments, recommendations and reward XP/streak into a data-derived next-action view | Code present — verify | Confirm links open the correct learner workflows, vocabulary errors do not hide assignments, and counts match persisted records; the daily plan is derived rather than stored as a checklist, and vocabulary currently follows the first active student organization |
| Teacher gradebook and grading | Gradebook service/repository/pages and academic-record migrations | Code present — verify | Assessment and teacher-entered grades reconcile; finalization/reopen and audit history behave correctly |
| Gradebook reports/export | Gradebook report page and CSV export | Partial; report selection/export hardening added in this branch | Term and subject are selectable; only finalized grades are ranked/averaged; CSV is correctly escaped; school format still needs approval |
| Parent links and progress | Parent feature, invitations, progress page, authorized vocabulary summary, persisted badge summaries, and persisted EN/TH portal language preference | Code present — verify; new migrations not applied | Invitation acceptance, revocation, vocabulary aggregates and earned badges are visible only to the linked parent; test with separate parent/student accounts and unrelated tenants |
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
| Basic gamification: points, achievement history | Existing reward ledger, XP levels and streak summary are present; the dashboard now adds evidence-derived achievement milestones and a daily mini quest | Partial; implementation present, runtime/security behavior unverified | Keep XP sourced from the persisted reward ledger; verify rewards are idempotent and derived only from trusted events; define correction/reversal policy |
| Badges and milestones | Four rule-versioned badge types are now persisted in `learning_badge_awards`; a self-scoped RPC awards them idempotently from validated lesson completions and evaluated assessment results | Code present — verify; migration not applied | Apply the forward migration, then verify awards persist across sessions, duplicate RPC calls do not duplicate rows, and another student cannot read or create awards |
| Streaks, levels and challenges | Persisted XP level and learning-streak summaries exist; dashboard now shows a daily mini quest based on distinct verified completions | Partial | Validate school timezone/day boundaries, holidays and duplicate evidence; add challenge configuration only after reward rules are approved |
| Leaderboards and team competitions | No dedicated implementation found | V2 | Optional, teacher-controlled, private by default, age-appropriate and non-shaming alternatives |
| Attendance register, history and school-wide report | Code present on the integration branch; SQL report RPC and school-wide report page added in this batch | Implemented but unverified | Apply the forward migrations, then verify manager scope, date limits, saved-mark counts, CSV safety and cross-tenant denial |
| Parent notifications and LINE OA | Parent portal/linking exists; no dedicated LINE OA/webhook integration found | V1.x/V2 | Verified account linking, consent/preferences, signature validation, idempotency, retries, delivery logs and opt-out |
| AI teacher assistant | Teacher-only draft generator for lessons, worksheets, quizzes and lesson plans; server-side OpenAI Responses API call; generated drafts are not persisted or published; disabled unless `AI_TEACHER_ASSISTANT_ENABLED=true`; database RPC maps the authenticated account to the Learning profile, validates active teacher membership, and atomically reserves a hard-coded maximum of 10 requests per rolling 24 hours per teacher | Implemented in code — migration `20261018020000_learning_ai_usage_limits.sql` is not applied; provider calls and authenticated access still require verification | Apply/review the migration; test active/inactive teacher access, cross-tenant denial, concurrent quota reservations, limit reset, disabled/missing-key/provider-failure states; review provider budgets before enabling broadly |
| AI student coach and personalized practice | Added `/learning/coach` and `learning-student-ai-coach` Edge Function. It uses a selected published school content item as context, provides hint-led practice, does not save prompts/responses, and enforces a fixed five-request rolling 24-hour student quota through an enrollment-checked RPC. Feature is disabled by default with `AI_STUDENT_COACH_ENABLED` and requires server-side `OPENAI_API_KEY`. | Partial — code added; migration `20261018030000_learning_student_ai_coach.sql` is not applied; provider and authenticated browser behavior not verified | Review and apply the migration; verify published-content access, active enrollment, cross-tenant denial, concurrent quota reservations, disabled/missing-key/provider-failure states, child-safe responses, Thai/English output, and data minimization before enabling |
| School-wide analytics and proficiency trends | Attendance aggregates/report are now present; director-level academic proficiency trends remain unestablished | Partial | Define proficiency thresholds, term/cohort calculations and permissions before adding academic performance dashboards |
| Official Thai reporting templates | Generic reports exist; official school templates not verified | V1 only for school-mandated blockers, otherwise V1.x/V2 | Obtain the actual school's forms/rules and compare formulas, labels, rounding and exports to approved examples |
| Billing and licensed seats | No dedicated Learning subscription/billing feature found | V3 | Tenant plans, seat-count rules, invoices, payment reconciliation, entitlements and support workflows |
| Offline learning/synchronization | No dedicated offline-learning implementation found | V2/V3 | Explicit offline scope, queued writes, conflict resolution, sync visibility and duplicate-submission prevention |
| Multi-country/curriculum expansion | Reusable academic and tenant foundations exist; country workflows are not established | V2/V3 | Configuration-driven curricula, language, calendars, grading, currency, local reporting and legal/privacy review |
| Teacher Marketplace and Extra Classes | Marketplace supports published tutoring offers, individual/group formats, online/in-person/hybrid delivery, package pricing, grade levels, parent/student lesson requests, teacher accept/decline responses, recurring weekly availability, and teacher profile bios/languages/qualifications. School owners/managers can review profiles in their own organization; profile edits reset review status to pending. Public listings show a school-reviewed badge only after manager approval. | Partial — profile, review and availability code present; migrations, CI and end-to-end authorization verification required. Availability is informational and does not confirm a booking; school review is not independent identity verification. | Next: date-specific availability and conflict-safe confirmed scheduling, payment/commission/refund/payout integration, reviews/disputes, school partnerships, safeguarding workflow and audit reporting |
| Content marketplace/third-party integrations | No Learning content marketplace scope verified | V3 | Licensing/ownership, tenant isolation, integration permissions, monitoring and support ownership |

## Gamification implementation order

1. **Specify rules first:** eligible event types, reward amounts, duplicate/reversal behavior, school/class settings, and whether rewards are enabled.
2. **Build a ledger, not just a points total:** each award must reference the trusted learning event, student, rule/version and timestamp; protect against duplicate event delivery.
3. **Add basic points and badges:** student achievement history plus teacher/school configuration and auditability.
4. **Add streaks/challenges after the ledger is reliable:** account for timezone, holidays and legitimate offline use.
5. **Add leaderboards last and make them optional:** do not expose child rankings publicly by default.

Do not implement attendance, AI, LINE, billing, offline sync or marketplace workflows as superficial UI-only features. They need their own requirements, data model, authorization, failure handling and acceptance tests. The current achievement display is evidence-derived, but it is not yet a persisted badge-award system.

## Current known limitations / next work

- The repository contains four competing feature-register documents. This root-level document is canonical; the other three point here to prevent roadmap drift.
- Gradebook report previously hard-coded the first term and first subject and could rank draft grades. This branch now adds term/subject selection, finalized-only average/ranking, loading/error/empty states and CSV escaping/UTF-8 handling. Local build and browser verification are still required.
- Parent invitation redirect timer is now cleaned up on unmount; invitation acceptance still requires authenticated integration testing.
- Parent portal EN/TH preference now persists per authenticated profile through explicit language-preference RPCs; apply `20261018000000_learning_parent_language_preferences.sql` and verify persistence across reloads/devices plus rejection of unsupported languages.
- The gradebook summary average versus finalized term-grade discrepancy observed during the pilot must be reconciled against category weights, included/excluded entries, overrides, missing work and the finalized-grade policy before changing the underlying calculation.
- Assignment lifecycle event panels showing no events need verification against real action history.
- The school must confirm whether attendance and any official report template are V1 blockers.
- Gamification now includes a persisted badge-award ledger in code; the migration is not applied and authenticated idempotency/RLS checks remain outstanding.
- Marketplace booking requests are now implemented as a first slice; requests are not confirmed bookings and no payment is collected. Teacher identity verification, calendar/availability, payment/commission/refunds/payouts, reviews/disputes, and full safeguarding workflows remain unimplemented.
- Student AI coaching is also disabled unless `AI_STUDENT_COACH_ENABLED=true`; it uses published content visible to the authenticated student and stores only quota metadata, not the student's question or response. The student quota migration must be reviewed/applied and negative authorization/provider-failure tests completed before enabling.
- AI teacher drafting remains disabled unless `AI_TEACHER_ASSISTANT_ENABLED=true`; live generation also requires the server-side `OPENAI_API_KEY` secret. A forward migration now adds a durable per-teacher rolling 24-hour cap of 10 generation attempts, and the Edge Function reserves quota before calling the provider. The migration is not applied; test active teacher identity mapping, cross-tenant denial, concurrency, provider failures and quota reset before enabling. Generated drafts are not persisted or auto-published; teachers must review them. No student personal data should be entered. Do not claim student AI coaching, LINE, offline sync, school billing or director analytics are implemented without dedicated code and acceptance evidence.

## Execution order

1. Pull this branch once and run `npm.cmd run build` and `npm.cmd run lint`; resolve errors before feature work.
2. Complete the authenticated teacher → student → result → progress → gradebook journey.
3. Test parent invitation/linking and negative access cases.
4. Reconcile gradebook calculations and lifecycle-event history against persisted records.
5. Get the pilot school's required report template and decide whether attendance is a launch blocker.
6. Only after V1 passes, implement basic gamification as the first engagement slice, then prioritize parent messaging/attendance from school feedback.
7. Keep AI, billing, offline synchronization and multi-country expansion behind explicit product and security gates.

**Scope rule:** Source inspection and compilation are not runtime verification. Change a status to “Verified” only with reproducible authenticated evidence. Never bypass RLS or add permissive policies just to make a workflow pass.
