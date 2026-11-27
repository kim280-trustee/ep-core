import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  "supabase/migrations/20261127150000_reconcile_assessment_gradebook_on_assignment_mapping_change.sql",
  "utf8"
).toLowerCase();

assert.ok(migration.includes("private.exclude_assessment_gradebook_entries_for_mapping_change"));
assert.ok(migration.includes("e.source_type = 'assessment_result'"));
assert.ok(migration.includes("e.assignment_id = p_assignment_id"));
assert.ok(migration.includes("p_assessment_id is null or e.assessment_id = p_assessment_id"));
assert.ok(migration.includes("p_class_group_id is null or e.class_group_id = p_class_group_id"));
assert.ok(migration.includes("p_student_user_id is null or e.student_user_id = p_student_user_id"));
assert.ok(migration.includes("e.included_in_grade = true"));
assert.ok(migration.includes("for update"));
assert.ok(migration.includes("grade.status = 'finalized'"));
assert.ok(migration.includes("reopen the term grade with an audit reason first"));
assert.ok(migration.includes("included_in_grade = false"));
assert.ok(migration.includes("learning_gradebook_audit_log"));
assert.ok(migration.includes("'exclude_assessment_mapping_change'"));
assert.ok(migration.includes("to_jsonb(v_entry)"));
assert.ok(migration.includes("to_jsonb(v_after)"));
assert.ok(migration.includes("btrim(p_reason)"));
assert.ok(migration.includes("public.learning_current_user_id()"));
assert.ok(migration.includes("before delete or update of assignment_id, item_type, assessment_id"));
assert.ok(migration.includes("before delete or update of assignment_id, class_group_id, student_user_id, status"));
assert.ok(migration.includes("old.item_type = 'assessment'"));
assert.ok(migration.includes("old.status = 'active'"));
assert.ok(migration.includes("private.guard_learning_assessment_assignment_parent_mapping()"));
assert.ok(migration.includes("old.class_subject_id is distinct from new.class_subject_id"));
assert.ok(migration.includes("old.organization_id is distinct from new.organization_id"));
assert.ok(migration.includes("new.status not in ('published', 'closed')"));
assert.ok(migration.includes("before update of organization_id, class_subject_id, status"));
assert.ok(migration.includes("assessment assignment academic mapping or publication state changed"));
assert.ok(migration.includes("grade.tenant_id = v_entry.tenant_id"));
assert.ok(migration.includes("revoke all on function private.guard_learning_assessment_assignment_item_mapping()"));
assert.ok(migration.includes("revoke all on function private.guard_learning_assessment_assignment_target_mapping()"));

console.log("Automatic assessment gradebook mapping reconciliation contract passed.");
