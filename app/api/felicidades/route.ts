/**
 * GET: datos para la página de celebración (felicidades).
 * Requiere auth y que el usuario tenga al menos un certificado o certificateAvailable.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, getAppUrl } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as certificado from "@/lib/services/certificado";
import * as grades from "@/lib/services/grades";

export const dynamic = "force-dynamic";

const BADGE_MAP: Record<string, { icon: string; name: string; desc: string }> = {
  first_lesson: { icon: "📖", name: "Primera lección", desc: "Completaste tu primera lección" },
  streak_3: { icon: "🔥", name: "Racha 3 días", desc: "3 días seguidos" },
  module_complete: { icon: "📦", name: "Módulo completo", desc: "Terminaste un módulo" },
  halfway: { icon: "⏱️", name: "A mitad de camino", desc: "50% del curso" },
  certificate: { icon: "🎓", name: "Certificado", desc: "Programa completado" },
  learning_team: { icon: "💬", name: "Equipo de aprendizaje", desc: "Contribuidor" },
};

export async function GET(req: NextRequest) {
  let auth: { uid: string; email: string | null };
  try {
    auth = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (getDemoMode()) {
    return NextResponse.json({
      nombre: "María González Reyes",
      curso: "Innovación Pública y Transformación Digital del Estado",
      horas: 40,
      calificacion: "9.2",
      leccionesTotal: 12,
      logros: [
        { icon: "🏆", name: "Programa completo", desc: "100% completado" },
        { icon: "🔥", name: "Racha 7 días", desc: "7 días seguidos" },
        { icon: "🎓", name: "Certificado", desc: "Sobresaliente" },
      ],
      carta: "Quiero aprender herramientas concretas para modernizar los procesos de mi área.",
      cartaFecha: "10 de enero de 2025",
      idCert: "PD-2026-1234-MX",
      grupo: "2025-I",
      verifyUrl: `${getAppUrl()}/verificar/PD-2026-1234-MX`,
    });
  }

  const db = getFirebaseAdminFirestore();
  const profileSnap = await db.collection("profiles").doc(auth.uid).get();
  const nombre = (profileSnap.data()?.full_name as string)?.trim() || auth.email?.split("@")[0] || "Estudiante";
  const totalMinutes = (profileSnap.data()?.totalMinutesOnPlatform as number) ?? 0;
  const horas = Math.round(totalMinutes / 60) || 40;

  const certs = await certificado.getCertificatesForUser(auth.uid);
  const firstCert = certs[0] ?? null;
  const curso = firstCert?.curso ?? "Innovación Pública y Transformación Digital del Estado";
  const calificacion = firstCert?.calificacion ?? "—";
  const idCert = firstCert?.idCert ?? null;
  const verifyUrl = firstCert ? `${getAppUrl()}/verificar/${firstCert.idCert}` : null;

  const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
  let grupo = "—";
  if (enrollment) {
    try {
      const cohort = await firebaseContent.getCohort(enrollment.cohort_id);
      grupo = (cohort.name as string) ?? enrollment.cohort_id;
    } catch {
      grupo = enrollment.cohort_id;
    }
  }

  const badgesSnap = await db.collection("users").doc(auth.uid).collection("badges").get();
  const earnedIds = badgesSnap.docs.map((d) => d.id as string);
  const logros = earnedIds
    .map((id) => BADGE_MAP[id])
    .filter(Boolean);
  if (logros.length === 0) {
    logros.push({ icon: "🏆", name: "Programa completo", desc: "100% completado" });
    if (firstCert) logros.push({ icon: "🎓", name: "Certificado", desc: "Sobresaliente" });
  }

  let leccionesTotal = 12;
  if (enrollment) {
    const courseId = await firebaseContent.getPrimaryCourseForCohort(enrollment.cohort_id);
    if (courseId) {
      const summary = await grades.getStudentGradeSummary(auth.uid, courseId);
      leccionesTotal = Math.round(summary.progressPercent / 100 * 20) || 12;
      const mods = await firebaseContent.getPublishedModules(courseId);
      const lessonCount = mods.reduce((acc, m) => acc + 1, 0);
      const lessons = await firebaseContent.getPublishedLessons(mods.map((m) => m.id));
      leccionesTotal = lessons.length || 12;
    }
  }

  let cartaEncrypted: string | undefined;
  let cartaFecha: string | undefined;
  const letterSnap = await db.collection("users").doc(auth.uid).collection("futureLetter").doc("letter").get();
  if (letterSnap.exists) {
    const d = letterSnap.data();
    cartaEncrypted = (d?.content as string) ?? undefined;
    const writtenAt = d?.writtenAt as { toDate?: () => Date } | undefined;
    if (writtenAt?.toDate) {
      cartaFecha = writtenAt.toDate().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
    }
  }

  return NextResponse.json({
    nombre,
    curso,
    horas,
    calificacion,
    leccionesTotal,
    logros,
    cartaEncrypted: cartaEncrypted ?? undefined,
    cartaFecha: cartaFecha ?? undefined,
    idCert: idCert ?? "PD-2026-0000-MX",
    grupo,
    verifyUrl: verifyUrl ?? `${getAppUrl()}/certificado`,
  });
}
