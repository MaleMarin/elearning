/**
 * WhatsApp Cloud API – envío de plantillas y texto.
 * Requiere: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN
 * Todo envío se registra en message_logs (vía caller).
 */

const BASE = "https://graph.facebook.com/v18.0";

export interface TemplateComponent {
  type: "header" | "body" | "button";
  parameters?: Array<
    | { type: "text"; text: string }
    | { type: "image"; image: { link: string } }
    | { type: "document"; document: { link: string; filename?: string } }
    | { type: "video"; video: { link: string } }
  >;
}

export interface SendTemplateOptions {
  to: string;
  templateName: string;
  language?: string;
  components?: TemplateComponent[];
  /** Para registrar en message_logs */
  cohortId?: string | null;
  recipientUserId?: string | null;
}

export interface SendTextOptions {
  to: string;
  text: string;
  /** Solo válido si hay ventana abierta (usuario escribió en las últimas 24h). Registrar en logs. */
  cohortId?: string | null;
  recipientUserId?: string | null;
}

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error("Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
  return { token, phoneId };
}

/** Número E.164 sin '+' para la API */
function toWaId(e164: string): string {
  return e164.replace(/^\+/, "").replace(/\D/g, "");
}

export async function sendTemplate(options: SendTemplateOptions): Promise<{ messageId: string }> {
  const { token, phoneId } = getConfig();
  const { to, templateName, language = "es", components = [] } = options;
  const waTo = toWaId(to);
  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to: waTo,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
      ...(components.length > 0 && { components }),
    },
  };
  const res = await fetch(`${BASE}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    error?: { message: string; code: number };
    messages?: Array<{ id: string }>;
  };
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `WhatsApp API ${res.status}`);
  }
  const messageId = data.messages?.[0]?.id ?? "";
  return { messageId };
}

/**
 * Envía texto. Solo funciona si hay ventana de conversación abierta
 * (usuario inició en las últimas 24h). Si no, la API devolverá error.
 */
export async function sendText(options: SendTextOptions): Promise<{ messageId: string }> {
  const { token, phoneId } = getConfig();
  const { to, text } = options;
  const waTo = toWaId(to);
  const body = {
    messaging_product: "whatsapp",
    to: waTo,
    type: "text",
    text: { body: text },
  };
  const res = await fetch(`${BASE}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    error?: { message: string; code: number };
    messages?: Array<{ id: string }>;
  };
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `WhatsApp API ${res.status}`);
  }
  const messageId = data.messages?.[0]?.id ?? "";
  return { messageId };
}
