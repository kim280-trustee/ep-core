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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (requestId !== loadRequestId.current) return;

      const authUser = sessionData.session?.user;
      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (requestId !== loadRequestId.current) return;

      // A valid Supabase session without an application profile is not an
      // authenticated E&P account. Clear the local session to avoid a login loop.
      if (!profile) {
        const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
        if (signOutError) throw signOutError;
        setUser(null);
        return;
      }

      const { data: userRole, error: userRoleError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", profile.id)
        .limit(1)
        .maybeSingle();

      if (userRoleError) throw userRoleError;
      if (requestId !== loadRequestId.current) return;

      let role: User["role"] = "STAFF";

      if (userRole?.role_id) {
        const { data: roleRecord, error: roleError } = await supabase
          .from("roles")
          .select("name")
          .eq("id", userRole.role_id)
          .eq("tenant_id", profile.tenant_id)
          .maybeSingle();

        if (roleError) throw roleError;
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
    } catch {
      if (requestId === loadRequestId.current) {
        // Never retain a previous account after a failed identity lookup.
        setUser(null);
      }
    } finally {
      if (requestId === loadRequestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const initialLoad = window.setTimeout(() => {
      if (mounted) void loadUser();
    }, 0);

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        loadRequestId.current += 1;
        setUser(null);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN") {
        // Do not render the previous account while the new account profile and
        // Learning membership are being resolved.
        loadRequestId.current += 1;
        setUser(null);
        setLoading(true);
      }

      window.setTimeout(() => {
        if (mounted) void loadUser();
      }, 0);
    });

    return () => {
      mounted = false;
      window.clearTimeout(initialLoad);
      loadRequestId.current += 1;
      data.subscription.unsubscribe();
    };
  }, [loadUser]);

  const logout = useCallback(async () => {
    // Invalidate pending profile reads and clear the visible identity immediately.
    loadRequestId.current += 1;
    setUser(null);
    setLoading(false);
    await authService.signOut();
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
