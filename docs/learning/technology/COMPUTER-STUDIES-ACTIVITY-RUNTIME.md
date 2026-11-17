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
