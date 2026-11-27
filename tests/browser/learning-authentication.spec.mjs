import { expect, test } from "@playwright/test";

const accounts = {
  "student@example.test": { id: "11111111-1111-4111-8111-111111111111", profileId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", roles: ["student"] },
  "teacher@example.test": { id: "22222222-2222-4222-8222-222222222222", profileId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", roles: ["teacher"] },
  "parent@example.test": { id: "33333333-3333-4333-8333-333333333333", profileId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", roles: ["parent"] },
  "admin@example.test": { id: "44444444-4444-4444-8444-444444444444", profileId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", roles: ["school-admin"] },
  "teacher-parent@example.test": { id: "55555555-5555-4555-8555-555555555555", profileId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", roles: ["teacher", "parent"] },
  "admin-parent@example.test": { id: "66666666-6666-4666-8666-666666666666", profileId: "ffffffff-ffff-4fff-8fff-ffffffffffff", roles: ["school-admin", "parent"] },
};

const portalForRole = {
  student: "/learning",
  teacher: "/teacher",
  parent: "/parent",
  "school-admin": "/school-admin",
};

function jwt() {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600, sub: "test" })}.signature`;
}

async function mockSupabase(page) {
  let activeAccount = null;
  await page.route("http://127.0.0.1:54321/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    const reply = (body, status = 200) => route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });

    if (path === "/auth/v1/token" && method === "POST") {
      const payload = request.postDataJSON();
      activeAccount = accounts[String(payload.email).toLowerCase()] ?? null;
      if (!activeAccount) return reply({ message: "Invalid login credentials" }, 400);
      const user = { id: activeAccount.id, aud: "authenticated", role: "authenticated", email: payload.email, app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
      return reply({ access_token: jwt(), token_type: "bearer", expires_in: 3600, refresh_token: "test-refresh-token", user });
    }

    if (path === "/auth/v1/logout" && method === "POST") {
      activeAccount = null;
      return route.fulfill({ status: 204, body: "" });
    }

    if (path === "/auth/v1/user") {
      if (!activeAccount) return reply({ message: "Auth session missing!" }, 401);
      return reply({ id: activeAccount.id, aud: "authenticated", role: "authenticated", email: Object.keys(accounts).find((email) => accounts[email] === activeAccount), app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" });
    }

    if (path.startsWith("/rest/v1/rpc/")) return reply(true);

    if (path.startsWith("/rest/v1/")) {
      if (!activeAccount) return reply({ message: "JWT expired" }, 401);
      const table = path.split("/").pop();
      const roles = activeAccount.roles;
      const email = Object.keys(accounts).find((item) => accounts[item] === activeAccount);
      const profile = {
        id: activeAccount.profileId,
        auth_user_id: activeAccount.id,
        tenant_id: "99999999-9999-4999-8999-999999999999",
        name: email.split("@")[0],
        email,
        created_at: "2026-01-01T00:00:00Z",
      };
      let rows = [];
      if (table === "users") rows = [profile];
      if (table === "user_roles") rows = [{ role_id: "role-staff" }];
      if (table === "roles") rows = [{ name: "STAFF" }];
      if (table === "tenants") rows = [{ id: profile.tenant_id, name: "Test School" }];
      if (table === "learning_class_memberships") {
        const requestedRole = url.searchParams.get("membership_type")?.replace("eq.", "");
        rows = roles.filter((role) => (role === "student" || role === "teacher") && (!requestedRole || requestedRole === role))
          .map((role) => ({ id: `membership-${role}`, user_id: profile.id, membership_type: role, status: "active", class_group_id: "test-class" }));
      }
      if (table === "learning_parent_student_links" && roles.includes("parent")) {
        rows = [{ id: "parent-link", parent_user_id: profile.id, status: "active" }];
      }
      if (table === "organization_memberships" && roles.includes("school-admin")) {
        rows = [{ organization_id: "organization-test", user_id: profile.id, status: "active" }];
      }
      const wantsObject = request.headers()["accept"]?.includes("application/vnd.pgrst.object");
      if (wantsObject) return reply(rows[0] ?? { message: "No rows found" }, rows.length ? 200 : 406);
      return reply(rows);
    }

    return reply({});
  });
}

async function signIn(page, email) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("test-password-not-a-real-credential");
  await page.getByRole("button", { name: "Sign In" }).click();
}

test.describe("Learning authentication browser acceptance", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabase(page);
  });

  for (const role of ["student", "teacher", "parent", "school-admin"]) {
    test(`routes a single-role ${role} account to its authorized portal`, async ({ page }) => {
      await signIn(page, `${role}@example.test`);
      await expect(page).toHaveURL(new RegExp(`${portalForRole[role]}$`));
      await expect(page.getByText("Access denied")).toHaveCount(0);
      if (role === "school-admin") {
        await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
      } else if (role === "teacher") {
        await expect(page.getByText("No active teaching classes")).toBeVisible();
      }
    });
  }

  test("offers both eligible portals to a teacher-parent account", async ({ page }) => {
    await signIn(page, "teacher-parent@example.test");
    await expect(page.getByRole("heading", { name: "Choose your portal" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Teacher Portal/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Parent Portal/ })).toBeVisible();
    await page.getByRole("button", { name: /Parent Portal/ }).click();
    await expect(page).toHaveURL(/\/parent$/);
  });

  test("offers School Admin and Parent to a multi-role administrator and routes the chosen portal", async ({ page }) => {
    await signIn(page, "admin-parent@example.test");
    await expect(page.getByRole("heading", { name: "Choose your portal" })).toBeVisible();
    await expect(page.getByRole("button", { name: /School Admin Portal/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Parent Portal/ })).toBeVisible();
    await page.getByRole("button", { name: /School Admin Portal/ }).click();
    await expect(page).toHaveURL(/\/school-admin$/);
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  test("denies a student who manually opens the teacher portal", async ({ page }) => {
    await signIn(page, "student@example.test");
    await expect(page).toHaveURL(/\/learning$/);
    await page.goto("/teacher");
    await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  });

  test("allows a multi-role user to sign out from the portal chooser", async ({ page }) => {
    await signIn(page, "teacher-parent@example.test");
    await expect(page.getByRole("heading", { name: "Choose your portal" })).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("heading", { name: "Sign in to E&P Learning" })).toBeVisible();
  });
});
