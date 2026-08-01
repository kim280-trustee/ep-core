import {
  supabase,
} from "../database";

import type {
  AuthRepository,
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
}