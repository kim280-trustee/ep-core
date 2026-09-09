import { supabase } from "@/core/database";

import type { PermissionCode } from "./authorization.types";

export async function loadUserPermissions(
  authUserId: string,
): Promise<PermissionCode[]> {
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();

  if (profileError || !profile) {
    throw profileError ?? new Error("User profile not found");
  }

  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", profile.id);

  if (rolesError) {
    throw rolesError;
  }

  const roleIds = (userRoles ?? []).map((userRole) => userRole.role_id);

  if (roleIds.length === 0) {
    return [];
  }

  const { data: rolePermissions, error: permissionsError } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .in("role_id", roleIds);

  if (permissionsError) {
    throw permissionsError;
  }

  const permissionIds = [
    ...new Set(
      (rolePermissions ?? []).map(
        (rolePermission) => rolePermission.permission_id,
      ),
    ),
  ];

  if (permissionIds.length === 0) {
    return [];
  }

  const { data: permissions, error: permissionError } = await supabase
    .from("permissions")
    .select("code")
    .in("id", permissionIds);

  if (permissionError) {
    throw permissionError;
  }

  return (permissions ?? [])
    .map((permission) => permission.code)
    .filter((code): code is PermissionCode => isPermissionCode(code));
}

function isPermissionCode(code: string): code is PermissionCode {
  return [
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "sales.view",
    "sales.create",
    "sales.void",
    "inventory.view",
    "inventory.adjust",
    "purchases.view",
    "purchases.create",
    "purchases.edit",
    "expenses.view",
    "expenses.create",
    "expenses.edit",
    "reports.view",
    "settings.view",
    "settings.manage",
  ].includes(code);
}
