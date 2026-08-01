/**
 * ============================================================
 * useRoles
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  roleService,
} from "../services/role.service";

import {
  useRoleStore,
} from "../store/role.store";

export function useRoles() {

  const {

    roles,

    setRoles,

  } = useRoleStore();

  useEffect(
    () => {

      setRoles(
        roleService.getRoles(),
      );

    },
    [
      setRoles,
    ],
  );

  return {

    roles,

  };

}