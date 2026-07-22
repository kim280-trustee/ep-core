import type { User } from "../types/auth.types";

export class AuthService {
  async login(
    email: string,
    _password: string,
  ): Promise<{
    user: User;
    token: string;
  }> {
    return {
      user: {
        id: "1",
        name: email,
        email,
        role: "owner",
      },

      token: "demo-token",
    };
  }

  async logout(): Promise<void> {
    return;
  }
}