import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendText } from "@/lib/services/whatsapp";

export const dynamic = "force-dynamic";

/** POST: enviar texto (solo si hay ventana abierta). Body: { to, text, cohortId?, recipientUserId? } */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role ?? "student";
    if (role !== "admin" && role !== "mentor") return NextResponse.json({ error: "Solo admin o mentor" }, { status: 403 });

    const body = await req.json();
    const to = body.to as string;
    const text = body.text as string;
    const cohortId = body.cohortId as string | undefined;
    const recipientUserId = body.recipientUserId as string | undefined;
    if (!to || !text) return NextResponse.json({ error: "Faltan to o text" }, { status: 400 });

    const { messageId } = await sendText({ to, text, cohortId: cohortId ?? null, recipientUserId: recipientUserId ?? null });
    await supabase.from("message_logs").insert({
      channel: "whatsapp",
      to,
      template_name: null,
      payload: { type: "text", body: text },
      status: "sent",
      provider_message_id: messageId,
      cohort_id: cohortId ?? null,
      recipient_user_id: recipientUserId ?? null,
    });
    return NextResponse.json({ messageId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : 403;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
