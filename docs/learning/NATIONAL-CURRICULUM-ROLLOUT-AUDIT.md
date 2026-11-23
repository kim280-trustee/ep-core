# Thai National Curriculum — P1–M6 and Early-Primary 2025 Rollout Audit

**Repository:** `kim280-trustee/ep-core`  
**Branch:** `paul/subject-rollout`  
**Audit date:** 21 November 2026  
**Implementation status:** All eight B.E. 2551 (2008), revised B.E. 2560 (2017), learning-area catalogues are complete. The separate B.E. 2568 (2025) P1–P3 competency framework is now seeded as a draft. Consolidated authenticated application testing is intentionally deferred until curriculum source work is complete.

## 1. Eight learning areas — 2008/2017 national core

| National learning area | Subject code | Unique official indicators | Grade alignments | Teacher resources |
|---|---|---:|---:|---|
| Thai Language | `THAI-LANGUAGE` | 319 | 391 | 319 lessons / 957 formative tasks |
| Mathematics | `MATH` | 157 | 157 in national master; 157 additional grade alignments across the primary and secondary Maths-specific catalogues | 157 lessons / 471 answer-keyed questions |
| Science and Technology | `SCI` | 415 | 415 in national master; 276 in canonical secondary catalogue | 415 core lessons / 1,245 formative tasks |
| Social Studies, Religion and Culture | `SOCIAL-STUDIES` | 418 | 540 | 418 lessons / 1,254 assessment stems |
| Health and Physical Education | `HEALTH-PE` | 221 | 279 | 221 lessons / 663 formative tasks |
| Arts | `ARTS` | 279 | 357 | 279 lessons / 837 assessment prompts |
| Occupations and Career | `CAREER` | 54 | 76 | 54 lessons / 162 answer-keyed questions |
| Foreign Languages | `FOREIGN-LANGUAGES` | 193 | 235 | 193 lessons / 579 formative tasks |
| **Total** | **8 learning areas** | **2,056** | **2,450** | **2,056 lessons / 6,168 tasks and prompts** |

Mathematics now has 157 unique P1–M6 indicators and 157 grade alignments in the national master: 116 primary and 41 secondary. The same objectives are also retained in two separate Maths-specific catalogues (116 primary and 41 secondary alignments), adding 157 catalogue-view alignments but no additional unique national indicators. Do not add those duplicate views to the national-master totals.

### Official-indicator required-flag reconciliation

A live database audit found that 839 official grade alignments in six learning areas had been marked `required=false` because their Must-Know / Should-Know priority had been treated as curriculum inclusion. This was incorrect: Should-Know indicators remain official curriculum indicators, and Social Studies also contains official pathway-classified indicators without a priority label.

Migration `20261121052847_mark_official_2008_learning_area_indicators_required.sql` changed only the required flag for 839 affected official alignments: Thai Language 68, Social Studies 405, Health and Physical Education 140, Arts 146, Career 39 and Foreign Languages 41. All original priority and pathway classifications were preserved. The subsequent primary Mathematics seed added 116 required indicators and grade alignments, already classified 82 Must-Know and 34 Should-Know. Current live verification therefore returns 2,056 required unique indicators, 2,450 required grade alignments and zero rows with both priority and pathway classifications missing. The nine legacy M3 W3.2 Science supplementary outcomes remain non-required.

Science's 415 core indicators are separate from 300 additional M4–M6 specialist outcomes across Biology, Chemistry, Physics and Earth/Space. Those specialist outcomes remain in their own subject tracks and are not part of the 415 national Science core total.

## 2. Science and Technology — closed curriculum gap

OBEC's 2021 source reports 415 unique core indicators:

| Grade | Indicators | Priority reconciliation |
|---|---:|---|
| P1 | 15 | 9 Must, 6 stored Should + 1 dual |
| P2 | 16 | 11 Must, 5 stored Should + 1 dual |
| P3 | 25 | 19 Must, 6 stored Should + 1 dual |
| P4 | 21 | 16 Must, 5 stored Should + 1 dual |
| P5 | 32 | 24 Must, 8 Should |
| P6 | 30 | 20 Must, 10 stored Should + 1 dual |
| M1 | 52 | 35 Must, 17 Should |
| M2 | 63 | 48 Must, 15 Should |
| M3 | 59 | 41 Must, 18 Should |
| M4 | 28 | 19 Must, 9 Should |
| M5 | 49 | 42 Must, 7 Should |
| M6 | 25 | 24 Must, 1 stored Should + 1 dual |
| **Total** | **415** | **308 Must / 107 stored Should + 6 dual Should labels = 113 Should classifications** |

