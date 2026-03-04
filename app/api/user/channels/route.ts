import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET: preferencias de canal del usuario actual */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { data, error } = await supabase
      .from("user_channels")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return NextResponse.json({ channel: data ?? null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

/** PUT: actualizar preferencias (teléfono E.164, opt-in WhatsApp, canal preferido) */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const body = await req.json();
    const whatsapp_number_e164 = body.whatsapp_number_e164 as string | undefined;
    const whatsapp_opt_in = body.whatsapp_opt_in as boolean | undefined;
    const preferred_channel = body.preferred_channel as "whatsapp" | "email" | "in_app" | undefined;

    const updates: Record<string, unknown> = {};
    if (whatsapp_number_e164 !== undefined) {
      const digits = String(whatsapp_number_e164 ?? "").replace(/\D/g, "");
      updates.whatsapp_number_e164 = digits === "" ? null : `+${digits}`;
    }
    if (whatsapp_opt_in !== undefined) {
      updates.whatsapp_opt_in = whatsapp_opt_in;
      if (whatsapp_opt_in) updates.whatsapp_opt_in_at = new Date().toISOString();
    }
    if (preferred_channel !== undefined && ["whatsapp", "email", "in_app"].includes(preferred_channel)) {
      updates.preferred_channel = preferred_channel;
    }

    const { data, error } = await supabase
      .from("user_channels")
      .upsert({ user_id: user.id, ...updates }, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ channel: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
