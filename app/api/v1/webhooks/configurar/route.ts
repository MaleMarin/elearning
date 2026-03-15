/**
 * POST /api/v1/webhooks/configurar
 * Requiere API key con permiso "admin" o "webhooks".
 * Body: { url: string, eventos: ["curso.completado", "certificado.emitido"] }
 * Guarda en Firestore: webhooks/{id} con url, eventos, apiKeyId (hash), createdAt.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { requireApiKey } from "@/lib/auth/api-key-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const EVENTOS_VALIDOS = new Set(["curso.completado", "certificado.emitido"]);

export async function POST(req: NextRequest) {
  const auth = await requireApiKey(req, "webhooks");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (getDemoMode()) {
    return NextResponse.json({ id: "demo-webhook", url: "", eventos: [] });
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url || !url.startsWith("https://")) {
      return NextResponse.json({ error: "url debe ser una URL HTTPS" }, { status: 400 });
    }
    const eventos = Array.isArray(body.eventos)
      ? (body.eventos as string[]).filter((e) => EVENTOS_VALIDOS.has(e))
      : [];
    if (eventos.length === 0) {
      return NextResponse.json({ error: "Al menos un evento: curso.completado, certificado.emitido" }, { status: 400 });
    }

    const ref = getFirebaseAdminFirestore().collection("webhooks").doc();
    const now = new Date();
    await ref.set({
      url,
      eventos,
      apiKeyId: auth.record.keyHash,
      createdAt: now,
      active: true,
    });
    return NextResponse.json({
      id: ref.id,
      url,
      eventos,
      mensaje: "Webhook configurado. Se enviarán POST a la URL cuando ocurran los eventos seleccionados.",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
