import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bdc49661-e23b-4925-af4c-a5a6bbd1c932',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/supabase-server.ts:createSupabaseServerClient',message:'entry createSupabaseServerClient',data:{hasUrl:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),hasServiceKey:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bdc49661-e23b-4925-af4c-a5a6bbd1c932',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/supabase-server.ts:createSupabaseServerClient',message:'missing supabase env',data:{supabaseUrlPresent:Boolean(supabaseUrl),serviceRolePresent:Boolean(serviceRoleKey)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    throw new Error("Supabase server env vars are missing");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}


