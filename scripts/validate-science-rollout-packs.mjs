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
    process.stderr.write(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") + "\n");
  }
  process.exit(1);
}
const parserUrl = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { parseTeacherPackMarkdown, extractTeacherPackGradeCodes } = await import(parserUrl);

// This is the single aggregate gate for every Science, Technology and specialist
// import file. It supplements the more detailed core/specialist validators.
const packs = [
  { path: "docs/learning/science/P1-P3-science-w1-w3-teacher-starter-pack.md", subject: "SCI", language: "th", lessons: 42, grades: { P1: 10, P2: 12, P3: 20 } },
  { path: "docs/learning/science/P4-P6-science-w1-w3-teacher-starter-pack.md", subject: "SCI", language: "th", lessons: 69, grades: { P4: 16, P5: 27, P6: 26 } },
  { path: "docs/learning/science/SCIENCE-TECHNOLOGY-W4.2-P1-P6-TEACHER-STARTER-PACK.md", subject: "SCI", language: "th", lessons: 28, grades: { P1: 5, P2: 4, P3: 5, P4: 5, P5: 5, P6: 4 } },
  { path: "docs/learning/science/SCIENCE-M1-M3-COMPLETE-IMPORT.md", subject: "SCI", language: "en", lessons: 174, grades: { M1: 52, M2: 63, M3: 59 } },
  { path: "docs/learning/science/SCIENCE-M4-M6-COMPLETE-IMPORT.md", subject: "SCI", language: "en", lessons: 102, grades: { M4: 28, M5: 49, M6: 25 } },
  { path: "docs/learning/science/BIOLOGY-M4-IMPORT.md", subject: "BIOLOGY", language: "en", lessons: 32, grade: "M4" },
  { path: "docs/learning/science/BIOLOGY-M5-IMPORT.md", subject: "BIOLOGY", language: "en", lessons: 39, grade: "M5" },
  { path: "docs/learning/science/BIOLOGY-M6-IMPORT.md", subject: "BIOLOGY", language: "en", lessons: 37, grade: "M6" },
  { path: "docs/learning/science/CHEMISTRY-M4-IMPORT.md", subject: "CHEMISTRY", language: "en", lessons: 28, grade: "M4" },
  { path: "docs/learning/science/CHEMISTRY-M5-IMPORT.md", subject: "CHEMISTRY", language: "en", lessons: 38, grade: "M5" },
  { path: "docs/learning/science/CHEMISTRY-M6-IMPORT.md", subject: "CHEMISTRY", language: "en", lessons: 15, grade: "M6" },
  { path: "docs/learning/science/PHYSICS-M4-IMPORT.md", subject: "PHYSICS", language: "en", lessons: 17, grade: "M4" },
  { path: "docs/learning/science/PHYSICS-M5-IMPORT.md", subject: "PHYSICS", language: "en", lessons: 26, grade: "M5" },
  { path: "docs/learning/science/PHYSICS-M6-IMPORT.md", subject: "PHYSICS", language: "en", lessons: 24, grade: "M6" },
  { path: "docs/learning/science/EARTH-SPACE-M4-IMPORT.md", subject: "EARTH_SPACE", language: "en", lessons: 12, grade: "M4" },
  { path: "docs/learning/science/EARTH-SPACE-M5-IMPORT.md", subject: "EARTH_SPACE", language: "en", lessons: 13, grade: "M5" },
  { path: "docs/learning/science/EARTH-SPACE-M6-IMPORT.md", subject: "EARTH_SPACE", language: "en", lessons: 19, grade: "M6" },
];

const failures = [];
const totals = {
  packs: 0,
  lessons: 0,
  questions: 0,
  thaiLessons: 0,
  englishLessons: 0,
  bySubject: new Map(),
};
const seenObjectives = new Set();

