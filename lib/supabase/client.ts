import { createBrowserClient } from "@supabase/ssr";
import { getDemoMode } from "@/lib/env";
import { getSupabaseConfig } from "@/lib/config";
import { createDemoBrowserMock } from "./demo-mock";

export function createClient() {
  if (getDemoMode()) return createDemoBrowserMock() as unknown as ReturnType<typeof createBrowserClient>;
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
