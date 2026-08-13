import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing environment variable: VITE_SUPABASE_URL",
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing environment variable: VITE_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },

    db: {
      schema: "public",
    },

    global: {
      headers: {
        "X-Client-Info":
          "ep-smart-pos",
      },
    },
  },
);

export type SupabaseClient =
  typeof supabase;