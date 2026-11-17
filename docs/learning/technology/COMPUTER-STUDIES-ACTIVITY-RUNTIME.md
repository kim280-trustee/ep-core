# Computer Studies activity runtime

Computer Studies activities use the shared E&P Learning content, assignment, response, teacher-review and gradebook workflows. They are not a separate student or teacher system.

## Supported activity sections

A published content version may contain one of these structured student sections:

- `code_activity`: JavaScript instructions and starter code. The student edits and runs code in a sandboxed iframe with an opaque origin, a restrictive Content Security Policy, no network connections, and a two-second execution timeout. The student submits the code and captured output for teacher review.
- `project_activity`: project instructions, submission requirements, an HTTPS project link, a student explanation and up to three evidence files.

Teacher answer keys, solutions and safety notes belong in a separate `teacher_only` section. The student runtime filters teacher-only sections before rendering content.

## Project evidence storage

Migration `20261117120000_learning_project_submission_storage.sql` creates the private `learning-project-submissions` bucket. Uploads are limited to 15 MB per file and three files per project response. Allowed formats are PDF, PNG, JPEG, WebP, TXT, ZIP and modern Office documents. Storage object paths are scoped to organization, assignment, content item and student. RLS permits the student to upload their own evidence and permits the assigned teacher or authorized academic manager to read it. Files are served to teachers through short-lived signed URLs.

## Marking and progress

Coding and project responses are saved through `learning_content_responses`. The existing teacher response review page displays structured code, output, project links and signed evidence links. Teachers award marks and feedback through the existing grading service, which remains responsible for gradebook synchronization. Required submitted content items continue to use the existing assignment completion and progress flow.

## Current runtime boundary

The first coding runner supports JavaScript only. It is an isolated browser execution surface for learning and manual teacher review; it is not a server-side code execution service or an automated correctness/grading engine. Teachers must inspect the submitted code/output or open the project evidence before awarding a final mark. Additional languages and automated test runners require a separately reviewed sandbox design.

## Digital-literacy assessment workflow

The existing Teacher Content Import page now supports a question-only mode for assessment packs. It validates each objective against the selected curriculum, subject and grade, then creates unpublished short-answer question drafts with protected manual-review answer keys. It does not create lesson records. Question-only imports use a distinct `-DL-Q` code namespace.

The M1–M6 question pack is `TECHNOLOGY-DIGITAL-LITERACY-ASSESSMENT-PACK.md` and contains 21 questions across seven grade-specific objective sections. After import, teachers review and publish questions in the Question Bank, attach the published questions to a grade- and subject-matched assessment in the Assessment Builder, and publish it through the existing workflow. Student responses use the existing teacher manual-review and gradebook synchronization lifecycle.

## End-to-end verification checklist

Run this only after the remaining Computer Studies implementation batch is complete:

1. Create and publish a JavaScript coding activity linked to a Technology objective; confirm teacher-only answer guidance is absent from the student view.
2. Open the activity as a student, edit and run the starter code, confirm output is captured, and confirm an endless loop is stopped by the runner timeout.
3. Save a draft, reload and confirm code is restored; submit and confirm the response becomes read-only.
4. Review the submitted code and output as the assigned teacher, award a mark and feedback, then confirm gradebook and student feedback are updated.
5. Create and publish a practical project activity; submit an HTTPS link, reflection and up to three allowed evidence files.
6. Confirm the storage layer rejects files over 15 MB, disallowed formats, invalid paths and a fourth evidence file; confirm only the student, assigned teacher and authorized academic manager can read evidence.
7. Open signed evidence links as the teacher, grade the project and confirm gradebook and student feedback updates.
8. Build and publish a Computer Studies digital-literacy assessment using the existing question bank and manual-review question workflow; submit a student attempt, mark it and confirm gradebook/progress synchronization.
