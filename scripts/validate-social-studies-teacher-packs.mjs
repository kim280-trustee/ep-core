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
const { parseTeacherPackMarkdown, extractTeacherPackGradeCode, extractTeacherPackGradeCodes } = await import(parserUrl);

const gradeCases = [
  ["SO1.1-P1-01", "P1"], ["SO2.2-P6-09", "P6"],
  ["SO3.1-M1-02", "M1"], ["SO5.2-M3-07", "M3"],
  ["SO1.1-M46-01", null], ["M4-S1_1-01", "M4"],
];
for (const [code, expected] of gradeCases) {
  const actual = extractTeacherPackGradeCode(code);
  if (actual !== expected) throw new Error("Grade extraction mismatch for " + code + ": expected " + expected + ", received " + actual);
}
if (JSON.stringify(extractTeacherPackGradeCodes("SO1.1-M46-01")) !== JSON.stringify(["M4", "M5", "M6"])) {
  throw new Error("Shared M4–M6 outcomes must expand to M4, M5 and M6.");
}
if (JSON.stringify(extractTeacherPackGradeCodes("SO2.1-P4-03")) !== JSON.stringify(["P4"])) {
  throw new Error("Grade-specific Social Studies outcomes must retain their exact grade.");
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
    const sequenceBlock = sourceSection.match(/\*\*Suggested teaching sequence\*\*([\s\S]*?)(?=\*\*Resources:\*\*)/)?.[1] ?? "";
    const teachingSteps = [...sequenceBlock.matchAll(/^(\d+)\.\s+.+$/gm)].map((match) => Number(match[1]));
    if (JSON.stringify(teachingSteps) !== JSON.stringify([1, 2, 3, 4])) {
      failures.push(heading[2] + ": expected exactly four numbered teaching-sequence steps");
    }
    const standard = sourceSection.match(/^\s*-\s+\*\*Standard:\*\*\s*(SO[1-5])\.\d+/m)?.[1];
    const resources = sourceSection.match(/\*\*Resources:\*\*\s*(.+)$/m)?.[1] ?? "";
    const expectedResource = {
      SO1: "short age-appropriate account", SO2: "school/community case card", SO3: "decision card",
      SO4: "primary/secondary source extract", SO5: "labelled map or atlas extract",
    }[standard];
    if (!expectedResource || !resources.toLowerCase().includes(expectedResource.toLowerCase())) {
      failures.push(heading[2] + ": resources do not match the Social Studies strand");
    }
    if (pack.path.endsWith("SOCIAL-STUDIES-P1-P3-TEACHER-STARTER-PACK.md")) {
      if (!sourceSection.includes("**Assessment stimulus")) {
        failures.push(heading[2] + ": P1–P3 lesson is missing its assessment stimulus card");
      }
      const expectedStimulus = {
        SO1: "verified tradition/source card",
        SO2: "school/community case card",
        SO3: "Assessment stimulus",
        SO4: "local-history evidence set",
        SO5: "school/community geography field card",
      }[standard];
      if (expectedStimulus && !sourceSection.includes(expectedStimulus)) {
        failures.push(heading[2] + ": P1–P3 assessment stimulus does not match strand " + standard);
      }
      const taskLabels = [...sourceSection.matchAll(/^\s*[123]\. \*\*(Recall \/ evidence|Explain \/ compare|Apply \/ demonstrate):\*\*/gm)].map((match) => match[1]);
      if (JSON.stringify(taskLabels) !== JSON.stringify(["Recall / evidence", "Explain / compare", "Apply / demonstrate"])) {
        failures.push(heading[2] + ": P1–P3 tasks must use the ordered evidence, explanation and application progression");
      }
    }
    const gradeCode = heading[2].match(/-(P[1-6]|M[1-6]|M46)-/)?.[1];
    const expectedBand = gradeCode === "M46" || /^M[4-6]$/.test(gradeCode ?? "") ? "upper secondary"
      : /^M[1-3]$/.test(gradeCode ?? "") ? "lower secondary"
      : /^P[4-6]$/.test(gradeCode ?? "") ? "upper primary" : "early primary";
    const differentiation = sourceSection.match(/\*\*Differentiation:\*\*\s*(.+)$/m)?.[1] ?? "";
    if (!differentiation.toLowerCase().startsWith("for " + expectedBand + " learners:")) {
      failures.push(heading[2] + ": differentiation does not explicitly start with grade band " + expectedBand);
    }
    if (sourceSection.includes("Learners demonstrate the knowledge or performance stated in this indicator.")) {
      failures.push(heading[2] + ": generic learning intention was not replaced");
    }
    if (!indicator || !sourceSection.includes("**Learning intention:** Learners will be able to demonstrate the specific knowledge or performance in this official indicator: " + indicator)) {
      failures.push(heading[2] + ": learning intention is not tied to the exact official indicator");
    }
  }
  const counts = {};
  if (lessons.length !== pack.count) failures.push(pack.path + ": expected " + pack.count + " lessons, parsed " + lessons.length);
  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    if (!code?.startsWith("SO")) failures.push(pack.path + ": lesson " + lesson.number + " has no Social Studies objective code");
    if (code && lesson.title === code) failures.push(code + ": imported lesson title must use the official indicator wording, not only its code");
    const officialIndicator = code ? indicatorByCode.get(code) : null;
    if (!officialIndicator) failures.push((code ?? pack.path + " lesson " + lesson.number) + ": official Thai indicator source text is missing");
    if (code && codes.has(code)) failures.push("Duplicate Social Studies objective code: " + code);
    if (code) codes.add(code);
    const grade = code?.match(/-(P[1-6]|M[1-6]|M46)-/)?.[1];
    if (!grade) failures.push(pack.path + ": lesson " + lesson.number + " has no grade scope in its code");
    else counts[grade] = (counts[grade] ?? 0) + 1;
    if (grade === "M46" && (extractTeacherPackGradeCode(code) !== null || JSON.stringify(extractTeacherPackGradeCodes(code)) !== JSON.stringify(["M4", "M5", "M6"]))) failures.push(code + ": shared M4–M6 code must expand to all three grades without collapsing");
    if (grade && grade !== "M46" && extractTeacherPackGradeCode(code) !== grade) failures.push(code + ": grade extractor did not resolve " + grade);
    if (lesson.questions.length !== 3) failures.push(code + ": expected three answer-keyed tasks, parsed " + lesson.questions.length);
    const questionNumbers = lesson.questions.map((question) => question.number).sort((a, b) => a - b);
    if (JSON.stringify(questionNumbers) !== JSON.stringify([1, 2, 3])) failures.push(code + ": expected exactly question numbers 1, 2 and 3");
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
