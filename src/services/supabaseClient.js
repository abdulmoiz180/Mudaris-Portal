import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing VITE_SUPABASE_URL environment variable. Please set it in your .env file."
  );
}
if (!supabaseKey) {
  throw new Error(
    "Missing VITE_SUPABASE_KEY environment variable. Please set it in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
