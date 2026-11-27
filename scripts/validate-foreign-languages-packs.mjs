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

const gradeCases = [["FL-P1-01","P1"],["FL-P6-18","P6"],["FL-M1-01","M1"],["FL-M46-01",null]];
for (const [code, expected] of gradeCases) {
  const actual = extractTeacherPackGradeCode(code);
  if (actual !== expected) throw new Error("Grade extraction mismatch for " + code + ": expected " + expected + ", received " + actual);
}
if (JSON.stringify(extractTeacherPackGradeCodes("FL-M46-01")) !== JSON.stringify(["M4","M5","M6"])) {
  throw new Error("Shared Foreign Languages outcomes must expand to M4, M5 and M6.");
}

const packs = [
  { path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P1-P3-TEACHER-STARTER-PACK.md", count: 50 },
  { path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P4-P6-TEACHER-STARTER-PACK.md", count: 60 },
  { path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-M1-M3-TEACHER-STARTER-PACK.md", count: 62 },
  { path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-M4-M6-SHARED-TEACHER-STARTER-PACK.md", count: 21, shared: true },
];
const expectedStandardPhrase = {
  "ต 1.1": "listening/reading",
  "ต 1.2": "turn-taking",
  "ต 1.3": "audience",
  "ต 2.1": "cultural",
  "ต 2.2": "comparison",
  "ต 3.1": "subject",
  "ต 4.1": "communication purpose",
  "ต 4.2": "source",
};
const codes = new Set();
const practicalActivities = new Set();
const failures = [];
let lessonTotal = 0;
let questionTotal = 0;
for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const headings = [...markdown.matchAll(/^### (\d+)\. (FL-(?:P[1-6]|M[1-6]|M46)-\d+)(?:\s+—\s+(.+))?\s*$/gm)];
  const indicators = new Map();
  const standards = new Map();
  const lessonSections = new Map();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(start, end);
    const objectiveLine = section.match(/^\*\*Objective:\*\*\s+(.+)$/m)?.[1] ?? "";
    const code = objectiveLine.match(/FL-(?:P[1-6]|M[1-6]|M46)-\d+/)?.[0];
    const indicator = code ? objectiveLine.replace(code, "").replace(/[`]/g, "").replace(/^[\s—–:-]+/, "").trim() : "";
    if (code && indicator) {
      indicators.set(code, indicator);
      const official = section.match(/^- \*\*Official indicator:\*\* `([^`]+)`/m)?.[1] ?? "";
      const standard = official.match(/ต \d\.\d/)?.[0];
      if (standard) standards.set(code, standard);
      lessonSections.set(code, section);
    }
  }
  const lessons = parseTeacherPackMarkdown(markdown);
  if (headings.length !== pack.count || lessons.length !== pack.count) {
    failures.push(pack.path + ": expected " + pack.count + " headings/lessons, parsed " + headings.length + "/" + lessons.length);
  }
  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    if (!code?.startsWith("FL-")) failures.push(pack.path + ": lesson " + lesson.number + " has no Foreign Languages objective code");
    if (code && codes.has(code)) failures.push("Duplicate Foreign Languages objective code: " + code);
    if (code) codes.add(code);
    const indicator = code ? indicators.get(code) : null;
    if (!indicator) failures.push((code ?? pack.path + " lesson " + lesson.number) + ": official Thai indicator is missing");
    if (code?.includes("-M46-")) {
      if (!pack.shared) failures.push(code + ": M46 outcome must be in the shared upper-secondary pack");
      if (JSON.stringify(extractTeacherPackGradeCodes(code)) !== JSON.stringify(["M4","M5","M6"])) failures.push(code + ": shared grade scope is incorrect");
    } else if (code && !extractTeacherPackGradeCode(code)) {
      failures.push(code + ": grade-specific outcome has no recognized grade");
    }
    if (!lesson.activity.trim() || !lesson.learningOutcome.trim()) failures.push(code + ": parsed activity or learning outcome is empty");
    const section = lessonSections.get(code) ?? "";
    const practical = section.match(/^\*\*Practical activity:\*\*\s*(.+)$/m)?.[1] ?? "";
    const evidence = section.match(/^\*\*Expected evidence:\*\*\s*(.+)$/m)?.[1] ?? "";
    const teacherCheck = section.match(/^\*\*Teacher check:\*\*\s*(.+)$/m)?.[1] ?? "";
    const standard = standards.get(code);
    const band = /^FL-P[1-3]-/.test(code) ? "early-primary"
      : /^FL-P[4-6]-/.test(code) ? "upper-primary"
      : /^FL-M[1-3]-/.test(code) ? "lower-secondary" : "upper-secondary";
    if (!practical.includes(code) || !practical.includes(indicator) || !practical.includes("Grade band: " + band)) {
      failures.push(code + ": practical activity must name the objective, exact indicator and grade band");
    }
    if (!evidence.includes(code) || !evidence.includes(indicator) || !teacherCheck.includes(code)) {
      failures.push(code + ": expected evidence and teacher check must be objective-specific");
    }
    const phrase = expectedStandardPhrase[standard];
    if (!phrase || !teacherCheck.toLowerCase().includes(phrase)) {
      failures.push(code + ": teacher check does not assess the target official standard " + String(standard));
    }
    practicalActivities.add(practical);
    if (lesson.questions.length !== 3) failures.push(code + ": expected three answer-keyed tasks, parsed " + lesson.questions.length);
    for (const question of lesson.questions) {
      questionTotal += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push(code + ": empty task or answer guidance");
      if (!indicator || !question.prompt.includes(indicator)) failures.push(code + ": task " + question.number + " is not tied to its exact official Thai indicator");
    }
  }
  lessonTotal += lessons.length;
  process.stdout.write("Parsed " + pack.path + ": " + lessons.length + " lessons and " + lessons.reduce((n, lesson) => n + lesson.questions.length, 0) + " answer-keyed tasks.\n");
}
if (lessonTotal !== 193) failures.push("Expected 193 unique Foreign Languages indicators, found " + lessonTotal);
if (codes.size !== 193) failures.push("Expected 193 unique Foreign Languages objective codes, found " + codes.size);
if (questionTotal !== 579) failures.push("Expected 579 answer-keyed tasks, found " + questionTotal);
if (practicalActivities.size !== 193) failures.push("Expected 193 distinct objective-/grade-specific practical activities, found " + practicalActivities.size);
if (failures.length) {
  process.stderr.write("\nForeign Languages pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: 193 unique Foreign Languages indicators, 579 indicator-linked answer-keyed tasks and 193 objective-/grade-specific practical activities parsed by the actual TypeScript importer parser.\n");
  process.stdout.write("The 21 shared M4–M6 indicators expand to 63 grade-specific lesson drafts and 189 grade-scoped questions.\n");
}
