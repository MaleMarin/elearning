import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendTemplate } from "@/lib/services/whatsapp";

export const dynamic = "force-dynamic";

const CERT_TEMPLATE = process.env.WHATSAPP_TEMPLATE_CERTIFICATE_READY ?? "certificado_listo";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "mentor") return NextResponse.json({ error: "Solo mentor o admin" }, { status: 403 });

    const { certificateId } = await req.json();
    if (!certificateId) return NextResponse.json({ error: "Falta certificateId" }, { status: 400 });

    const { data: cert } = await supabase.from("certificates").select("id, user_id").eq("id", certificateId).single();
    if (!cert) return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });

    const { data: channel } = await supabase
      .from("user_channels")
      .select("whatsapp_number_e164")
      .eq("user_id", cert.user_id)
      .eq("whatsapp_opt_in", true)
      .not("whatsapp_number_e164", "is", null)
      .maybeSingle();
    if (!channel?.whatsapp_number_e164) return NextResponse.json({ error: "Usuario sin WhatsApp opt-in" }, { status: 400 });

    const { messageId } = await sendTemplate({
      to: channel.whatsapp_number_e164,
      templateName: CERT_TEMPLATE,
      language: "es",
      recipientUserId: cert.user_id,
    });
    await supabase.from("message_logs").insert({
      channel: "whatsapp",
      to: channel.whatsapp_number_e164,
      template_name: CERT_TEMPLATE,
      payload: { certificate_id: certificateId },
      status: "sent",
      provider_message_id: messageId,
      recipient_user_id: cert.user_id,
    });
    return NextResponse.json({ messageId });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
