import {
  supabase,
} from "./supabase.client";


export async function checkDatabaseConnection() {

  const {
    error,
  } = await supabase
    .from("tenants")
    .select("id")
    .limit(1);


  if (error) {

    console.error(
      "Database connection failed:",
      error,
    );

    return false;

  }


  console.log(
    "Database connection successful",
  );


  return true;

}