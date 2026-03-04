import { NextRequest, NextResponse } from "next/server";
import { getSeedMode, getSeedSecret } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { runStagingSeed } from "@/lib/seed/run-seed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/seed
 * Solo disponible cuando SEED_MODE=staging.
 * Requiere header: x-seed-secret: <SEED_SECRET>
 * Idempotente: si ya existe el curso demo, no duplica.
 */
export async function POST(request: NextRequest) {
  if (getSeedMode() !== "staging") {
    return NextResponse.json(
      { error: "Seed no disponible en este entorno" },
      { status: 404 }
    );
  }

  const secret = getSeedSecret();
  if (!secret || secret === "") {
    return NextResponse.json(
      { error: "SEED_SECRET no configurado" },
      { status: 500 }
    );
  }

  const headerSecret = request.headers.get("x-seed-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (headerSecret !== secret) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();
    const result = await runStagingSeed(supabase);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      skipped: result.skipped ?? false,
      cohortId: result.cohortId,
      courseId: result.courseId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al ejecutar seed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** GET: indicar si el seed está habilitado (sin revelar secret). */
export async function GET() {
  const mode = getSeedMode();
  return NextResponse.json({
    seedAvailable: mode === "staging",
    message: mode === "staging" ? "POST con header x-seed-secret para ejecutar" : "Seed deshabilitado",
  });
}
