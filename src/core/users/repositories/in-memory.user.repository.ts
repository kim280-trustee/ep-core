/**
 * ============================================================
 * In Memory User Repository
 * ============================================================
 */

import type {
  User,
} from "../types/user.types";

import type {
  UserRepository,
} from "./user.repository";

export class InMemoryUserRepository
implements UserRepository {

  private users: User[] = [];

  findAll() {

    return this.users;

  }

  findById(
    id: string,
  ) {

    return this.users.find(
      (user) => user.id === id,
    );

  }

  create(
    user: Omit<
      User,
      "id" |
      "createdAt" |
      "updatedAt"
    >,
  ) {

    const newUser: User = {

      ...user,

      id: crypto.randomUUID(),

      createdAt: new Date(),

      updatedAt: new Date(),

    };

    this.users.push(
      newUser,
    );

    return newUser;

  }

  update(
    id: string,
    data: Partial<User>,
  ) {

    const user =
      this.findById(id);

    if (!user) {

      return undefined;

    }

    Object.assign(
      user,
      data,
      {

        updatedAt:
          new Date(),

      },
    );

    return user;

  }

  delete(
    id: string,
  ) {

    const index =
      this.users.findIndex(
        (user) =>
          user.id === id,
      );

    if (
      index === -1
    ) {

      return false;

    }

    this.users.splice(
      index,
      1,
    );

    return true;

  }

}