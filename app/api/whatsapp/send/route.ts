import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendTemplate } from "@/lib/services/whatsapp";
import { auditLog, getClientIp } from "@/lib/services/audit";
import type { TemplateComponent } from "@/lib/services/whatsapp";

export const dynamic = "force-dynamic";

async function ensureSender() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? "student";
  if (role !== "admin" && role !== "mentor") throw new Error("Solo admin o mentor pueden enviar");
  return { supabase, user, role };
}

/** POST: enviar plantilla a un número o a un grupo. Body: { to?, cohortId?, templateName, language?, components?, cohortId (si envío a grupo) } */
export async function POST(req: NextRequest) {
  try {
    const { supabase, user, role } = await ensureSender();
    const body = await req.json();
    const cohortId = body.cohortId as string | undefined;
    const to = body.to as string | undefined;
    const templateName = body.templateName as string;
    const language = (body.language as string) ?? "es";
    const components = body.components as TemplateComponent[] | undefined;
    const recipientUserId = body.recipientUserId as string | undefined;

    if (!templateName) {
      return NextResponse.json({ error: "Falta templateName" }, { status: 400 });
    }

    let targets: { to: string; recipientUserId?: string }[] = [];
    if (to) {
      targets = [{ to, recipientUserId: recipientUserId ?? undefined }];
    } else if (cohortId) {
      const { data: channels } = await supabase
        .from("user_channels")
        .select("user_id, whatsapp_number_e164")
        .eq("whatsapp_opt_in", true)
        .not("whatsapp_number_e164", "is", null);
      const { data: members } = await supabase
        .from("cohort_members")
        .select("user_id")
        .eq("cohort_id", cohortId);
      const memberIds = new Set((members ?? []).map((m) => m.user_id));
      const withPhone = (channels ?? []).filter((c) => c.whatsapp_number_e164 && memberIds.has(c.user_id));
      targets = withPhone.map((c) => ({ to: c.whatsapp_number_e164!, recipientUserId: c.user_id }));
    }

    if (targets.length === 0) {
      return NextResponse.json({ error: "No hay destinatarios (indica 'to' o 'cohortId' con usuarios opt-in)" }, { status: 400 });
    }

    const results: { to: string; messageId?: string; error?: string }[] = [];
    for (const t of targets) {
      try {
        const { messageId } = await sendTemplate({
          to: t.to,
          templateName,
          language,
          components,
          cohortId: cohortId ?? null,
          recipientUserId: t.recipientUserId ?? null,
        });
        await supabase.from("message_logs").insert({
          channel: "whatsapp",
          to: t.to,
          template_name: templateName,
          payload: { language, components: components ?? [] },
          status: "sent",
          provider_message_id: messageId,
          cohort_id: cohortId ?? null,
          recipient_user_id: t.recipientUserId ?? null,
        });
        results.push({ to: t.to, messageId });
      } catch (e) {
        results.push({ to: t.to, error: e instanceof Error ? e.message : "Error" });
      }
    }
    await auditLog({
      userId: user.id,
      role,
      action: "whatsapp.send_template",
      resourceType: "cohort",
      resourceId: cohortId ?? undefined,
      payload: { templateName, language, targetCount: targets.length },
      ip: getClientIp(req),
    });
    return NextResponse.json({ results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor pueden enviar" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
