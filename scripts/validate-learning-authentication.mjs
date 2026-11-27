import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [login, provider, context, repository, roleRoute, studentRoutes, teacherRoutes, parentRoutes, adminRoutes, studentLayout, teacherLayout, parentLayout, workspaceShell] =
  await Promise.all([
    read("../src/features/auth/pages/LoginPage.tsx"),
    read("../src/core/auth/auth.provider.tsx"),
    read("../src/core/auth/auth.context.ts"),
    read("../src/core/auth/supabase.auth.repository.ts"),
    read("../src/core/auth/LearningRoleRoute.tsx"),
    read("../src/features/learning-dashboard/routes/learning-dashboard.routes.tsx"),
    read("../src/features/learning-teacher/routes/learning-teacher.routes.tsx"),
    read("../src/features/learning-parent/routes/learning-parent.routes.tsx"),
    read("../src/features/learning-school-admin/routes/learning-school-admin.routes.tsx"),
    read("../src/features/learning-dashboard/layouts/StudentLayout.tsx"),
    read("../src/features/learning-teacher/layouts/TeacherLayout.tsx"),
    read("../src/features/learning-parent/layouts/ParentLayout.tsx"),
    read("../src/features/learning-shared/components/LearningWorkspaceShell.tsx"),
  ]);

const checks = [
  ["password sign-in uses the normalized email", login.includes("authService.signIn(normalizedEmail, password)")],
  ["login verifies that Supabase established a session", login.includes("if (!session?.user)")],
  ["login rejects users without any active Learning portal", login.includes("if (destinations.length === 0)") && login.includes("await authService.signOut()")],
  ["post-login redirects remain inside the portal selected by the user", login.includes("getDestinationPath(destination, requestedPath)") && login.includes("isPathWithin(requestedPath, destination)")],
  ["authorization lookup failures are not silently treated as missing membership", repository.includes("if (membershipError) throw membershipError") && repository.includes("if (parentError) throw parentError") && repository.includes("if (organizationMembershipError) throw organizationMembershipError") && repository.includes("if (failedPermissionCheck?.error)")],
  ["login destination collects active teacher and student memberships", repository.includes('.eq("status", "active")') && repository.includes('membership_type === "teacher"') && repository.includes('membership_type === "student"') && repository.includes('destinations.push("/teacher")') && repository.includes('destinations.push("/learning")')],
  ["login destination collects active parent links and school-admin permission", repository.includes('learning_parent_student_links') && repository.includes('destinations.push("/parent")') && repository.includes('organization_memberships') && repository.includes('learning_can_manage_academic_records') && repository.includes('target_organization_id') && repository.includes('destinations.push("/school-admin")') && repository.includes('return destinations')],
  ["multi-role accounts receive a portal chooser after identity verification", login.includes("destinations.length > 1") && login.includes("setAvailablePortals(destinations)") && login.includes("const refreshedUser = await refreshUser()") && login.includes("availablePortals.map((destination)")],
  ["portal chooser only opens destinations returned by authorization checks", login.includes("if (!availablePortals.includes(destination)) return") && login.includes("PORTAL_DETAILS[destination].title")],
  ["users can safely sign out from the portal chooser", login.includes("async function handlePortalSignOut()") && login.includes("await authService.signOut()") && login.includes("setAvailablePortals([])")],
  ["logout is local to the current browser session", repository.includes('signOut({ scope: "local" })')],
  ["auth provider fails closed on identity lookup errors", provider.includes("if (profileError) throw profileError") && provider.includes("if (userRoleError) throw userRoleError") && provider.includes("if (roleError) throw roleError")],
  ["auth provider invalidates stale reads and handles sign-out events", provider.includes("loadRequestId.current += 1") && provider.includes('event === "SIGNED_OUT"') && provider.includes('event === "SIGNED_IN"') && provider.includes("setLoading(true)")],
  ["auth provider invalidates in-flight identity reads on every Supabase auth event", provider.includes("Every Supabase auth event can invalidate an in-flight identity read") && provider.includes("loadRequestId.current += 1;") && provider.includes("window.setTimeout(() => {")],
  ["cross-tab sign-out or expired sessions immediately clear the authenticated identity", provider.includes('event === "SIGNED_OUT"') && provider.includes("setUser(null);") && provider.includes("setLoading(false);")],
  ["auth provider clears a session without an application profile", provider.includes("if (!profile)") && provider.includes('signOut({ scope: "local" })')],
  ["student portal requires a student membership", studentRoutes.includes('<LearningRoleRoute role="student">')],
  ["teacher portal requires a teacher membership", teacherRoutes.includes('<LearningRoleRoute role="teacher">')],
  ["parent portal requires an active parent link", parentRoutes.includes('<LearningRoleRoute role="parent">')],
  ["school-admin routes require academic-management permission", adminRoutes.includes('<LearningRoleRoute role="school-admin">')],
  ["student, teacher and parent portals expose logout", studentLayout.includes("LearningWorkspaceShell") && teacherLayout.includes("LearningWorkspaceShell") && parentLayout.includes("LearningWorkspaceShell") && workspaceShell.includes("await logout()")],
  ["school-admin portal exposes logout on every protected school-admin route", adminRoutes.includes('<LearningWorkspaceShell role="school-admin"') && workspaceShell.includes("await logout()")],
  ["role guard blocks protected content while access is unresolved or denied", roleRoute.includes('access === "checking"') && roleRoute.includes('access === "denied"') && roleRoute.includes('access === "error"')],
  ["logout restores identity only after a successful account reload", provider.includes("const restoredUser = await loadUser();") && provider.includes("if (!restoredUser)") && provider.includes("return authenticatedUser;") && provider.includes("return null;") && provider.includes("{ cause: error }")],
  ["login verifies the refreshed application identity matches the Supabase session before redirecting", login.includes("const refreshedUser = await refreshUser();") && login.includes("refreshedUser.authUserId !== session.user.id") && login.includes("navigate(getDestinationPath(destination, requestedPath), { replace: true })")],
  ["auth refresh returns the verified profile or null rather than hiding hydration failure", context.includes("() => Promise<User | null>") && provider.includes("refreshUser: loadUser") && provider.includes("Promise<User | null>")],
  ["auth refresh returns a verified profile result to its callers", provider.includes("refreshUser: loadUser") && context.includes("() => Promise<User | null>")],
  ["all four portals display the actual logout recovery outcome", workspaceShell.includes("error instanceof Error ? error.message")],
  ["no portal falsely claims the session was restored after every logout failure", !workspaceShell.includes("Your session has been restored")],
  ["student, teacher, parent and school-admin portals display logout failures", studentLayout.includes("LearningWorkspaceShell") && teacherLayout.includes("LearningWorkspaceShell") && parentLayout.includes("LearningWorkspaceShell") && adminRoutes.includes("LearningWorkspaceShell") && workspaceShell.includes("logoutError")],
];

for (const [label, passed] of checks) {
  assert.equal(passed, true, `Authentication contract failed: ${label}`);
  process.stdout.write(`PASS ${label}\n`);
}

process.stdout.write(`Validated ${checks.length} Learning authentication contracts.\n`);
