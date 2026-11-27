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
6. Three protected `learning_question_evaluation_keys` rows containing the teacher-pack expected answers. The browser importer writes these through the existing `save_learning_question_evaluation_key` SECURITY DEFINER RPC, not direct table access; the RPC checks authenticated active teacher membership or academic-record management permission and rejects published versions. The evaluation-key table remains unreadable and non-writable directly by authenticated browser clients.

The importer also preserves pack-level safety/teaching guidance and per-lesson marking guides in teacher-only content sections; these are not exposed to students.
7. Three `learning_question_objectives` links to the same objective.

Short-answer scoring uses `manual_review`. Answer keys are stored in the protected evaluation-key table and are not included in student-facing lesson content. The assessment builder supports published `short_answer` questions alongside automatically scored question types. Students submit written responses; attempts remain pending until an authorized teacher marks every written response in the teacher review queue at `/teacher/assessments/:assessmentId/review`. The trusted grading function finalizes the attempt and updates the assessment result and gradebook only after all manual responses are marked.

All imported content and questions remain **drafts**. The importer does not submit items for review or publish them. Pack-level safety/teaching/assessment guidance is marked with `type: teacher_only` and `audience: teacher`. The student content runtime excludes these sections, including legacy guidance sections identified by their teacher-guidance titles. The teacher content detail page displays the guidance in a clearly labelled teacher-only panel and preserves it when a new content version is saved. Teachers and authorized academic reviewers continue to use the existing review/publication lifecycle.

## Validation and failure handling

- Objective codes must resolve uniquely inside the selected subject.
- The objective must have an active alignment to the selected curriculum and grade.
- Code-less outcomes use exact text matching, conservative text similarity, or a unique grade-scoped outcome number. Ambiguous mappings stop the import; the importer does not silently choose one.
- Every lesson must contain exactly three answer-keyed questions numbered 1, 2 and 3 in that order; missing, repeated, shifted or reordered question numbers block parsing before any import can begin.
- Content and question codes are normalized to the existing uppercase, hyphen-separated content code convention.
- Existing codes are never overwritten. Preflight checks only the exact content/question codes in the selected organization, rather than loading the entire organization library.
- Lesson-pack retries are resumable: a lesson is skipped only when its lesson code and all three expected question codes already exist. Remaining untouched lessons are imported in chunks of up to 40 lessons (up to 120 questions).
- If only part of a lesson code group exists, the importer stops and identifies the objective for manual inspection; it does not overwrite or guess how to repair partial records.
- Question-only imports skip only existing question codes that pass the trusted database completeness check; incomplete, mismatched or unverified existing records block the retry. New questions are imported in chunks of up to 40.
- Imports run in chunks of up to 40 lessons (or 40 questions). The UI identifies the exact failed chunk number and total, reports the number of records saved by earlier completed chunks, and distinguishes a failure before any chunk was saved from a partial import. After either success or failure, it refreshes the teacher content library and question-bank views; refresh failures do not mask the original import result. If a chunk fails, the repository attempts to delete that chunk's newly created parent records. This is compensating cleanup, not a single multi-table database transaction. The schema enforces the dependency chain: deleting a lesson parent cascades to its content versions and objective mappings; deleting a question parent cascades to its versions; deleting each question version cascades to its protected evaluation key and objective mappings. The importer deletes question parents before lesson parents, then verifies the exact parent-row deletion counts. It now verifies the number of deleted question and lesson parent rows against the number created; a partial or RLS-blocked delete is reported as a cleanup failure even when the database request itself returned no error. If cleanup fails or the deleted-row count does not match, the draft libraries must be checked before retrying. Earlier successful lesson chunks remain saved and can be skipped on a subsequent retry only after lesson and question integrity checks pass. Question-only retries likewise skip only database-verified complete questions.

## Repeatable parser validation

Run `npm.cmd run validate:science-packs` from the repository root before importing Science core material. It transpiles and executes the actual TypeScript teacher-pack parser, then validates all five core packs: 139 primary P1–P6 lessons and 276 secondary M1–M6 lessons, for 415 core lessons and 1,245 answer-keyed formative tasks. It checks lesson counts, grade distribution, heading/objective grade agreement, cross-pack unique objective codes, sequential question numbers, non-empty answer keys and primary teacher-only marking guides.

Run `npm.cmd run validate:science-specialist-packs` to validate the 12 Biology, Chemistry, Physics and Earth/Space packs: 300 lessons and 900 answer-keyed questions.

Run `npm.cmd run validate:science-rollout-packs` for the aggregate 17-pack gate. It checks every import file together, including each pack's expected lesson count, grade scope, question count, subject totals, language allocation and duplicate subject/grade objective identities. Expected total: 715 lessons and 2,145 questions (139 Thai primary lessons / 417 tasks; 576 English secondary and specialist lessons / 1,728 questions).

These are source-pack/parser checks; they do not replace authenticated preview, draft-save import and teacher/student acceptance tests in the application. CI also runs the independent validators for the other learning areas. A failure in another subject's validator is reported separately and does not mean the Science parser failed.

## Complete 17-pack Science rollout gate

Run `npm run validate:science-rollout-packs` to validate all 17 primary, secondary-core and upper-secondary specialist import files together through the actual TypeScript importer parser. This aggregate check independently asserts each pack's lesson/question counts, grade scope, three sequential answer-keyed questions per lesson, duplicate subject/grade objective identities, language allocation and subject totals. Expected totals: 715 lessons and 2,145 questions (Thai 139/417; English 576/1,728). CI runs this gate after the core and specialist Science validators.

