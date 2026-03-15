/**
 * AI Roleplay: escenarios configurables y guardado de resúmenes en Firestore.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export interface RoleplayScenario {
  id: string;
  title: string;
  characterPrompt: string;
  /** Instrucción para el bot al adoptar el personaje. */
  openingLine: string;
  order: number;
}

/** Escenarios por defecto (admin puede ampliar en Firestore más adelante). */
export const DEFAULT_ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "convence-jefe",
    title: "Convence a tu jefe de adoptar una innovación",
    characterPrompt: "Eres el jefe directo del alumno. Eres escéptico ante los cambios y priorizas el riesgo operativo. Responde como tal, con objeciones realistas pero abierto a argumentos sólidos.",
    openingLine: "Entiendo que quieres proponer algo distinto, pero aquí las cosas siempre se han hecho así. ¿Qué tienes en mente y por qué debería arriesgarme?",
    order: 0,
  },
  {
    id: "resistencia-equipo",
    title: "Gestiona la resistencia al cambio de tu equipo",
    characterPrompt: "Eres un miembro del equipo que resiste el cambio. Tienes miedo a lo nuevo y te aferras a los procesos actuales. Responde como tal, mostrando preocupaciones legítimas.",
    openingLine: "Otra vez con cambios. Ya hemos intentado cosas antes y no funcionaron. ¿Por qué esta vez sería distinto?",
    order: 1,
  },
  {
    id: "presenta-ministerio",
    title: "Presenta un proyecto de innovación al Ministerio",
    characterPrompt: "Eres una autoridad del Ministerio, con poco tiempo y muchas demandas. Eres formal pero dispuesto a escuchar si la propuesta es clara y con impacto medible.",
    openingLine: "Tengo 10 minutos. ¿Qué proyecto quieres presentar y cuál es el resultado concreto que buscan?",
    order: 2,
  },
  {
    id: "negocia-recursos",
    title: "Negocia recursos para tu iniciativa",
    characterPrompt: "Eres quien asigna presupuesto. Tienes restricciones y otras prioridades. Responde como tal: escuchas pero pides justificación y alternativas.",
    openingLine: "Recursos siempre faltan. ¿Cuánto necesitas, para qué exactamente y qué pasaría si te damos la mitad?",
    order: 3,
  },
];

const COLLECTION = "roleplay_summaries";

export async function getScenarios(): Promise<RoleplayScenario[]> {
  try {
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("roleplay_scenarios").orderBy("order", "asc").get();
    if (snap.empty) return DEFAULT_ROLEPLAY_SCENARIOS;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoleplayScenario));
  } catch {
    return DEFAULT_ROLEPLAY_SCENARIOS;
  }
}

export async function getScenario(id: string): Promise<RoleplayScenario | null> {
  const all = await getScenarios();
  return all.find((s) => s.id === id) ?? null;
}

/** Admin: guardar o actualizar escenario en Firestore. */
export async function saveScenario(data: Omit<RoleplayScenario, "id"> & { id?: string }): Promise<RoleplayScenario> {
  const db = getFirebaseAdminFirestore();
  const id = data.id?.trim() || db.collection("roleplay_scenarios").doc().id;
  const ref = db.collection("roleplay_scenarios").doc(id);
  await ref.set({
    title: (data.title as string) ?? "",
    characterPrompt: (data.characterPrompt as string) ?? "",
    openingLine: (data.openingLine as string) ?? "",
    order: typeof data.order === "number" ? data.order : 0,
  }, { merge: true });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as RoleplayScenario;
}

/** Admin: eliminar escenario. */
export async function deleteScenario(id: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection("roleplay_scenarios").doc(id).delete();
}

export interface RoleplaySummary {
  id: string;
  userId: string;
  scenarioId: string;
  scenarioTitle: string;
  turnCount: number;
  feedback?: string;
  completedAt: string;
}

export async function saveRoleplaySummary(
  userId: string,
  scenarioId: string,
  scenarioTitle: string,
  turnCount: number,
  feedback?: string
): Promise<void> {
  try {
    const db = getFirebaseAdminFirestore();
    const ref = db.collection("users").doc(userId).collection(COLLECTION).doc();
    await ref.set({
      scenarioId,
      scenarioTitle,
      turnCount,
      feedback: feedback ?? null,
      completedAt: new Date().toISOString(),
    });
  } catch {
    // Modo demo o sin Firebase: no persistir
  }
}
