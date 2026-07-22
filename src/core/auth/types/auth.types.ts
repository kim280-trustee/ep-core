export type UserRole =
  | "owner"
  | "admin"
  | "manager"
  | "staff"
  | "teacher"
  | "student"
  | "parent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}