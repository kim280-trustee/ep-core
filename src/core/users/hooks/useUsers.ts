/**
 * ============================================================
 * useUsers
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  userService,
} from "../services/user.service";

import {
  useUserStore,
} from "../store/user.store";

export function useUsers() {

  const {
    users,
    setUsers,
  } = useUserStore();

  useEffect(
    () => {

      setUsers(
        userService.getUsers(),
      );

    },
    [
      setUsers,
    ],
  );

  return {

    users,

  };

}