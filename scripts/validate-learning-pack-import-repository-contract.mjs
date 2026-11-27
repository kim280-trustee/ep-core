import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const repositoryPath = resolve(process.cwd(), "src/features/learning-content/repositories/learning-pack-import.repository.ts");
const source = await readFile(repositoryPath, "utf8");
const pagePath = resolve(process.cwd(), "src/features/learning-content/pages/TeacherContentImportPage.tsx");
const pageSource = await readFile(pagePath, "utf8");

const contentSchemaPath = resolve(process.cwd(), "supabase/migrations/20260918230000_learning_content_foundation.sql");
const questionSchemaPath = resolve(process.cwd(), "supabase/migrations/20260919000000_learning_assessment_engine.sql");
const evaluationKeySecurityPath = resolve(process.cwd(), "supabase/migrations/20261116012908_learning_security_definer_remediation.sql");
const [contentSchema, questionSchema, evaluationKeySecurity] = await Promise.all([
  readFile(contentSchemaPath, "utf8"),
  readFile(questionSchemaPath, "utf8"),
  readFile(evaluationKeySecurityPath, "utf8"),
]);

// Parent-row rollback depends on these explicit FK cascades.
const lessonCascadeCount = [...contentSchema.matchAll(/content_item_id uuid not null references public\.learning_content_items\(id\) on delete cascade/gi)].length;
assert.ok(lessonCascadeCount >= 2,
  "Lesson deletion must cascade to both content versions and objective mappings.");
assert.match(questionSchema, /question_id uuid not null references public\.learning_questions\(id\) on delete cascade/i,
  "Question deletion must cascade to question versions.");
assert.match(questionSchema, /question_version_id uuid primary key references public\.learning_question_versions\(id\) on delete cascade/i,
  "Question-version deletion must cascade to protected evaluation keys.");
assert.match(questionSchema, /question_version_id uuid not null references public\.learning_question_versions\(id\) on delete cascade/i,
  "Question-version deletion must cascade to objective mappings.");
assert.match(evaluationKeySecurity, /public\.learning_can_manage_academic_records\(v_organization_id\)[\s\S]*?cm\.membership_type = 'teacher'[\s\S]*?cm\.status = 'active'[\s\S]*?u\.auth_user_id = v_auth_user_id/i,
  "Protected evaluation-key writes must require active teacher membership or academic-record management permission.");
assert.match(evaluationKeySecurity, /for update of qv/i,
  "Protected evaluation-key writes must lock the question version while checking publication state.");

