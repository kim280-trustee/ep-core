import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read = (path) => readFile(resolve(process.cwd(), path), "utf8");
const [responseSecurity, responseTable, gradebookGuard, repository] = await Promise.all([
  read("supabase/migrations/20261010000000_harden_learning_content_response_integrity.sql"),
  read("supabase/migrations/20261005133000_learning_student_content_responses.sql"),
  read("supabase/migrations/20261103090000_protect_content_response_gradebook_entries.sql"),
  read("src/features/learning-content/repositories/learning-content.repository.ts"),
]);

assert.match(responseSecurity, /revoke insert, update on table public\.learning_content_responses from public, anon, authenticated/i,
  "Response writes must be denied by default before narrow column grants are applied.");
assert.match(responseSecurity, /grant insert \(organization_id, assignment_id, content_item_id, content_version_id, student_user_id, response_text, status, submitted_at\)/i,
  "Students must not insert score, feedback or server-managed identity fields.");
assert.match(responseSecurity, /grant update \(response_text, status, submitted_at, updated_at\)/i,
  "Students must not update assignment, organization, identity, score or teacher feedback fields.");
assert.match(responseSecurity, /student_user_id = \(select u\.id from public\.users u where u\.auth_user_id = \(select auth\.uid\(\)\)\)/,
  "A student may only create or read their own response.");
assert.match(responseSecurity, /private\.learning_student_has_assignment_target\(assignment_id, student_user_id\)/,
  "Student response writes must require an active assignment target.");
assert.match(responseSecurity, /a\.status = 'published'[\s\S]*a\.available_from is null or a\.available_from <= now\(\)/,
  "Responses must be restricted to published and currently available assignments.");
assert.match(responseSecurity, /cv\.status = 'published'[\s\S]*cv\.published_at is not null/,
  "A supplied content version must be published before a response can reference it.");
assert.match(responseSecurity, /status = 'draft'[\s\S]*status in \('draft', 'submitted'\)/,
  "Only draft responses may be edited, and updates must remain in an allowed state.");
assert.match(responseSecurity, /create policy learning_content_responses_select[\s\S]*learning_can_manage_academic_records\(organization_id\)[\s\S]*learning_teacher_can_manage_content_response/,
  "Response reads must be scoped to the student, assigned teacher or academic manager.");

const gradingStart = responseSecurity.indexOf("CREATE OR REPLACE FUNCTION public.grade_learning_content_response");
assert.ok(gradingStart >= 0, "A guarded grading RPC must exist.");
const grading = responseSecurity.slice(gradingStart);
assert.match(grading, /auth\.uid\(\) is null/, "Grading requires authentication.");
assert.match(grading, /v_response\.status <> 'submitted'/, "Only submitted responses may be graded.");
assert.match(grading, /learning_can_manage_academic_records\(v_response\.organization_id\)[\s\S]*learning_teacher_can_manage_content_response/,
  "Grading must require a teacher assigned to the class or an academic manager.");
assert.match(grading, /p_score < 0 or p_score > p_max_score/, "Scores must be within the declared maximum.");
assert.match(grading, /v_response\.organization_id/, "Grading must preserve the response organization boundary.");

assert.match(gradebookGuard, /notes->>'source' = 'content_response'/,
  "Response-derived gradebook entries must be identified by source.");
assert.match(gradebookGuard, /must be corrected through the original content response workflow/,
  "Response-derived grades must be corrected through the response workflow.");
assert.match(gradebookGuard, /cannot be deleted from the Gradebook/,
  "Response-derived grades must not be manually deleted.");

const saveStart = repository.indexOf("  async saveStudentResponse(");
const saveEnd = repository.indexOf("\n  },", saveStart);
const saveMethod = repository.slice(saveStart, saveEnd);
assert.ok(saveStart >= 0 && saveEnd > saveStart, "Student response persistence method must be present.");
assert.match(saveMethod, /onConflict:"assignment_id,content_item_id,student_user_id"/,
  "Student responses must be uniquely upserted per assignment, content item and student.");
assert.match(saveMethod, /existing\.status==="submitted"/,
  "Submitted responses must be immutable to the student.");
assert.doesNotMatch(saveMethod, /score:|max_score:|teacher_feedback:/,
  "Student response persistence must never write grading fields.");
const gradeStart = repository.indexOf("  async gradeTeacherResponse(");
const gradeEnd = repository.indexOf("\n  },", gradeStart);
const gradeMethod = repository.slice(gradeStart, gradeEnd);
assert.match(gradeMethod, /grade_learning_content_response/,
  "Teacher grading must use the guarded database RPC.");

process.stdout.write("PASS: student response ownership, assignment/version availability, teacher grading and gradebook protection.\\n");
