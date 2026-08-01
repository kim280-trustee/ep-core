/**
 * ============================================================
 * usePermissions
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  permissionService,
} from "../services/permission.service";

import {
  usePermissionStore,
} from "../store/permission.store";

export function usePermissions() {

  const {

    permissions,

    setPermissions,

  } = usePermissionStore();

  useEffect(
    () => {

      setPermissions(
        permissionService.getPermissions(),
      );

    },
    [
      setPermissions,
    ],
  );

  return {

    permissions,

  };

}