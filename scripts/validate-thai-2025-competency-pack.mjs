import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const root = process.cwd();
const parserPath = resolve(root, "src/features/learning-content/utils/teacher-pack-parser.ts");
const parserSource = await readFile(parserPath, "utf8");
const compiled = ts.transpileModule(parserSource, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
  reportDiagnostics: true,
});
const diagnostics = compiled.diagnostics ?? [];
if (diagnostics.length) {
  for (const diagnostic of diagnostics) {
    process.stderr.write("Parser TypeScript error: " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") + "\n");
  }
  process.exit(1);
}
const parserUrl = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { parseTeacherPackMarkdown, extractTeacherPackGradeCode } = await import(parserUrl);

const packPath = "docs/learning/thai-primary-2025/TH-PRIMARY-2025-P1-P3-COMPETENCY-IMPORT.md";
const markdown = await readFile(resolve(root, packPath), "utf8");
const lessons = parseTeacherPackMarkdown(markdown);
const capabilities = ["READ", "WRITE", "NUM", "SCI", "SOCIETY", "ECON", "HEALTH", "ARTS"];
const expectedCodes = new Set(
  ["P1", "P2", "P3"].flatMap((grade) => capabilities.map((capability) => grade + "-TH68-" + capability + "-01")),
);
const failures = [];
const seenCodes = new Set();
const grades = {};
let questionCount = 0;

if (lessons.length !== 24) failures.push("Expected 24 annual capability lessons, parsed " + lessons.length);

for (const lesson of lessons) {
  const code = lesson.objectiveCode;
  if (!code) {
    failures.push("Lesson " + lesson.number + " has no internal E&P objective code");
    continue;
  }
  if (seenCodes.has(code)) failures.push("Duplicate objective code: " + code);
  seenCodes.add(code);

  const grade = extractTeacherPackGradeCode(code);
  if (!grade || !["P1", "P2", "P3"].includes(grade)) {
    failures.push("Objective " + code + " does not resolve to P1, P2 or P3");
  } else {
    grades[grade] = (grades[grade] ?? 0) + 1;
  }

  const titleGrade = lesson.title.match(/^\[(P[1-3])\]/)?.[1];
  if (titleGrade !== grade) failures.push("Lesson " + lesson.number + " heading grade " + titleGrade + " does not match objective grade " + grade);
  if (!lesson.learningOutcome.trim()) failures.push("Lesson " + lesson.number + " has no annual outcome text");
  if (!lesson.activity.trim()) failures.push("Lesson " + lesson.number + " has no teaching activity");
  if (lesson.questions.length !== 3) failures.push("Lesson " + lesson.number + " has " + lesson.questions.length + " answer-keyed questions; expected 3");

  const questionNumbers = new Set();
  for (const question of lesson.questions) {
    questionCount += 1;
    if (questionNumbers.has(question.number)) failures.push("Lesson " + lesson.number + " repeats question " + question.number);
    questionNumbers.add(question.number);
    if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push("Lesson " + lesson.number + " has an empty prompt or answer key");
  }
  for (const number of [1, 2, 3]) {
    if (!questionNumbers.has(number)) failures.push("Lesson " + lesson.number + " is missing question " + number);
  }
}

for (const code of expectedCodes) {
  if (!seenCodes.has(code)) failures.push("Missing annual capability outcome code: " + code);
}
for (const code of seenCodes) {
  if (!expectedCodes.has(code)) failures.push("Unexpected outcome code: " + code);
}
for (const grade of ["P1", "P2", "P3"]) {
  if (grades[grade] !== 8) failures.push("Expected 8 " + grade + " outcomes, parsed " + (grades[grade] ?? 0));
}
if (questionCount !== 72) failures.push("Expected 72 answer-keyed formative questions, parsed " + questionCount);

if (failures.length) {
  process.stderr.write("Thai 2025 competency pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("PASS: Thai B.E. 2568 P1-P3 pack has 24 annual outcomes (8 per grade), 24 unique internal objective codes and 72 answer-keyed formative questions.\n");
}
