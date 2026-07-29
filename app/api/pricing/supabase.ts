import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * NOTE: The app does not use Supabase yet — orders, pricing and inquiries
 * are still stored in local JSON files under /data (see lib/store.ts).
 * This client is wired up and ready for whenever you want to migrate to a
 * real database. Until then, nothing in the app calls this file.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Browser/client-safe Supabase client — uses the public anon key. */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Server-only Supabase client — uses the secret service_role key, which
 * bypasses Row Level Security. NEVER import this in a Client Component or
 * expose it to the browser; only use it inside API routes / Server Components.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}
