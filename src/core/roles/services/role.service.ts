/**
 * ============================================================
 * Role Service
 * ============================================================
 */

import {
  InMemoryRoleRepository,
} from "../repositories";

const repository =
  new InMemoryRoleRepository();

export const roleService = {

  getRoles() {

    return repository.findAll();

  },

  getRoleById(
    id: string,
  ) {

    return repository.findById(
      id,
    );

  },

  createRole:
    repository.create.bind(
      repository,
    ),

  updateRole:
    repository.update.bind(
      repository,
    ),

  deleteRole:
    repository.delete.bind(
      repository,
    ),

};