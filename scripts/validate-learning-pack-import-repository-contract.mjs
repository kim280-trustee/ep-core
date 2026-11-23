import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const repositoryPath = resolve(process.cwd(), "src/features/learning-content/repositories/learning-pack-import.repository.ts");
const source = await readFile(repositoryPath, "utf8");

function methodBody(methodName, nextMethodName) {
  const start = source.indexOf(\`  async \${methodName}(\`);
  assert.notEqual(start, -1, \`Repository method \${methodName} must exist.\`);
  const end = nextMethodName
    ? source.indexOf(\`  async \${nextMethodName}(\`, start + 1)
    : source.indexOf("\n};", start);
  assert.notEqual(end, -1, \`Repository method boundary after \${methodName} must exist.\`);
  return source.slice(start, end);
}

const questionOnly = methodBody("importQuestionsOnly", "importChunk");
const lessonChunk = methodBody("importChunk");
const questionPreflight = questionOnly.indexOf("findExistingImportCodes");
const questionWrite = questionOnly.indexOf('.insert(questionRows)');
const lessonPreflight = lessonChunk.indexOf("findExistingImportCodes");
const lessonWrite = lessonChunk.indexOf('.insert(contentRows)');

assert.ok(questionPreflight >= 0 && questionWrite > questionPreflight,
  "Question-only imports must complete existing-code preflight before the first insert.");
assert.ok(lessonPreflight >= 0 && lessonWrite > lessonPreflight,
  "Lesson imports must complete existing-code preflight before the first insert.");
assert.match(questionOnly, /findExistingImportCodeConflicts\(/,
  "Question-only imports must block normalized existing-code collisions.");
assert.match(lessonChunk, /findExistingImportCodeConflicts\(/,
  "Lesson imports must block normalized existing-code collisions.");
assert.match(source, /const lookupBatchSize = 100/,
  "Existing-code lookups must remain bounded to batches of 100.");
assert.match(source, /\.slice\(offset, offset \+ lookupBatchSize\)/,
  "Existing-code lookup loops must slice each bounded batch.");
assert.match(questionOnly, /createdQuestionIds\.push\(/,
  "Question-only import must track created rows for failure cleanup.");
assert.match(lessonChunk, /createdContentIds\.push\(/,
  "Lesson import must track created content rows for failure cleanup.");
assert.match(lessonChunk, /createdQuestionIds\.push\(/,
  "Lesson import must track created question rows for failure cleanup.");
assert.match(source, /Promise\.allSettled\(batch\.map/,
  "Protected answer-key writes must settle all in-flight RPC calls before cleanup.");
assert.match(source, /save_learning_question_evaluation_key/,
  "Protected answer keys must use the authorized RPC rather than direct table inserts.");
assert.match(source, /Cleanup also failed|Cleanup also reported/,
  "Cleanup failures must be surfaced with actionable recovery guidance.");

process.stdout.write("PASS: importer integration contract — preflight-before-write, bounded lookups, cleanup tracking and protected answer-key RPC.\n");
