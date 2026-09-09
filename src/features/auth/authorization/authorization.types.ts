export type PermissionCode =
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "sales.view"
  | "sales.create"
  | "sales.void"
  | "inventory.view"
  | "inventory.adjust"
  | "purchases.view"
  | "purchases.create"
  | "purchases.edit"
  | "expenses.view"
  | "expenses.create"
  | "expenses.edit"
  | "reports.view"
  | "settings.view"
  | "settings.manage";

export interface AuthorizationState {
  permissions: PermissionCode[];
  loading: boolean;
}
