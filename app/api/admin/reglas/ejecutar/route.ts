/**
 * POST /api/admin/reglas/ejecutar
 * Ejecuta el motor de reglas de inscripción automática.
 * Autorizado: admin (sesión) o cron con x-cron-secret.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  const isAuthorizedCron = !!process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;

  let isAdmin = false;
  try {
    const user = await getAuthFromRequest(req);
    isAdmin = user.role === "admin";
  } catch {
    // no session
  }

  if (!isAuthorizedCron && !isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const db = getFirebaseAdminFirestore();
    const reglasSnap = await db
      .collection("enrollmentRules")
      .where("active", "==", true)
      .get();

    const resultados: { reglaId: string; estado?: string; mensaje?: string; error?: string }[] = [];

    for (const reglaDoc of reglasSnap.docs) {
      const regla = reglaDoc.data();
      try {
        const resultado = await evaluarRegla(regla, db);
        resultados.push({ reglaId: reglaDoc.id, ...resultado });
      } catch (err) {
        resultados.push({
          reglaId: reglaDoc.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      ejecutadas: resultados.length,
      timestamp: new Date().toISOString(),
      resultados,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function evaluarRegla(
  regla: Record<string, unknown>,
  db: ReturnType<typeof getFirebaseAdminFirestore>
): Promise<{ estado: string; mensaje: string }> {
  // TODO: implementar lógica según tipo de regla (course_completed, etc.)
  // Por ahora retorna pendiente — estructura lista para expandir
  return {
    estado: "pendiente",
    mensaje: "Motor de reglas listo para configurar",
  };
}
