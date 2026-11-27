import { supabase } from "../database";

import type {
  AuthRepository,
  LoginDestination,
} from "./auth.repository";

import type {
  AuthResponse,
  Session,
} from "@supabase/supabase-js";

export class SupabaseAuthRepository implements AuthRepository {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signUp({ email, password });
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async getLoginDestination(authUserId: string): Promise<LoginDestination> {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) return null;

    const { data: memberships, error: membershipError } = await supabase
      .from("learning_class_memberships")
      .select("membership_type")
      .eq("user_id", profile.id)
      .eq("status", "active");

    if (membershipError) throw membershipError;

    if (memberships?.some((membership) => membership.membership_type === "teacher")) {
      return "/teacher";
    }

    if (memberships?.some((membership) => membership.membership_type === "student")) {
      return "/learning";
    }

    const { data: parentLinks, error: parentError } = await supabase
      .from("learning_parent_student_links")
      .select("id")
      .eq("parent_user_id", profile.id)
      .eq("status", "active")
      .limit(1);

    if (parentError) throw parentError;
    if (parentLinks?.length) return "/parent";

    const { data: permissionRows, error: permissionsError } = await supabase.rpc(
      "get_current_user_permissions",
    );

    if (permissionsError) throw permissionsError;

    const permissions = permissionRows as { permission_code: string }[] | null;
    if (permissions?.some((permission) => permission.permission_code === "learning.academic.manage")) {
      return "/school-admin";
    }

    return null;
  }
}
