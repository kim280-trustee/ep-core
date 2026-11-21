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

const gradeCases = [["ARTS-P1-01","P1"],["ARTS-P6-27","P6"],["ARTS-M1-01","M1"],["ARTS-M3-32","M3"],["ARTS-M46-01",null]];
for (const [code, expected] of gradeCases) {
  const actual = extractTeacherPackGradeCode(code);
  if (actual !== expected) throw new Error("Grade extraction mismatch for " + code + ": expected " + expected + ", received " + actual);
}
if (JSON.stringify(extractTeacherPackGradeCodes("ARTS-M46-01")) !== JSON.stringify(["M4","M5","M6"])) {
  throw new Error("Shared Arts M4–M6 outcomes must expand to all three grades.");
}

const packs = [
  { path: "docs/learning/arts/ARTS-M1-TEACHER-STARTER-PACK.md", count: 27 },
  { path: "docs/learning/arts/ARTS-M2-TEACHER-STARTER-PACK.md", count: 27 },
  { path: "docs/learning/arts/ARTS-M3-TEACHER-STARTER-PACK.md", count: 32 },
  { path: "docs/learning/arts/ARTS-M4-M6-TEACHER-STARTER-PACK.md", count: 39, shared: true },
  { path: "docs/learning/arts/ARTS-P1-P3-TEACHER-STARTER-PACK.md", count: 72 },
  { path: "docs/learning/arts/ARTS-P4-TEACHER-STARTER-PACK.md", count: 29 },
  { path: "docs/learning/arts/ARTS-P5-TEACHER-STARTER-PACK.md", count: 26 },
  { path: "docs/learning/arts/ARTS-P6-TEACHER-STARTER-PACK.md", count: 27 },
];
const codes = new Set();
const failures = [];
let lessonsTotal = 0;
let questionsTotal = 0;
for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const headings = [...markdown.matchAll(/^#{2,3}\s+(?:Lesson\s+\d+\s*[:—–-]\s*.+|\d+\.\s+.+)$/gm)];
  const indicatorByCode = new Map();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(start, end);
    const objectiveLine = section.match(/^\*\*Objective:\*\*\s+(.+)$/m)?.[1] ?? "";
    const code = objectiveLine.match(/ARTS-(?:P[1-6]|M[1-6]|M46)-\d+/)?.[0];
    const indicator = code ? objectiveLine.replace(code, "").replace(/[`]/g, "").replace(/^[\s—–:-]+/, "").trim() : "";
    if (code && indicator) indicatorByCode.set(code, indicator);
  }
  const lessons = parseTeacherPackMarkdown(markdown);
  if (headings.length !== pack.count || lessons.length !== pack.count) failures.push(pack.path + ": expected " + pack.count + " headings/lessons, parsed " + headings.length + "/" + lessons.length);
  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    if (!code?.startsWith("ARTS-")) failures.push(pack.path + ": lesson " + lesson.number + " has no Arts objective code");
    if (code && codes.has(code)) failures.push("Duplicate Arts objective code: " + code);
    if (code) codes.add(code);
    const indicator = code ? indicatorByCode.get(code) : null;
    if (!indicator) failures.push((code ?? pack.path + " lesson " + lesson.number) + ": official Thai indicator text is missing");
    if (code?.includes("-M46-")) {
      if (!pack.shared) failures.push(code + ": M46 outcome must be in the shared M4–M6 pack");
      if (JSON.stringify(extractTeacherPackGradeCodes(code)) !== JSON.stringify(["M4","M5","M6"])) failures.push(code + ": shared grade scope is incorrect");
    } else if (code && !extractTeacherPackGradeCode(code)) failures.push(code + ": grade-specific outcome has no recognized grade");
    if (code && lesson.title === code) failures.push(code + ": lesson title is only the objective code");
    if (!lesson.activity.trim() || !lesson.learningOutcome.trim()) failures.push(code + ": parsed teaching activity or learning outcome is empty");
    if (lesson.questions.length !== 3) failures.push(code + ": expected three answer-keyed tasks, parsed " + lesson.questions.length);
    for (const question of lesson.questions) {
      questionsTotal += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push(code + ": empty task or answer guidance");
      if (!indicator || !question.prompt.includes(indicator)) failures.push(code + ": task " + question.number + " is not tied to the exact official Thai indicator");
    }
  }
  lessonsTotal += lessons.length;
  process.stdout.write("Parsed " + pack.path + ": " + lessons.length + " lessons and " + lessons.reduce((n, lesson) => n + lesson.questions.length, 0) + " answer-keyed tasks.\n");
}
if (lessonsTotal !== 279) failures.push("Expected 279 unique Arts indicators, found " + lessonsTotal);
if (codes.size !== 279) failures.push("Expected 279 unique Arts codes, found " + codes.size);
if (questionsTotal !== 837) failures.push("Expected 837 answer-keyed tasks, found " + questionsTotal);
if (failures.length) {
  process.stderr.write("\nArts pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: 279 unique Arts indicators and 837 indicator-linked answer-keyed tasks parsed by the actual TypeScript importer parser.\n");
  process.stdout.write("The 39 shared M4–M6 indicators expand to 117 grade-specific lesson drafts and 351 grade-scoped questions.\n");
}
