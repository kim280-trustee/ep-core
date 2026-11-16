# E&P Learning — Mathematics Rollout Readiness

**Branch:** `paul/learning-academic-integrity-audit`  
**Scope:** Thai Mathematics M1–M6 core-curriculum knowledge graph and teacher authoring readiness  
**Status:** Code and documentation committed; migrations have not been applied to Supabase; no Maths pilot class or student records have been created.

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

## Pending migration order

The live `ep-core` database migration history currently ends at `20261116015418`. Apply all pending branch migrations in timestamp order after reviewing them:

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
11. `20261116071500_learning_academic_record_integrity.sql` — strengthens term dates and gradebook class/term/student scope. School-structure write policies were already hardened by an earlier applied migration.

The graph seeds are idempotent upserts and check for their required curriculum, grade and subject-strand prerequisites. They do not create school-specific academic years, terms, class groups, memberships, content or assessments.

The integrity migration includes preflight checks. It will stop rather than apply if existing terms fall outside their academic-year dates, or if existing gradebook records connect mismatched terms, classes or class subjects. Reconcile any reported records before retrying.

## Live database preflight

Read-only inspection of the connected `ep-core` database found the current English pilot as one academic year (`2026-2027`), one M1 class (`M1-MEP-A`) under curriculum `TH-MEP-EN`, one term and one class subject. There are 8 gradebook entries and 1 term-grade row.

The current read-only preflight returned **zero mismatches** for term dates, gradebook term/class year alignment, gradebook class-subject/class alignment and student membership references. The academic-management RLS policies are already permission-scoped in the live database.

No database rows or migrations were changed during this inspection.

## Teacher workflow compatibility

The existing generic workflows already support the new Maths catalogue:

- **Teacher Content Create** loads curricula, grades, subjects, skills, topics and objectives. It checks that the chosen objective is aligned to the exact selected curriculum and grade before saving a draft.
- **Question Bank** derives available objectives from the selected class's curriculum, grade and subject. It saves those same academic-scope IDs to each question version and links the selected objective.
- **Teacher Content Library** filters the existing content catalogue by curriculum, grade, subject, content type and status. The grade filter now narrows materials to objectives aligned to the selected grade, and content cards show the grade tags associated with their objective mappings; no Maths-only content library is required.

No separate Maths authoring module or route is needed. After the migrations are applied, Maths becomes available through the existing generic academic selectors and class-scoped question authoring. The content library's grade filter and grade tags also make M1–M6 teacher resources easier to isolate and identify.

## Pilot setup — ready after migrations and verification

The academic-year model has been corrected in code and migration: the school academic year is organization-scoped, while each class group owns its curriculum and grade. Existing curriculum values on academic-year records are preserved as nullable legacy metadata; new school years no longer require a curriculum.

After applying and verifying the migrations:

- Select the school's existing academic year; do not create a duplicate year for Maths.
- Create one Maths pilot class using the Thai Maths curriculum and M1 grade.
- Assign Mathematics (`MATH`) as the class subject.
- Add the authorised teacher and a test student to the class.
- Create one M1 Maths lesson as draft and one M1 Maths question as draft.
- Verify both appear only in the Maths class's correct curriculum/grade/subject scope.
- Publish only after teacher review and successful end-to-end testing.

The existing English MEP pilot's class curriculum, grade, term, memberships and published learning records are not changed by these migrations. No pilot records have been created yet.

## Explicitly not done

- No Supabase migration has been applied.
- No production or pilot data has been changed.
- No new academic year, term, class group, class subject or membership has been created.
- No separate Maths UI module was added because the existing generic teacher workflows already support the academic dimensions.
- No local lint/build result is claimed; consolidated local verification remains pending.

## Official curriculum source

Office of the Basic Education Commission (OBEC), Ministry of Education, *Learning Standards and Indicators (Revised B.E. 2560)*, Mathematics, pp. 17–29:  
https://www.academic.obec.go.th/images/document/1580786277_d_1.pdf
