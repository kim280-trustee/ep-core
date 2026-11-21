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

const packs = [
  { area: "Thai Language", path: "docs/learning/thai-language/THAI-LANGUAGE-P1-P3-TEACHER-STARTER-PACK.md", count: 80, kind: "thai" },
  { area: "Thai Language", path: "docs/learning/thai-language/THAI-LANGUAGE-P4-P6-TEACHER-STARTER-PACK.md", count: 100, kind: "thai" },
  { area: "Thai Language", path: "docs/learning/thai-language/THAI-LANGUAGE-M1-M3-TEACHER-STARTER-PACK.md", count: 103, kind: "thai" },
  { area: "Thai Language", path: "docs/learning/thai-language/THAI-LANGUAGE-M4-M6-SHARED-TEACHER-STARTER-PACK.md", count: 36, kind: "thai" },
  { area: "Career", path: "docs/learning/career/CAREER-P1-P3-TEACHER-STARTER-PACK.md", count: 9, kind: "career" },
  { area: "Career", path: "docs/learning/career/CAREER-P4-P5-TEACHER-STARTER-PACK.md", count: 11, kind: "career" },
  { area: "Career", path: "docs/learning/career/CAREER-P6-M6-TEACHER-STARTER-PACK.md", count: 34, kind: "career" },
];

const codes = { thai: new Set(), career: new Set() };
const failures = [];
const totals = { thai: { lessons: 0, questions: 0 }, career: { lessons: 0, questions: 0 } };

for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const lessons = parseTeacherPackMarkdown(markdown);
  if (lessons.length !== pack.count) failures.push(pack.path + ": expected " + pack.count + " lessons, parsed " + lessons.length);

  for (const lesson of lessons) {
    const code = lesson.objectiveCode;
    const pattern = pack.kind === "thai"
      ? /^TH[1-5]\.\d-(?:P[1-6]|M[1-6]|M4-6)-\d{2}$/
      : /^CAREER-(?:P[1-6]|M[1-6]|M46)-\d{2}$/;
    if (!code || !pattern.test(code)) {
      failures.push(pack.path + ": lesson " + lesson.number + " has missing or invalid objective code " + String(code));
    } else {
      if (codes[pack.kind].has(code)) failures.push("Duplicate " + pack.area + " objective code: " + code);
      codes[pack.kind].add(code);
      const shared = pack.kind === "thai" ? /-M4-6-\d{2}$/.test(code) : /-M46-\d{2}$/.test(code);
      if (shared) {
        if (extractTeacherPackGradeCode(code) !== null) failures.push(code + ": shared grade scope must not collapse to one grade");
        if (JSON.stringify(extractTeacherPackGradeCodes(code)) !== JSON.stringify(["M4", "M5", "M6"])) failures.push(code + ": shared grade scope must expand to M4, M5 and M6");
      } else {
        const expectedGrade = code.match(/-(P[1-6]|M[1-6])-/)?.[1];
        if (!expectedGrade || extractTeacherPackGradeCode(code) !== expectedGrade) failures.push(code + ": importer grade extraction mismatch");
      }
    }

    if (!lesson.title.trim() || !lesson.learningOutcome.trim() || !lesson.activity.trim()) {
      failures.push((code ?? "lesson " + lesson.number) + ": title, outcome or activity is empty");
    }
    if (lesson.questions.length !== 3) failures.push((code ?? "lesson " + lesson.number) + ": expected 3 answer-keyed questions, parsed " + lesson.questions.length);
    for (const question of lesson.questions) {
      totals[pack.kind].questions += 1;
      if (!question.prompt.trim() || !question.expectedAnswer.trim()) failures.push((code ?? "lesson " + lesson.number) + ": question " + question.number + " is missing a prompt or answer/evidence guide");
    }
  }

  totals[pack.kind].lessons += lessons.length;
  process.stdout.write("Parsed " + pack.path + ": " + lessons.length + " lessons.\n");
}

if (totals.thai.lessons !== 319 || codes.thai.size !== 319 || totals.thai.questions !== 957) {
  failures.push("Thai Language expected 319 unique objectives / lessons and 957 answer-keyed tasks; found " + totals.thai.lessons + " lessons, " + codes.thai.size + " codes and " + totals.thai.questions + " tasks");
}
if (totals.career.lessons !== 54 || codes.career.size !== 54 || totals.career.questions !== 162) {
  failures.push("Career expected 54 unique objectives / lessons and 162 answer-keyed tasks; found " + totals.career.lessons + " lessons, " + codes.career.size + " codes and " + totals.career.questions + " tasks");
}

if (failures.length) {
  process.stderr.write("\nThai Language / Career validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: Thai Language 319 objectives / 957 answer-keyed tasks and Career 54 objectives / 162 answer-keyed tasks parsed by the actual TypeScript importer parser.\n");
  process.stdout.write("Shared upper-secondary Thai Language and Career objectives expand to M4, M5 and M6 without collapsing their grade scope.\n");
}
