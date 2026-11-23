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
  for (const diagnostic of compiled.diagnostics) {
    process.stderr.write("Parser TypeScript error: " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") + "\n");
  }
  process.exit(1);
}
const parserUrl = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { parseTeacherPackMarkdown, extractTeacherPackGradeCode, extractTeacherPackGradeCodes } = await import(parserUrl);

const gradeCases = [
  ["HPE-P1-01", "P1"], ["HPE-P6-18", "P6"],
  ["HPE-M1-01", "M1"], ["HPE-M3-24", "M3"],
  ["HPE-M46-01", null], ["M4-S1_1-01", "M4"],
];
for (const [code, expected] of gradeCases) {
  const actual = extractTeacherPackGradeCode(code);
  if (actual !== expected) throw new Error("Grade extraction mismatch for " + code + ": expected " + expected + ", received " + actual);
}
if (JSON.stringify(extractTeacherPackGradeCodes("HPE-M46-01")) !== JSON.stringify(["M4", "M5", "M6"])) {
  throw new Error("Shared Health & PE outcomes must expand to M4, M5 and M6.");
}

const packs = [
  { path: "docs/learning/health-pe/HEALTH-PE-M1-M3-TEACHER-STARTER-PACK.md", count: 72, shared: false },
  { path: "docs/learning/health-pe/HEALTH-PE-M4-M6-SHARED-TEACHER-STARTER-PACK.md", count: 29, shared: true },
  { path: "docs/learning/health-pe/HEALTH-PE-P1-P3-TEACHER-STARTER-PACK.md", count: 54, shared: false },
  { path: "docs/learning/health-pe/HEALTH-PE-P4-P6-TEACHER-STARTER-PACK.md", count: 66, shared: false },
];
const codes = new Set();
const failures = [];
let lessonsTotal = 0;
let questionsTotal = 0;
for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const languageDefects = [
    ["Give one accurate facts", "singular fact wording"],
    ["at a early primary level", "early-primary article"],
    ["at a upper primary level", "upper-primary article"],
    ["at a lower secondary level", "lower-secondary compound modifier"],
    ["at a upper secondary level", "upper-secondary article"],
  ];
  for (const [phrase, label] of languageDefects) {
    if (markdown.includes(phrase)) failures.push(pack.path + ": contains a language defect (" + label + "): " + phrase);
  }
  const headings = [...markdown.matchAll(/^### (\d+)\. (HPE-(?:P[1-6]|M[1-6]|M46)-\d+)(?:\s+—\s+(.+))?\s*$/gm)];
  const indicators = new Map();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(start, end);
    const indicator = section.match(/^\s*-\s+\*\*Original Thai indicator:\*\*\s*(.+)$/m)?.[1]?.trim();
    if (indicator) indicators.set(heading[2], indicator);
  }
  const lessons = parseTeacherPackMarkdown(markdown);
  if (headings.length !== pack.count || lessons.length !== pack.count) {
    failures.push(pack.path + ": expected " + pack.count + " lessons/headings; parsed " + lessons.length + " lessons and " + headings.length + " headings");
  }
  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    if (!code?.startsWith("HPE-")) failures.push(pack.path + ": lesson " + lesson.number + " has no Health & PE objective code");
    if (code && codes.has(code)) failures.push("Duplicate Health & PE objective code: " + code);
    if (code) codes.add(code);
    const indicator = code ? indicators.get(code) : null;
    if (!indicator) failures.push((code ?? pack.path + " lesson " + lesson.number) + ": official Thai indicator is missing");
    if (code?.includes("-M46-")) {
      if (!pack.shared) failures.push(code + ": M46 outcome must be in the shared upper-secondary pack");
      if (JSON.stringify(extractTeacherPackGradeCodes(code)) !== JSON.stringify(["M4", "M5", "M6"])) failures.push(code + ": shared grade scope is incorrect");
    } else if (code && !extractTeacherPackGradeCode(code)) {
      failures.push(code + ": grade-specific outcome has no recognized grade");
    }
    if (code && lesson.title === code) failures.push(code + ": imported lesson title must retain the indicator wording");
    if (lesson.questions.length !== 3) failures.push(code + ": expected three answer-keyed tasks, parsed " + lesson.questions.length);
    for (const question of lesson.questions) {
      questionsTotal += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push(code + ": empty question or answer guidance");
      if (!indicator || !question.prompt.includes(indicator)) failures.push(code + ": task " + question.number + " is not tied to its official Thai indicator");
    }
  }
  lessonsTotal += lessons.length;
  process.stdout.write("Parsed " + pack.path + ": " + lessons.length + " lessons and " + lessons.reduce((n, lesson) => n + lesson.questions.length, 0) + " answer-keyed tasks.\n");
}
if (lessonsTotal !== 221) failures.push("Expected 221 unique Health & PE indicators, found " + lessonsTotal);
if (codes.size !== 221) failures.push("Expected 221 unique Health & PE objective codes, found " + codes.size);
if (questionsTotal !== 663) failures.push("Expected 663 answer-keyed tasks, found " + questionsTotal);
if (failures.length) {
  process.stderr.write("\nHealth & PE pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: " + lessonsTotal + " unique Health & PE indicators and " + questionsTotal + " indicator-linked answer-keyed tasks parsed by the actual TypeScript importer parser.\n");
  process.stdout.write("The 29 shared M4–M6 indicators expand to 87 grade-specific lesson drafts and 261 grade-scoped questions.\n");
}
