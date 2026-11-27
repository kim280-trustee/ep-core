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
  for (const diagnostic of compiled.diagnostics) process.stderr.write("Parser TypeScript error: " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") + "\n");
  process.exit(1);
}
const parserUrl = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { parseTeacherPackMarkdown } = await import(parserUrl);

const packs = [
  { grade: "P1", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P1-TEACHER-STARTER-PACK.md", expectedLessons: 16 },
  { grade: "P2", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P2-TEACHER-STARTER-PACK.md", expectedLessons: 16 },
  { grade: "P3", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P3-TEACHER-STARTER-PACK.md", expectedLessons: 18 },
  { grade: "P4", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P4-TEACHER-STARTER-PACK.md", expectedLessons: 20 },
  { grade: "P5", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P5-TEACHER-STARTER-PACK.md", expectedLessons: 20 },
  { grade: "P6", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P6-TEACHER-STARTER-PACK.md", expectedLessons: 20 },
  { grade: "M1", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-M1-TEACHER-STARTER-PACK.md", expectedLessons: 20 },
  { grade: "M2", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-M2-TEACHER-STARTER-PACK.md", expectedLessons: 21 },
  { grade: "M3", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-M3-TEACHER-STARTER-PACK.md", expectedLessons: 21 },
  { grade: "M4-M6", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-M4-M6-TEACHER-STARTER-PACK.md", expectedLessons: 21 },
];
const register = await readFile(resolve(root, "docs/learning/foreign-languages/FOREIGN-LANGUAGES-INDICATOR-SOURCE-RECONCILIATION.csv"), "utf8");
const registeredCodes = new Set(register.split(/\r?\n/).filter(line => /^"FL-(?:P[1-6]|M[1-3]|M46)-/.test(line)).map(line => line.match(/^"([^"]+)"/)?.[1]).filter(Boolean));
const allCodes = new Set();
let lessonTotal = 0;
let questionTotal = 0;
const failures = [];

for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const lessons = parseTeacherPackMarkdown(markdown);
  if (lessons.length !== pack.expectedLessons) failures.push(pack.grade + ": expected " + pack.expectedLessons + " lessons, found " + lessons.length);
  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    if (!code || !(pack.grade === "M4-M6" ? code.startsWith("FL-M46-") : code.startsWith("FL-" + pack.grade + "-")) ) failures.push(pack.grade + " lesson " + lesson.number + ": objective code is missing or belongs to another grade");
    else {
      if (allCodes.has(code)) failures.push("Duplicate objective code: " + code);
      allCodes.add(code);
      if (!registeredCodes.has(code)) failures.push("Objective code is absent from source register: " + code);
    }
    if (!lesson.learningOutcome.trim()) failures.push(code + ": learning outcome is empty");
    if (!lesson.activity.trim()) failures.push(code + ": practical activity is empty");
    if (lesson.questions.length !== 3) failures.push(code + ": expected exactly three answer-keyed questions");
    for (const question of lesson.questions) if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push(code + ": question " + question.number + " has an empty prompt or answer");
  }
  lessonTotal += lessons.length;
  questionTotal += lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0);
}
if (lessonTotal !== 193) failures.push("Expected 193 lessons across P1-M6 (with one shared M4-M6 interval), found " + lessonTotal);
if (questionTotal !== 579) failures.push("Expected 579 answer-keyed questions across P1-M6 (with one shared M4-M6 interval), found " + questionTotal);
if (allCodes.size !== 193) failures.push("Expected 193 unique objective codes, found " + allCodes.size);
if (failures.length) {
  for (const failure of failures) process.stderr.write("FAIL: " + failure + "\n");
  process.exit(1);
}
process.stdout.write("Foreign Languages P1-M6 teacher packs valid: 193 lessons, 579 answer-keyed questions, 193 unique registered objective codes; M4-M6 interval indicators represented once.\n");
