import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sql = await readFile(
  "supabase/migrations/20261117120000_learning_project_submission_storage.sql",
  "utf8",
);

function requireMatch(pattern, message) {
  assert.match(sql, pattern, message);
}
function forbidMatch(pattern, message) {
  assert.doesNotMatch(sql, pattern, message);
}

requireMatch(/'learning-project-submissions'\s*,\s*'learning-project-submissions'\s*,\s*false\s*,\s*15728640/isu,
  "Evidence bucket must be private and limited to 15 MiB");
requireMatch(/allowed_mime_types\s*=\s*excluded\.allowed_mime_types/isu,
  "Bucket MIME allow-list must be maintained on replay");
requireMatch(/cardinality\(storage\.foldername\(name\)\)\s*=\s*4/isu,
  "Object paths must contain exactly four folders");
requireMatch(/\(storage\.foldername\(name\)\)\[4\]\s*=\s*public\.learning_current_user_id\(\)::text/isu,
  "Student uploads must be scoped to the authenticated student");
requireMatch(/ai\.organization_id::text\s*=\s*\(storage\.foldername\(name\)\)\[1\]/isu,
  "Path organization must match assignment organization");
requireMatch(/a\.id::text\s*=\s*\(storage\.foldername\(name\)\)\[2\]/isu,
  "Path assignment must match assignment item");
requireMatch(/ai\.content_item_id::text\s*=\s*\(storage\.foldername\(name\)\)\[3\]/isu,
  "Path content item must match assignment item");
requireMatch(/private\.learning_student_has_assignment_target\(a\.id,\s*public\.learning_current_user_id\(\)\)/isu,
  "Upload must require a valid student assignment target");
requireMatch(/a\.status\s*=\s*'published'/isu,
  "Uploads must target published assignments");
requireMatch(/a\.available_from\s+is\s+null\s+or\s+a\.available_from\s*<=\s*now\(\)/isu,
  "Uploads must respect availability start");
requireMatch(/cv\.status\s*=\s*'published'/isu,
  "Uploads must reference published content");
requireMatch(/section->>'type'\s*=\s*'project_activity'/isu,
  "Uploads must be limited to project activities");
requireMatch(/learning_project_submissions_select[\s\S]*?\(storage\.foldername\(name\)\)\[4\]\s*=\s*public\.learning_current_user_id\(\)::text/isu,
  "Students must be able to read their own evidence");
requireMatch(/learning_can_manage_academic_records\(admin_response\.organization_id\)/isu,
  "Academic-manager reads must be organization-scoped");
requireMatch(/learning_teacher_can_manage_content_response\(r\.assignment_id,\s*r\.student_user_id\)/isu,
  "Teacher reads must pass response authorization");
requireMatch(/learning_project_submissions_student_delete[\s\S]*?\(storage\.foldername\(name\)\)\[4\]\s*=\s*public\.learning_current_user_id\(\)::text/isu,
  "Only the evidence owner may delete");
requireMatch(/r\.status\s*=\s*'submitted'/isu,
  "Deletion must be blocked after submission");
forbidMatch(/create\s+policy\s+\w+\s+on\s+storage\.objects\s+for\s+update/isu,
  "Evidence must not expose client-side update access");
requireMatch(/security\s+definer[\s\S]*?set\s+search_path\s*=\s*''/isu,
  "File-limit trigger must lock down search_path");
requireMatch(/pg_advisory_xact_lock/isu,
  "Concurrent file inserts must serialize the count");
requireMatch(/v_existing_count\s*>=\s*3/isu,
  "Each project response is limited to three files");
requireMatch(/before\s+insert\s+on\s+storage\.objects/isu,
  "File limit must be enforced by a database trigger");


const runtimePage = await readFile(
  "src/features/learning-dashboard/pages/LearningContentRuntimePage.tsx",
  "utf8",
);
const teacherResponsesPage = await readFile(
  "src/features/learning-content/pages/TeacherContentResponsesPage.tsx",
  "utf8",
);

// Browser MIME metadata is not consistently populated for every supported file.
// The extension fallback is used only when the browser supplies no MIME type;
// a non-empty unsupported MIME type must still be rejected.
assert.match(runtimePage, /function getProjectEvidenceMimeType\(file: File\): string \| null/isu,
  "Project uploads must normalize file MIME types");
assert.match(runtimePage, /if \(browserMimeType\) return ALLOWED_PROJECT_FILE_TYPES\.has\(browserMimeType\) \? browserMimeType : null/isu,
  "An explicit unsupported browser MIME type must not be overridden by the filename");
assert.match(runtimePage, /PROJECT_FILE_MIME_BY_EXTENSION/isu,
  "Supported extensions must provide a fallback when browser MIME metadata is empty");
assert.match(runtimePage, /const contentType = getProjectEvidenceMimeType\(file\)/isu,
  "The upload must send the validated MIME type to private storage");
assert.match(runtimePage, /file\.size > 15 \* 1024 \* 1024 \|\| !contentType/isu,
  "The upload path must enforce the size and MIME constraints");
assert.match(runtimePage, /uploadedPaths\.length[\s\S]*?\.remove\(uploadedPaths\)/isu,
  "Partially uploaded evidence must be removed when response persistence fails");
assert.match(runtimePage, /\.upload\(objectPath, file, \{ contentType, upsert: false \}\)/isu,
  "Evidence objects must be uploaded without overwriting an existing object");
assert.match(runtimePage, /attachments\.push\(\{ path: objectPath, name: file\.name, size: file\.size, type: contentType \}\)/isu,
  "Persisted attachment metadata must use the normalized MIME type");
assert.match(runtimePage, /setProjectFiles\(selected\)/isu,
  "The selected evidence files must be retained for the next save or submit");
assert.match(teacherResponsesPage, /createSignedUrl\(file\.path, 3600\)/isu,
  "Teacher evidence access must use expiring signed URLs");
assert.match(teacherResponsesPage, /file\.path\.startsWith\(expectedPathPrefix\)/isu,
  "Teacher evidence links must be constrained to the response ownership path");
assert.match(teacherResponsesPage, /target="_blank" rel="noopener noreferrer"/isu,
  "External project and evidence links must use safe new-tab attributes");

console.log("Learning project evidence storage contract passed.");
