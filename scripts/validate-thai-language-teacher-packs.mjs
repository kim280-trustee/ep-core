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
const { parseTeacherPackMarkdown, extractTeacherPackGradeCode, extractTeacherPackGradeCodes } = await import(url);

const gradeCases = [["TH1.1-P1-01","P1"],["TH5.1-P6-04","P6"],["TH1.1-M1-01","M1"],["TH1.1-M4-6-01",null]];
for (const [code, expected] of gradeCases) {
  const actual = extractTeacherPackGradeCode(code);
  if (actual !== expected) throw new Error("Grade extraction mismatch for " + code + ": expected " + expected + ", received " + actual);
}
if (JSON.stringify(extractTeacherPackGradeCodes("TH1.1-M4-6-01")) !== JSON.stringify(["M4","M5","M6"])) {
  throw new Error("Shared Thai Language outcomes must expand to M4, M5 and M6.");
}

const packs = [
  { path: "docs/learning/thai-language/THAI-LANGUAGE-P1-P3-TEACHER-STARTER-PACK.md", count: 80 },
  { path: "docs/learning/thai-language/THAI-LANGUAGE-P4-P6-TEACHER-STARTER-PACK.md", count: 100 },
  { path: "docs/learning/thai-language/THAI-LANGUAGE-M1-M3-TEACHER-STARTER-PACK.md", count: 103 },
  { path: "docs/learning/thai-language/THAI-LANGUAGE-M4-M6-SHARED-TEACHER-STARTER-PACK.md", count: 36, shared: true },
];
const codes = new Set();
const failures = [];
let lessonTotal = 0;
let questionTotal = 0;
for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const headings = [...markdown.matchAll(/^### (\d+)\. (TH[1-5]\.\d-(?:P[1-6]|M[1-6]|M4-6)-\d+)(?:\s+—\s+(.+))?\s*$/gm)];
  const indicators = new Map();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(start, end);
    const objectiveLine = section.match(/^\*\*Objective:\*\*\s+(.+)$/m)?.[1] ?? "";
    const code = objectiveLine.match(/TH[1-5]\.\d-(?:P[1-6]|M[1-6]|M4-6)-\d+/)?.[0];
    const indicator = code
      ? objectiveLine.replace(code, "").replace(/[`]/g, "").replace(/^[\s—–:-]+/, "").trim() || heading[3]?.trim() || ""
      : "";
    if (code && indicator) indicators.set(code, indicator);
  }
  const lessons = parseTeacherPackMarkdown(markdown);
  if (headings.length !== pack.count || lessons.length !== pack.count) failures.push(pack.path + ": expected " + pack.count + " headings/lessons, parsed " + headings.length + "/" + lessons.length);
  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    if (!code?.startsWith("TH")) failures.push(pack.path + ": lesson " + lesson.number + " has no Thai Language objective code");
    if (code && codes.has(code)) failures.push("Duplicate Thai Language objective code: " + code);
    if (code) codes.add(code);
    const indicator = code ? indicators.get(code) : null;
    if (!indicator) failures.push((code ?? pack.path + " lesson " + lesson.number) + ": official Thai indicator wording is missing");
    if (code?.includes("-M4-6-")) {
      if (!pack.shared) failures.push(code + ": shared M4–M6 outcome must be in the shared pack");
      if (JSON.stringify(extractTeacherPackGradeCodes(code)) !== JSON.stringify(["M4","M5","M6"])) failures.push(code + ": shared grade scope is incorrect");
    } else if (code && !extractTeacherPackGradeCode(code)) failures.push(code + ": grade-specific outcome has no recognized grade");
    if (!lesson.activity.trim() || !lesson.learningOutcome.trim()) failures.push(code + ": parsed activity or learning outcome is empty");
    if (lesson.questions.length !== 3) failures.push(code + ": expected three answer-keyed tasks, parsed " + lesson.questions.length);
    for (const question of lesson.questions) {
      questionTotal += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push(code + ": empty task or answer/evidence guidance");
      if (!indicator || !question.prompt.includes(indicator)) failures.push(code + ": task " + question.number + " is not tied to its exact official Thai indicator");
    }
  }
  lessonTotal += lessons.length;
  process.stdout.write("Parsed " + pack.path + ": " + lessons.length + " lessons and " + lessons.reduce((n, lesson) => n + lesson.questions.length, 0) + " answer-keyed tasks.\n");
}
if (lessonTotal !== 319) failures.push("Expected 319 unique Thai Language indicators, found " + lessonTotal);
if (codes.size !== 319) failures.push("Expected 319 unique Thai Language objective codes, found " + codes.size);
if (questionTotal !== 957) failures.push("Expected 957 answer-keyed tasks, found " + questionTotal);
if (failures.length) {
  process.stderr.write("\nThai Language pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: 319 unique Thai Language indicators and 957 indicator-linked answer-keyed tasks parsed by the actual TypeScript importer parser.\n");
  process.stdout.write("The 36 shared M4–M6 indicators expand to 108 grade-specific lesson drafts and 324 grade-scoped questions.\n");
}
