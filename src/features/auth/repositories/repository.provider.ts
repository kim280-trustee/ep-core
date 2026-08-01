import {
  inMemoryAuthRepository,
} from "./in-memory.auth.repository";


import {
  SupabaseAuthRepository,
} from "./supabase.auth.repository";



export const authRepository =

  import.meta.env.VITE_SUPABASE_URL

    ? new SupabaseAuthRepository()

    : inMemoryAuthRepository;