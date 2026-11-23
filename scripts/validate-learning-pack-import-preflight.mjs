import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const source = await readFile(resolve(process.cwd(), "src/features/learning-content/utils/learning-pack-import-validation.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.length ?? 0, 0, "Import validation helper must transpile cleanly.");
const moduleUrl = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { normalizeLearningImportCode, findExistingImportCodeConflicts, formatExistingImportCodeConflict, planResumableLessonImport, selectNewImportQuestions } = await import(moduleUrl);

assert.equal(normalizeLearningImportCode(" ep sci/p1 001 "), "EP-SCI-P1-001");
assert.equal(normalizeLearningImportCode("..."), "");
assert.deepEqual(findExistingImportCodeConflicts({
  requestedContentCodes: ["ep-sci-p1-001", "ep-sci-p1-002"],
  requestedQuestionCodes: ["q-001", "q-002"],
  existingContentCodes: new Set(["EP SCI P1 001"]),
  existingQuestionCodes: new Set(["Q-002"]),
}), { contentCodes: ["EP-SCI-P1-001"], questionCodes: ["Q-002"] });
assert.deepEqual(findExistingImportCodeConflicts({
  requestedContentCodes: ["new-lesson"],
  requestedQuestionCodes: ["new-question"],
  existingContentCodes: new Set(["old-lesson"]),
  existingQuestionCodes: new Set(["old-question"]),
}), { contentCodes: [], questionCodes: [] });
assert.equal(formatExistingImportCodeConflict({ contentCodes: [], questionCodes: [] }), null);
assert.match(formatExistingImportCodeConflict({ contentCodes: ["LESSON-1"], questionCodes: ["Q-1"] }), /1 lesson code\(s\): LESSON-1; 1 question code\(s\): Q-1/);

const lesson = (code) => ({
  objectiveCode: code,
  contentImportCode: `EP-${code}-LESSON`,
  questions: [1, 2, 3].map((number) => ({ code: `EP-${code}-Q0${number}` })),
});
const fresh = lesson("SCI-P1-001");
const complete = lesson("SCI-P1-002");
assert.deepEqual(
  planResumableLessonImport(
    [fresh, complete],
    new Set([complete.contentImportCode.toLowerCase()]),
    new Set(complete.questions.map((question) => question.code.toLowerCase())),
  ),
  { lessonsToImport: [fresh], skippedLessons: 1 },
  "A complete prior lesson group must be skipped while untouched lessons remain importable.",
);
assert.throws(
  () => planResumableLessonImport([fresh], new Set([fresh.contentImportCode]), new Set()),
  /SCI-P1-001.*lesson record: yes; existing questions: 0\/3/,
  "A parent lesson without its questions must stop the retry.",
);
assert.throws(
  () => planResumableLessonImport([fresh], new Set(), new Set([fresh.questions[0].code])),
  /SCI-P1-001.*lesson record: no; existing questions: 1\/3/,
  "Question records without the parent lesson must stop the retry.",
);
assert.throws(
  () => planResumableLessonImport(
    [fresh],
    new Set([fresh.contentImportCode]),
    new Set(fresh.questions.slice(0, 2).map((question) => question.code)),
  ),
  /existing questions: 2\/3/,
  "A partially-created lesson group must stop the retry.",
);
const questionCandidates = [
  { code: "NEW-Q-01" },
  { code: "OLD-Q-02" },
  { code: "NEW-Q-03" },
];
assert.deepEqual(
  selectNewImportQuestions(questionCandidates, new Set(["old q 02"])),
  { questionsToImport: [questionCandidates[0], questionCandidates[2]], skippedQuestions: 1 },
  "Question-only retry must skip existing normalized codes and preserve untouched questions.",
);

process.stdout.write("PASS: import preflight, collision detection, resumable lesson retries and question-only retry selection.\n");
