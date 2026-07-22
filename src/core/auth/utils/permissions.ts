import type {
  UserRole,
} from "../types/auth.types";

export type Permission =
  | "create"
  | "read"
  | "update"
  | "delete";

const permissions: Record<
  UserRole,
  Permission[]
> = {
  owner: [
    "create",
    "read",
    "update",
    "delete",
  ],

  admin: [
    "create",
    "read",
    "update",
    "delete",
  ],

  manager: [
    "create",
    "read",
    "update",
  ],

  staff: [
    "read",
  ],

  teacher: [
    "read",
    "update",
  ],

  student: [
    "read",
  ],

  parent: [
    "read",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission,
) {
  return permissions[role].includes(
    permission,
  );
}