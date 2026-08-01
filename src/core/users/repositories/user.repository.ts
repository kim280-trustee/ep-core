/**
 * ============================================================
 * User Repository Contract
 * ============================================================
 */

import type {
  User,
} from "../types/user.types";

export interface UserRepository {

  findAll(): User[];

  findById(
    id: string,
  ): User | undefined;

  create(
    user: Omit<
      User,
      "id" |
      "createdAt" |
      "updatedAt"
    >,
  ): User;

  update(
    id: string,
    data: Partial<User>,
  ): User | undefined;

  delete(
    id: string,
  ): boolean;

}