function methodBody(methodName, nextMethodName) {
  const start = source.indexOf("  async " + methodName + "(");
  assert.notEqual(start, -1, "Repository method " + methodName + " must exist.");
  const end = nextMethodName
    ? source.indexOf("  async " + nextMethodName + "(", start + 1)
    : source.indexOf("\n};", start);
  assert.notEqual(end, -1, "Repository method boundary after " + methodName + " must exist.");
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
assert.match(source, /const MAX_IMPORT_CHUNK_ITEMS = 40/,
  "Both import paths must enforce the same bounded 40-item chunk ceiling.");
assert.match(questionOnly, /input\.questions\.length > MAX_IMPORT_CHUNK_ITEMS/,
  "Question-only imports must reject oversized chunks before any database lookup or write.");
assert.match(lessonChunk, /input\.lessons\.length > MAX_IMPORT_CHUNK_ITEMS/,
  "Lesson imports must reject oversized chunks before any database lookup or write.");
assert.match(source, /function assertExactUniqueValues/,
  "Import writes must share an exact-set acknowledgement verifier.");
assert.match(questionOnly, /assertExactUniqueValues\(\[\.\.\.questionByCode\.keys\(\)\], codes, "question parents"\)/,
  "Question-only imports must verify exact returned question codes.");
assert.match(lessonChunk, /assertExactUniqueValues\(\[\.\.\.contentByCode\.keys\(\)\], contentCodes, "lesson parents"\)/,
  "Lesson imports must verify exact returned lesson codes.");
assert.match(source, /insert\(contentVersionRows\)[\s\S]*?select\("id,content_item_id"\)[\s\S]*?insertedContentVersions/,
  "Lesson version writes must return and verify persisted parent coverage.");
assert.match(source, /insert\(contentObjectiveRows\)[\s\S]*?select\("content_item_id,objective_id"\)[\s\S]*?insertedContentObjectives/,
  "Lesson objective links must return and verify persisted coverage.");
assert.match(source, /insert\(objectiveRows\)[\s\S]*?select\("question_version_id,objective_id"\)[\s\S]*?insertedQuestionObjectives/,
  "Question-only objective links must return and verify persisted coverage.");
assert.match(source, /insert\(questionObjectiveRows\)[\s\S]*?select\("question_version_id,objective_id"\)[\s\S]*?insertedLessonQuestionObjectives/,
  "Lesson-pack question objective links must return and verify persisted coverage.");
const questionVerification = methodBody("verifyExistingQuestionImports", "findIncompleteExistingContentCodes");
assert.match(questionVerification, /new Set\(expectedCodes\)\.size !== expectedCodes\.length/,
  "Question integrity verification must reject duplicate normalized input codes.");
assert.match(questionVerification, /!batchCodes\.has\(code\) \|\| receivedCodes\.has\(code\)/,
  "Question integrity verification must reject unexpected and duplicate response codes.");
assert.match(questionVerification, /typeof row\.question_exists !== "boolean" \|\| typeof row\.is_complete !== "boolean"/,
  "Question integrity verification must reject malformed boolean response fields.");
assert.match(questionVerification, /receivedCodes\.size !== batch\.length/,
  "Question integrity verification must confirm exact response-code coverage before making retry decisions.");

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
assert.match(questionOnly, /\.delete\(\)[\s\S]*?\.select\("id"\)[\s\S]*?deletedQuestions\?\.length[\s\S]*?createdQuestionIds\.length/,
  "Question-only rollback must confirm every created question was actually deleted.");
assert.match(lessonChunk, /\.delete\(\)[\s\S]*?\.select\("id"\)[\s\S]*?deletedQuestions\?\.length[\s\S]*?createdQuestionIds\.length/,
  "Lesson rollback must confirm every created question was actually deleted.");
assert.match(lessonChunk, /\.delete\(\)[\s\S]*?\.select\("id"\)[\s\S]*?deletedContent\?\.length[\s\S]*?createdContentIds\.length/,
  "Lesson rollback must confirm every created content row was actually deleted.");
const questionDeleteIndex = lessonChunk.indexOf('.from("learning_questions")');
const contentDeleteIndex = lessonChunk.indexOf('.from("learning_content_items")', questionDeleteIndex + 1);
assert.ok(questionDeleteIndex >= 0 && contentDeleteIndex > questionDeleteIndex,
  "Lesson rollback must delete question parents before lesson parents, preserving the FK cascade cleanup order.");

assert.match(source, /Cleanup also failed|Cleanup also reported/,
  "Cleanup failures must be surfaced with actionable recovery guidance.");


assert.match(pageSource, /planResumableLessonImport/,
  "The import page must use the shared, tested lesson retry planner.");
assert.match(pageSource, /selectNewImportQuestions/,
  "The import page must use the shared, tested question-only retry planner.");
assert.doesNotMatch(pageSource, /const newLessons: ResolvedLesson/,
  "Lesson retry decisions must not be duplicated inline in the page.");
assert.match(pageSource, /failedChunk = \{ kind: "question", number: chunkNumber, total: totalChunks \}/, "Question-only imports must capture the failed chunk before awaiting its write.");
assert.match(pageSource, /failedChunk = \{ kind: "lesson", number: chunkNumber, total: totalChunks \}/, "Lesson imports must capture the failed chunk before awaiting its write.");
assert.match(pageSource, /formatImportChunkFailure\(/, "The UI must report the exact failed chunk and recovery boundary.");
assert.match(pageSource, /failedChunk \? `Nothing was saved from this run\./, "A first-chunk failure must be distinguished from a partial import.");
assert.match(pageSource, /catch \(error\) \{[\s\S]*?await invalidateImportQueries\(\);[\s\S]*?Partial import:/, "Failed imports must refresh teacher content and question-bank caches after any earlier chunks have committed.");
assert.match(pageSource, /await Promise\.allSettled\(\[/, "Cache refresh failures must not mask the original import result.");

process.stdout.write("PASS: importer contract — preflight, bounded lookups, verified rollback, FK cascades and protected-key authorization.\n");
