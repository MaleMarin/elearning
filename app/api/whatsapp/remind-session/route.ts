import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendTemplate } from "@/lib/services/whatsapp";

export const dynamic = "force-dynamic";

const SESSION_TEMPLATE = process.env.WHATSAPP_TEMPLATE_SESSION_REMINDER ?? "recordatorio_sesion";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "mentor") return NextResponse.json({ error: "Solo mentor o admin" }, { status: 403 });

    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "Falta sessionId" }, { status: 400 });

    const { data: session } = await supabase.from("sessions").select("id, cohort_id, title, scheduled_at").eq("id", sessionId).single();
    if (!session) return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });

    const { data: channels } = await supabase
      .from("user_channels")
      .select("user_id, whatsapp_number_e164")
      .eq("whatsapp_opt_in", true)
      .not("whatsapp_number_e164", "is", null);
    const { data: members } = await supabase.from("cohort_members").select("user_id").eq("cohort_id", session.cohort_id);
    const memberIds = new Set((members ?? []).map((m) => m.user_id));
    const targets = (channels ?? []).filter((c) => c.whatsapp_number_e164 && memberIds.has(c.user_id));

    const results: { to: string; messageId?: string; error?: string }[] = [];
    const when = new Date(session.scheduled_at).toLocaleString();
    for (const t of targets) {
      try {
        const { messageId } = await sendTemplate({
          to: t.whatsapp_number_e164!,
          templateName: SESSION_TEMPLATE,
          language: "es",
          components: [
            { type: "body", parameters: [{ type: "text", text: session.title }, { type: "text", text: when }] },
          ],
          cohortId: session.cohort_id,
          recipientUserId: t.user_id,
        });
        await supabase.from("message_logs").insert({
          channel: "whatsapp",
          to: t.whatsapp_number_e164!,
          template_name: SESSION_TEMPLATE,
          payload: { session_id: sessionId, title: session.title, scheduled_at: session.scheduled_at },
          status: "sent",
          provider_message_id: messageId,
          cohort_id: session.cohort_id,
          recipient_user_id: t.user_id,
        });
        results.push({ to: t.whatsapp_number_e164!, messageId });
      } catch (e) {
        results.push({ to: t.whatsapp_number_e164!, error: e instanceof Error ? e.message : "Error" });
      }
    }
    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
