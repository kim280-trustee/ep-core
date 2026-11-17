# Technology Teacher Pack Import Guide

The six Technology starter packs are teacher planning resources. They are not live app content until an authorized teacher imports them through the existing Teacher Content Import workflow.

## Import sequence

1. Apply the two Technology curriculum migrations in timestamp order:
   - `20261117100000_learning_technology_curriculum_catalog.sql`
   - `20261117101500_learning_technology_m1_m6_knowledge_graph.sql`
2. Sign in as an authorized teacher in the target organization.
3. Open the existing Teacher Content Import page.
4. Select curriculum `TH-TECH-M1-M6`, subject `TECH`, and the grade matching the pack.
5. Import the matching Markdown pack from `docs/learning/technology/`.
6. Review every generated lesson and question as a draft. Confirm the objective code and indicator alignment before submitting content for review.
7. Use the existing teacher review and publication workflow. The importer does not publish content.

## Pack register

| File | Grade | Lessons | Questions |
|---|---|---:|---:|
| `M1-technology-teacher-starter-pack.md` | M1 | 9 | 27 |
| `M2-technology-teacher-starter-pack.md` | M2 | 9 | 27 |
| `M3-technology-teacher-starter-pack.md` | M3 | 9 | 27 |
| `M4-technology-teacher-starter-pack.md` | M4 | 6 | 18 |
| `M5-technology-teacher-starter-pack.md` | M5 | 2 | 6 |
| `M6-technology-teacher-starter-pack.md` | M6 | 1 | 3 |
| **Total** | | **36** | **108** |

Each lesson has one official objective code and indicator code, one teaching activity and three answer-keyed questions. The parser expects exactly three answer-keyed questions per lesson.

## Digital-literacy assessment question pack

A separate question-only pack is available at `TECHNOLOGY-DIGITAL-LITERACY-ASSESSMENT-PACK.md`. It adds 21 short-answer questions across seven official Computing Science objectives in M1–M6. The questions cover privacy, safe technology use, source reliability, misinformation, intellectual property, responsible data science and technology's social impact.

Import it through the same Teacher Content Import page:

1. Select curriculum `TH-TECH-M1-M6` and subject `TECH`.
2. Select **Import assessment questions only** before choosing the Markdown pack.
3. Confirm that every objective code resolves to the intended grade and subject. The importer blocks unresolved or unaligned mappings.
4. Import the questions as unpublished manual-review drafts. This mode creates no lesson records and uses a separate `-DL-Q` code namespace to avoid collisions with the regular lesson-pack questions.
5. Review and publish the question drafts in the Question Bank.
6. Open the Assessment Builder, select the target class, grade and Technology subject, create a digital-literacy quiz or test, and attach the published questions for that academic scope.
7. Publish the assessment through the existing teacher review workflow. Student attempts use the existing manual-review grading and gradebook synchronization lifecycle.

The pack contains seven objective sections, three questions each. M1 and M2 address safe information-technology use; M3 has separate information-evaluation and legal/copyright sections; M4 applies responsible digital practice in a project; M5 addresses ethical data science; M6 addresses safe information sharing and social impact.

## Teacher-only guidance and safety

Each pack includes teacher-only safety and assessment guidance. The importer stores that guidance separately from student-facing lesson text. Review the guidance before importing or publishing.

Design & Technology activities must use approved classroom tools and materials under suitable supervision. Do not use mains electricity, exposed high-voltage components, hazardous chemicals or unsafe cutting tools in student activities. Prefer simulations and approved low-voltage kits.

Computing Science activities must use fictional or anonymised datasets. Never ask students to share passwords, private messages, addresses or other personal information. Students must respect copyright, privacy, source reliability and applicable computer-use rules.

## Current status

The curriculum catalogue, knowledge graph and six Markdown packs are committed to the implementation branch. The migrations have not been applied to Supabase, the packs have not been imported, and no tests/build/lint have been run. Use `TECHNOLOGY-STAGING-VERIFICATION.sql` after migration on staging.
