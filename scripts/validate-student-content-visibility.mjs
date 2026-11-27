import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const sourcePath = resolve(process.cwd(), "src/features/learning-content/utils/student-content-sections.ts");
const source = await readFile(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.length ?? 0, 0, "Student visibility helper must transpile without TypeScript diagnostics.");
const moduleUrl = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { getStudentVisibleContentSections } = await import(moduleUrl);

const visible = getStudentVisibleContentSections({
  sections: [
    { type: "text", title: "Learning outcome", body: "Explain the water cycle." },
    { type: "teacher_only", audience: "teacher", title: "Marking guide", body: "PRIVATE ANSWER KEY" },
    { type: "text", audience: "teacher", title: "Teacher notes", body: "PRIVATE STAFF NOTES" },
    { type: "text", title: "Safety and teaching guidance", body: "PRIVATE SAFETY NOTES" },
    { type: "text", title: "Answer key", body: "PRIVATE ANSWER KEY TITLE" },
    { type: "text", title: "Teacher rubric", body: "PRIVATE RUBRIC" },
    { type: "text", title: "Assessment notes", audience: "staff", body: "PRIVATE ASSESSMENT NOTES" },
    { type: "text", title: "Private lesson notes", visibility: "private", body: "PRIVATE VISIBILITY NOTES" },
    { type: "text", title: "Extra section", teacherOnly: true, body: "PRIVATE TEACHER FLAG" },
    { type: "text", title: "Answer-key", body: "PRIVATE PUNCTUATED KEY" },
    { type: "text", title: "Teacher_notes", body: "PRIVATE PUNCTUATED NOTES" },
    { type: "text", title: "Visible task", body: "Read the passage.", answerKey: "SECRET", teacherNotes: "SECRET", rubric: "SECRET", solution: "SECRET", internalMetadata: { expectedAnswer: "SECRET" } },
    { type: "text", title: "Student safety instructions", body: "Keep a safe distance from the equipment." },
    { type: "text", title: "Practice questions", body: "1. Describe evaporation." },
    { type: "code_activity", title: "Coding task", body: "Build a loop.", instructions: "Use a for loop.", starterCode: "for (;;) {}", requirements: ["loop"] },
    { type: "project_activity", title: "Project", body: "Create a model.", requirements: "Include labels." },
    { type: "text", title: "Empty", body: "   " },
    null,
    "invalid",
  ],
});

assert.deepEqual(
  visible.map((section) => section.title),
  ["Learning outcome", "Visible task", "Student safety instructions", "Practice questions", "Coding task", "Project"],
  "Only student-facing content sections should remain.",
);
const serialized = JSON.stringify(visible).toLowerCase();
for (const privateText of ["private answer key", "private staff notes", "private safety notes", "private answer key title", "private rubric", "private assessment notes", "private visibility notes", "private teacher flag", "private punctuated key", "private punctuated notes", "marking guide", "teacher notes", "secret"]) {
  assert.equal(serialized.includes(privateText), false, "Student content leaked teacher-only material: " + privateText);
}
assert.equal(visible[2].body, "Keep a safe distance from the equipment.", "Student-facing safety instructions must remain visible.");
assert.deepEqual(Object.keys(visible[1]).sort(), ["body", "instructions", "requirements", "starterCode", "title", "type"],
  "Student-visible sections must use an allow-listed output shape without arbitrary source metadata.");
assert.equal(visible[4].starterCode, "for (;;) {}", "Coding activity starter code must be preserved.");
assert.equal(visible[4].instructions, "Use a for loop.", "Coding activity instructions must be preserved.");
assert.equal(visible[5].requirements, "Include labels.", "Project requirements must be preserved.");
assert.deepEqual(getStudentVisibleContentSections({ sections: "not-an-array" }), [], "Malformed section payloads must safely return no sections.");

const runtime = await readFile(resolve(process.cwd(), "src/features/learning-dashboard/pages/LearningContentRuntimePage.tsx"), "utf8");
assert.match(runtime, /getStudentVisibleContentSections\(publishedVersion\.body\)/, "Student runtime must use the tested visibility boundary.");
process.stdout.write("PASS: student content filtering excludes teacher-only/legacy guidance and preserves supported activity sections.\n");
