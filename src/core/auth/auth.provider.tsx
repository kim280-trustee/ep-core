import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../database";
import { AuthContext } from "./auth.context";
import { authService } from "./auth.service";
import type { User } from "@/features/auth/types";

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadRequestId = useRef(0);

  const loadUser = useCallback(async () => {
    const requestId = ++loadRequestId.current;

    try {
      const { data } = await supabase.auth.getSession();
      if (requestId !== loadRequestId.current) return;

      if (!data.session) {
        setUser(null);
        return;
      }

      const authUser = data.session.user;
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .single();

      if (requestId !== loadRequestId.current) return;

      if (!profile) {
        setUser(null);
        return;
      }

      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", profile.id)
        .limit(1)
        .maybeSingle();

      if (requestId !== loadRequestId.current) return;

      let role: User["role"] = "STAFF";

      if (userRole?.role_id) {
        const { data: roleRecord } = await supabase
          .from("roles")
          .select("name")
          .eq("id", userRole.role_id)
          .eq("tenant_id", profile.tenant_id)
          .maybeSingle();

        if (requestId !== loadRequestId.current) return;

        if (
          roleRecord?.name === "OWNER" ||
          roleRecord?.name === "MANAGER" ||
          roleRecord?.name === "STAFF"
        ) {
          role = roleRecord.name;
        }
      }

      if (requestId !== loadRequestId.current) return;

      setUser({
        id: profile.id,
        authUserId: authUser.id,
        tenantId: profile.tenant_id,
        name: profile.name,
        email: profile.email,
        role,
        createdAt: profile.created_at ?? new Date().toISOString(),
      });
    } finally {
      if (requestId === loadRequestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void loadUser();

    const { data } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        if (mounted) void loadUser();
      }, 0);
    });

    return () => {
      mounted = false;
      loadRequestId.current += 1;
      data.subscription.unsubscribe();
    };
  }, [loadUser]);

  const logout = useCallback(async () => {
    await authService.signOut();
    loadRequestId.current += 1;
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser: loadUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
