import type {
  AuthResponse,
  Session,
} from "@supabase/supabase-js";

export type LoginDestination = "/" | "/teacher" | "/learning";

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

  getLoginDestination(
    authUserId: string,
  ): Promise<LoginDestination>;
}