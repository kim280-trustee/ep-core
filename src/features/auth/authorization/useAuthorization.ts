import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/core/auth";

import { loadUserPermissions } from "./authorization.service";
import type { AuthorizationState, PermissionCode } from "./authorization.types";

export function useAuthorization(): AuthorizationState & {
  hasPermission: (permission: PermissionCode) => boolean;
} {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<PermissionCode[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextPermissions = await loadUserPermissions(user.authUserId);
      setPermissions(nextPermissions);
    } catch {
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadPermissions();
  }, [authLoading, loadPermissions]);

  const hasPermission = useCallback(
    (permission: PermissionCode) => permissions.includes(permission),
    [permissions],
  );

  return {
    permissions,
    loading: authLoading || loading,
    hasPermission,
  };
}
