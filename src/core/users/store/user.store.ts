/**
 * ============================================================
 * User Store
 * ============================================================
 */

import {
  create,
} from "zustand";

import type {
  User,
} from "../types/user.types";

interface UserStore {

  users: User[];

  setUsers(
    users: User[],
  ): void;

}

export const useUserStore =
  create<UserStore>(
    (set) => ({

      users: [],

      setUsers: (
        users,
      ) => set({

        users,

      }),

    }),
  );