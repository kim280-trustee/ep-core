import { supabase } from "@/core/database";

import type { PermissionCode } from "./authorization.types";

type PermissionRow = {
  permission_code: string;
};

export async function loadUserPermissions(
  _authUserId: string,
): Promise<PermissionCode[]> {
  const { data, error } = await supabase.rpc("get_current_user_permissions");

  if (error) {
    throw error;
  }

  return (data as PermissionRow[] | null ?? [])
    .map((permission: PermissionRow) => permission.permission_code)
    .filter((code: string): code is PermissionCode => isPermissionCode(code));
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
