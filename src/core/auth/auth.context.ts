import {
  createContext,
} from "react";


import type {
  User,
} from "@/features/auth/types";



export interface AuthContextValue {


  user:
    User | null;


  loading:
    boolean;


  refreshUser:
    () => Promise<void>;


  logout:
    () => Promise<void>;

}



export const AuthContext =

  createContext<AuthContextValue | undefined>(
    undefined,
  );