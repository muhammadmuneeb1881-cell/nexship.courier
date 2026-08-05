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

// IMPORTANT: On Vercel (App Router / Fluid compute), the platform's Data
// Cache can transparently cache the *internal* fetch() calls that
// supabase-js makes to the Supabase REST API — even inside route handlers
// marked `export const dynamic = "force-dynamic"`. That flag only stops the
// route itself from being statically cached; it does NOT automatically mark
// every fetch a library makes underneath as uncacheable. Vercel logs showed
// this literally: "Using cache ...supabase.co/rest/v1/orders", which is why
// the merchant dashboard kept seeing an old order status after admin
// updates. Passing a custom `fetch` here that forces `cache: "no-store"` on
// every request the client makes fixes it at the source, for both clients.
function noStoreFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, cache: "no-store" });
}

/** Browser/client-safe Supabase client — uses the public anon key. */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: noStoreFetch },
  });
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
    global: { fetch: noStoreFetch },
  });
}
