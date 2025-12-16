import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bdc49661-e23b-4925-af4c-a5a6bbd1c932',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/supabase-browser.ts:module',message:'missing browser supabase env',data:{supabaseUrlPresent:Boolean(supabaseUrl),anonKeyPresent:Boolean(anonKey)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  throw new Error("Supabase browser env vars are missing");
}

export const supabaseBrowserClient = createClient(supabaseUrl, anonKey);