for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const lessons = parseTeacherPackMarkdown(markdown);
  const expectedQuestions = pack.lessons * 3;
  let questionCount = 0;
  const gradeCounts = {};

  if (lessons.length !== pack.lessons) {
    failures.push(pack.path + ": expected " + pack.lessons + " lessons, parsed " + lessons.length);
  }

  for (const lesson of lessons) {
    if (!lesson.objectiveCode && !lesson.objectiveText?.trim()) {
      failures.push(pack.path + ": lesson " + lesson.number + " has no objective identity");
    }
    if (!lesson.learningOutcome.trim() || !lesson.activity.trim()) {
      failures.push(pack.path + ": lesson " + lesson.number + " has empty outcome or activity");
    }
    if (lesson.questions.length !== 3) {
      failures.push(pack.path + ": lesson " + lesson.number + " has " + lesson.questions.length + " answer-keyed questions; expected 3");
    }

    const parsedGrades = extractTeacherPackGradeCodes(lesson.objectiveCode);
    if (pack.grade) {
      if (parsedGrades.length && !parsedGrades.includes(pack.grade)) {
        failures.push(pack.path + ": objective " + lesson.objectiveCode + " resolves to " + parsedGrades.join("/") + ", expected " + pack.grade);
      }
      gradeCounts[pack.grade] = (gradeCounts[pack.grade] ?? 0) + 1;
    } else {
      const grade = parsedGrades.length === 1 ? parsedGrades[0] : null;
      if (!grade) {
        failures.push(pack.path + ": lesson " + lesson.number + " objective " + (lesson.objectiveCode ?? "(text only)") + " does not resolve to exactly one grade");
      } else {
        gradeCounts[grade] = (gradeCounts[grade] ?? 0) + 1;
      }
    }

    const identity = lesson.objectiveCode ?? lesson.objectiveText ?? "";
    const gradeKey = pack.grade ?? parsedGrades.join("+") ?? "unscoped";
    const key = pack.subject + "|" + gradeKey + "|" + identity.trim().toUpperCase();
    if (seenObjectives.has(key)) failures.push(pack.path + ": duplicate subject/grade objective identity " + key);
    seenObjectives.add(key);

    const questionNumbers = new Set();
    for (const question of lesson.questions) {
      questionCount += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) {
        failures.push(pack.path + ": lesson " + lesson.number + " has an empty question prompt or answer key");
      }
      if (questionNumbers.has(question.number)) {
        failures.push(pack.path + ": lesson " + lesson.number + " repeats question number " + question.number);
      }
      questionNumbers.add(question.number);
    }
    for (const number of [1, 2, 3]) {
      if (!questionNumbers.has(number)) failures.push(pack.path + ": lesson " + lesson.number + " is missing question number " + number);
    }
  }

  if (questionCount !== expectedQuestions) {
    failures.push(pack.path + ": expected " + expectedQuestions + " questions, parsed " + questionCount);
  }
  if (pack.grades) {
    for (const [grade, expected] of Object.entries(pack.grades)) {
      if (gradeCounts[grade] !== expected) failures.push(pack.path + ": expected " + expected + " " + grade + " lessons, parsed " + (gradeCounts[grade] ?? 0));
    }
    for (const grade of Object.keys(gradeCounts)) {
      if (!(grade in pack.grades)) failures.push(pack.path + ": unexpected grade " + grade + " (" + gradeCounts[grade] + " lessons)");
    }
  }

  totals.packs += 1;
  totals.lessons += lessons.length;
  totals.questions += questionCount;
  if (pack.language === "th") totals.thaiLessons += lessons.length;
  else totals.englishLessons += lessons.length;
  totals.bySubject.set(pack.subject, (totals.bySubject.get(pack.subject) ?? 0) + lessons.length);
  process.stdout.write("PASS " + pack.path + ": " + lessons.length + " lessons / " + questionCount + " questions / language " + pack.language + "\n");
}

const expectedSubjectTotals = { SCI: 415, BIOLOGY: 108, CHEMISTRY: 81, PHYSICS: 67, EARTH_SPACE: 44 };
for (const [subject, expected] of Object.entries(expectedSubjectTotals)) {
  const actual = totals.bySubject.get(subject) ?? 0;
  if (actual !== expected) failures.push(subject + ": expected " + expected + " lessons, found " + actual);
}
if (totals.packs !== 17) failures.push("Expected 17 import packs, found " + totals.packs);
if (totals.lessons !== 715) failures.push("Expected 715 total lessons, found " + totals.lessons);
if (totals.questions !== 2145) failures.push("Expected 2,145 answer-keyed questions, found " + totals.questions);
if (totals.thaiLessons !== 139) failures.push("Expected 139 Thai primary lessons, found " + totals.thaiLessons);
if (totals.englishLessons !== 576) failures.push("Expected 576 English secondary/specialist lessons, found " + totals.englishLessons);

if (failures.length) {
  process.stderr.write("\nScience rollout validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: all 17 Science import packs total 715 lessons and 2,145 answer-keyed questions. Thai 139/417; English 576/1,728. Subject totals: " + JSON.stringify(Object.fromEntries(totals.bySubject)) + ".\n");
}
