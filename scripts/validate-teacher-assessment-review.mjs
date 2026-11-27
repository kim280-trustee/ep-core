import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/features/learning-assessment/pages/TeacherAssessmentReviewPage.tsx", "utf8");
const sql = readFileSync("supabase/tests/learning_security_contract.sql", "utf8");

assert.ok(page.includes("function isValidGradeDraft"), "teacher grade entry must use a shared score validator");
assert.ok(page.includes("Math.round(score * 100)"), "teacher marks must be limited to the supported two-decimal precision");
assert.ok(page.includes("score >= 0 && score <= maximum"), "teacher marks must stay within the question point range");
assert.ok(page.includes("maxLength={2000}"), "teacher feedback must have a bounded input length");
assert.ok(page.includes("reviewQuery.refetch()"), "teachers must be able to retry a failed response load");
assert.ok(page.includes("listQuestionVersionsByIds("), "review page must batch question version reads");
assert.ok(page.includes("listAttemptAnswersForAttempts("), "review page must batch answer reads across attempts");
assert.ok(!page.includes("listAttemptAnswers(attempt.id)"), "review page must not issue one answer request per attempt");
assert.ok(!page.includes("getQuestionVersion(item.questionVersionId)"), "review page must not issue one version request per question");
assert.ok(page.includes('gradeMutation.data?.status === "evaluated"'), "teacher confirmation must distinguish completed grading from remaining manual review");
assert.ok(sql.includes("grade_learning_attempt_answer(uuid,numeric,text)"), "database security contract must cover the manual grading RPC");
assert.ok(sql.includes("p_awarded_points > v_answer.points"), "database contract must assert server-side score upper bounds");
assert.ok(sql.includes("has_function_privilege('anon', 'public.grade_learning_attempt_answer"), "database contract must assert anonymous execution is denied");

console.log("Teacher assessment review contract passed: bounded marks, retry behavior, grading authorization and batched review loading are present.");
