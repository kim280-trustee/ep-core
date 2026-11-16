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

M4–M6 coverage is limited to the eight grade-level indicators in the revised 2017 core-curriculum tables. It is not a complete list of additional/elective upper-secondary mathematics course outcomes.

## Migration order

Apply only after the planned academic-schema audit and approval:

1. `20261116060000_learning_maths_curriculum_catalog.sql` — Mathematics subject, Thai Maths curriculum, M1–M6 grade catalogue and curriculum-subject link.
2. `20261116061500_learning_maths_m1_knowledge_graph.sql` — M1 skills, topics, objectives and grade alignments.
3. `20261116063000_learning_maths_m2_m3_knowledge_graph.sql` — M2 and M3 skills/topics/objectives/alignments.
4. `20261116064500_learning_maths_m4_m6_knowledge_graph.sql` — M4–M6 core-curriculum topics/objectives/alignments.

The graph seeds are idempotent upserts and check for their required curriculum, grade and subject-strand prerequisites. They do not create school-specific academic years, terms, class groups, memberships, content or assessments.

## Teacher workflow compatibility

The existing generic workflows already support the new Maths catalogue:

- **Teacher Content Create** loads curricula, grades, subjects, skills, topics and objectives. It checks that the chosen objective is aligned to the exact selected curriculum and grade before saving a draft.
- **Question Bank** derives available objectives from the selected class's curriculum, grade and subject. It saves those same academic-scope IDs to each question version and links the selected objective.
- **Teacher Content Library** filters the existing content catalogue; no Maths-only content library is required.

No separate Maths authoring module or route is needed. After the migrations are applied, Maths becomes available through the existing generic academic selectors and class-scoped question authoring.

## Pilot setup — blocked pending the academic-schema audit

Do not create a Maths pilot class yet. The current academic schema ties `learning_academic_years` to one `curriculum_id`. A class group must use the same curriculum as its academic-year record, and academic-year codes are unique per organization.

The existing English MEP pilot uses its own curriculum. Creating a Maths class under that same academic-year record would fail the class-year curriculum foreign key. Creating a second academic-year record for the same school year under the Maths curriculum would duplicate the school's year and term records; the current unique organization/year-code rule also means it would need a different code.

This is a multi-curriculum data-model issue, not a teacher-page issue. Resolve it during the planned Phase 1 database audit before creating parallel subject classes. The audit should decide whether school academic years and terms should be organization-scoped independently of curriculum, with each class carrying its own curriculum and grade.

### Pilot checklist after the audit

- Confirm the Maths catalogue and all four knowledge-graph migrations are applied successfully.
- Confirm the existing English pilot's curriculum, academic year, term, class, memberships and published learning records remain unchanged.
- Create one Maths pilot class using the approved school academic year, Thai Maths curriculum and M1 grade.
- Assign Mathematics (`MATH`) as the class subject.
- Add the authorised teacher and a test student to the class.
- Create one M1 Maths lesson as draft and one M1 Maths question as draft.
- Verify both appear only in the Maths class's correct curriculum/grade/subject scope.
- Publish only after teacher review and successful end-to-end testing.

## Explicitly not done

- No Supabase migration has been applied.
- No production or pilot data has been changed.
- No new school academic year, term, class group, class subject or membership has been created.
- No new UI feature was added because the existing generic teacher workflows already support the academic dimensions.

## Official curriculum source

Office of the Basic Education Commission (OBEC), Ministry of Education, *Learning Standards and Indicators (Revised B.E. 2560)*, Mathematics, pp. 17–29:  
https://www.academic.obec.go.th/images/document/1580786277_d_1.pdf
