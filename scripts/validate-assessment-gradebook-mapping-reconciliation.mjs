import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  "supabase/migrations/20261127140000_validate_assessment_gradebook_mapping_on_reinclude.sql",
  "utf8"
).toLowerCase();

assert.ok(migration.includes("private.learning_assessment_gradebook_mapping_is_valid"));
assert.ok(migration.includes("a.status = 'published'"));
assert.ok(migration.includes("t.status = 'active'"));
assert.ok(migration.includes("count(distinct a.id)"));
assert.ok(migration.includes("v_assignment_count <> 1"));
assert.ok(migration.includes("v_term_count = 1"));
assert.ok(migration.includes("v_term_id = v_entry.term_id"));
assert.ok(migration.includes("p_included_in_grade and v_entry.source_type = 'assessment_result'"));
assert.ok(migration.includes("not private.learning_assessment_gradebook_mapping_is_valid(v_entry.id)"));
assert.ok(migration.includes("keep this record excluded"));
assert.ok(migration.includes("for update"));
assert.ok(migration.includes("learning_gradebook_audit_log"));
assert.ok(migration.includes("btrim(p_reason)"));
assert.ok(migration.includes("grade.status = 'finalized'") || migration.includes("if v_grade_status = 'finalized'"));
assert.ok(migration.includes("revoke all on function private.learning_assessment_gradebook_mapping_is_valid(uuid)"));
assert.ok(migration.includes("grant execute on function public.set_learning_gradebook_entry_included(uuid, boolean, text)"));

console.log("Assessment gradebook mapping reconciliation contract passed.");
