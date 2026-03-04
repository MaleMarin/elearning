import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getDemoMode } from "@/lib/env";
import { createDemoServerMock } from "./demo-mock";

export async function createServerSupabaseClient() {
  if (getDemoMode()) return createDemoServerMock() as unknown as Awaited<ReturnType<typeof createServerClient>>;
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
