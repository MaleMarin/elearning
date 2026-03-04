import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplate } from "@/lib/services/whatsapp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SESSION_TEMPLATE = process.env.WHATSAPP_TEMPLATE_SESSION_REMINDER ?? "recordatorio_sesion";
const TASK_TEMPLATE = process.env.WHATSAPP_TEMPLATE_TASK_REMINDER ?? "recordatorio_tarea";
const CERT_TEMPLATE = process.env.WHATSAPP_TEMPLATE_CERTIFICATE_READY ?? "certificado_listo";

/** GET o POST con ?job=session_24h|session_1h|task_due|certificate_ready. Fallback manual si no hay Vercel Cron. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const job = searchParams.get("job") ?? "all";
  const result = await runJobs(job);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const job = (body.job as string) ?? "all";
  const result = await runJobs(job);
  return NextResponse.json(result);
}

async function runJobs(job: string): Promise<{ ok: boolean; sent: number; errors: string[] }> {
  const admin = createAdminClient();
  let sent = 0;
  const errors: string[] = [];

  if (job === "all" || job === "session_24h" || job === "session_1h") {
    const now = new Date();
    const run24 = job === "all" || job === "session_24h";
    const run1h = job === "all" || job === "session_1h";
    const sessionsToRun: { id: string; cohort_id: string; title: string; scheduled_at: string; kind: "24h" | "1h" }[] = [];
    if (run24) {
      const from24 = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const to24 = new Date(now.getTime() + 25 * 60 * 60 * 1000);
      const { data: s24 } = await admin.from("sessions").select("id, cohort_id, title, scheduled_at").gte("scheduled_at", from24.toISOString()).lte("scheduled_at", to24.toISOString());
      (s24 ?? []).forEach((s) => sessionsToRun.push({ ...s, kind: "24h" }));
    }
    if (run1h) {
      const from1h = new Date(now.getTime() + 30 * 60 * 1000);
      const to1h = new Date(now.getTime() + 90 * 60 * 1000);
      const { data: s1 } = await admin.from("sessions").select("id, cohort_id, title, scheduled_at").gte("scheduled_at", from1h.toISOString()).lte("scheduled_at", to1h.toISOString());
      (s1 ?? []).forEach((s) => sessionsToRun.push({ ...s, kind: "1h" }));
    }
    for (const s of sessionsToRun) {
      const { data: channels } = await admin
        .from("user_channels")
        .select("user_id, whatsapp_number_e164")
        .eq("whatsapp_opt_in", true)
        .not("whatsapp_number_e164", "is", null);
      const { data: members } = await admin.from("cohort_members").select("user_id").eq("cohort_id", s.cohort_id);
      const memberIds = new Set((members ?? []).map((m) => m.user_id));
      const targets = (channels ?? []).filter((c) => c.whatsapp_number_e164 && memberIds.has(c.user_id));
      const when = new Date(s.scheduled_at).toLocaleString();
      for (const t of targets) {
        try {
          const { messageId } = await sendTemplate({
            to: t.whatsapp_number_e164!,
            templateName: SESSION_TEMPLATE,
            language: "es",
            components: [{ type: "body", parameters: [{ type: "text", text: s.title }, { type: "text", text: when }] }],
            cohortId: s.cohort_id,
            recipientUserId: t.user_id,
          });
          await admin.from("message_logs").insert({
            channel: "whatsapp",
            to: t.whatsapp_number_e164!,
            template_name: SESSION_TEMPLATE,
            payload: { session_id: s.id, job: s.kind },
            status: "sent",
            provider_message_id: messageId,
            cohort_id: s.cohort_id,
            recipient_user_id: t.user_id,
          });
          sent++;
        } catch (e) {
          errors.push(e instanceof Error ? e.message : "Error");
        }
      }
    }
  }

  if (job === "all" || job === "task_due") {
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const { data: tasks } = await admin
      .from("tasks")
      .select("id, user_id, title, due_at")
      .is("completed_at", null)
      .gte("due_at", new Date().toISOString())
      .lte("due_at", in24h.toISOString());
    for (const task of tasks ?? []) {
      const { data: ch } = await admin
        .from("user_channels")
        .select("whatsapp_number_e164")
        .eq("user_id", task.user_id)
        .eq("whatsapp_opt_in", true)
        .not("whatsapp_number_e164", "is", null)
        .maybeSingle();
      if (!ch?.whatsapp_number_e164) continue;
      try {
        const { messageId } = await sendTemplate({
          to: ch.whatsapp_number_e164,
          templateName: TASK_TEMPLATE,
          language: "es",
          components: [{ type: "body", parameters: [{ type: "text", text: task.title }, { type: "text", text: new Date(task.due_at).toLocaleString() }] }],
          recipientUserId: task.user_id,
        });
        await admin.from("message_logs").insert({
          channel: "whatsapp",
          to: ch.whatsapp_number_e164,
          template_name: TASK_TEMPLATE,
          payload: { task_id: task.id },
          status: "sent",
          provider_message_id: messageId,
          recipient_user_id: task.user_id,
        });
        sent++;
      } catch (e) {
        errors.push(e instanceof Error ? e.message : "Error");
      }
    }
  }

  if (job === "all" || job === "certificate_ready") {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: certs } = await admin
      .from("certificates")
      .select("id, user_id")
      .gte("issued_at", since.toISOString());
    for (const c of certs ?? []) {
      const { data: ch } = await admin
        .from("user_channels")
        .select("whatsapp_number_e164")
        .eq("user_id", c.user_id)
        .eq("whatsapp_opt_in", true)
        .not("whatsapp_number_e164", "is", null)
        .maybeSingle();
      if (!ch?.whatsapp_number_e164) continue;
      try {
        const { messageId } = await sendTemplate({
          to: ch.whatsapp_number_e164,
          templateName: CERT_TEMPLATE,
          language: "es",
          recipientUserId: c.user_id,
        });
        await admin.from("message_logs").insert({
          channel: "whatsapp",
          to: ch.whatsapp_number_e164,
          template_name: CERT_TEMPLATE,
          payload: { certificate_id: c.id },
          status: "sent",
          provider_message_id: messageId,
          recipient_user_id: c.user_id,
        });
        sent++;
      } catch (e) {
        errors.push(e instanceof Error ? e.message : "Error");
      }
    }
  }

  return { ok: true, sent, errors };
}
