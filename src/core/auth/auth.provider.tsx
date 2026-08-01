import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../database";

import {
  AuthContext,
} from "./auth.context";

import type {
  User,
} from "@/features/auth/types";

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({
  children,
}: Props) {

  const [
    user,
    setUser,
  ] = useState<User | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  const loadUser = useCallback(
    async () => {

      const {
        data,
      } = await supabase.auth.getSession();


      if (!data.session) {

        setUser(null);
        setLoading(false);

        return;

      }


      const authUser =
        data.session.user;


      const {
        data: profile,
      } =
        await supabase

          .from("users")

          .select("*")

          .eq(
            "auth_user_id",
            authUser.id,
          )

          .single();


      if (profile) {

        setUser({

          id:
            profile.id,

          authUserId:
            profile.auth_user_id,

          tenantId:
            profile.tenant_id,

          name:
            profile.name,

          email:
            profile.email,

          role:
            profile.role ?? "STAFF",

          createdAt:
            profile.created_at,

        });

      } else {

        setUser(null);

      }


      setLoading(false);

    },
    [],
  );


  useEffect(() => {

    let mounted = true;


    const initialize = async () => {

      if (mounted) {

        await loadUser();

      }

    };


    void initialize();


    const {
      data,
    } =
      supabase.auth.onAuthStateChange(
        () => {

          void loadUser();

        },
      );


    return () => {

      mounted = false;

      data.subscription.unsubscribe();

    };


  }, [loadUser]);



  const logout = useCallback(
    async () => {

      await supabase.auth.signOut();

      setUser(null);

    },
    [],
  );


  return (

    <AuthContext.Provider

      value={{

        user,

        loading,

        refreshUser:
          loadUser,

        logout,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}