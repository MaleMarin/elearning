import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, getSupabaseServiceRoleKey } from "@/lib/config";

/**
 * Server-only client with service role. Use only in API routes for:
 * - Inserting notifications (any user_id)
 * - Inserting weekly_digests
 * - Any operation that bypasses RLS
 */
export function createAdminClient() {
  const { url } = getSupabaseConfig();
  const key = getSupabaseServiceRoleKey();
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}
