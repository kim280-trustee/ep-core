import {
  createClient,
} from "@supabase/supabase-js";

import {
  databaseConfig,
} from "./database.config";


if (!databaseConfig.url) {
  throw new Error(
    "Missing Supabase URL",
  );
}


if (!databaseConfig.anonKey) {
  throw new Error(
    "Missing Supabase anon key",
  );
}


export const supabase = createClient(
  databaseConfig.url,
  databaseConfig.anonKey,
);