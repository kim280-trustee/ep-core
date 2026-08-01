/**
 * ============================================================
 * User Service
 * ============================================================
 */

import {
  InMemoryUserRepository,
} from "../repositories";

const repository =
  new InMemoryUserRepository();

export const userService = {

  getUsers() {

    return repository.findAll();

  },

  getUserById(
    id: string,
  ) {

    return repository.findById(
      id,
    );

  },

  createUser: repository.create.bind(
    repository,
  ),

  updateUser: repository.update.bind(
    repository,
  ),

  deleteUser: repository.delete.bind(
    repository,
  ),

};