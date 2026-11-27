import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read = (path) => readFile(resolve(process.cwd(), path), "utf8");
const [transition, objectiveGuard, repository] = await Promise.all([
  read("supabase/migrations/20261010000900_harden_learning_content_version_transitions.sql"),
  read("supabase/migrations/20261116043000_learning_content_objective_subject_integrity.sql"),
  read("src/features/learning-content/repositories/learning-content.repository.ts"),
]);

const functionStart = transition.indexOf("create or replace function public.transition_learning_content_version_status");
assert.ok(functionStart >= 0, "A single database transition function must own content-version lifecycle changes.");
const lifecycle = transition.slice(functionStart, transition.indexOf("$function$;", functionStart) + "$function$;".length);

assert.match(lifecycle, /auth\.uid\(\)/, "Publishing must require an authenticated actor.");
assert.match(lifecycle, /learning_current_user_id\(\)/, "Publishing must resolve the actor from the authenticated session.");
assert.match(lifecycle, /learning_can_manage_academic_records\(v_item\.organization_id\)/,
  "Publishing must require organization-scoped academic-record management permission.");
assert.match(lifecycle, /for update of ci/i, "Content item must be locked during status transitions.");
assert.match(lifecycle, /for update/i, "Content version must be locked during status transitions.");
assert.match(lifecycle, /content needs at least one learning objective/i,
  "Review and publication must require at least one linked learning objective.");
assert.match(lifecycle, /jsonb_typeof\(v_sections\) is distinct from 'array'/,
  "Review and publication must reject malformed section payloads.");
assert.match(lifecycle, /content version cannot be empty/i,
  "Review and publication must reject empty content.");
assert.match(lifecycle, /v_version\.status = 'draft' and p_status = 'review'/,
  "Draft content must move through review before publication.");
assert.match(lifecycle, /v_version\.status = 'review' and p_status in \('draft', 'published'\)/,
  "Review content may return to draft or proceed to publication.");
assert.match(lifecycle, /content must be in review before a version can be published/i,
  "A draft version cannot bypass review.");
assert.match(transition, /revoke all on function public\.transition_learning_content_version_status\(uuid, text\) from public, anon/i,
  "Anonymous and public callers must not execute the lifecycle RPC.");
assert.match(transition, /grant execute on function public\.transition_learning_content_version_status\(uuid, text\) to authenticated/i,
  "Authenticated callers must use the guarded lifecycle RPC.");

assert.match(objectiveGuard, /guard_learning_content_objective_scope/,
  "Objective mappings must be protected by a database trigger.");
assert.match(objectiveGuard, /objective\.status = 'active'[\s\S]*topic\.status = 'active'[\s\S]*skill\.status = 'active'/,
  "Content mappings must reference active objectives, topics and skills.");
assert.match(objectiveGuard, /learning_objective_alignments[\s\S]*learning_grade_levels[\s\S]*learning_curriculum_subjects/,
  "Content mappings must resolve through active curriculum, grade and subject alignment.");
assert.match(objectiveGuard, /all learning objectives linked to one content item must belong to the same subject/i,
  "One content item must not mix learning-area subjects.");
assert.match(objectiveGuard, /only draft content can have its learning-objective mappings changed/i,
  "Reviewed or published content objective mappings must be immutable.");

const versionStatusMethod = repository.slice(
  repository.indexOf("  async updateVersionStatus("),
  repository.indexOf("\n  },", repository.indexOf("  async updateVersionStatus(")) + 5,
);
assert.match(versionStatusMethod, /transition_learning_content_version_status/,
  "The frontend repository must delegate version status changes to the guarded database RPC.");
assert.doesNotMatch(versionStatusMethod, /\.from\(["']learning_content_versions["']\)\.update/,
  "The frontend must not bypass lifecycle validation with direct table updates.");

process.stdout.write("PASS: content lifecycle authorization, review gates, objective alignment and immutable reviewed mappings.\\n");
