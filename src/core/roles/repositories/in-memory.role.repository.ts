/**
 * ============================================================
 * In Memory Role Repository
 * ============================================================
 */

import type {
  Role,
} from "../types/role.types";

import type {
  RoleRepository,
} from "./role.repository";

export class InMemoryRoleRepository
implements RoleRepository {

  private roles: Role[] = [];

  findAll() {

    return this.roles;

  }

  findById(
    id: string,
  ) {

    return this.roles.find(
      (role) => role.id === id,
    );

  }

  create(
    role: Omit<
      Role,
      "id" |
      "createdAt" |
      "updatedAt"
    >,
  ) {

    const newRole: Role = {

      ...role,

      id: crypto.randomUUID(),

      createdAt: new Date(),

      updatedAt: new Date(),

    };

    this.roles.push(
      newRole,
    );

    return newRole;

  }

  update(
    id: string,
    data: Partial<Role>,
  ) {

    const role =
      this.findById(id);

    if (!role) {

      return undefined;

    }

    Object.assign(
      role,
      data,
      {

        updatedAt:
          new Date(),

      },
    );

    return role;

  }

  delete(
    id: string,
  ) {

    const index =
      this.roles.findIndex(
        (role) => role.id === id,
      );

    if (
      index === -1
    ) {

      return false;

    }

    this.roles.splice(
      index,
      1,
    );

    return true;

  }

}