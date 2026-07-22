import { create } from "zustand";

import type {
  AuthState,
  User,
} from "../types/auth.types";

interface AuthActions {
  login: (
    user: User,
    token: string,
  ) => void;

  logout: () => void;
}

export const useAuthStore = create<
  AuthState & AuthActions
>((set) => ({
  user: null,

  token: null,

  isAuthenticated: false,

  login: (
    user,
    token,
  ) =>
    set({
      user,
      token,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),
}));