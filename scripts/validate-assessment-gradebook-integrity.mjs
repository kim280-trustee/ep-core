import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8").toLowerCase();
const grading = read("supabase/migrations/20261126140000_scope_manual_assessment_grading_to_student_class.sql");
const sync = read("supabase/migrations/20260930061030_learning_assessment_result_gradebook_sync.sql");
const bestAttempt = read("supabase/migrations/20261004052315_learning_gradebook_best_attempt_policy.sql");
const finalizedGuard = read("supabase/migrations/20261021100000_learning_gradebook_finalized_entry_guard.sql");
const manualLifecycle = read("supabase/migrations/20261117090000_learning_manual_review_assessment_lifecycle.sql");

for (const fragment of [
  "auth.uid()", "learning_can_manage_academic_records", "learning_teacher_can_view_student",
  "attempt_status <> 'evaluating'", "evaluation_status = 'manual_reviewed'",
  "p_awarded_points < 0", "p_awarded_points > v_answer.points",
  "on conflict (attempt_id) do update", "learning_assessment_results",
  "jsonb_set(coalesce(notes, '{}'::jsonb), '{automatic}', 'false'::jsonb, true)",
  "set status = 'evaluated'", "revoke all on function public.grade_learning_attempt_answer"
]) assert.ok(grading.includes(fragment), `Manual grading must preserve: ${fragment}`);

assert.ok(!grading.includes("learning_is_active_teacher("), "manual grading must not allow organization-wide teacher access");
assert.ok(sync.includes("on conflict (assessment_result_id) where assessment_result_id is not null"), "result-to-gradebook sync must upsert idempotently by result");
assert.ok(sync.includes("assessment_result_id") && sync.includes("attempt_id"), "gradebook records must retain result and attempt provenance");
assert.ok(sync.includes("if v_assignment_count <> 1 then") && sync.includes("return false"), "ambiguous assignment mapping must not create an arbitrary gradebook entry");
assert.ok(sync.includes("after insert or update of score, max_score, percentage, evaluated_at"), "result changes must trigger gradebook synchronization");
for (const fragment of [
  "percentage desc nulls last", "evaluated_at desc nulls last", "ar.id desc",
  "included_in_grade = (gbe.assessment_result_id = v_best_result_id)",
  "'attempt_policy', 'best_attempt'"
]) assert.ok(bestAttempt.includes(fragment), `Best-attempt gradebook policy must preserve: ${fragment}`);
assert.ok(finalizedGuard.includes("current_user in ('anon', 'authenticated')"), "direct client gradebook mutations must be blocked");
assert.ok(finalizedGuard.includes("learning_term_grades") && finalizedGuard.includes("status = 'finalized'"), "finalized term grades must remain protected");
assert.ok(manualLifecycle.includes("if v_answer.evaluation_status = 'manual_reviewed' then"), "already-graded answers must not be silently regraded");
assert.ok(manualLifecycle.includes("on conflict (attempt_id) do update"), "manual-review result finalization must be idempotent");

console.log("Assessment/gradebook integrity contract passed: authorized one-time grading, idempotent result sync, deterministic best-attempt inclusion and finalized-grade protection.");
