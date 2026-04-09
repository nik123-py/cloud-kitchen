import { createClient } from "@supabase/supabase-js";

// Admin client with service role key — bypasses RLS
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

// User-scoped client — respects RLS via the user's JWT
export function getSupabaseClient(authHeader: string) {
  const url = process.env.SUPABASE_URL!;
  const anonKey = process.env.SUPABASE_ANON_KEY!;
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}
