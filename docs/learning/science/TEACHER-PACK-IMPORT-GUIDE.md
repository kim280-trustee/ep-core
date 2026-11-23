# E&P Learning — Teacher Pack Import Guide

## Purpose

The generic teacher-pack importer converts the existing Markdown lesson packs into records in the existing E&P Learning content and assessment tables. It does not create a parallel content system or change the curriculum knowledge graph.

Open **Teacher Content Library → Import teacher pack**, or use the route `/teacher/content/import`.

## Before importing

- Sign in with a real, active teacher account.
- Select an assigned teacher class to identify the organization where the drafts will be created.
- For secondary core and specialist packs, select curriculum `TH-SCI-M1-M6`. For primary P1–P6 packs, select `TH-BASIC-CORE-2008-2017`. Select the matching subject; the fallback grade applies only to packs without grade-coded objectives.
- Upload one consolidated Markdown (`.md`) pack at a time. The secondary core and specialist import set is provided as 14 subject/grade files across five tracks. Primary P1–P6 Science packs are maintained separately. Each import uses the correct subject and grade scope.
- Check every objective code and grade shown in the preview. Code-less official outcomes are matched against the selected subject/grade catalogue; ambiguous matches block the import.

The selected class is used only to establish the teacher's organization access. It does not change that class, add a subject to it, or assign content to its students. Choose the content language explicitly: use English (`en`) for the secondary core and specialist packs, and Thai (`th`) for the primary P1–P6 packs. The import page saves this language on both lesson and question records; it does not translate or rewrite the Markdown.

## Consolidated Science import files

Import these 14 files using curriculum `TH-SCI-M1-M6`. The M1–M3 and M4–M6 core Science packs use explicit grade-coded objective IDs and sequentially numbered lesson headings, so each lesson resolves to its source grade within the mixed-grade core pack. Both consolidated packs have passed a source-level parser compatibility check for lesson headings, objective codes and three answer-keyed questions per lesson. The M1–M3 pack includes nine official M3 W4.1/W4.2 technology lessons; nine legacy W3.2 lessons are preserved separately and excluded from the core import. The upper-secondary specialist Biology, Chemistry, Physics and Earth/Space packs remain grade-scoped because some outcomes are intentionally code-less in the original teacher material; select the exact grade shown for those files.

| Import file | Subject | Grade | Lessons | Questions |
|---|---|---:|---:|---:|
| `SCIENCE-M1-M3-COMPLETE-IMPORT.md` | `SCI` — Science | M1–M3 | 174 | 522 |
| `SCIENCE-M4-M6-COMPLETE-IMPORT.md` | `SCI` — Science | M4–M6 | 102 | 306 |
| `BIOLOGY-M4-IMPORT.md` | `BIOLOGY` — Biology | M4 | 32 | 96 |
| `BIOLOGY-M5-IMPORT.md` | `BIOLOGY` — Biology | M5 | 39 | 117 |
| `BIOLOGY-M6-IMPORT.md` | `BIOLOGY` — Biology | M6 | 37 | 111 |
| `CHEMISTRY-M4-IMPORT.md` | `CHEMISTRY` — Chemistry | M4 | 28 | 84 |
| `CHEMISTRY-M5-IMPORT.md` | `CHEMISTRY` — Chemistry | M5 | 38 | 114 |
| `CHEMISTRY-M6-IMPORT.md` | `CHEMISTRY` — Chemistry | M6 | 15 | 45 |
| `PHYSICS-M4-IMPORT.md` | `PHYSICS` — Physics | M4 | 17 | 51 |
| `PHYSICS-M5-IMPORT.md` | `PHYSICS` — Physics | M5 | 26 | 78 |
| `PHYSICS-M6-IMPORT.md` | `PHYSICS` — Physics | M6 | 24 | 72 |
| `EARTH-SPACE-M4-IMPORT.md` | `EARTH_SPACE` — Earth, Astronomy and Space Science | M4 | 12 | 36 |
| `EARTH-SPACE-M5-IMPORT.md` | `EARTH_SPACE` — Earth, Astronomy and Space Science | M5 | 13 | 39 |
| `EARTH-SPACE-M6-IMPORT.md` | `EARTH_SPACE` — Earth, Astronomy and Space Science | M6 | 19 | 57 |
| **Total** | **5 subject tracks** | **M1–M6** | **576** | **1,728** |

