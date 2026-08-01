/**
 * ============================================================
 * Permission Store
 * ============================================================
 */

import {
  create,
} from "zustand";

import type {
  Permission,
} from "../types/permission.types";

interface PermissionStore {

  permissions: Permission[];

  setPermissions(
    permissions: Permission[],
  ): void;

}

export const usePermissionStore =
  create<PermissionStore>(
    (set) => ({

      permissions: [],

      setPermissions(
        permissions,
      ) {

        set({

          permissions,

        });

      },

    }),
  );