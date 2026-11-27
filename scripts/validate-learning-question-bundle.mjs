import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const migration = read("../supabase/migrations/20261126150000_create_learning_question_bundle_atomically.sql");
const repository = read("../src/features/learning-assessment/repositories/learning-assessment.repository.ts");
const service = read("../src/features/learning-assessment/services/learning-assessment.service.ts");
const page = read("../src/features/learning-assessment/pages/QuestionBankPage.tsx");

for (const token of [
  "security definer", "set search_path = ''", "auth.uid()", "learning_current_user_id()",
  "learning_can_manage_academic_records", "learning_is_active_teacher", "for update",
  "learning_question_versions", "learning_question_evaluation_keys", "learning_question_objectives",
  "manual_review", "exact_option", "revoke all", "grant execute on function",
]) assert.ok(migration.toLowerCase().includes(token.toLowerCase()), `Migration is missing ${token}`);

assert.ok(repository.includes('rpc("create_learning_question_bundle"'), "Repository must call the atomic authoring RPC");
assert.ok(repository.includes("Question bundle creation returned an incomplete result"), "Repository must validate RPC output");
assert.ok(service.includes("createQuestionBundle"), "Service must expose the atomic authoring operation");
assert.ok(page.includes("learningAssessmentService.createQuestionBundle("), "Question bank must use the atomic authoring operation");
assert.ok(!page.includes("learningAssessmentService.createQuestionVersion("), "Question bank must not create versions separately");
assert.ok(!page.includes("learningAssessmentService.saveQuestionEvaluationKey("), "Question bank must not save evaluation keys separately");
assert.ok(!page.includes("learningAssessmentService.addQuestionObjective("), "Question bank must not save objective mappings separately");

console.log("Atomic teacher question authoring bundle contract passed.");