Import one file at a time and select the exact subject and grade shown in the table. The mixed-grade M4–M6 core Science file is intentional: every objective code carries its source grade. Do not combine the grade-specific specialist import files; their grade selector is part of code-less outcome resolution. All imported records remain unpublished drafts.

## Primary Science import files

Import these three packs using curriculum `TH-BASIC-CORE-2008-2017`, subject `SCI` — Science and Technology, and content language `th`. Each lesson contains a grade-coded objective, three formative tasks and expected evidence. The importer resolves the grade from each objective code and verifies its exact curriculum alignment; the fallback-grade selector is not used for these coded lessons.

| Import file | Grades | Lessons | Formative tasks |
|---|---|---:|---:|
| `P1-P3-science-w1-w3-teacher-starter-pack.md` | P1–P3 | 42 | 126 |
| `P4-P6-science-w1-w3-teacher-starter-pack.md` | P4–P6 | 69 | 207 |
| `SCIENCE-TECHNOLOGY-W4.2-P1-P6-TEACHER-STARTER-PACK.md` | P1–P6 | 28 | 84 |
| **Total** | **P1–P6** | **139** | **417** |

The primary packs use the national master curriculum because their official grade alignments are registered in `TH-BASIC-CORE-2008-2017`. Import each file separately and confirm the preview reports the expected lesson and question counts before saving drafts.


## What the importer creates

For each validated lesson:

1. One `learning_content_items` row with content type `lesson`.
2. One initial `learning_content_versions` row containing the learning outcome, teaching activity/notes and the three student-facing practice prompts (never the answer keys). Pack-level safety/teaching/assessment guidance is stored in a separate `teacher_only` section.
3. One `learning_content_objectives` link to the exact curriculum objective.
4. Three `learning_questions` rows using the existing `short_answer` question type.
5. Three `learning_question_versions` rows with exact curriculum, grade and subject scope.
6. Three protected `learning_question_evaluation_keys` rows containing the teacher-pack expected answers.

The importer also preserves pack-level safety/teaching guidance and per-lesson marking guides in teacher-only content sections; these are not exposed to students.
7. Three `learning_question_objectives` links to the same objective.

Short-answer scoring uses `manual_review`. Answer keys are stored in the protected evaluation-key table and are not included in student-facing lesson content. The assessment builder supports published `short_answer` questions alongside automatically scored question types. Students submit written responses; attempts remain pending until an authorized teacher marks every written response in the teacher review queue at `/teacher/assessments/:assessmentId/review`. The trusted grading function finalizes the attempt and updates the assessment result and gradebook only after all manual responses are marked.

All imported content and questions remain **drafts**. The importer does not submit items for review or publish them. Pack-level safety/teaching/assessment guidance is marked with `type: teacher_only` and `audience: teacher`. The student content runtime excludes these sections, including legacy guidance sections identified by their teacher-guidance titles. The teacher content detail page displays the guidance in a clearly labelled teacher-only panel and preserves it when a new content version is saved. Teachers and authorized academic reviewers continue to use the existing review/publication lifecycle.

## Validation and failure handling

- Objective codes must resolve uniquely inside the selected subject.
- The objective must have an active alignment to the selected curriculum and grade.
- Code-less outcomes use exact text matching, conservative text similarity, or a unique grade-scoped outcome number. Ambiguous mappings stop the import; the importer does not silently choose one.
- Every lesson must contain exactly three questions with answer keys.
- Content and question codes are normalized to the existing uppercase, hyphen-separated content code convention.
- Existing codes are never overwritten. Preflight checks only the exact content/question codes in the selected organization, rather than loading the entire organization library.
- Lesson-pack retries are resumable: a lesson is skipped only when its lesson code and all three expected question codes already exist. Remaining untouched lessons are imported in chunks of up to 40 lessons (up to 120 questions).
- If only part of a lesson code group exists, the importer stops and identifies the objective for manual inspection; it does not overwrite or guess how to repair partial records.
- Question-only imports skip existing question codes and import the remaining questions in chunks of up to 40.
- If a chunk fails, the importer attempts to delete that chunk's newly created parent records so dependent versions and mappings cascade. If cleanup fails, the UI reports that the draft libraries must be checked before retrying. Earlier successful chunks remain saved and can be safely skipped on a subsequent retry.

