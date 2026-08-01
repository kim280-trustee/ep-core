function required(
  value: string | undefined,
  name: string,
) {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`,
    );
  }

  return value;
}

export const env = {
  supabaseUrl: required(
    import.meta.env.VITE_SUPABASE_URL,
    "VITE_SUPABASE_URL",
  ),

  supabaseKey: required(
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    "VITE_SUPABASE_ANON_KEY",
  ),
};