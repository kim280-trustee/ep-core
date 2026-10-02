import {
  supabase,
} from "../database";

import type {
  AuthRepository,
  LoginDestination,
} from "./auth.repository";

import type {
  AuthResponse,
  Session,
} from "@supabase/supabase-js";

export class SupabaseAuthRepository
  implements AuthRepository {

  async signIn(
    email: string,
    password: string,
  ): Promise<AuthResponse> {

    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signUp(
    email: string,
    password: string,
  ): Promise<AuthResponse> {

    return await supabase.auth.signUp({
      email,
      password,
    });
  }

  async signOut(): Promise<void> {

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async getSession(): Promise<Session | null> {

    const {
      data,
    } = await supabase.auth.getSession();

    return data.session;
  }

  async getLoginDestination(
    authUserId: string,
  ): Promise<LoginDestination> {

    const { data: profile, error: profileError } =
      await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", authUserId)
        .single();

    if (profileError || !profile) {
      return "/";
    }

    const { data: memberships, error: membershipError } =
      await supabase
        .from("learning_class_memberships")
        .select("membership_type")
        .eq("user_id", profile.id)
        .eq("status", "active");

    if (membershipError || !memberships?.length) {
      return "/";
    }

    if (memberships.some((membership) => membership.membership_type === "teacher")) {
      return "/teacher";
    }

    if (memberships.some((membership) => membership.membership_type === "student")) {
      return "/learning";
    }

    return "/";
  }
}