All 415 required official core indicators are present in the draft national master curriculum. The canonical secondary Science catalogue contains all 276 M1–M6 core indicators. The nine legacy M3 W3.2 outcomes remain non-required supplementary material and are excluded from the official core count.

The 102 upper-secondary core indicators are grade-specific: M4 28, M5 49, M6 25. They are not copied as 102 indicators into each grade. The six dual-classified exceptions across the full core are preserved in catalogue notes.

Teacher-pack coverage: 139 primary, 174 M1–M3 and 102 M4–M6 core lessons, for 415 unique objective codes and 1,245 formative tasks. The 300 specialist upper-secondary lessons remain separate.

Audit and read-only SQL: `science/SCIENCE-CORE-CURRICULUM-GAP-AUDIT.md`, `science/M4-M6-SCIENCE-CORE-SOURCE-AUDIT.md`, and `science/SCIENCE-STAGING-VERIFICATION.sql`.

## 3. Separate B.E. 2568 (2025) P1–P3 competency framework

The official OBEC early-primary curriculum is competency-based and is not a replacement set of eight subject indicators. It is published for schools that are ready and voluntarily adopt it.

The catalogue keeps it separate under `TH-PRIMARY-2025-P1-P3` and represents:

- Three foundational capabilities: Reading Literacy, Writing Literacy and Numeracy.
- Five functional-literacy capabilities: Science/Environment/Technology; Society/Citizenship; Economy/Finance; Physical/Mental Health; Arts/Culture for Aesthetics.
- Eight annual outcomes per grade: P1 8, P2 8, P3 8 — 24 total.
- Twenty-four grade-specific illustrative knowledge topics from official section 8.
- Five cross-cutting desirable characteristics, not a ninth annual capability.
- Twenty-four exact grade alignments and 72 E&P-authored formative questions.

The integrated subject in E&P is an internal navigation grouping only; it is not an official OBEC subject. E&P-generated codes such as `P1-TH68-READ-01` are internal identifiers, not official OBEC indicator codes. The curriculum remains draft and has not been activated for a school.

Audit and pack: `thai-primary-2025/THAI-PRIMARY-2025-CURRICULUM-AUDIT.md` and `thai-primary-2025/TH-PRIMARY-2025-P1-P3-COMPETENCY-IMPORT.md`.

## 4. Source-pack and automated validation

The eight 2008/2017 learning areas have 39 teacher-pack files covering 2,056 unique official objective codes. The cross-curriculum validator checks expected pack counts, grade-section or indicator-list coverage, one unique objective code per lesson where the pack is lesson-structured, and cross-pack duplicates.

- `npm run validate:national-curriculum-packs` — all 39 source packs across the eight learning areas, 2,056 unique official objective codes.
- `npm run validate:thai-career-packs` — actual TypeScript importer-parser checks for Thai Language (319 lessons / 957 tasks) and Career (54 / 162), including shared-grade expansion.
- `npm run validate:thai-language-packs` — dedicated Thai Language validation of all 319 objective codes, exact official Thai indicator wording in every task and all 957 answer-keyed tasks.
- `npm run validate:maths-packs` and `npm run validate:maths-primary-packs` — actual parser validation of all 157 Mathematics lessons (116 primary and 41 secondary) and 471 answer-keyed questions.
- `npm run validate:science-packs` — actual parser validation of 276 consolidated secondary Science lessons and 828 answer-keyed questions; the national validator also covers all 415 core Science objectives.
- `npm run validate:social-studies-packs` — actual parser validation of 418 indicators and 1,254 tasks, checking each task includes its exact official Thai indicator and shared M4–M6 grade expansion.
- `npm run validate:health-pe-packs`, `npm run validate:arts-packs` and `npm run validate:foreign-languages-packs` — actual parser checks of 221/663, 279/837 and 193/579 respectively, including shared upper-secondary grade expansion.
- `npm run validate:thai-2025-packs` — validates 24 annual outcomes, P1/P2/P3 grade mapping and 72 answer-keyed questions in the separate B.E. 2568 pack.
- CI also runs the production build and ESLint.

