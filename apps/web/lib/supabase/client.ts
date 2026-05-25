import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Reads NEXT_PUBLIC_SUPABASE_URL + the
 * publishable key (formerly anon key) from env. Session is persisted to
 * the standard Supabase cookies + localStorage.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
