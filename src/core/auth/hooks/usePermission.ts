import {
  useAuth,
} from "./useAuth";

import {
  hasPermission,
  type Permission,
} from "../utils/permissions";

export function usePermission() {
  const { user } = useAuth();

  function can(
    permission: Permission,
  ) {
    if (!user) {
      return false;
    }

    return hasPermission(
      user.role,
      permission,
    );
  }

  return {
    can,
  };
}