GitHub Actions run 258 passed all curriculum source validators, all eight learning-area importer-parser checks, the separate B.E. 2568 pack validation, production build and ESLint. This includes Thai Language's 36 shared M4–M6 indicators resolving to all three upper-secondary grades, and Career's 11 shared M4–M6 indicators resolving to all three grades. The Social Studies check validates all 418 unique indicators and 1,254 indicator-linked answer-keyed tasks. Do not treat source-pack validation as an authenticated application import test.

## 5. Scope boundaries and release plan

The single consolidated authenticated import and application test is specified in `CURRICULUM-CONSOLIDATED-IMPORT-TEST-PLAN.md`. It reconciles the 2,056 unique source indicators with 2,450 grade-specific draft lessons and 7,350 question drafts after shared M4–M6 expansion, while keeping the 2025 framework, specialist Science and Cambridge Computer Studies separate.

- The 2008/2017 eight learning areas and the 2025 competency-based P1–P3 framework remain separate curriculum versions.
- Thai Studies remains outside this rollout and is not represented as complete.
- Cambridge Click Start Computer Studies remains a separate international course; it is not a substitute for national Science and Technology indicators.
- The 300 specialist upper-secondary Science outcomes remain separate from the 415 core Science indicators.
- Social Studies now has 418 lessons, 1,254 indicator-linked formative tasks with answer/evidence guidance, four-step strand-specific teaching sequences, grade-band differentiation and a teacher implementation guide. The importer expands its 61 shared M4–M6 outcomes into 183 grade-specific draft lessons and 549 grade-scoped questions using collision-safe codes.
- Health and Physical Education now has 221 lessons and 663 indicator-specific formative tasks with answer/evidence guidance. Its 29 shared M4–M6 indicators expand into 87 grade-specific draft lessons and 261 grade-scoped questions.
- Arts now has 279 lessons and 837 indicator-specific formative tasks with answer/evidence guidance. Its 39 shared M4–M6 indicators expand into 117 grade-specific draft lessons and 351 grade-scoped questions.
- Foreign Languages now has 193 lessons and 579 indicator-specific formative tasks with answer/evidence guidance. Its 21 shared M4–M6 indicators expand into 63 grade-specific draft lessons and 189 grade-scoped questions.
- Thai Language now has 319 lessons and 957 indicator-specific formative tasks with Thai answer/evidence guidance. Its 36 shared M4–M6 indicators expand into 108 grade-specific draft lessons and 324 grade-scoped questions.
- Teacher packs remain Markdown source. No pack has been imported into a school organization or published as part of this batch.
- No school, class, student, assignment, publication or learner-progress records were created or changed by the curriculum work.
- Do not begin repeated subject-by-subject UI tests. Finish curriculum source and pack work first, then perform one consolidated authenticated teacher import, student assessment, teacher review, gradebook and progress-reporting test.
- Keep PR #174 open and in draft until the approval-gated consolidated review is complete. Do not merge or activate curricula automatically.


## Consolidated rollout readiness — 23 November 2026

All eight national learning areas now have source packs and automated validators on `paul/subject-rollout`. The reconciled source totals are **2,056 unique official indicators**, **2,450 required grade alignments**, **2,056 source lesson sections** and **6,168 source tasks**. Shared outcomes are expanded by the importer to an expected **2,450 grade-specific lesson drafts** and **7,350 question drafts**. These expected import totals have not been confirmed by a new staging import.

The separate B.E. 2568 P1–P3 competency framework (24 outcomes / 72 tasks), 300 upper-secondary Science specialist outcomes (900 tasks), and Cambridge Click Start Computer Studies (41 lessons / 123 tasks) remain outside the eight-area national totals. Thai Studies remains outside this rollout and is not marked complete.

The latest source-validation workflow confirms the national, Thai Language/Career, B.E. 2568, Science, Mathematics, Computer Studies, HPE, Arts and Foreign Languages checks pass, along with the production build and ESLint. The only remaining failing workflow step is the Social Studies pack validator, which belongs to Edna's separate workstream and is intentionally not modified in this branch.

**Application acceptance is prepared but not authorized.** No isolated staging organization, test class or authenticated staging teacher/student session has been approved. Accordingly, no staging resources have been created, no authenticated import or publication has been performed, no Supabase migration has been applied in this batch, and no live school or learner records have been changed. Follow `CURRICULUM-CONSOLIDATED-IMPORT-TEST-PLAN.md` only after explicit staging authorization.
