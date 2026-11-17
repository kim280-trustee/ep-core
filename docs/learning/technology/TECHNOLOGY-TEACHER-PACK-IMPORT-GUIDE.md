# Computer Studies Teacher Pack Import Guide

The active school Computer Studies sequence is Cambridge Click Start International Edition:

- M1 → Learner's Book 4
- M2 → Learner's Book 5
- M3 → Learner's Book 6

Only these three grade packs are in scope. M4–M6 and the former Thai national Technology/digital-literacy pack are excluded. Thai Studies is not changed.

## Database setup

The following migrations have been applied to the existing E&P Supabase project:

- `20261117100000_learning_technology_curriculum_catalog.sql`
- `20261117101500_learning_technology_m1_m6_knowledge_graph.sql` (database migration name: `learning_computer_studies_m1_m3_knowledge_graph`)

The active curriculum code is `CLICK-START-M1-M3`; the subject code is `COMPUTER-STUDIES`. The database currently contains three grades, three grade topics, 29 objectives and 29 grade alignments.

## One-file teacher import

Use the combined pack for the full subject rollout:

1. Sign in as an authorized teacher in the target organization.
2. Open the existing Teacher Content Import page.
3. Select curriculum `CLICK-START-M1-M3` and subject `COMPUTER-STUDIES`.
4. Select `COMPUTER-STUDIES-M1-M3-COMPLETE-IMPORT.md`.
5. Leave **Import assessment questions only** unchecked.
6. Review the 29 detected lessons, 87 questions and their objective/grade mappings.
7. Choose **Import validated drafts** once the importer reports no mapping errors.
8. Review and publish the lessons through the existing teacher workflow when ready.

The combined pack contains explicit objective codes (`M1-01` through `M3-12`). The importer uses those codes to resolve each lesson and infer its grade from the selected curriculum, so the fallback grade selector does not restrict the combined import to one grade.

## Active pack register

| File | Grade | Cambridge book | Lessons | Questions |
|---|---|---|---:|---:|
| `M1-technology-teacher-starter-pack.md` | M1 | Learner's Book 4 | 8 | 24 |
| `M2-technology-teacher-starter-pack.md` | M2 | Learner's Book 5 | 9 | 27 |
| `M3-technology-teacher-starter-pack.md` | M3 | Learner's Book 6 | 12 | 36 |
| **Combined one-file import** | **M1–M3** | **Books 4–6** | **29** | **87** |

The sample-paper chapter in each book is an assessment resource and is not included as a lesson. The packs contain original lesson starters and practice questions based on published chapter titles; teachers must consult the actual learner's book for exact subtopics and exercises.

## Existing activity and assessment features

- The existing lesson content library stores each lesson as a versioned draft linked to its exact learning objective.
- The 87 questions are created as short-answer manual-review drafts. Answer keys are stored in the protected evaluation-key table.
- Nothing is published automatically. Teachers retain the existing review and publication controls.
- Use practical project submissions for Word, PowerPoint, Excel, Tux Paint, Logo drawings, Scratch projects and other book-aligned work.
- The current coding workspace executes JavaScript only; it does not natively execute MSWLogo, Scratch or QB64. Students can submit code/text and screenshots for teacher review or use approved installed software.
- For QB64, Flash and other legacy software, follow school IT policy and use safe approved environments or clearly labelled alternatives.
- Do not ask students to publish private information, share passwords or use real personal contact lists.

## Rollout status

- Curriculum and grade catalogue: applied.
- Knowledge graph: applied and database-verified (3 grades, 29 objectives, 29 alignments).
- Combined import pack: prepared (29 lessons, 87 answer-keyed questions).
- Teacher import into the school's organization: not yet run; it requires an authorized teacher session. The import creates unpublished drafts only.
- End-to-end teacher/student testing: pending until the content import is complete.
- No M4–M6 materials are included. Thai Studies remains untouched.
