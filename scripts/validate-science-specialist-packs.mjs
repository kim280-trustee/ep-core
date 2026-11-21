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

const packs = [
  { subject: "BIOLOGY", grade: "M4", expected: 32 },
  { subject: "BIOLOGY", grade: "M5", expected: 39 },
  { subject: "BIOLOGY", grade: "M6", expected: 37 },
  { subject: "CHEMISTRY", grade: "M4", expected: 28 },
  { subject: "CHEMISTRY", grade: "M5", expected: 38 },
  { subject: "CHEMISTRY", grade: "M6", expected: 15 },
  { subject: "PHYSICS", grade: "M4", expected: 17 },
  { subject: "PHYSICS", grade: "M5", expected: 26 },
  { subject: "PHYSICS", grade: "M6", expected: 24 },
  { subject: "EARTH-SPACE", grade: "M4", expected: 12 },
  { subject: "EARTH-SPACE", grade: "M5", expected: 13 },
  { subject: "EARTH-SPACE", grade: "M6", expected: 19 },
];

const failures = [];
const totals = { lessons: 0, questions: 0 };
for (const pack of packs) {
  const path = "docs/learning/science/" + pack.subject + "-" + pack.grade + "-IMPORT.md";
  const markdown = await readFile(resolve(root, path), "utf8");
  const lessons = parseTeacherPackMarkdown(markdown);
  const identities = new Set();
  let questions = 0;
  if (lessons.length !== pack.expected) failures.push(path + ": expected " + pack.expected + " lessons, parsed " + lessons.length);

  for (const lesson of lessons) {
    const identity = lesson.objectiveCode ?? lesson.objectiveText ?? "";
    if (!identity.trim()) failures.push(path + ": lesson " + lesson.number + " has no objective code or objective text");
    if (identity && identities.has(identity)) failures.push(path + ": duplicate objective identity " + identity);
    if (identity) identities.add(identity);

    if (lesson.objectiveCode) {
      const grade = extractTeacherPackGradeCode(lesson.objectiveCode);
      if (grade && grade !== pack.grade) failures.push(path + ": " + lesson.objectiveCode + " resolves to " + grade + ", expected " + pack.grade);
    }
    if (!lesson.learningOutcome.trim() || !lesson.activity.trim()) failures.push(path + ": lesson " + lesson.number + " has empty learning outcome or activity");
    if (lesson.questions.length !== 3) failures.push(path + ": lesson " + lesson.number + " has " + lesson.questions.length + " answer-keyed questions; expected 3");
    for (const question of lesson.questions) {
      questions += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push(path + ": lesson " + lesson.number + " question " + question.number + " is missing prompt or answer guidance");
    }
  }

  const expectedQuestions = pack.expected * 3;
  if (questions !== expectedQuestions) failures.push(path + ": expected " + expectedQuestions + " questions, parsed " + questions);
  totals.lessons += lessons.length;
  totals.questions += questions;
  process.stdout.write("Parsed " + path + ": " + lessons.length + " lessons and " + questions + " answer-keyed questions.\n");
}

if (totals.lessons !== 300) failures.push("Expected 300 specialist Science lessons, found " + totals.lessons);
if (totals.questions !== 900) failures.push("Expected 900 specialist Science questions, found " + totals.questions);

if (failures.length) {
  process.stderr.write("\nSpecialist Science validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: 300 Biology, Chemistry, Physics and Earth/Space specialist lessons and 900 answer-keyed questions parsed by the actual TypeScript importer parser.\n");
  process.stdout.write("Grade counts: Biology 32/39/37; Chemistry 28/38/15; Physics 17/26/24; Earth/Space 12/13/19 (M4/M5/M6).\n");
}
