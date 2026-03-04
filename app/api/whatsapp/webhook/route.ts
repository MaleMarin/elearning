import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

/** GET: verificación del webhook (hub.mode=subscribe, hub.verify_token, hub.challenge) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || token !== VERIFY_TOKEN || !challenge) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return new NextResponse(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

interface WhatsAppWebhookValue {
  statuses?: Array<{ id: string; status: string }>;
  messages?: unknown[];
}

/** POST: mensajes entrantes y estados (delivered, read, failed). Guardar en webhook_events_whatsapp y actualizar message_logs. */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { entry?: Array<{ changes?: Array<{ value?: WhatsAppWebhookValue }> }> };
  const admin = createAdminClient();

  await admin.from("webhook_events_whatsapp").insert({ payload: body });

  const entry = body.entry?.[0];
  const changes = entry?.changes ?? [];
  for (const change of changes) {
    const value = change.value;
    if (!value) continue;

    if (value.statuses) {
      for (const status of value.statuses) {
        const providerId = status.id;
        const newStatus = status.status === "delivered" ? "delivered" : status.status === "read" ? "read" : status.status === "failed" ? "failed" : null;
        if (newStatus) {
          await admin.from("message_logs").update({ status: newStatus }).eq("provider_message_id", providerId);
        }
      }
    }
    if (value.messages) {
      for (const _msg of value.messages) {
        // Mensaje entrante: opcionalmente podrías crear thread o marcar "ventana abierta" para sendText
        // Por ahora solo guardamos el evento en webhook_events_whatsapp
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
