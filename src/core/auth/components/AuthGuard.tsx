import type {
  ReactNode,
} from "react";

import {
  usePermission,
} from "../hooks/usePermission";

import type {
  Permission,
} from "../utils/permissions";

interface Props {
  permission: Permission;
  children: ReactNode;
}

export function AuthGuard({
  permission,
  children,
}: Props) {
  const { can } =
    usePermission();

  if (!can(permission)) {
    return null;
  }

  return children;
}