## Repeatable parser validation

Run `npm.cmd run validate:science-packs` from the repository root before importing Science core material. It transpiles and executes the actual TypeScript teacher-pack parser, then validates all five core packs: 139 primary P1–P6 lessons and 276 secondary M1–M6 lessons, for 415 core lessons and 1,245 answer-keyed formative tasks. It checks lesson counts, grade distribution, heading/objective grade agreement, cross-pack unique objective codes, sequential question numbers, non-empty answer keys and primary teacher-only marking guides.

Run `npm.cmd run validate:science-specialist-packs` to validate the 12 Biology, Chemistry, Physics and Earth/Space packs: 300 lessons and 900 answer-keyed questions.

Run `npm.cmd run validate:science-rollout-packs` for the aggregate 17-pack gate. It checks every import file together, including each pack's expected lesson count, grade scope, question count, subject totals, language allocation and duplicate subject/grade objective identities. Expected total: 715 lessons and 2,145 questions (139 Thai primary lessons / 417 tasks; 576 English secondary and specialist lessons / 1,728 questions).

These are source-pack/parser checks; they do not replace authenticated preview, draft-save import and teacher/student acceptance tests in the application. CI also runs the independent validators for the other learning areas. A failure in another subject's validator is reported separately and does not mean the Science parser failed.

## Complete 17-pack Science rollout gate

Run `npm run validate:science-rollout-packs` to validate all 17 primary, secondary-core and upper-secondary specialist import files together through the actual TypeScript importer parser. This aggregate check independently asserts each pack's lesson/question counts, grade scope, three sequential answer-keyed questions per lesson, duplicate subject/grade objective identities, language allocation and subject totals. Expected totals: 715 lessons and 2,145 questions (Thai 139/417; English 576/1,728). CI runs this gate after the core and specialist Science validators.

## Question Bank access

The Question Bank now lets an authorized teacher select a curriculum, grade and subject independently of the selected access class. The class still establishes the organization context. Academic filtering uses batched version/objective lookups so large imported packs do not cause one database request per question.

## Scope and release boundary

The importer uses the authenticated Supabase client and existing row-level security policies. It does not use a service-role key, invent a system teacher, bypass RLS, publish records, create school/class/student rows, or modify live pilot data automatically.

The importer is implemented in the repository. The 14 consolidated secondary Science import files contain 576 lessons and 1,728 answer-keyed questions; none have been imported. Separate primary P1–P6 packs contain 139 lessons and 417 formative tasks. Across the full P1–M6 core set, 415 lessons and 1,245 formative tasks are prepared; the 300 specialist upper-secondary outcomes add 300 lessons and 900 questions. Total prepared material is 715 lessons and 2,145 questions. Live Supabase currently has zero imported Science lessons and zero Science questions. Curriculum priorities and grade alignments have been reconciled against the live catalogue. The latest draft PR #174 run passed the Science core and specialist parser validations, all other subject validators except Social Studies, production build and ESLint. The overall workflow remains failed only at the Social Studies pack step. No curriculum-pack records were created by CI. An authorized teacher must still perform the authenticated preview and controlled draft-save workflow in the target organization. End-to-end student/teacher checks remain pending.


## Social Studies shared-grade outcomes

Social Studies teacher packs use objective codes such as `SO2.1-P4-03`. The parser preserves the dotted standard code and maps the embedded grade to the exact grade-level alignment. The upper-secondary pack uses 61 shared `M46` outcomes; each aligns to M4, M5 and M6. The importer expands each shared outcome into three grade-specific draft lessons and uses grade-scoped content/question codes to avoid duplicate-code collisions. The official Thai indicator wording supplies the imported lesson title. No record is published automatically.

Run `npm run validate:social-studies-packs` to verify all 418 Social Studies indicators and 1,254 answer-keyed formative tasks through the actual TypeScript importer parser.
