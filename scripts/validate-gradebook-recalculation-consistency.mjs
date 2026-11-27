import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  "supabase/migrations/20261127110000_gradebook_recalculation_finalization_consistency.sql",
  "utf8"
).toLowerCase();

const calculateStart = sql.indexOf("create or replace function public.calculate_learning_term_grade");
const finalizeStart = sql.indexOf("create or replace function public.finalize_learning_term_grade");
assert.ok(calculateStart >= 0 && finalizeStart > calculateStart, "Recalculation and finalization RPCs must both be replaced");
const calculate = sql.slice(calculateStart, finalizeStart);
const finalize = sql.slice(finalizeStart);

assert.ok(calculate.includes("for update"), "Recalculation must lock an existing term-grade row");
assert.ok(calculate.includes("v_grade.override_score"), "Recalculation must inspect an existing manual override");
assert.ok(calculate.includes("coalesce(public.learning_term_grades.override_score, excluded.score)"), "Recalculation must preserve the effective override score");
assert.ok(calculate.includes("public.learning_term_grades.override_grade"), "Recalculation must preserve the override letter grade");
assert.ok(calculate.includes("'calculatedscore', v_calculated_score"), "Calculation provenance must retain the underlying calculated score");
assert.ok(calculate.includes("'appliedoverride'"), "Calculation provenance must record an applied override");
assert.ok(calculate.includes("v_grade.status = 'finalized'"), "Recalculation must reject finalized grades");
assert.ok(calculate.includes("learning_can_manage_academic_records"), "Recalculation must retain academic-manager authorization");

assert.ok(sql.includes("alter table public.learning_term_grade_history") &&
  sql.includes("add column if not exists override_score") &&
  sql.includes("add column if not exists override_grade") &&
  sql.includes("add column if not exists override_reason"),
  "History must retain manual override provenance");
assert.ok(finalize.includes("for update"), "Finalization must lock the grade row");
assert.ok(finalize.includes("learning_term_grade_history"), "Finalization must create a history snapshot");
assert.ok(finalize.includes("v_grade.override_score") && finalize.includes("v_grade.override_reason"), "Finalization history must snapshot override provenance");
assert.ok(finalize.includes("if v_grade.status = 'finalized' then") && finalize.includes("return v_grade.id"), "Repeated finalization must be idempotent");
assert.ok(finalize.includes("learning_gradebook_audit_log"), "Finalization must write an audit record");
assert.ok(sql.includes("revoke all on function public.calculate_learning_term_grade") &&
  sql.includes("grant execute on function public.calculate_learning_term_grade(uuid, uuid, uuid) to authenticated"),
  "Recalculation RPC must remain authenticated-only");
assert.ok(sql.includes("revoke all on function public.finalize_learning_term_grade") &&
  sql.includes("grant execute on function public.finalize_learning_term_grade(uuid, uuid, uuid) to authenticated"),
  "Finalization RPC must remain authenticated-only");

console.log("Gradebook recalculation/finalization consistency contract passed.");
