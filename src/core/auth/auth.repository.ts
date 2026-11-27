import type {
  AuthResponse,
  Session,
} from "@supabase/supabase-js";

export type LoginDestination = "/teacher" | "/learning" | "/parent" | "/school-admin";

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

  getLoginDestinations(
    authUserId: string,
  ): Promise<LoginDestination[]>;
}
