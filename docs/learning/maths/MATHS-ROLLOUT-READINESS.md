# E&P Learning — Mathematics Rollout Readiness

## Current coverage — 21 November 2026

**Primary and secondary Mathematics are now seeded and source-reconciled.** The national master contains 157 unique Mathematics objectives: 116 primary indicators (P1–P6) and 41 secondary indicators (M1–M6). The new primary-specific `TH-MATH-P1-P6` catalogue contains 116 required alignments; the existing secondary-specific `TH-MATH-M1-M6` catalogue remains unchanged at 41.

The 116 primary indicators are classified 82 Must-Know and 34 Should-Know, exactly matching the OBEC 2021 grade summaries. The 2017 revised Mathematics standards are used for official indicator numbering; seven code-column transcription errors in the 2021 priority PDF are cross-walked in `PRIMARY-MATH-CURRICULUM-GAP-AUDIT.md`. The apparent P6 14/7 discrepancy was a manual counting error; the detailed table confirms 15/6.

| Grade | Primary objectives | Must-Know | Should-Know | Teacher lessons |
|---|---:|---:|---:|---:|
| P1 | 10 | 6 | 4 | 10 |
| P2 | 16 | 13 | 3 | 16 |
| P3 | 28 | 22 | 6 | 28 |
| P4 | 22 | 15 | 7 | 22 |
| P5 | 19 | 11 | 8 | 19 |
| P6 | 21 | 15 | 6 | 21 |
| **Primary total** | **116** | **82** | **34** | **116** |
| **Secondary M1–M6** | **41** | **41** | **0** | **41** |
| **All Mathematics** | **157** | **123** | **34** | **157** |

The two primary teacher packs contain 116 lessons and 348 answer-keyed formative tasks. The secondary packs contain 41 lessons and 123 answer-keyed questions. Total Mathematics authoring coverage is 157 lessons and 471 tasks.

The live national staging verification returns 2,056 unique required indicators and 2,450 grade alignments across all eight learning areas, with zero unclassified required alignments. Mathematics-specific verification confirms 116/116 primary alignments in both the national master and `TH-MATH-P1-P6`, plus the existing 41/41 secondary alignments in both the national master and `TH-MATH-M1-M6`.

The full importer-parser validation, production build and ESLint passed in GitHub Actions run 326. Authenticated teacher import, preview, draft-save and student/teacher end-to-end tests remain deferred to the single consolidated application-testing phase.


**Branch:** `paul/thai-national-curriculum-foundation`  
**Scope:** Thai Mathematics P1–M6 core-curriculum knowledge graph and teacher authoring readiness  
**Status:** All prerequisite, academic-integrity, secondary Mathematics and primary Mathematics catalogue migrations are applied to the existing Supabase project. All 157 national-master objective-to-grade alignments are verified; the 116 primary and 41 secondary objectives are also aligned in their separate Maths-specific catalogues. The 116 primary rows retain 82 `must_know` and 34 `should_know` classifications; the 41 secondary rows are all `must_know`. The separate Maths catalogues duplicate these same objectives by design. No Maths pilot class or student records have been created.

## Curriculum coverage delivered

| Grade | Official core-curriculum indicators seeded | Teacher lesson starters |
|---|---:|---:|
| M1 | 9 | 9 |
| M2 | 12 | 12 |
| M3 | 12 | 12 |
| M4 | 3 | 3 |
| M5 | 4 | 4 |
| M6 | 1 | 1 |
| **Total** | **41** | **41** |

Each lesson includes three practice questions with worked or direct answer keys: **123 practice questions and answers** across M1–M6.

M4–M6 coverage is limited to the eight grade-level indicators in the revised 2017 core-curriculum tables. It is not a complete list of additional/elective upper-secondary mathematics course outcomes.

## Applied migration order

The 13 migrations below were applied in timestamp order after the live-database preflight returned PASS for all nine integrity checks:

