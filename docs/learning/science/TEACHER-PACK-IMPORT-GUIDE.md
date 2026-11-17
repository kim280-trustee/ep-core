# E&P Learning — Teacher Pack Import Guide

## Purpose

The generic teacher-pack importer converts the existing Markdown lesson packs into records in the existing E&P Learning content and assessment tables. It does not create a parallel content system or change the curriculum knowledge graph.

Open **Teacher Content Library → Import teacher pack**, or use the route `/teacher/content/import`.

## Before importing

- Sign in with a real, active teacher account.
- Select an assigned teacher class to identify the organization where the drafts will be created.
- Select the Thai Science curriculum, the pack's subject and its fallback grade.
- Upload one consolidated Markdown (`.md`) pack at a time. The complete Science corpus is consolidated into five subject-specific files so each import uses the correct subject scope.
- Check every objective code and grade shown in the preview. Code-less official outcomes are matched against the selected subject/grade catalogue; ambiguous matches block the import.

The selected class is used only to establish the teacher's organization access. It does not change that class, add a subject to it, or assign content to its students.

## Consolidated Science import files

Import each file separately, selecting the exact subject shown below while keeping curriculum `TH-SCI-M1-M6`. The objective codes carry the grade mapping, so one file can cover multiple grades within the same subject.

| Import file | Subject | Grades | Lessons | Questions |
|---|---|---|---:|---:|
| `SCIENCE-M1-M3-COMPLETE-IMPORT.md` | `SCI` — Science | M1–M3 | 142 | 426 |
| `BIOLOGY-M4-M6-COMPLETE-IMPORT.md` | `BIOLOGY` — Biology | M4–M6 | 108 | 324 |
| `CHEMISTRY-M4-M6-COMPLETE-IMPORT.md` | `CHEMISTRY` — Chemistry | M4–M6 | 81 | 243 |
| `PHYSICS-M4-M6-COMPLETE-IMPORT.md` | `PHYSICS` — Physics | M4–M6 | 67 | 201 |
| `EARTH-SPACE-M4-M6-COMPLETE-IMPORT.md` | `EARTH_SPACE` — Earth, Astronomy and Space Science | M4–M6 | 44 | 132 |
| **Total** | **5 subject imports** | **M1–M6** | **442** | **1,326** |

Each consolidated file includes the original source pack sections. Import one subject at a time; do not combine different subject codes in a single import because the importer validates against the selected subject.

## What the importer creates

For each validated lesson:

1. One `learning_content_items` row with content type `lesson`.
2. One initial `learning_content_versions` row containing the learning outcome, teaching activity/notes and the three student-facing practice prompts (never the answer keys). Pack-level safety/teaching/assessment guidance is stored in a separate `teacher_only` section.
3. One `learning_content_objectives` link to the exact curriculum objective.
4. Three `learning_questions` rows using the existing `short_answer` question type.
5. Three `learning_question_versions` rows with exact curriculum, grade and subject scope.
6. Three protected `learning_question_evaluation_keys` rows containing the teacher-pack expected answers.
7. Three `learning_question_objectives` links to the same objective.

Short-answer scoring uses `manual_review`. Answer keys are stored in the protected evaluation-key table and are not included in student-facing lesson content. The assessment builder supports published `short_answer` questions alongside automatically scored question types. Students submit written responses; attempts remain pending until an authorized teacher marks every written response in the teacher review queue at `/teacher/assessments/:assessmentId/review`. The trusted grading function finalizes the attempt and updates the assessment result and gradebook only after all manual responses are marked.

All imported content and questions remain **drafts**. The importer does not submit items for review or publish them. Pack-level safety/teaching/assessment guidance is marked with `type: teacher_only` and `audience: teacher`. The student content runtime excludes these sections, including legacy guidance sections identified by their teacher-guidance titles. The teacher content detail page displays the guidance in a clearly labelled teacher-only panel and preserves it when a new content version is saved. Teachers and authorized academic reviewers continue to use the existing review/publication lifecycle.

## Validation and failure handling

- Objective codes must resolve uniquely inside the selected subject.
- The objective must have an active alignment to the selected curriculum and grade.
- Code-less outcomes use exact text matching, conservative text similarity, or a unique grade-scoped outcome number. Ambiguous mappings stop the import; the importer does not silently choose one.
- Every lesson must contain exactly three questions with answer keys.
- Content and question codes are normalized to the existing uppercase, hyphen-separated content code convention.
- Existing codes are never overwritten. A duplicate stops the pack before the first insert.
- Inserts run in chunks of up to 40 lessons (up to 120 questions). If a chunk fails, the importer attempts to delete that chunk's newly created parent records so dependent versions and mappings cascade. If cleanup fails, the UI reports that the draft libraries must be checked before retrying.
- If a later chunk fails after earlier chunks succeeded, the UI reports the completed lesson/question counts. Do not blindly retry a partially completed pack; inspect the content and question libraries first.

## Question Bank access

The Question Bank now lets an authorized teacher select a curriculum, grade and subject independently of the selected access class. The class still establishes the organization context. Academic filtering uses batched version/objective lookups so large imported packs do not cause one database request per question.

## Scope and release boundary

The importer uses the authenticated Supabase client and existing row-level security policies. It does not use a service-role key, invent a system teacher, bypass RLS, publish records, create school/class/student rows, or modify live pilot data automatically.

The importer is implemented in the repository. The 45 Science curriculum migrations and the M2/M3 strand-integrity correction have been applied to the existing Supabase project; all 442 objectives and alignments have been verified. The five consolidated import files are prepared, but the 442 lesson drafts and 1,326 question drafts have **not** been imported. That final authoring step must be performed by an authorized teacher in the target organization. Import smoke tests, end-to-end student/teacher checks, and final local lint/build remain pending.
