# Thai National Curriculum — P1–M6 and Early-Primary 2025 Rollout Audit

**Repository:** `kim280-trustee/ep-core`  
**Branch:** `paul/thai-national-curriculum-foundation`  
**Audit date:** 21 November 2026  
**Implementation status:** All eight B.E. 2551 (2008), revised B.E. 2560 (2017), learning-area catalogues are complete. The separate B.E. 2568 (2025) P1–P3 competency framework is now seeded as a draft. Consolidated authenticated application testing is intentionally deferred until curriculum source work is complete.

## 1. Eight learning areas — 2008/2017 national core

| National learning area | Subject code | Unique official indicators | Grade alignments | Teacher resources |
|---|---|---:|---:|---|
| Thai Language | `THAI-LANGUAGE` | 319 | 391 | 319 lessons / 957 formative tasks |
| Mathematics | `MATH` | 41 | 41 in national master; 82 across national and Maths-specific catalogues | 41 lessons / 123 answer-keyed questions |
| Science and Technology | `SCI` | 415 | 415 in national master; 276 in canonical secondary catalogue | 415 core lessons / 1,245 formative tasks |
| Social Studies, Religion and Culture | `SOCIAL-STUDIES` | 418 | 540 | 418 lessons / 1,254 assessment stems |
| Health and Physical Education | `HEALTH-PE` | 221 | 279 | 221 lessons / 663 formative tasks |
| Arts | `ARTS` | 279 | 357 | 279 lessons / 837 assessment prompts |
| Occupations and Career | `CAREER` | 54 | 76 | 54 lessons / 162 answer-keyed questions |
| Foreign Languages | `FOREIGN-LANGUAGES` | 193 | 235 | 193 lessons / 579 formative tasks |
| **Total** | **8 learning areas** | **1,940** | **2,334** | **1,940 lessons / 5,820 tasks and prompts** |

The 41 Mathematics objectives have 41 alignments in the national master and are also retained in the separate Maths-specific catalogue, giving 82 alignments across both catalogues. Do not add those duplicate catalogue views to the 2,334 national-master alignment total.

### Official-indicator required-flag reconciliation

A live database audit found that 839 official grade alignments in six learning areas had been marked `required=false` because their Must-Know / Should-Know priority had been treated as curriculum inclusion. This was incorrect: Should-Know indicators remain official curriculum indicators, and Social Studies also contains official pathway-classified indicators without a priority label.

Migration `20261121052847_mark_official_2008_learning_area_indicators_required.sql` changed only the required flag for the affected official alignments: Thai Language 68, Social Studies 405, Health and Physical Education 140, Arts 146, Career 39 and Foreign Languages 41. All original priority and pathway classifications were preserved. Live verification now returns 1,940 required unique indicators, 2,334 required grade alignments and zero rows with both priority and pathway classifications missing. The nine legacy M3 W3.2 Science supplementary outcomes remain non-required.

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

The eight 2008/2017 learning areas have 39 teacher-pack files covering 1,940 unique official objective codes. The cross-curriculum validator checks expected pack counts, grade-section or indicator-list coverage, one unique objective code per lesson where the pack is lesson-structured, and cross-pack duplicates.

- `npm run validate:national-curriculum-packs` — all eight learning areas.
- `npm run validate:science-packs` — executes the actual TypeScript importer parser against the 276 consolidated secondary Science lessons and 828 answer-keyed questions.
- `npm run validate:social-studies-packs` — executes the actual TypeScript importer parser against all 418 Social Studies indicators and 1,254 answer-keyed tasks, checking every task includes its exact official Thai indicator.
- `npm run validate:thai-2025-packs` — validates the 24 annual outcomes, P1/P2/P3 grade mapping and 72 answer-keyed questions in the separate B.E. 2568 pack.
- CI also runs the production build and ESLint.

The all-eight-area source-pack validator, Thai B.E. 2568 competency-pack validator, Science parser validator, Social Studies parser validator, production build and ESLint are run together in GitHub Actions. Run 95 passed the first three validators, production build and ESLint before Social Studies answer authoring was added. The new Social Studies parser check is now included in CI and its result is pending. Do not treat source-pack validation as an authenticated application import test.

## 5. Scope boundaries and release plan

- The 2008/2017 eight learning areas and the 2025 competency-based P1–P3 framework remain separate curriculum versions.
- Thai Studies remains outside this rollout and is not represented as complete.
- Cambridge Click Start Computer Studies remains a separate international course; it is not a substitute for national Science and Technology indicators.
- The 300 specialist upper-secondary Science outcomes remain separate from the 415 core Science indicators.
- Social Studies now has 418 lessons and 1,254 indicator-linked formative tasks with answer/evidence guidance. The importer expands its 61 shared M4–M6 outcomes into 183 grade-specific draft lessons and 549 grade-scoped questions using collision-safe codes.
- Teacher packs remain Markdown source. No pack has been imported into a school organization or published as part of this batch.
- No school, class, student, assignment, publication or learner-progress records were created or changed by the curriculum work.
- Do not begin repeated subject-by-subject UI tests. Finish curriculum source and pack work first, then perform one consolidated authenticated teacher import, student assessment, teacher review, gradebook and progress-reporting test.
- Keep PR #173 open and in draft until the consolidated review is complete. Do not merge or activate curricula automatically.
