/**
 * ============================================================
 * Permission Service
 * ============================================================
 */

import {
  InMemoryPermissionRepository,
} from "../repositories";

const repository =
  new InMemoryPermissionRepository();

export const permissionService = {

  getPermissions() {

    return repository.findAll();

  },

  getPermissionById(
    id: string,
  ) {

    return repository.findById(
      id,
    );

  },

  createPermission:
    repository.create.bind(
      repository,
    ),

  updatePermission:
    repository.update.bind(
      repository,
    ),

  deletePermission:
    repository.delete.bind(
      repository,
    ),

};