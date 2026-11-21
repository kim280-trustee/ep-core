import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const root = process.cwd();
const parserPath = resolve(root, "src/features/learning-content/utils/teacher-pack-parser.ts");
const parserSource = await readFile(parserPath, "utf8");
const compiled = ts.transpileModule(parserSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
if (compiled.diagnostics?.length) {
  for (const diagnostic of compiled.diagnostics) {
    process.stderr.write("Parser TypeScript error: " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") + "\n");
  }
  process.exit(1);
}
const parserUrl = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { parseTeacherPackMarkdown, extractTeacherPackGradeCode } = await import(parserUrl);

const packs = [
  { path: "docs/learning/maths/M1-mathematics-teacher-starter-pack.md", lessons: 9, grades: { M1: 9 } },
  { path: "docs/learning/maths/M2-M3-mathematics-teacher-starter-pack.md", lessons: 24, grades: { M2: 12, M3: 12 } },
  { path: "docs/learning/maths/M4-M6-mathematics-teacher-starter-pack.md", lessons: 8, grades: { M4: 3, M5: 4, M6: 1 } },
];

const codes = new Set();
const failures = [];
let totalLessons = 0;
let totalQuestions = 0;

for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const lessons = parseTeacherPackMarkdown(markdown);
  const gradeCounts = {};
  if (lessons.length !== pack.lessons) failures.push(pack.path + ": expected " + pack.lessons + " lessons, parsed " + lessons.length);

  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    const match = code?.match(/^(M[1-6])-K[1-3]_[1-3]-\d{2}$/);
    if (!match) {
      failures.push(pack.path + ": lesson " + lesson.number + " has invalid or missing Mathematics objective code " + String(code));
    } else {
      const grade = match[1];
      gradeCounts[grade] = (gradeCounts[grade] ?? 0) + 1;
      if (extractTeacherPackGradeCode(code) !== grade) failures.push(code + ": importer grade extraction did not resolve " + grade);
      if (codes.has(code)) failures.push("Duplicate Mathematics objective code: " + code);
      codes.add(code);
    }

    if (!lesson.activity.trim()) failures.push((code ?? "lesson " + lesson.number) + ": teaching activity is empty");
    if (lesson.questions.length !== 3) failures.push((code ?? "lesson " + lesson.number) + ": expected 3 answer-keyed questions, parsed " + lesson.questions.length);
    for (const question of lesson.questions) {
      totalQuestions += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push((code ?? "lesson " + lesson.number) + ": question " + question.number + " is missing a prompt or answer");
    }
  }

  for (const [grade, expected] of Object.entries(pack.grades)) {
    if ((gradeCounts[grade] ?? 0) !== expected) failures.push(pack.path + ": expected " + expected + " " + grade + " lessons, found " + (gradeCounts[grade] ?? 0));
  }
  totalLessons += lessons.length;
  process.stdout.write("Parsed " + pack.path + ": " + lessons.length + " lessons.\n");
}

if (totalLessons !== 41) failures.push("Expected 41 Mathematics lessons, found " + totalLessons);
if (codes.size !== 41) failures.push("Expected 41 unique Mathematics objective codes, found " + codes.size);
if (totalQuestions !== 123) failures.push("Expected 123 answer-keyed questions, found " + totalQuestions);

if (failures.length) {
  process.stderr.write("\nMathematics pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: 41 unique M1–M6 Mathematics objectives and 123 answer-keyed questions parsed by the actual TypeScript importer parser.\n");
}
