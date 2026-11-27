import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  "supabase/migrations/20261127130000_guard_linked_assessment_result_retention.sql",
  "utf8"
).toLowerCase();

assert.ok(
  migration.includes("create or replace function private.guard_linked_assessment_result_retention"),
  "A private retention guard must exist"
);
assert.ok(
  migration.includes("before delete or update of attempt_id, student_user_id, organization_id"),
  "Delete and source-identity changes must be guarded"
);
assert.ok(
  migration.includes("where e.assessment_result_id = old.id"),
  "Guard must only protect results already linked to gradebook entries"
);
assert.ok(
  migration.includes("cannot be deleted"),
  "Linked result deletion must fail with a clear retention message"
);
assert.ok(
  migration.includes("source identity cannot be changed"),
  "Linked result identity mutation must fail with a clear message"
);
assert.ok(
  migration.includes("using errcode = '23503'") &&
    migration.includes("using errcode = '23514'"),
  "Deletion and identity violations must return integrity error codes"
);
assert.ok(
  migration.includes("security definer") && migration.includes("set search_path = ''"),
  "Trigger function must use a hardened execution context"
);
assert.ok(
  migration.includes("revoke all on function private.guard_linked_assessment_result_retention()"),
  "Trigger function must not be executable by client roles"
);

const sourceSync = readFileSync(
  "supabase/migrations/20260930061030_learning_assessment_result_gradebook_sync.sql",
  "utf8"
).toLowerCase();
assert.ok(
  sourceSync.includes("on conflict (assessment_result_id)"),
  "Retention guard must protect the same stable source identity used by sync"
);

console.log("Assessment-result gradebook retention guard contract passed.");
