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

  async getLoginDestinations(authUserId: string): Promise<LoginDestination[]> {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) return [];

    const destinations: LoginDestination[] = [];

    const { data: memberships, error: membershipError } = await supabase
      .from("learning_class_memberships")
      .select("membership_type")
      .eq("user_id", profile.id)
      .eq("status", "active");

    if (membershipError) throw membershipError;

    if (memberships?.some((membership) => membership.membership_type === "teacher")) {
      destinations.push("/teacher");
    }

    if (memberships?.some((membership) => membership.membership_type === "student")) {
      destinations.push("/learning");
    }

    const { data: parentLinks, error: parentError } = await supabase
      .from("learning_parent_student_links")
      .select("id")
      .eq("parent_user_id", profile.id)
      .eq("status", "active")
      .limit(1);

    if (parentError) throw parentError;
    if (parentLinks?.length) destinations.push("/parent");

    const { data: organizationMemberships, error: organizationMembershipError } = await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", profile.id)
      .eq("status", "active");

    if (organizationMembershipError) throw organizationMembershipError;

    const organizationIds = [
      ...new Set((organizationMemberships ?? []).map((membership) => membership.organization_id)),
    ];

    if (organizationIds.length > 0) {
      // Use the same organization-scoped database predicate as LearningRoleRoute.
      // The generated Supabase type may not yet include this private-schema RPC.
      const permissionClient = supabase as unknown as {
        rpc: (
          functionName: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
      };

      const permissionResults = await Promise.all(
        organizationIds.map((organizationId) =>
          permissionClient.rpc("learning_can_manage_academic_records", {
            target_organization_id: organizationId,
          }),
        ),
      );

      const failedPermissionCheck = permissionResults.find((result) => result.error);
      if (failedPermissionCheck?.error) {
        throw new Error(failedPermissionCheck.error.message);
      }

      if (permissionResults.some((result) => result.data === true)) {
        destinations.push("/school-admin");
      }
    }

    return destinations;
  }
}
