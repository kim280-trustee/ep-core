import type {
  AuthResponse,
  Session,
} from "@supabase/supabase-js";

export interface AuthRepository {
  signIn(
    email: string,
    password: string,
  ): Promise<AuthResponse>;

  signUp(
    email: string,
    password: string,
  ): Promise<AuthResponse>;

  signOut(): Promise<void>;

  getSession(): Promise<Session | null>;
}