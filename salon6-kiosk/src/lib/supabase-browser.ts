import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error("Supabase browser env vars are missing");
}

// createBrowserClient automatically handles cookies in the browser
export const supabaseBrowserClient = createBrowserClient(supabaseUrl, anonKey);






