/**
 * El Laboratorio: sala de entretenimiento sin calificaciones.
 * Funciones compartidas: frase semanal, contadores de actividad por zona.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getDemoMode } from "@/lib/env";

const LAB_CONFIG = "lab_config";
const WEEKLY_PHRASE = "weekly_phrase";

export interface LabZone {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
}

export const LAB_ZONES: LabZone[] = [
  { id: "juegos", name: "Zona Juegos", description: "Trivia, adivina la política, mitos y verdades.", href: "/laboratorio/zona-juegos", icon: "🎯" },
  { id: "creatividad", name: "Zona Creatividad", description: "Generador de ideas absurdas, rediseña trámites.", href: "/laboratorio/zona-creatividad", icon: "💡" },
  { id: "exploracion", name: "Zona Exploración", description: "Mapa de innovaciones, archivo secreto, podcast.", href: "/laboratorio/zona-exploracion", icon: "🗺️" },
  { id: "humor", name: "Zona Humor", description: "Burocrátron 3000, muro de frases.", href: "/laboratorio/zona-humor", icon: "😄" },
];

const DEMO_PHRASE = "Esta semana en el laboratorio: explora sin presión. Juega, crea y descubre — nada cuenta para la nota.";

/** Obtiene la frase semanal del laboratorio (Claude o guardada). */
export async function getWeeklyPhrase(): Promise<string> {
  if (getDemoMode()) return DEMO_PHRASE;
  try {
    const db = getFirebaseAdminFirestore();
    const doc = await db.collection(LAB_CONFIG).doc(WEEKLY_PHRASE).get();
    const data = doc.data();
    return (data?.phrase as string) ?? DEMO_PHRASE;
  } catch {
    return DEMO_PHRASE;
  }
}

/** Contador de alumnos activos por zona hoy (para el hub). */
export async function getActiveCountsByZone(): Promise<Record<string, number>> {
  if (getDemoMode()) {
    return { juegos: 3, creatividad: 2, exploracion: 1, humor: 4, hablas_humano: 2 };
  }
  try {
    const db = getFirebaseAdminFirestore();
    const today = new Date().toISOString().slice(0, 10);
    const counts: Record<string, number> = {};
    for (const z of LAB_ZONES) {
      const snap = await db.collection("lab_activity").where("zoneId", "==", z.id).where("date", "==", today).limit(500).get();
      const uids = new Set(snap.docs.map((d) => d.data().userId).filter(Boolean));
      counts[z.id] = uids.size;
    }
    return counts;
  } catch {
    return {};
  }
}

/** ¿Hay contenido nuevo esta semana? (para badge "Nuevo"). */
export async function getZonesWithNewContent(): Promise<Set<string>> {
  if (getDemoMode()) return new Set(["juegos", "humor"]);
  try {
    const db = getFirebaseAdminFirestore();
    const weekStart = getWeekStart(new Date());
    const snap = await db.collection("lab_new_content").where("weekStart", "==", weekStart).get();
    const zones = new Set(snap.docs.map((d) => d.data().zoneId as string).filter(Boolean));
    return zones;
  } catch {
    return new Set();
  }
}

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}
