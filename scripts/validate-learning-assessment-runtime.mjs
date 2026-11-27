import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime = readFileSync("src/features/learning-dashboard/pages/LearningAssessmentRuntimePage.tsx", "utf8");

assert.ok(runtime.includes("useRef<Promise<void>>(Promise.resolve())"), "answer writes must use a persistent promise queue");
assert.ok(runtime.includes("answerSaveQueue.current = queuedSave"), "each save must extend the queue");
assert.ok(runtime.includes(".catch(() => undefined)\n      .then(async () => {"), "a failed save must not block later corrections");
assert.ok(runtime.includes("pendingAnswerSaves > 0 || saveAnswerMutation.isError"), "submission must wait for all answer writes");
assert.ok(runtime.includes("listQuestionVersionsByIds("), "assessment runtime must load question versions in a single bounded batch");
assert.ok(!runtime.includes("getQuestionVersion("), "assessment runtime must not issue one question-version request per question");
assert.ok(runtime.includes('pendingAnswerSaves > 0 ? "Saving answers..." '), "the submit control must show the saving state");

console.log("Learning assessment runtime contract passed: answer writes are serialized, submissions wait for persistence, and question versions load in batches.");
