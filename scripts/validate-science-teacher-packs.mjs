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
}).outputText;
const parserUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const { parseTeacherPackMarkdown } = await import(parserUrl);

const packs = [
  {
    path: "docs/learning/science/SCIENCE-M1-M3-COMPLETE-IMPORT.md",
    expectedLessons: 174,
    expectedQuestions: 522,
    expectedGrades: { M1: 52, M2: 63, M3: 59 },
  },
  {
    path: "docs/learning/science/SCIENCE-M4-M6-COMPLETE-IMPORT.md",
    expectedLessons: 102,
    expectedQuestions: 306,
    expectedGrades: { M4: 28, M5: 49, M6: 25 },
  },
];

let totalLessons = 0;
let totalQuestions = 0;
const allObjectiveCodes = new Set();
const failures = [];

for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const lessons = parseTeacherPackMarkdown(markdown);
  const codes = new Set();
  const grades = {};
  const lessonNumbers = new Set();
  let questionCount = 0;

  if (lessons.length !== pack.expectedLessons) {
    failures.push(`${pack.path}: expected ${pack.expectedLessons} lessons, parsed ${lessons.length}`);
  }

  for (const lesson of lessons) {
    if (lessonNumbers.has(lesson.number)) {
      failures.push(`${pack.path}: duplicate lesson number ${lesson.number}`);
    }
    lessonNumbers.add(lesson.number);

    if (!lesson.objectiveCode) {
      failures.push(`${pack.path}: lesson ${lesson.number} has no objective code`);
    } else {
      if (codes.has(lesson.objectiveCode)) {
        failures.push(`${pack.path}: duplicate objective code ${lesson.objectiveCode}`);
      }
      codes.add(lesson.objectiveCode);

      const grade = lesson.objectiveCode.match(/^(M[1-6])[-_]/)?.[1];
      if (!grade) {
        failures.push(`${pack.path}: objective code ${lesson.objectiveCode} has no recognized M1–M6 grade prefix`);
      } else {
        grades[grade] = (grades[grade] ?? 0) + 1;
      }
    }

    if (lesson.questions.length !== 3) {
      failures.push(`${pack.path}: lesson ${lesson.number} has ${lesson.questions.length} answer-keyed questions; expected 3`);
    }

    const questionNumbers = new Set();
    for (const question of lesson.questions) {
      questionCount += 1;
      if (questionNumbers.has(question.number)) {
        failures.push(`${pack.path}: lesson ${lesson.number} repeats question number ${question.number}`);
      }
      questionNumbers.add(question.number);
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) {
        failures.push(`${pack.path}: lesson ${lesson.number} contains an empty prompt or answer key`);
      }
    }
    for (const expectedNumber of [1, 2, 3]) {
      if (!questionNumbers.has(expectedNumber)) {
        failures.push(`${pack.path}: lesson ${lesson.number} is missing question number ${expectedNumber}`);
      }
    }
  }

  if (questionCount !== pack.expectedQuestions) {\n    failures.push(`${pack.path}: expected ${pack.expectedQuestions} questions, parsed ${questionCount}`);\n  }\n\n  for (const [grade, expectedCount] of Object.entries(pack.expectedGrades)) {
    if (grades[grade] !== expectedCount) {
      failures.push(`${pack.path}: expected ${expectedCount} ${grade} lessons, parsed ${grades[grade] ?? 0}`);
    }
  }

  const unexpectedGrades = Object.keys(grades).filter((grade) => !(grade in pack.expectedGrades));
  for (const grade of unexpectedGrades) {
    failures.push(`${pack.path}: unexpected grade ${grade} found (${grades[grade]} lessons)`);
  }

  totalLessons += lessons.length;
  totalQuestions += questionCount;
  process.stdout.write(`Parsed ${pack.path}: ${lessons.length} lessons, ${codes.size} unique objective codes, ${questionCount} answer-keyed questions; grades ${JSON.stringify(grades)}\n`);
}

if (failures.length) {
  process.stderr.write(`\nScience teacher-pack validation failed (${failures.length} issue(s)):\n`);
  for (const failure of failures) process.stderr.write(`- ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`\nPASS: ${totalLessons} lessons and ${totalQuestions} answer-keyed questions parsed by the actual TypeScript importer parser.\n`);
}
