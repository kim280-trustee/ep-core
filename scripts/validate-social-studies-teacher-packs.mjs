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

const gradeCases = [
  ["SO1.1-P1-01", "P1"], ["SO2.2-P6-09", "P6"],
  ["SO3.1-M1-02", "M1"], ["SO5.2-M3-07", "M3"],
  ["SO1.1-M46-01", null], ["M4-S1_1-01", "M4"],
];
for (const [code, expected] of gradeCases) {
  const actual = extractTeacherPackGradeCode(code);
  if (actual !== expected) throw new Error("Grade extraction mismatch for " + code + ": expected " + expected + ", received " + actual);
}

const packs = [
  { path: "docs/learning/social-studies/SOCIAL-STUDIES-M1-TEACHER-STARTER-PACK.md", count: 45, grades: { M1: 45 } },
  { path: "docs/learning/social-studies/SOCIAL-STUDIES-M2-TEACHER-STARTER-PACK.md", count: 45, grades: { M2: 45 } },
  { path: "docs/learning/social-studies/SOCIAL-STUDIES-M3-TEACHER-STARTER-PACK.md", count: 50, grades: { M3: 50 } },
  { path: "docs/learning/social-studies/SOCIAL-STUDIES-M4-M6-TEACHER-STARTER-PACK.md", count: 61, grades: { M46: 61 } },
  { path: "docs/learning/social-studies/SOCIAL-STUDIES-P1-P3-TEACHER-STARTER-PACK.md", count: 104, grades: { P1: 31, P2: 34, P3: 39 } },
  { path: "docs/learning/social-studies/SOCIAL-STUDIES-P4-TEACHER-STARTER-PACK.md", count: 38, grades: { P4: 38 } },
  { path: "docs/learning/social-studies/SOCIAL-STUDIES-P5-TEACHER-STARTER-PACK.md", count: 36, grades: { P5: 36 } },
  { path: "docs/learning/social-studies/SOCIAL-STUDIES-P6-TEACHER-STARTER-PACK.md", count: 39, grades: { P6: 39 } },
];

const codes = new Set();
const failures = [];
let lessonTotal = 0;
let questionTotal = 0;
for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const lessons = parseTeacherPackMarkdown(markdown);
  const indicatorByCode = new Map();
  const sourceHeadings = [...markdown.matchAll(/^### (\d+)\. (SO[1-5]\.\d-(?:P[1-6]|M[1-6]|M46)-\d+)\s*$/gm)];
  for (let index = 0; index < sourceHeadings.length; index += 1) {
    const heading = sourceHeadings[index];
    const sectionStart = (heading.index ?? 0) + heading[0].length;
    const sectionEnd = sourceHeadings[index + 1]?.index ?? markdown.length;
    const sourceSection = markdown.slice(sectionStart, sectionEnd);
    const indicator = sourceSection.match(/^\s*-\s+\*\*Official indicator:\*\*\s*(.+)$/m)?.[1]?.trim();
    if (indicator) indicatorByCode.set(heading[2], indicator);
  }
  const counts = {};
  if (lessons.length !== pack.count) failures.push(pack.path + ": expected " + pack.count + " lessons, parsed " + lessons.length);
  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    if (!code?.startsWith("SO")) failures.push(pack.path + ": lesson " + lesson.number + " has no Social Studies objective code");
    const officialIndicator = code ? indicatorByCode.get(code) : null;
    if (!officialIndicator) failures.push((code ?? pack.path + " lesson " + lesson.number) + ": official Thai indicator source text is missing");
    if (code && codes.has(code)) failures.push("Duplicate Social Studies objective code: " + code);
    if (code) codes.add(code);
    const grade = code?.match(/-(P[1-6]|M[1-6]|M46)-/)?.[1];
    if (!grade) failures.push(pack.path + ": lesson " + lesson.number + " has no grade scope in its code");
    else counts[grade] = (counts[grade] ?? 0) + 1;
    if (grade === "M46" && extractTeacherPackGradeCode(code) !== null) failures.push(code + ": shared M4–M6 code must not be collapsed to one grade");
    if (grade && grade !== "M46" && extractTeacherPackGradeCode(code) !== grade) failures.push(code + ": grade extractor did not resolve " + grade);
    if (lesson.questions.length !== 3) failures.push(code + ": expected three answer-keyed tasks, parsed " + lesson.questions.length);
    for (const question of lesson.questions) {
      questionTotal += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push(code + ": empty question or answer guidance");
      if (!officialIndicator || !question.prompt.includes(officialIndicator)) failures.push(code + ": task " + question.number + " is not explicitly tied to its official Thai indicator");
    }
  }
  for (const [grade, expected] of Object.entries(pack.grades)) {
    if ((counts[grade] ?? 0) !== expected) failures.push(pack.path + ": expected " + expected + " " + grade + " lessons, found " + (counts[grade] ?? 0));
  }
  lessonTotal += lessons.length;
  process.stdout.write("Parsed " + pack.path + ": " + lessons.length + " lessons; " + lessons.reduce((n, lesson) => n + lesson.questions.length, 0) + " answer-keyed tasks.\n");
}
if (lessonTotal !== 418) failures.push("Expected 418 unique Social Studies indicators, found " + lessonTotal);
if (codes.size !== 418) failures.push("Expected 418 unique Social Studies objective codes, found " + codes.size);
if (questionTotal !== 1254) failures.push("Expected 1,254 answer-keyed tasks, found " + questionTotal);
if (failures.length) {
  process.stderr.write("\nSocial Studies pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: " + lessonTotal + " unique Social Studies indicators and " + questionTotal + " indicator-linked, answer-keyed tasks parsed by the actual TypeScript importer parser.\n");
  process.stdout.write("Note: 61 M4–M6 shared outcomes align to all three upper-secondary grades (183 grade alignments); they are intentionally not collapsed to one grade code.\n");
}
