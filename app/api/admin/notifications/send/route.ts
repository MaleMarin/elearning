import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { sendPushNotification } from "@/lib/notifications/webpush";
import * as firebaseContent from "@/lib/services/firebase-content";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const TEMPLATE_MESSAGES: Record<string, { title: string; body: string }> = {
  recordatorio_sesion: { title: "Recordatorio de sesión", body: "Tienes una sesión en vivo próximamente. Revisa el programa." },
  recordatorio_tarea: { title: "Tarea pendiente", body: "Tienes una tarea por entregar. Entra a la plataforma para ver los detalles." },
  certificado_listo: { title: "Tu certificado está listo", body: "Has completado el programa. Descarga tu certificado desde la plataforma." },
  inactividad: { title: "Te extrañamos", body: "Hace tiempo que no entras. Continúa donde lo dejaste." },
  racha: { title: "¡Sigue tu racha!", body: "Estás avanzando muy bien. No pierdas tu racha de aprendizaje." },
  bienvenida: { title: "Bienvenido al programa", body: "Ya estás inscrito. Entra a la plataforma para comenzar." },
  recordatorio_modulo: { title: "Nuevo módulo disponible", body: "Un nuevo módulo se ha desbloqueado. Entra a continuar." },
  recordatorio_quiz: { title: "Quiz pendiente", body: "Tienes un quiz por completar. Refuerza lo aprendido." },
};

/** POST: enviar notificación manual. Solo admin. Body: { scope: "cohort"|"user", cohortId?, userId?, channel: "push"|"whatsapp"|"all", templateKey } */
export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth?.uid || auth.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const scope = (body.scope as string) ?? "cohort";
  const cohortId = body.cohortId as string | undefined;
  const userId = body.userId as string | undefined;
  const channel = (body.channel as string) ?? "push";
  const templateKey = (body.templateKey as string) ?? "recordatorio_sesion";

  const payload = TEMPLATE_MESSAGES[templateKey] ?? TEMPLATE_MESSAGES.recordatorio_sesion;

  let userIds: string[] = [];
  if (scope === "user" && userId) {
    userIds = [userId];
  } else if (scope === "cohort" && cohortId) {
    userIds = await firebaseContent.listActiveEnrollmentUserIdsInCohort(cohortId);
  } else {
    return NextResponse.json({ error: "Indica cohortId o userId según el alcance" }, { status: 400 });
  }

  if (userIds.length === 0) {
    return NextResponse.json({ error: "No hay destinatarios en ese alcance" }, { status: 400 });
  }

  const results: { userId: string; channel: string; ok: boolean; error?: string }[] = [];

  if (channel === "push" || channel === "all") {
    for (const uid of userIds) {
      try {
        await sendPushNotification(uid, { ...payload, url: "/inicio" });
        results.push({ userId: uid, channel: "push", ok: true });
      } catch (e) {
        results.push({ userId: uid, channel: "push", ok: false, error: e instanceof Error ? e.message : "Error" });
      }
    }
  }

  if (channel === "whatsapp" || channel === "all") {
    for (const uid of userIds) {
      results.push({ userId: uid, channel: "whatsapp", ok: false, error: "Usa el Centro de Comunicación para WhatsApp" });
    }
  }

  return NextResponse.json({ results });
}
