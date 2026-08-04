/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Permission Repositories
 * ============================================================
 */

export * from "./permission.repository";

export * from "./in-memory.permission.repository";

export * from "./repository.provider";

import {
  getPermissionRepository,
} from "./repository.provider";

export const permissionRepository =
  getPermissionRepository();