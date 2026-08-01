import {
  SupabaseAuthRepository,
} from "./supabase.auth.repository";

class AuthService {

  private repository =
    new SupabaseAuthRepository();

  signIn(
    email: string,
    password: string,
  ) {
    return this.repository.signIn(
      email,
      password,
    );
  }

  signUp(
    email: string,
    password: string,
  ) {
    return this.repository.signUp(
      email,
      password,
    );
  }

  signOut() {
    return this.repository.signOut();
  }

  getSession() {
    return this.repository.getSession();
  }
}

export const authService =
  new AuthService();