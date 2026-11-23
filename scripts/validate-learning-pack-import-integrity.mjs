import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read = (path) => readFile(resolve(process.cwd(), path), "utf8");
const [migration, repository, page, types] = await Promise.all([
  read("supabase/migrations/20261123140000_verify_learning_pack_import_question_completeness.sql"),
  read("src/features/learning-content/repositories/learning-pack-import.repository.ts"),
  read("src/features/learning-content/pages/TeacherContentImportPage.tsx"),
  read("src/core/database/database.types.ts"),
]);

assert.match(migration, /security definer[\s\S]*set search_path = ''/i,
  "The protected-key verification must use a fixed search path.");
assert.match(migration, /auth\.uid\(\)/,
  "The verification RPC must require an authenticated user.");
assert.match(migration, /p_class_group_id uuid[\s\S]*public\.is_organization_member\(p_organization_id\)/,
  "The verification RPC must be scoped to the selected organization and class.");
assert.match(migration, /membership\.membership_type = 'teacher'[\s\S]*membership\.status = 'active'/,
  "The verification RPC must require an active teacher in the selected class or an academic manager.");
assert.match(migration, /public\.learning_can_manage_academic_records\(p_organization_id\)/,
  "The verification RPC must allow authorized academic managers.");
assert.match(migration, /public\.is_organization_member\(p_organization_id\)/,
  "The verification RPC must enforce organization membership.");
assert.match(migration, /revoke all on function public\.verify_learning_pack_import_questions\(uuid, uuid, jsonb\) from public, anon/i,
  "The verification RPC must not be executable by public or anonymous callers.");
assert.match(migration, /grant execute on function public\.verify_learning_pack_import_questions\(uuid, uuid, jsonb\) to authenticated/i,
  "The verification RPC must be callable by authenticated users.");
assert.match(migration, /question_version_count|version_count/,
  "The RPC must verify question versions.");
assert.match(migration, /learning_question_evaluation_keys/,
  "The RPC must verify protected evaluation-key presence and content internally.");
assert.match(migration, /learning_objective_alignments[\\s\\S]*learning_curriculum_subjects/,
  "The RPC must validate exact active objective-to-curriculum/grade/subject alignment.");
assert.match(migration, /learning_question_objectives/,
  "The RPC must verify objective mappings.");
assert.match(migration, /evaluation_key->>'expected_answer'/,
  "The RPC must compare the protected expected answer without returning it.");
assert.match(migration, /returns table \([\s\S]*question_code text[\s\S]*question_exists boolean[\s\S]*is_complete boolean[\s\S]*issue text/i,
  "The RPC must return only question identifiers and completeness flags.");
assert.doesNotMatch(migration, /returns table[\s\S]*evaluation_key jsonb/i,
  "The RPC must never return protected answer-key JSON.");

assert.match(repository, /verify_learning_pack_import_questions/,
  "The repository must use the trusted completeness RPC.");
assert.match(repository, /const batchSize = 100/,
  "Question integrity RPC requests must remain bounded.");
assert.match(repository, /findIncompleteExistingContentCodes/,
  "The repository must inspect existing lesson versions and objective links.");
assert.match(repository, /hasSection\("Learning outcome"/,
  "Existing lesson versions must be checked against the expected learning outcome.");
assert.match(repository, /hasSection\("Practice questions"/,
  "Existing lesson versions must be checked against their expected questions.");
assert.match(repository, /objectives\.length === 1/,
  "Existing lessons must have exactly one expected objective link.");

const planningStart = page.indexOf("const questionCandidates");
const questionCheck = page.indexOf("verifyExistingQuestionImports", planningStart);
const questionPlan = page.indexOf("selectNewImportQuestions", planningStart);
const lessonCheck = page.indexOf("findIncompleteExistingContentCodes", planningStart);
const lessonPlan = page.indexOf("planResumableLessonImport", planningStart);
assert.ok(questionCheck >= 0 && questionPlan > questionCheck,
  "Question completeness must be verified before question-only retry planning.");
assert.ok(lessonCheck >= 0 && lessonPlan > lessonCheck,
  "Lesson completeness must be verified before lesson retry planning.");
assert.match(page, /!integrity\?\.questionExists \|\| !integrity\.isComplete/,
  "Existing question codes without a complete integrity result must block retries.");
assert.match(types, /verify_learning_pack_import_questions:/,
  "Generated database types must include the verification RPC.");

process.stdout.write("PASS: import retries skip only complete lesson/question groups; protected answer keys remain server-side.\n");
