import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as apiKeys from "@/lib/services/apiKeys";

export const dynamic = "force-dynamic";

/** GET: listar API keys (solo admin). */
export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ keys: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const keys = await apiKeys.listApiKeys();
    const list = keys.map((k) => ({
      id: k.id,
      keyPrefix: k.keyPrefix,
      institucion: k.institucion,
      permisos: k.permisos,
      createdAt: k.createdAt.toISOString(),
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      revoked: !!k.revokedAt,
    }));
    return NextResponse.json({ keys: list });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/** POST: crear API key. Body: { institucion, permisos[] }. Devuelve keyValue una sola vez. */
export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      keyValue: "pd_live_DEMO_KEY_NO_USAR",
      keyPrefix: "pd_live_…",
      id: "demo",
      mensaje: "Guarda la key; no se volverá a mostrar.",
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const institucion = typeof body.institucion === "string" ? body.institucion.trim() : "";
    if (!institucion) return NextResponse.json({ error: "Falta institucion" }, { status: 400 });
    const permisos = Array.isArray(body.permisos) ? body.permisos.filter((p: string) => ["progreso", "admin", "webhooks"].includes(p)) : ["progreso"];
    const result = await apiKeys.createApiKey(institucion, permisos as apiKeys.ApiKeyPermiso[]);
    return NextResponse.json({
      keyValue: result.keyValue,
      keyPrefix: result.keyPrefix,
      id: result.id,
      mensaje: "Guarda la key en un lugar seguro; no se volverá a mostrar.",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