1. `20261116030000_learning_subject_catalog_manage.sql` — enables subject and curriculum-subject creation for academic managers.
2. `20261116031500_learning_grade_level_catalog_manage.sql` — enables curriculum grade-level creation for academic managers.
3. `20261116033000_learning_objective_alignment_manage.sql` — enables academic-manager objective alignment.
4. `20261116043000_learning_content_objective_subject_integrity.sql` — subject-aware content/objective integrity.
5. `20261116044500_learning_question_academic_scope.sql` — curriculum/grade/subject scope for question versions.
6. `20261116060000_learning_maths_curriculum_catalog.sql` — Mathematics subject, Thai Maths curriculum, M1–M6 grade catalogue and curriculum-subject link.
7. `20261116061500_learning_maths_m1_knowledge_graph.sql` — M1 skills, topics, objectives and grade alignments.
8. `20261116063000_learning_maths_m2_m3_knowledge_graph.sql` — M2 and M3 skills/topics/objectives/alignments.
9. `20261116064500_learning_maths_m4_m6_knowledge_graph.sql` — M4–M6 core-curriculum topics/objectives/alignments.
10. `20261116070000_learning_academic_year_multi_curriculum.sql` — makes the school academic year curriculum-independent while preserving existing curriculum values as optional legacy metadata.
11. `20261116071500_learning_academic_record_integrity.sql` — strengthens term dates and gradebook class/term/student scope. School-structure write policies were already hardened by an earlier applied migration.\n12. `20261118198000_classify_thai_mathematics_m1_m6_must_know.sql` — classifies the 41 Mathematics indicators as `must_know` in both curriculum catalogues, matching OBEC's M1–M6 summary.

The graph seeds are idempotent upserts and check for their required curriculum, grade and subject-strand prerequisites. They do not create school-specific academic years, terms, class groups, memberships, content or assessments.

The integrity migration includes preflight checks. It will stop rather than apply if existing terms fall outside their academic-year dates, or if existing gradebook records connect mismatched terms, classes or class subjects. Reconcile any reported records before retrying.

## Live database preflight

Read-only inspection of the connected `ep-core` database found the current English pilot as one academic year (`2026-2027`), one M1 class (`M1-MEP-A`) under curriculum `TH-MEP-EN`, one term and one class subject. There are 8 gradebook entries and 1 term-grade row.

The committed read-only preflight script was executed against the live project. All nine integrity checks returned **PASS with zero issues**, covering term dates, gradebook term/class year alignment, class-subject/class alignment, student membership references, and content-objective subject/alignment integrity. The academic-management RLS policies are already permission-scoped in the live database.

The live Mathematics catalogues are verified: the national master contains 157 required objectives and 157 grade alignments (116 primary, 41 secondary). `TH-MATH-P1-P6` contains the same 116 primary objectives and alignments; `TH-MATH-M1-M6` contains the same 41 secondary objectives and alignments. The primary priority split is 82 Must-Know / 34 Should-Know; all 41 secondary indicators are Must-Know. Both separate Maths-specific catalogues match the national master without adding unique indicators. All 157 national-master alignments have zero unclassified rows.

The preflight itself was read-only. The subsequent migrations added academic catalogue, integrity and multi-curriculum support; they did not create or modify school academic years, terms, classes, memberships, authored content, assessments or student records.

## Teacher pack import readiness

All five Mathematics teacher packs have been checked against the importer parser: 157 lessons, 471 answer-keyed questions, 157 unique objective codes and no lesson-format errors. All 157 objective codes were found in the live Mathematics catalogues. Import instructions are in `MATHS-TEACHER-PACK-IMPORT-GUIDE.md`; the packs remain source material until an authorized teacher imports them into the target organization as unpublished drafts.

Read-only database verification is in `supabase/verification/learning-academic-maths-verification.sql`. The live national master reports 157 required Mathematics objectives and 157 aligned grade rows; the separate primary and secondary Maths catalogues report 116 and 41 respectively. Duplicate official codes and unaligned required objectives: zero.

## Teacher workflow compatibility

The existing generic workflows already support the new Maths catalogue:

- **Teacher Content Create** loads curricula, grades, subjects, skills, topics and objectives. It checks that the chosen objective is aligned to the exact selected curriculum and grade before saving a draft.
- **Question Bank** derives available objectives from the selected class's curriculum, grade and subject. It saves those same academic-scope IDs to each question version and links the selected objective.
- **Teacher Content Library** filters the existing content catalogue by curriculum, grade, subject, content type and status. The grade filter now narrows materials to objectives aligned to the selected grade, and content cards show the grade tags associated with their objective mappings; no Maths-only content library is required.

