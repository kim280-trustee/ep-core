import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  "supabase/migrations/20261127120000_require_fresh_gradebook_calculation_before_finalization.sql",
  "utf8"
).toLowerCase();

assert.ok(sql.includes("create or replace function public.finalize_learning_term_grade"), "Finalization RPC must be replaced");
assert.ok(sql.includes("for update"), "Finalization must lock the term-grade row");
assert.ok(sql.includes("jsonb_agg(jsonb_build_object("), "Finalization must rebuild the current included-entry snapshot");
assert.ok(sql.includes("'entryid', e.id"), "Freshness comparison must include gradebook entry identity");
assert.ok(sql.includes("'percentage', e.percentage") && sql.includes("'weight', e.weight"), "Freshness comparison must include calculation inputs");
assert.ok(sql.includes("v_grade.calculation->'entries' is distinct from v_current_entries"), "Finalization must reject changed or missing calculation snapshots");
assert.ok(sql.includes("recalculate the term grade before finalizing it"), "Stale calculation rejection must tell the operator to recalculate");
assert.ok(sql.includes("v_grade.status = 'finalized'") && sql.includes("return v_grade.id"), "Repeated finalization must remain idempotent");
assert.ok(sql.includes("learning_term_grade_history"), "Finalization must retain immutable history snapshots");
assert.ok(sql.includes("override_score, override_grade, override_reason"), "History must retain override provenance");
assert.ok(sql.includes("learning_gradebook_audit_log"), "Finalization must retain its audit event");
assert.ok(sql.includes("learning_can_manage_academic_records"), "Academic-manager authorization must remain enforced");
assert.ok(sql.includes("revoke all on function public.finalize_learning_term_grade") &&
  sql.includes("grant execute on function public.finalize_learning_term_grade(uuid, uuid, uuid) to authenticated"),
  "Finalization RPC must remain authenticated-only");

console.log("Gradebook finalization freshness contract passed.");
