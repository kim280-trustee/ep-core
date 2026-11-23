import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const parserPath = resolve(process.cwd(), "src/features/learning-content/utils/teacher-pack-parser.ts");
const source = await readFile(parserPath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.length ?? 0, 0, "Teacher-pack parser must transpile cleanly.");
const moduleUrl = "data:text/javascript;base64," + Buffer.from(compiled.outputText).toString("base64");
const { parseTeacherPackMarkdown } = await import(moduleUrl);

function packWithQuestionNumbers(numbers) {
  const questions = numbers.map((number) => `${number}. Question ${number}? **Answer:** Expected answer ${number}.`).join("\\n");
  return `## Lesson 1. Sample lesson

**Objective code:** \`SCI-M1-01\`
**Learning outcome:** Explain the sample concept.
**Suggested activity:** Observe, discuss and record the result.

**Formative assessment**
${questions}
`;
}

const valid = parseTeacherPackMarkdown(packWithQuestionNumbers([1, 2, 3]));
assert.equal(valid.length, 1);
assert.deepEqual(valid[0].questions.map((question) => question.number), [1, 2, 3]);

for (const numbers of [[1, 1, 3], [2, 3, 4], [1, 3, 2], [0, 1, 2]]) {
  assert.throws(
    () => parseTeacherPackMarkdown(packWithQuestionNumbers(numbers)),
    /numbered 1, 2 and 3 in order/,
    `Parser must reject question numbering ${numbers.join(", ")}`,
  );
}

assert.throws(
  () => parseTeacherPackMarkdown(packWithQuestionNumbers([1, 2])),
  /exactly three answer-keyed questions numbered 1, 2 and 3 in order/,
);

process.stdout.write("PASS: teacher-pack parser accepts ordered questions 1–3 and rejects missing, repeated, reordered or shifted numbering.\\n");
