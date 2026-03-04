import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { getSupabaseConfig, getSiteUrl } from "@/lib/config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get("next") ?? "/";
  if (getDemoMode()) return NextResponse.redirect(new URL(next, getSiteUrl()));

  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  if (code) {
    const supabase = createServerClient(
      url,
      anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: "", maxAge: 0, ...options });
          },
        },
      }
    );
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email ?? undefined,
        full_name: data.user.user_metadata?.full_name ?? data.user.email ?? undefined,
      }, { onConflict: "id" });
    }
  }

  return NextResponse.redirect(new URL(next, getSiteUrl()));
}
