/**
 * ============================================================
 * In Memory Permission Repository
 * ============================================================
 */

import type {
  Permission,
} from "../types/permission.types";

import type {
  PermissionRepository,
} from "./permission.repository";

export class InMemoryPermissionRepository
implements PermissionRepository {

  private permissions: Permission[] = [];

  findAll() {

    return this.permissions;

  }

  findById(
    id: string,
  ) {

    return this.permissions.find(
      (permission) =>
        permission.id === id,
    );

  }

  create(
    permission: Omit<
      Permission,
      "id" |
      "createdAt" |
      "updatedAt"
    >,
  ) {

    const newPermission: Permission = {

      ...permission,

      id: crypto.randomUUID(),

      createdAt: new Date(),

      updatedAt: new Date(),

    };

    this.permissions.push(
      newPermission,
    );

    return newPermission;

  }

  update(
    id: string,
    data: Partial<Permission>,
  ) {

    const permission =
      this.findById(id);

    if (!permission) {

      return undefined;

    }

    Object.assign(
      permission,
      data,
      {

        updatedAt:
          new Date(),

      },
    );

    return permission;

  }

  delete(
    id: string,
  ) {

    const index =
      this.permissions.findIndex(
        (permission) =>
          permission.id === id,
      );

    if (
      index === -1
    ) {

      return false;

    }

    this.permissions.splice(
      index,
      1,
    );

    return true;

  }

}