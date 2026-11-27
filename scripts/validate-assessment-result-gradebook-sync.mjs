import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  "supabase/migrations/20260930061030_learning_assessment_result_gradebook_sync.sql",
  "utf8"
).toLowerCase();

const syncStart = sql.indexOf("create or replace function private.sync_learning_assessment_result_to_gradebook");
const triggerStart = sql.indexOf("create or replace function private.sync_learning_assessment_result_gradebook_trigger");
assert.ok(syncStart >= 0 && triggerStart > syncStart, "Assessment-result sync function and trigger wrapper must exist");
const sync = sql.slice(syncStart, triggerStart);

assert.ok(sync.includes("where r.id = p_result_id"), "Sync must load the exact assessment result");
assert.ok(sync.includes("v_result.score") && sync.includes("v_result.max_score"), "Sync must require scored results");
assert.ok(sync.includes("v_assignment_count <> 1"), "Sync must reject ambiguous assignment mappings");
assert.ok(sync.includes("a.status = 'published'"), "Only published assignments may create gradebook records");
assert.ok(sync.includes("t.status = 'active'"), "Only active assignment targets may create gradebook records");
assert.ok(sync.includes("v_term_count <> 1"), "Sync must reject ambiguous active-term mappings");
assert.ok(sync.includes("assessment_result_id"), "Gradebook rows must retain source-result identity");
assert.ok(sync.includes("on conflict (assessment_result_id)"), "Repeated result sync must be idempotent");
assert.ok(sync.includes("do update set"), "Changed assessment results must update the existing source row");
assert.ok(sync.includes("score = excluded.score") && sync.includes("max_score = excluded.max_score"), "Updated score inputs must be synchronized");
assert.ok(sync.includes("included_in_grade = excluded.included_in_grade"), "Grade inclusion must follow the synchronized source row");
assert.ok(sync.includes("'source', 'assessment_result'"), "Gradebook provenance must identify the assessment-result source");
assert.ok(sync.includes("'assessment_result_id', v_result.id"), "Gradebook provenance must retain result identity");

const trigger = sql.slice(triggerStart);
assert.ok(trigger.includes("after insert or update of score, max_score, percentage, evaluated_at"), "Sync trigger must run when assessment result scoring fields change");
assert.ok(trigger.includes("perform private.sync_learning_assessment_result_to_gradebook(new.id)"), "Trigger must sync the changed result id");
assert.ok(sql.includes("revoke all on function private.sync_learning_assessment_result_to_gradebook(uuid)"), "Internal sync function must not be callable by client roles");

console.log("Assessment-result to gradebook synchronization contract passed.");
