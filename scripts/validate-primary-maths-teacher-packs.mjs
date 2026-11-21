import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const root = process.cwd();
const source = await readFile(resolve(root, "src/features/learning-content/utils/teacher-pack-parser.ts"), "utf8");
const compiled = ts.transpileModule(source, {
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
  { path: "docs/learning/maths/PRIMARY-MATHEMATICS-P1-P3-TEACHER-STARTER-PACK.md", expected: 54, grades: { P1: 10, P2: 16, P3: 28 } },
  { path: "docs/learning/maths/PRIMARY-MATHEMATICS-P4-P6-TEACHER-STARTER-PACK.md", expected: 62, grades: { P4: 22, P5: 19, P6: 21 } },
];
const failures = [];
const codes = new Set();
const officialCodes = new Set();
const totals = { lessons: 0, questions: 0, must: 0, should: 0 };
const gradeCounts = {};

for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const lessons = parseTeacherPackMarkdown(markdown);
  if (lessons.length !== pack.expected) failures.push(pack.path + ": expected " + pack.expected + " lessons, parsed " + lessons.length);

  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    const match = code?.match(/^(P[1-6])-K([1-3]_[1-3])-(\d{2})$/);
    if (!match) {
      failures.push(pack.path + ": lesson " + lesson.number + " has invalid objective code " + String(code));
    } else {
      const [, grade, strand, index] = match;
      gradeCounts[grade] = (gradeCounts[grade] ?? 0) + 1;
      if (extractTeacherPackGradeCode(code) !== grade) failures.push(code + ": importer grade extraction mismatch");
      if (codes.has(code)) failures.push("Duplicate primary Mathematics objective code: " + code);
      codes.add(code);
    }
    if (!lesson.title.trim() || !lesson.learningOutcome.trim() || !lesson.activity.trim()) failures.push((code ?? "lesson " + lesson.number) + ": title, learning outcome or teaching activity is empty");
    if (lesson.questions.length !== 3) failures.push((code ?? "lesson " + lesson.number) + ": expected 3 answer-keyed questions, parsed " + lesson.questions.length);
    for (const question of lesson.questions) {
      totals.questions += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push((code ?? "lesson " + lesson.number) + ": question " + question.number + " has missing prompt or answer");
    }
  }

  for (const [grade, expected] of Object.entries(pack.grades)) {
    if ((gradeCounts[grade] ?? 0) !== expected) failures.push(pack.path + ": expected " + expected + " " + grade + " lessons, found " + (gradeCounts[grade] ?? 0));
  }

  const lessonBlocks = markdown.split(/^## Lesson \d+ — /m).slice(1);
  for (const block of lessonBlocks) {
    const code = block.match(/^\*\*Objective:\*\* `(P[1-6]-K[1-3]_[1-3]-\d{2})`/m)?.[1];
    const official = block.match(/^\*\*Official indicator:\*\* (ค [1-3]\.\d ป\.[1-6]\/\d+)/m)?.[1];
    const priority = block.match(/^\*\*Priority:\*\* (Must-Know|Should-Know)\s*$/m)?.[1];
    if (!code || !official || !priority) {
      failures.push(pack.path + ": a lesson is missing objective code, official indicator or priority label");
      continue;
    }
    const codeParts = code.match(/^(P[1-6])-K([1-3]_[1-3])-(\d{2})$/);
    const officialParts = official.match(/^ค ([1-3]\.\d) ป\.(\d)\/(\d+)$/);
    if (!officialParts || officialParts[1] !== codeParts[2].replace("_",".") || "P"+officialParts[2] !== codeParts[1] || Number(officialParts[3]) !== Number(codeParts[3])) {
      failures.push(code + ": official indicator crosswalk mismatch (" + official + ")");
    }
    if (officialCodes.has(official)) failures.push("Duplicate official primary Mathematics indicator: " + official);
    officialCodes.add(official);
    if (priority === "Must-Know") totals.must += 1;
    else totals.should += 1;
  }
  totals.lessons += lessons.length;
  process.stdout.write("Parsed " + pack.path + ": " + lessons.length + " lessons.\n");
}

const expectedGrades = { P1: 10, P2: 16, P3: 28, P4: 22, P5: 19, P6: 21 };
for (const [grade, expected] of Object.entries(expectedGrades)) {
  if ((gradeCounts[grade] ?? 0) !== expected) failures.push("Expected " + expected + " " + grade + " lessons, found " + (gradeCounts[grade] ?? 0));
}
if (totals.lessons !== 116 || codes.size !== 116 || officialCodes.size !== 116) failures.push("Expected 116 unique primary objectives; found " + totals.lessons + " lessons, " + codes.size + " internal codes and " + officialCodes.size + " official codes");
if (totals.questions !== 348) failures.push("Expected 348 answer-keyed questions, found " + totals.questions);
if (totals.must !== 82 || totals.should !== 34) failures.push("Expected 82 Must-Know and 34 Should-Know labels, found " + totals.must + " / " + totals.should);

if (failures.length) {
  process.stderr.write("\nPrimary Mathematics validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: 116 P1–P6 Mathematics objectives, 348 answer-keyed tasks, official indicator crosswalks and 82/34 priority labels validated through the actual TypeScript importer parser.\n");
}
