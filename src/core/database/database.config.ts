export interface DatabaseConfig {


  provider:

    | "supabase"

    | "local";



  url?: string;



  anonKey?: string;



}





console.log(
  "SUPABASE URL:",
  import.meta.env.VITE_SUPABASE_URL,
);



console.log(
  "SUPABASE KEY EXISTS:",
  !!import.meta.env.VITE_SUPABASE_ANON_KEY,
);





export const databaseConfig: DatabaseConfig = {


  provider:

    "supabase",



  url:

    import.meta.env.VITE_SUPABASE_URL,



  anonKey:

    import.meta.env.VITE_SUPABASE_ANON_KEY,



};