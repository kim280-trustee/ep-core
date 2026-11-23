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

const artsDisciplineCounts = { "Visual arts": 0, "Music": 0, "Dance and drama": 0 };
for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const sections = [...markdown.matchAll(/^#{2,3}\s+(?:(?:Lesson|Outcome)\s+\d+|Group\s+\d+\s+[—–-]\s+Outcome\s+\d+|\d+\.)[^\n]*$/gm)];
  for (let index = 0; index < sections.length; index += 1) {
    const section = markdown.slice(sections[index].index, sections[index + 1]?.index ?? markdown.length);
    const objective = section.match(/^\*\*Objective:\*\*\s*\x60([^\x60]+)\x60\s*[—–-]\s*(.+)$/m);
    const code = objective?.[1] ?? pack.path;
    const discipline = section.match(/^\*\*Arts discipline:\*\*\s*(.+)$/m)?.[1]?.trim();
    const gradeBand = section.match(/^\*\*Grade band:\*\*\s*(.+)$/m)?.[1]?.trim();
    const activity = section.match(/^\*\*Practical activity:\*\*\s*([\s\S]*?)(?=^\*\*Expected evidence:\*\*)/m)?.[1] ?? "";
    const evidence = section.match(/^\*\*Expected evidence:\*\*\s*([\s\S]*?)(?=^\*\*Teacher check:\*\*)/m)?.[1] ?? "";
    const teacherCheck = section.match(/^\*\*Teacher check:\*\*\s*([\s\S]*?)(?=^\*\*Independent practice\*\*)/m)?.[1] ?? "";
    if (!objective || !discipline || !gradeBand) failures.push(code + ": missing explicit indicator, discipline or grade-band classification");
    if (discipline in artsDisciplineCounts) artsDisciplineCounts[discipline] += 1;
    const expectedBand = code.includes("M46") ? "Upper secondary (M4–M6)" : /-P[1-3]-/.test(code) ? "Early primary (P1–P3)" : /-P[4-6]-/.test(code) ? "Upper primary (P4–P6)" : "Lower secondary (M1–M3)";
    if (gradeBand !== expectedBand) failures.push(code + ": grade-band differentiation does not match objective code");
    if (!activity.includes(expectedBand) || !/safe|safely|safety/i.test(activity)) failures.push(code + ": activity lacks grade-specific delivery or safety guidance");
    if (!evidence.includes("at least two") || !/evidence/i.test(evidence)) failures.push(code + ": expected evidence lacks observable indicator-linked criteria");
    if (!/three-point rubric|three observable criteria/i.test(teacherCheck)) failures.push(code + ": teacher check lacks an observable marking rubric");
    if (/Study an artwork or design related to|Identify three relevant visual elements|Explain how line, shape, colour, form, texture, space, balance, unity or technique communicates meaning/i.test(section)) failures.push(code + ": legacy cross-discipline generic task scaffold remains");
    if (!objective?.[2] || !section.includes(objective[2].trim())) failures.push(code + ": official Thai indicator text is missing");
  }
  for (const lesson of parseTeacherPackMarkdown(markdown)) {
    const [q1, q2, q3] = lesson.questions;
    if (!q1?.prompt.includes("two specific features") || !q1.expectedAnswer.includes("two accurate")) failures.push(lesson.objectiveCode + ": knowledge task must test two distinct subject features with evidence");
    if (!q2?.prompt.includes("fictional") || !q2.prompt.includes("three-step plan") || !q2.expectedAnswer.includes("three workable steps")) failures.push(lesson.objectiveCode + ": application task must use a fictional case and sequenced decision");
    if (!q3?.prompt.includes("Demonstration / evidence product") || !q3.prompt.includes("Produce") || !q3.expectedAnswer.includes("observable criteria")) failures.push(lesson.objectiveCode + ": final task must require an observable product/performance and criteria");
  }
}
for (const [discipline, count] of Object.entries(artsDisciplineCounts)) if (!count) failures.push("No lessons classified for " + discipline);
if (artsDisciplineCounts["Visual arts"] !== 109 || artsDisciplineCounts.Music !== 90 || artsDisciplineCounts["Dance and drama"] !== 80) failures.push("Unexpected Arts discipline distribution: " + JSON.stringify(artsDisciplineCounts));

if (failures.length) {
  process.stderr.write("\nArts pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: 279 unique Arts indicators and 837 indicator-linked answer-keyed tasks parsed by the actual TypeScript importer parser.\n");
  process.stdout.write("The 39 shared M4–M6 indicators expand to 117 grade-specific lesson drafts and 351 grade-scoped questions.\n");
}
