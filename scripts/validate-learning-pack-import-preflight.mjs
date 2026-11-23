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
process.stdout.write("PASS: import preflight normalization, collision detection and actionable error messages.\n");
