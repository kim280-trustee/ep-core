export type PermissionCode =
  | "products.view"
  | "products.create"
  | "products.update"
  | "products.delete"
  | "sales.view"
  | "sales.create"
  | "sales.return"
  | "inventory.view"
  | "inventory.adjust"
  | "purchases.view"
  | "purchases.create"
  | "purchases.receive"
  | "purchases.return"
  | "expenses.view"
  | "expenses.create"
  | "expenses.update"
  | "expenses.delete"
  | "reports.view"
  | "settings.view"
  | "settings.manage";

export interface AuthorizationState {
  permissions: PermissionCode[];
  loading: boolean;
}
