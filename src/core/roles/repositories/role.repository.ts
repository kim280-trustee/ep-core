/**
 * ============================================================
 * Role Repository
 * ============================================================
 */

import type {
  Role,
} from "../types/role.types";

export interface RoleRepository {

  findAll(): Role[];

  findById(
    id: string,
  ): Role | undefined;

  create(
    role: Omit<
      Role,
      "id" |
      "createdAt" |
      "updatedAt"
    >,
  ): Role;

  update(
    id: string,
    data: Partial<Role>,
  ): Role | undefined;

  delete(
    id: string,
  ): boolean;

}