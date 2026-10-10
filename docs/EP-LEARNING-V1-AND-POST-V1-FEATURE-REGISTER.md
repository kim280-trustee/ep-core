# E&P Learning — V1 and Post-V1 Feature Register

**Repository:** `kim280-trustee/ep-core`  
**Branch reviewed:** `paul/integrate-edna-content`  
**Review date:** 2026-10-10  
**Purpose:** Keep the V1 pilot focused while preserving the agreed post-V1 roadmap.

## Status definitions

- **Code present — verify:** Relevant source files or migrations exist; this is not proof that the complete feature works end to end.
- **Partial / needs scope check:** Some capability exists, but the complete product requirement is not established.
- **Not found in reviewed tree:** No matching implementation was identified in the reviewed branch tree. This is not a claim that no related code exists anywhere.
- **Deferred:** Deliberately not a V1 launch requirement unless the pilot school makes it essential.

## V1 core — verify before launch

| Capability | Current repository evidence | Status | V1 acceptance target |
|---|---|---|---|
| Authentication and tenant foundation | Core auth and tenant/membership architecture | Code present — verify | Correct sign-in, tenant isolation, role and membership enforcement |
| Academic structure and class membership | Learning academic/runtime migrations and class workflows | Code present — verify | Teacher and student see only their permitted classes and work |
| Content library and authoring | Learning content/authoring feature files and content migrations | Code present — verify | Create, edit, publish and reuse content without exposing unpublished versions |
| Assignment lifecycle | Assignment creation/history/runtime and lifecycle migrations | Code present — verify | Publish, assign, submit, review, reopen/reassign according to policy |
| Assessment runtime and results | Assessment runtime and assessment security migrations | Code present — verify | Student attempt is persisted and evaluated correctly; attempts/release rules enforced |
| Student progress and recommendations | `learning-dashboard` and `learning-mastery` source plus mastery/recommendation migration | Code present — verify | Real completed work drives progress and recommendations |
| Gradebook | `learning-gradebook` pages, service/repository and academic-record migrations | Code present — verify | Assessment and teacher-entered grades persist, recalculate and export accurately |
| Parent progress and linking | `learning-parent`, parent invitation function and related migrations | Code present — verify | Only a verified, authorized guardian can view the linked student's permitted progress |
| Reports | Generic `src/features/reports` engine/service/repository/pages and gradebook reports | Partial / needs scope check | Confirm required pilot reports and exports with the school; do not assume official Thai templates exist |
| Content-response grading | Student response and teacher grading migrations/features | Code present — verify | Teacher feedback/score is saved and appears correctly in the student/gradebook workflow |
| Security and data integrity | Recent assessment, content-version, assignment lifecycle, parent invitation and response-integrity migrations | Code present — verify | Apply migrations safely; test authorization boundaries and invalid transitions using normal authenticated flows |

## Post-V1 roadmap

| Feature | Branch review finding | Target | Dependencies / acceptance notes |
|---|---|---|---|
| Gamification: points, badges, achievement history | Not found in reviewed tree | V1.x | Define auditable award rules based on verified learning events; prevent duplicate rewards |
| Streaks, levels and challenges | Not found in reviewed tree | V1.x | Build after basic rewards; use school-controlled settings and age-appropriate defaults |
| Leaderboards and team competitions | Not found in reviewed tree | V2 or later | Optional by class/school; privacy controls and non-shaming alternatives required |
| Attendance | No dedicated Learning attendance feature identified in matching paths | V1.x only if pilot requires it; otherwise later | Define attendance states, correction history, class/term rules and parent visibility |
| Parent notifications and LINE OA | Parent portal/linking exists; a LINE OA/webhook integration was not identified in matching paths | V1.x / V2 | Requires verified guardian links, consent/preferences, delivery logs, retry handling and secure webhook validation |
| AI teacher assistant | No dedicated AI teacher feature identified in matching paths | V2 | Teacher-reviewed outputs; curriculum alignment, content safety and usage/cost controls |
| AI student learning coach | No dedicated AI coach feature identified in matching paths | V2 | Ground answers in approved learning material; age-appropriate safeguards and teacher/parent controls |
| School-wide analytics and proficiency trends | Gradebook, mastery and recommendations exist; full director-level analytics not established | V2 | Define proficiency metrics and aggregation rules before dashboards |
| Thai official reporting templates | Generic reporting code exists; official template coverage not established | V1 requirement discovery; then V1.x/V2 | Obtain real school templates and verify formulas, grading periods, Thai labels and exports |
| School billing and seat licensing | No dedicated Learning billing/subscription implementation identified in matching paths | V3 | Requires pricing, seat-count rules, school contracts, invoices, payment reconciliation and access policy |
| Offline learning and synchronization | No dedicated offline-learning implementation identified in matching paths | V2/V3 | Define supported offline actions, conflict resolution, queued submissions and safe sync |
| Multi-country/curriculum expansion | Reusable academic foundation exists; full country-specific workflows are not established | V3 | Configuration-driven curricula, localization, calendars, grading and privacy/legal review |

## Launch gates

Do not mark a capability as launch-ready solely because its page, service, or migration exists. Record evidence from the running app and database.

1. Build passes with no TypeScript errors.
2. Teacher creates or selects published content and publishes a complete assignment.
3. Student opens the assignment, completes content, submits an assessment and receives the correct result.
4. Progress, mastery/recommendations and gradebook reflect persisted results consistently.
5. Teacher grading of content responses persists and is visible only to authorized users.
6. Parent invitation/linking and progress access work with correct authorization boundaries.
7. Negative checks confirm students cannot access another student's private records, unpublished content, or unauthorized assignment data.
8. Required pilot reports are agreed with the school and their calculations/exports are checked against sample records.
9. Migrations are applied and verified in the target Supabase environment; no production change is assumed from source files alone.

## Next actions

1. Run the current branch locally: inspect Git status, pull once, run `npm.cmd run build`, and report exact failures if any.
2. Execute the authenticated teacher-to-student-to-gradebook pilot workflow.
3. Test parent linking/progress separately.
4. Ask the pilot school which official reports are mandatory for the first term.
5. Keep gamification and other deferred features in this register; do not implement them before V1 gates pass unless a documented pilot blocker changes the priority.

## Scope control

This register is a repository-informed planning artifact, not a claim that all listed functionality has been browser-tested. Update statuses only when supported by code inspection or reproducible runtime evidence. Do not create duplicate tables or seed data just to make a roadmap item appear complete.
