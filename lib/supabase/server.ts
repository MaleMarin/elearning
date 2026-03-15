import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getDemoMode } from "@/lib/env";
import { createDemoServerMock } from "./demo-mock";

export async function createServerSupabaseClient() {
  if (getDemoMode()) return createDemoServerMock() as unknown as Awaited<ReturnType<typeof createServerClient>>;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !key?.trim()) return createDemoServerMock() as unknown as Awaited<ReturnType<typeof createServerClient>>;
  const cookieStore = await cookies();
  return createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
}
