/**
 * POST: traducir todo el curso a inglés o portugués.
 * Body: { courseId: string, targetLanguage: "en" | "pt" }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { checkAdminAIRateLimit } from "@/lib/rate-limit";
import * as translation from "@/lib/services/translation";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ ok: true, translated: 0, errors: [], message: "Modo demo: no se traduce." });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { ok } = checkAdminAIRateLimit(auth.uid);
    if (!ok) return NextResponse.json({ error: "Límite diario de IA alcanzado" }, { status: 429 });
    const body = await req.json().catch(() => ({}));
    const courseId = body.courseId as string;
    const targetLanguage = (body.targetLanguage as string) === "pt" ? "pt" : "en";
    if (!courseId) return NextResponse.json({ error: "Falta courseId" }, { status: 400 });
    const result = await translation.translateCourse(courseId, targetLanguage);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
