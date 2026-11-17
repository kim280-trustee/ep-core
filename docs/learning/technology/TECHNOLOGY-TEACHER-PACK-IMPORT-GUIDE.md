# Computer Studies Teacher Pack Import Guide

The active school Computer Studies sequence is Cambridge Click Start International Edition:

- M1 → Learner's Book 4
- M2 → Learner's Book 5
- M3 → Learner's Book 6

Only these three grade packs are in scope. Do not import the former national Thai Technology M4–M6 packs or the old digital-literacy question pack; they do not represent the confirmed school textbook sequence.

## Import sequence

1. Apply the two curriculum migrations in timestamp order:
   - `20261117100000_learning_technology_curriculum_catalog.sql`
   - `20261117101500_learning_technology_m1_m6_knowledge_graph.sql`
2. Sign in as an authorized teacher in the target organization.
3. Open the existing Teacher Content Import page.
4. Select curriculum `CLICK-START-M1-M3`, subject `COMPUTER-STUDIES`, and the matching grade.
5. Import only the matching pack from `docs/learning/technology/`.
6. Review generated lessons and questions as unpublished drafts. Confirm that each chapter is mapped to the correct grade and objective.
7. Use the existing teacher review and publication workflow. Import does not publish content.

## Active pack register

| File | Grade | Cambridge book | Lessons | Questions |
|---|---|---|---:|---:|
| `M1-technology-teacher-starter-pack.md` | M1 | Learner's Book 4 | 8 | 24 |
| `M2-technology-teacher-starter-pack.md` | M2 | Learner's Book 5 | 9 | 27 |
| `M3-technology-teacher-starter-pack.md` | M3 | Learner's Book 6 | 12 | 36 |
| **Total** | | | **29** | **87** |

The sample paper chapter in each book is an assessment resource and is not included as a lesson. The packs contain original lesson starters and practice questions based on published chapter titles; teachers must consult the actual learner's book for its exact subtopics and exercises.

## Using the Computer Studies activity runtime

- Use the coding workspace for suitable MSWLogo, Scratch and QB64 learning activities. The current workspace runtime supports JavaScript only; do not imply that it executes MSWLogo, Scratch or QB64 source natively. For those languages, students can submit code/text and screenshots for teacher review or use the approved installed software.
- Use practical project submissions for Word, PowerPoint, Excel, Tux Paint, Logo drawings, Scratch projects and other book-aligned work.
- Teachers review submissions, award marks and feedback, and use the existing gradebook synchronization workflow.
- For QB64, Flash and other legacy software, follow school IT policy. Use safe, approved offline environments or a clearly labelled alternative where the original software is unavailable.
- Do not ask students to publish private information, share passwords or use real personal contact lists in exercises.

## Current status

The curriculum migrations and three M1–M3 packs are staged in the implementation branch. They have not been applied to Supabase and packs have not been imported. No tests, lint or builds have been run.