No separate Maths authoring module or route is needed. With the migrations now applied, Maths is available through the existing generic academic selectors and class-scoped question authoring. The content library's grade filter and grade tags also make M1–M6 teacher resources easier to isolate and identify.

## Pilot setup — ready for a separate school-level action

The academic-year model has been corrected in code and migration: the school academic year is organization-scoped, while each class group owns its curriculum and grade. Existing curriculum values on academic-year records are preserved as nullable legacy metadata; new school years no longer require a curriculum.

The migrations are applied and verified. Pilot setup is still a separate school-level action:

- Select the school's existing academic year; do not create a duplicate year for Maths.
- Create one Maths pilot class using the Thai Maths curriculum and M1 grade.
- Assign Mathematics (`MATH`) as the class subject.
- Add the authorised teacher and a test student to the class.
- Create one M1 Maths lesson as draft and one M1 Maths question as draft.
- Verify both appear only in the Maths class's correct curriculum/grade/subject scope.
- Publish only after teacher review and successful end-to-end testing.

The existing English MEP pilot's class curriculum, grade, term, memberships and published learning records are not changed by these migrations. No pilot records have been created yet.

## Explicitly not done

- [x] The 11 additive prerequisite, academic-integrity and Mathematics migrations have been applied and verified.
- [x] Three teacher packs parser-validated: 41 lessons, 123 answer-keyed questions, 41 objective codes matched to the live catalogue.\n- [x] OBEC must-know classification applied and verified across both curriculum catalogues (82 alignments; zero unclassified).
- [ ] Import the three packs into the school's organization through an authorized teacher session.
- No new Maths pilot class, term, subject assignment or student membership has been created.
- No new academic year, term, class group, class subject or membership has been created.
- No separate Maths UI module was added because the existing generic teacher workflows already support the academic dimensions.
- [x] Dedicated `validate:maths-packs` executes the actual TypeScript importer parser against all three packs: 41 unique M1–M6 objectives, correct grade counts and 123 answer-keyed questions.
- [x] GitHub Actions run 258 passed the full curriculum validation suite, production build and ESLint. Authenticated teacher import and end-to-end UI tests remain deferred to the consolidated testing phase.

## Official curriculum source

Office of the Basic Education Commission (OBEC), Ministry of Education, *Learning Standards and Indicators (Revised B.E. 2560)*, Mathematics, pp. 17–29:  
https://www.academic.obec.go.th/images/document/1580786277_d_1.pdf


## Primary Mathematics implementation — completed

- Migration: `20261121160000_seed_primary_mathematics_p1_p6.sql`.
- New separate catalogue: `TH-MATH-P1-P6` (draft).
- 116 primary objectives seeded once in the Mathematics knowledge graph and aligned to both `TH-BASIC-CORE-2008-2017` and `TH-MATH-P1-P6`.
- All 116 alignments are required; 82 are Must-Know and 34 are Should-Know. No unclassified rows or duplicate official codes.
- Primary teacher packs: `PRIMARY-MATHEMATICS-P1-P3-TEACHER-STARTER-PACK.md` (54 lessons) and `PRIMARY-MATHEMATICS-P4-P6-TEACHER-STARTER-PACK.md` (62 lessons). Each lesson contains three answer-keyed tasks.
- Automated validator: `npm run validate:maths-primary-packs`; it uses the actual TypeScript importer parser and checks 116 internal codes, 116 official indicator crosswalks, 348 questions, grade coverage and 82/34 priorities.
- Read-only verification: `PRIMARY-MATH-STAGING-VERIFICATION.sql`. All 12 catalogue/grade rows, both 116-objective catalogue totals, priority totals and the P3 money code crosswalk pass.
- GitHub Actions run 326 passed curriculum validators, specialist and Click Start pack checks, production build and ESLint.

The original gap check is retained for audit history; use `PRIMARY-MATH-STAGING-VERIFICATION.sql` for current-state verification. No content has been imported or published to a school.
