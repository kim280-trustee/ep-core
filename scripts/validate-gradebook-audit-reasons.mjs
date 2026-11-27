import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  "supabase/migrations/20261127100000_require_gradebook_audit_reasons.sql",
  "utf8"
).toLowerCase();

const updateStart = migration.indexOf("create or replace function public.update_learning_manual_gradebook_entry");
const deleteStart = migration.indexOf("create or replace function public.delete_learning_manual_gradebook_entry");
assert.ok(updateStart >= 0 && deleteStart > updateStart, "Both manual gradebook mutation RPCs must be replaced");

const updateFunction = migration.slice(updateStart, deleteStart);
const deleteFunction = migration.slice(deleteStart);

for (const [name, body] of [
  ["update_learning_manual_gradebook_entry", updateFunction],
  ["delete_learning_manual_gradebook_entry", deleteFunction]
]) {
  assert.ok(body.includes("p_reason is null or btrim(p_reason) = ''"), `${name} must reject a missing or blank audit reason`);
  assert.ok(body.includes("btrim(p_reason)"), `${name} must persist the normalized reason`);
  assert.ok(body.includes("learning_can_manage_academic_records"), `${name} must retain academic-manager authorization`);
  assert.ok(body.includes("for update"), `${name} must lock the target entry before mutation`);
  assert.ok(body.includes("learning_term_grades") && body.includes("v_grade_status = 'finalized'"), `${name} must protect finalized term grades`);
  assert.ok(body.includes("learning_gradebook_audit_log"), `${name} must write an audit record`);
}

assert.ok(updateFunction.includes("'update_entry'"), "Edits must be auditable as update_entry");
assert.ok(deleteFunction.includes("'delete_entry'"), "Deletions must be auditable as delete_entry");
assert.ok(deleteFunction.includes("insert into public.learning_gradebook_audit_log") &&
  deleteFunction.indexOf("insert into public.learning_gradebook_audit_log") < deleteFunction.indexOf("delete from public.learning_gradebook_entries"),
  "Deletion audit must be written before the entry is deleted");
assert.ok(migration.includes("revoke all on function public.update_learning_manual_gradebook_entry") &&
  migration.includes("grant execute on function public.update_learning_manual_gradebook_entry(uuid,text,numeric,numeric,uuid,text,text,boolean,text) to authenticated"),
  "Update RPC must remain authenticated-only");
assert.ok(migration.includes("revoke all on function public.delete_learning_manual_gradebook_entry") &&
  migration.includes("grant execute on function public.delete_learning_manual_gradebook_entry(uuid,text) to authenticated"),
  "Delete RPC must remain authenticated-only");

console.log("Gradebook audit-reason contract passed: edits and deletions require nonblank reasons, preserve authorization, row locks, finalized-grade protection and audit-before-delete ordering.");