## Complete imported question-group verification

After importing the 17 Science packs as drafts, run `docs/learning/science/SCIENCE-IMPORT-COMPLETE-GROUP-VERIFICATION.sql` in the authorized Supabase SQL editor. It is read-only and does not create, update, delete or publish records.

The query starts from each imported lesson and generates its three expected question codes (`Q01`, `Q02`, `Q03`). It then LEFT JOINs the question, version, protected evaluation key and objective link. This is important: checks that start from versions or objective links can silently omit a question whose dependent record is missing.

Expected result: 2,145 `QUESTION_SLOT` rows plus one `SUMMARY` row, all marked `PASS`. The query detects missing or duplicate question rows, versions and protected answer keys; missing or incorrect objective links; wrong language/status; and curriculum/grade/subject alignment errors. Any `CHECK_*` result or a summary other than `PASS` blocks acceptance. Inspect the affected draft records through the authorized workflow before attempting recovery.

CI validates the SQL contract offline. It checks that all three expected slots are generated and that every dependent table is LEFT JOINed. It does not connect to Supabase or claim that content has been imported.

## Question Bank access

The Question Bank now lets an authorized teacher select a curriculum, grade and subject independently of the selected access class. The class still establishes the organization context. Academic filtering uses batched version/objective lookups so large imported packs do not cause one database request per question.

## Scope and release boundary

The importer uses the authenticated Supabase client and existing row-level security policies. It does not use a service-role key, invent a system teacher, bypass RLS, publish records, create school/class/student rows, or modify live pilot data automatically.

The importer is implemented in the repository. The 14 consolidated secondary Science import files contain 576 lessons and 1,728 answer-keyed questions; none have been imported. Separate primary P1–P6 packs contain 139 lessons and 417 formative tasks. Across the full P1–M6 core set, 415 lessons and 1,245 formative tasks are prepared; the 300 specialist upper-secondary outcomes add 300 lessons and 900 questions. Total prepared material is 715 lessons and 2,145 questions. Live Supabase currently has zero imported Science lessons and zero Science questions. Curriculum priorities and grade alignments have been reconciled against the live catalogue. The latest draft PR #174 run passed the Science core and specialist parser validations, all other subject validators except Social Studies, production build and ESLint. The overall workflow remains failed only at the Social Studies pack step. No curriculum-pack records were created by CI. An authorized teacher must still perform the authenticated preview and controlled draft-save workflow in the target organization. End-to-end student/teacher checks remain pending.


## Social Studies shared-grade outcomes

Social Studies teacher packs use objective codes such as `SO2.1-P4-03`. The parser preserves the dotted standard code and maps the embedded grade to the exact grade-level alignment. The upper-secondary pack uses 61 shared `M46` outcomes; each aligns to M4, M5 and M6. The importer expands each shared outcome into three grade-specific draft lessons and uses grade-scoped content/question codes to avoid duplicate-code collisions. The official Thai indicator wording supplies the imported lesson title. No record is published automatically.

Run `npm run validate:social-studies-packs` to verify all 418 Social Studies indicators and 1,254 answer-keyed formative tasks through the actual TypeScript importer parser.


## Duplicate-code preflight and safe retry behavior

Before inserting either a lesson pack or a question-only pack, the authenticated importer checks the target organization for existing normalized content and question codes. Codes are compared using the same canonical normalization used for persistence, so differences in letter case, spaces or punctuation do not bypass the check. The preflight query is batched to keep large-pack requests bounded.

If the importer reports an existing code:
1. Stop the retry; do not repeatedly submit the same pack or generate replacement codes just to bypass the warning.
2. Inspect the target organization's draft content and question bank for the reported codes.
3. Determine whether the earlier attempt completed, partially completed, or left records requiring an authorized cleanup/reconciliation.
4. Resume only with the confirmed missing chunks and their original intended codes, after resolving the existing records through the authorized application workflow.

The preflight check is an early diagnostic guard. Database uniqueness constraints remain authoritative if two import sessions race between preflight and insert. No import should be run against the live pilot as a recovery test. The offline regression gate is `npm run validate:learning-pack-import-preflight`; CI runs it with the other learning-content validators. The shared retry planner now receives only database-verified complete question codes. Before any existing question code can be skipped, the authenticated importer calls `verify_learning_pack_import_questions`, which checks the exact prompt, protected expected answer, manual-review response configuration and scoring mode, version count, objective mapping and academic scope. A class teacher can verify only question drafts they created; an authorized academic manager can inspect organization-wide imports. This prevents the completeness endpoint from becoming a cross-teacher protected-answer guessing oracle. The RPC returns only completeness flags; protected answer-key JSON never reaches the browser. Existing lesson codes are also checked for their version, expected lesson sections, draft/language state, metadata and exact objective link. Parent-only, question-only, orphaned or partially-created groups stop with an objective-specific error; question-only retries skip only complete records. The offline regression gate is `npm run validate:learning-pack-import-integrity`, and CI runs it without connecting to Supabase.


The authenticated import retry now verifies the integrity of existing records before skipping them. It calls the organization-scoped `verify_learning_pack_import_questions` RPC, which checks prompt, protected expected answer, scoring mode, exact version count, objective link and active curriculum/grade/subject alignment while returning no answer-key data to the browser. Existing lesson drafts are checked for their version, expected content sections, draft/language state, metadata and exact objective mapping. Any incomplete or mismatched existing record blocks retry before writes. CI validates this contract offline; the migration still requires an authorized deployment and has not been applied to Supabase.
