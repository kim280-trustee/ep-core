import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const sql = await readFile(resolve(process.cwd(), "docs/learning/science/SCIENCE-IMPORT-COMPLETE-GROUP-VERIFICATION.sql"), "utf8");
const checks = [
  [/cross join generate_series\\(1,3\\)/, "all three expected question slots"],
  [/left join public\\.learning_questions q/, "missing question rows"],
  [/left join public\\.learning_question_versions qv/, "missing question versions"],
  [/left join public\\.learning_question_evaluation_keys k/, "missing protected answer keys"],
  [/left join public\\.learning_question_objectives qo/, "missing objective links"],
  [/CHECK_PROTECTED_ANSWER_KEY/, "answer-key cardinality"],
  [/CHECK_CURRICULUM_GRADE_ALIGNMENT/, "curriculum and grade alignment"],
  [/CHECK_SUBJECT_ALIGNMENT/, "subject alignment"],
  [/count\\(\\*\\)=2145/, "all 2,145 expected question slots"],
  [/count\\(\\*\\) filter \\(where result='PASS'\\)=2145/, "all slots must pass"],
];
for (const [pattern, label] of checks) assert.match(sql, pattern, "SQL must validate " + label + ".");
assert.doesNotMatch(sql, /\\b(insert|update|delete|truncate)\\s+public\\./i, "Verification SQL must not mutate public tables.");
process.stdout.write("PASS: complete Science import verification checks all 2,145 expected question slots and dependent records.\\n");
