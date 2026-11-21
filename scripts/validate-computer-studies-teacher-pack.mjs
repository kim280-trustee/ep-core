import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const root = process.cwd();
const parserSource = await readFile(resolve(root, "src/features/learning-content/utils/teacher-pack-parser.ts"), "utf8");
const compiled = ts.transpileModule(parserSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
if (compiled.diagnostics?.length) {
  for (const diagnostic of compiled.diagnostics) process.stderr.write(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") + "\n");
  process.exit(1);
}
const url = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { parseTeacherPackMarkdown, extractTeacherPackGradeCode } = await import(url);

const path = "docs/learning/technology/COMPUTER-STUDIES-M1-M3-COMPLETE-IMPORT.md";
const markdown = await readFile(resolve(root, path), "utf8");
const lessons = parseTeacherPackMarkdown(markdown);
const expected = { M1: 8, M2: 9, M3: 12 };
const counts = {};
const codes = new Set();
const failures = [];

if (lessons.length !== 29) failures.push("Expected 29 Click Start lessons, parsed " + lessons.length);
for (const lesson of lessons) {
  const code = lesson.objectiveCode;
  const match = code?.match(/^(M[1-3])-\d{2}$/);
  if (!match) {
    failures.push("Lesson " + lesson.number + " has invalid or missing grade-scoped objective code " + String(code));
  } else {
    const grade = match[1];
    counts[grade] = (counts[grade] ?? 0) + 1;
    if (extractTeacherPackGradeCode(code) !== grade) failures.push(code + ": importer grade extraction mismatch");
    if (codes.has(code)) failures.push("Duplicate Click Start objective code: " + code);
    codes.add(code);
  }
  if (!lesson.learningOutcome.trim() || !lesson.activity.trim()) failures.push((code ?? "lesson " + lesson.number) + ": learning outcome or practical activity is empty");
  if (lesson.questions.length !== 3) failures.push((code ?? "lesson " + lesson.number) + ": expected 3 answer-keyed practice questions, parsed " + lesson.questions.length);
  for (const question of lesson.questions) {
    if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push((code ?? "lesson " + lesson.number) + ": question " + question.number + " has an empty prompt or answer");
  }
}
for (const [grade, total] of Object.entries(expected)) {
  if ((counts[grade] ?? 0) !== total) failures.push("Expected " + total + " " + grade + " lessons, found " + (counts[grade] ?? 0));
}
if (codes.size !== 29) failures.push("Expected 29 unique Click Start objective codes, found " + codes.size);
if (failures.length) {
  process.stderr.write("\nComputer Studies pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("PASS: Cambridge Click Start M1–M3 parsed as 29 grade-scoped lessons and 87 answer-keyed practice questions through the actual TypeScript importer parser.\n");
}
