# Thai Curriculum — Consolidated Import and Acceptance Test Plan

**Implementation branch:** `paul/subject-rollout`  
**Pull request:** [#174](https://github.com/kim280-trustee/ep-core/pull/174) (draft; not merged)  
**Purpose:** One coordinated application test after all curriculum source packs and catalogue work are complete.  
**Current rule:** Complete repository-side implementation and automated verification without provisioning staging. Do not repeatedly test the authenticated application after each subject. Do not import or publish these packs to the live pilot school. Staging is intentionally deferred and is not a blocker to closing the source-pack and repository implementation work.

## 1. National 2008/2017 curriculum — source and import totals

The national master contains 2,056 unique required indicators across the eight learning areas and 2,450 required grade alignments. The 39 source packs contain 2,056 unique lesson sections and 6,168 source formative questions. Shared M4–M6 outcomes expand during import, so the expected grade-specific draft total is 2,450 lessons and 7,350 questions.

| Learning area | Unique source indicators / lessons | Shared M4–M6 outcomes | Expected grade-specific draft lessons | Expected question drafts |
|---|---:|---:|---:|---:|
| Thai Language | 319 | 36 | 391 | 1,173 |
| Mathematics | 157 | 0 | 157 | 471 |
| Science and Technology core | 415 | 0 | 415 | 1,245 |
| Social Studies | 418 | 61 | 540 | 1,620 |
| Health and Physical Education | 221 | 29 | 279 | 837 |
| Arts | 279 | 39 | 357 | 1,071 |
| Occupations and Career | 54 | 11 | 76 | 228 |
| Foreign Languages | 193 | 21 | 235 | 705 |
| **Total** | **2,056** | **197** | **2,450** | **7,350** |

Shared outcomes are counted once in the source pack and three times in the grade-specific draft total. The 197 shared outcomes therefore add 394 draft lesson rows and 1,182 question rows. The expected 2,450 draft lessons equal the 2,450 required national-master grade alignments.

## 2. Separate curricula and course tracks

These resources are deliberately not added to the eight-area national-master totals:

| Separate scope | Source outcomes / lessons | Answer-keyed questions | Boundary |
|---|---:|---:|---|
| B.E. 2568 (2025) P1–P3 competency framework | 24 annual outcomes | 72 | Separate draft curriculum; not a replacement for the 2008/2017 subject indicators |
| Upper-secondary Science specialists | 300 | 900 | Biology, Chemistry, Physics and Earth/Space remain separate subject tracks |
| Cambridge Click Start Computer Studies | 41 | 123 | Separate international course; not a substitute for national Science and Technology |

Thai Studies is outside this rollout and must not be reported as complete.

## 3. One consolidated application test — approval-gated

These steps describe a separate future authenticated acceptance pass; they are not part of the repository-side completion gate. Source-pack, parser, importer-contract, build and lint checks are completed through CI. The owner has chosen to finish without staging, so no staging organization, class or test accounts will be created. Do not substitute the live pilot school or real learner records as test fixtures.

### A. Teacher access and academic selectors

- (Deferred) Sign in as an authorized teacher in an isolated test organization, if authenticated acceptance is commissioned later.
- Confirm the intended curriculum, grade and subject selectors load without errors.
- Confirm each selected subject is available for the selected curriculum.
- Confirm grade lists match the curriculum version and do not silently fall back to another grade.
- Confirm the importer blocks a pack if its objective code is missing, duplicated, unknown or not aligned to the selected grade.

### B. Pack preview and grade mapping

- Preview the 39 national source packs and the separate 2025, specialist Science and Computer Studies packs.
- Compare source lesson counts and question counts with the tables above.
- Confirm all 197 shared M4–M6 source outcomes each expand to exactly three grade-specific records (591 grade-scoped records in total), with no cross-grade code collisions.
- Confirm grade-specific outcomes resolve to exactly one grade.
- Confirm the imported objective code, official Thai indicator wording, lesson title, learning outcome, practical activity and teacher guidance are preserved.
- Confirm each imported question has a distinct grade-scoped import code where shared outcomes expand.

### C. Draft import and resumability

- (Deferred) If a separate isolated test environment is later authorized, import as unpublished drafts only.
- Verify the final national totals: 2,450 grade-specific lesson drafts and 7,350 question drafts.
- Verify the 2025 framework remains separate at 24 outcomes / 72 questions.
- Verify the four Science specialist tracks remain separate at 300 outcomes / 900 questions.
- Verify Computer Studies remains a separate 41-lesson / 123-question course.
- Repeat an import to confirm complete lesson groups are skipped safely without creating duplicates.
- Simulate or inspect a partial lesson/question group and confirm the importer stops with a clear diagnostic rather than overwriting or guessing.
- Confirm answer keys remain protected and are not exposed as learner-visible prompt text.

### D. Teacher review and student learning flow

- Open an imported draft as a teacher and verify the content and answer key can be reviewed.
- Publish only selected test content inside the staging organization.
- Assign a test activity to a staging student account.
- Complete a student submission and confirm the learner sees the prompt but not the protected answer key.
- Review the submission as a teacher, provide feedback and verify the score/evidence is recorded against the correct objective, subject, grade, curriculum and term.
- Confirm gradebook and progress reporting reflect the test activity without crossing class, term or student boundaries.

### E. Final safety and integrity checks

- Confirm no duplicate content or question import codes were created.
- Confirm no objective is linked to a grade outside its official alignments.
- Confirm shared M4–M6 content has three distinct grade-specific records and no cross-grade collision.
- Confirm no draft was published automatically.
- Confirm no live pilot school, class, student, assignment or progress record was modified.
- Record any failures and fix them before approving rollout.

## 4. Acceptance gates

| Gate | Required result |
|---|---|
| Catalogue coverage | 2,056 unique required indicators / 2,450 required alignments; zero unclassified required rows |
| Source packs | All 39 national packs and all separate packs pass their dedicated parser/structure validators |
| Shared-grade expansion | 197 shared outcomes expand to 591 grade-specific lesson rows; no code collisions |
| National draft import | Deferred: no staging import is performed in this repository-only completion |
| Separate curriculum boundaries | 2025, specialist Science and Computer Studies totals remain separate |
| Answer-key protection | Learner cannot access protected evaluation keys |
| Teacher/student workflow | Preview, draft review, controlled publication, student submission, teacher review and progress all pass |
| Data safety | No live pilot or real learner records are changed during testing |

## 5. Automated checks already run during implementation

The GitHub Actions workflow runs the 39-pack national validator, the Thai Language/Career parser checks, the 2025 competency validator, consolidated Science and specialist Science validators, secondary and primary Mathematics validators, Computer Studies validator, and parser validators for Social Studies, Health/PE, Arts, Foreign Languages and Thai Language. It then runs the production build and ESLint.

These automated checks validate source structure, parser compatibility, objective-code uniqueness, answer-key presence and grade mapping. The shared parser also has a regression fixture for Social Studies packs where a Thai-only official-indicator line precedes the explicit objective-code line. All curriculum source validators, production build and ESLint passed in PR workflow `45140943548` on commit `6a259f6b92b70fe2adb5ab248d894d400065f0c9`. The workflow completed successfully. These checks do not claim that authenticated database import or teacher/student application acceptance has occurred.

## 6. Release boundary

PR #174 remains open and in draft. Do not merge, activate curricula, publish content or import into the live school automatically. Repository-side implementation and automated verification are complete on the current branch. Authenticated import, protected-answer-key runtime verification, and teacher/student workflow acceptance remain explicitly deferred because staging is not being provisioned. This is a known release limitation, not an unfinished repository task.

No Supabase migration is applied by this completion batch; no curriculum data is seeded; no staging organization, class or user is created; and no live school or learner record is changed. If authenticated acceptance is commissioned later, it must use a separately authorized isolated environment and follow sections A–E.