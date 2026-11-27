import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [login, provider, repository, roleRoute, studentRoutes, teacherRoutes, parentRoutes, adminRoutes, studentLayout, teacherLayout, parentLayout] =
  await Promise.all([
    read("../src/features/auth/pages/LoginPage.tsx"),
    read("../src/core/auth/auth.provider.tsx"),
    read("../src/core/auth/supabase.auth.repository.ts"),
    read("../src/core/auth/LearningRoleRoute.tsx"),
    read("../src/features/learning-dashboard/routes/learning-dashboard.routes.tsx"),
    read("../src/features/learning-teacher/routes/learning-teacher.routes.tsx"),
    read("../src/features/learning-parent/routes/learning-parent.routes.tsx"),
    read("../src/features/learning-school-admin/routes/learning-school-admin.routes.tsx"),
    read("../src/features/learning-dashboard/layouts/StudentLayout.tsx"),
    read("../src/features/learning-teacher/layouts/TeacherLayout.tsx"),
    read("../src/features/learning-parent/layouts/ParentLayout.tsx"),
  ]);

const checks = [
  ["password sign-in uses the normalized email", login.includes("authService.signIn(normalizedEmail, password)")],
  ["login verifies that Supabase established a session", login.includes("if (!session?.user)")],
  ["login rejects users without an active Learning portal", login.includes("if (!destination)") && login.includes("await authService.signOut()")],
  ["post-login redirects are constrained to the resolved role", login.includes("isPathWithin(requestedPath, \"/teacher\")") && login.includes("isPathWithin(requestedPath, \"/learning\")") && login.includes("isPathWithin(requestedPath, \"/parent\")") && login.includes("isPathWithin(requestedPath, \"/school-admin\")")],
  ["authorization lookup failures are not silently treated as missing membership", repository.includes("if (membershipError) throw membershipError") && repository.includes("if (parentError) throw parentError") && repository.includes("if (organizationMembershipError) throw organizationMembershipError") && repository.includes("if (failedPermissionCheck?.error)")],
  ["login destination checks active teacher/student memberships", repository.includes('.eq("status", "active")') && repository.includes('membership_type === "teacher"') && repository.includes('membership_type === "student"')],
  ["login destination checks active parent links and school-admin permission", repository.includes('learning_parent_student_links') && repository.includes('organization_memberships') && repository.includes('learning_can_manage_academic_records') && repository.includes('target_organization_id')],
  ["logout is local to the current browser session", repository.includes('signOut({ scope: "local" })')],
  ["auth provider fails closed on identity lookup errors", provider.includes("if (profileError) throw profileError") && provider.includes("if (userRoleError) throw userRoleError") && provider.includes("if (roleError) throw roleError")],
  ["auth provider invalidates stale reads and handles sign-out events", provider.includes("loadRequestId.current += 1") && provider.includes('event === "SIGNED_OUT"') && provider.includes('event === "SIGNED_IN"') && provider.includes("setLoading(true)")],
  ["auth provider clears a session without an application profile", provider.includes("if (!profile)") && provider.includes('signOut({ scope: "local" })')],
  ["student portal requires a student membership", studentRoutes.includes('<LearningRoleRoute role="student">')],
  ["teacher portal requires a teacher membership", teacherRoutes.includes('<LearningRoleRoute role="teacher">')],
  ["parent portal requires an active parent link", parentRoutes.includes('<LearningRoleRoute role="parent">')],
  ["school-admin routes require academic-management permission", adminRoutes.includes('<LearningRoleRoute role="school-admin">')],
  ["student, teacher and parent portals expose logout", studentLayout.includes("await logout()") && teacherLayout.includes("await logout()") && parentLayout.includes("await logout()")],
  ["role guard blocks protected content while access is unresolved or denied", roleRoute.includes('access === "checking"') && roleRoute.includes('access === "denied"') && roleRoute.includes('access === "error"')],
];

for (const [label, passed] of checks) {
  assert.equal(passed, true, `Authentication contract failed: ${label}`);
  process.stdout.write(`PASS ${label}\n`);
}

process.stdout.write(`Validated ${checks.length} Learning authentication contracts.\n`);
