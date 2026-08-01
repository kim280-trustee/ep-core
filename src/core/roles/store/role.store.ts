/**
 * ============================================================
 * Role Store
 * ============================================================
 */

import {
  create,
} from "zustand";

import type {
  Role,
} from "../types/role.types";

interface RoleStore {

  roles: Role[];

  setRoles(
    roles: Role[],
  ): void;

}

export const useRoleStore =
  create<RoleStore>(
    (set) => ({

      roles: [],

      setRoles(
        roles,
      ) {

        set({

          roles,

        });

      },

    }),
  );