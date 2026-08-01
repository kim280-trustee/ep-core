/**
 * ============================================================
 * Permission Repository
 * ============================================================
 */

import type {
  Permission,
} from "../types/permission.types";

export interface PermissionRepository {

  findAll(): Permission[];

  findById(
    id: string,
  ): Permission | undefined;

  create(
    permission: Omit<
      Permission,
      "id" |
      "createdAt" |
      "updatedAt"
    >,
  ): Permission;

  update(
    id: string,
    data: Partial<Permission>,
  ): Permission | undefined;

  delete(
    id: string,
  ): boolean;

}