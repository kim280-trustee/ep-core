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
  const questions = numbers.map((number) => `${number}. Question ${number}? **Answer:** Expected answer ${number}.`).join("\n");
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

// Social Studies packs place the Thai-only official-indicator text before the
// explicit objective-code line. The parser must prefer the latter.
const socialStudiesFormat = `### 1. SO1.1-P4-01

- **Official indicator:** อธิบายความสำคัญของศาสนาและการอยู่ร่วมกันอย่างเคารพ
**Objective:** \`SO1.1-P4-01\` — อธิบายความสำคัญของศาสนาและการอยู่ร่วมกันอย่างเคารพ
**Practical activity:** Compare two respectful community choices and explain the evidence.

**Independent practice**
1. Identify the indicator idea: อธิบายความสำคัญของศาสนาและการอยู่ร่วมกันอย่างเคารพ. **Answer:** Identify the relevant idea.
2. Explain the indicator idea: อธิบายความสำคัญของศาสนาและการอยู่ร่วมกันอย่างเคารพ. **Answer:** Give an accurate explanation.
3. Apply the indicator idea: อธิบายความสำคัญของศาสนาและการอยู่ร่วมกันอย่างเคารพ. **Answer:** Apply it to the scenario.
`;
const socialStudiesLesson = parseTeacherPackMarkdown(socialStudiesFormat)[0];
assert.equal(socialStudiesLesson.objectiveCode, "SO1.1-P4-01");


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

process.stdout.write("PASS: teacher-pack parser accepts ordered questions 1–3 and rejects missing, repeated, reordered or shifted numbering.\n");
