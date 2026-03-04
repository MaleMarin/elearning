import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendTemplate } from "@/lib/services/whatsapp";

export const dynamic = "force-dynamic";

const TASK_TEMPLATE = process.env.WHATSAPP_TEMPLATE_TASK_REMINDER ?? "recordatorio_tarea";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "mentor") return NextResponse.json({ error: "Solo mentor o admin" }, { status: 403 });

    const { taskId } = await req.json();
    if (!taskId) return NextResponse.json({ error: "Falta taskId" }, { status: 400 });

    const { data: task } = await supabase.from("tasks").select("id, user_id, title, due_at").eq("id", taskId).single();
    if (!task) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

    const { data: channel } = await supabase
      .from("user_channels")
      .select("whatsapp_number_e164")
      .eq("user_id", task.user_id)
      .eq("whatsapp_opt_in", true)
      .not("whatsapp_number_e164", "is", null)
      .maybeSingle();
    if (!channel?.whatsapp_number_e164) return NextResponse.json({ error: "Usuario sin WhatsApp opt-in" }, { status: 400 });

    const { messageId } = await sendTemplate({
      to: channel.whatsapp_number_e164,
      templateName: TASK_TEMPLATE,
      language: "es",
      components: [{ type: "body", parameters: [{ type: "text", text: task.title }, { type: "text", text: new Date(task.due_at).toLocaleString() }] }],
      recipientUserId: task.user_id,
    });
    await supabase.from("message_logs").insert({
      channel: "whatsapp",
      to: channel.whatsapp_number_e164,
      template_name: TASK_TEMPLATE,
      payload: { task_id: taskId, title: task.title, due_at: task.due_at },
      status: "sent",
      provider_message_id: messageId,
      recipient_user_id: task.user_id,
    });
    return NextResponse.json({ messageId });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
