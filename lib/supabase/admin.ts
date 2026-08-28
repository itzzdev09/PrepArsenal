// PrepArsenal — Non-request-scoped Supabase client for background writes.
// Server-only. Used by the persistent semantic cache and cron-style routes that
// run outside an authenticated request (no cookies to forward).
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/**
 * Returns a shared service client, or null if Supabase env is not configured.
 * Prefers SUPABASE_SERVICE_ROLE_KEY (bypasses RLS); falls back to the anon key,
 * which works against the permissive `semantic_cache` policies.
 */
export function getAdminSupabase(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
