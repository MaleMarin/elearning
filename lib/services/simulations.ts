/**
 * Simulador de Política Pública — catálogo y resultados por usuario (Brecha 2).
 * Firestore: /simulations/{id} (opcional, si se seedean), /users/{uid}/simulations/{simulationId}
 * Micro-simulaciones (admin): /microSimulations/{id}
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getSimulationsWithIds } from "@/lib/data/simulations-seed";
import type { Simulation } from "@/lib/types/simulador";
import type { SimulationEvaluation } from "@/lib/types/simulador";

/** Opción de una micro-simulación (escenario con opciones). */
export interface SimulationOption {
  text: string;
  outcome: string;
}

/** Micro-simulación: escenario, opciones y reflexión (admin / lecciones). */
export interface MicroSimulation {
  id: string;
  scenario: string;
  options: SimulationOption[];
  reflection: string;
  moduleId: string | null;
  lessonId: string | null;
  order: number;
}

const SIMULATIONS_COLL = "simulations";
const MICRO_SIMULATIONS_COLL = "microSimulations";
const USERS = "users";
const USER_SIMULATIONS = "simulations";

function db() {
  return getFirebaseAdminFirestore();
}

/** Lista de simulaciones (desde seed; si hay docs en Firestore se podrían fusionar). */
export async function getSimulations(): Promise<Simulation[]> {
  const list = getSimulationsWithIds();
  try {
    const snap = await db().collection(SIMULATIONS_COLL).limit(1).get();
    if (!snap.empty) {
      const all = await db().collection(SIMULATIONS_COLL).get();
      return all.docs.map((d) => ({ id: d.id, ...d.data() } as Simulation));
    }
  } catch {
    // ignore
  }
  return list;
}

/** Una simulación por id. */
export async function getSimulation(id: string): Promise<Simulation | null> {
  const list = getSimulationsWithIds();
  const fromSeed = list.find((s) => s.id === id);
  if (fromSeed) return fromSeed;
  try {
    const snap = await db().collection(SIMULATIONS_COLL).doc(id).get();
    if (snap.exists) return { id: snap.id, ...snap.data() } as Simulation;
  } catch {
    // ignore
  }
  return null;
}

export interface UserSimulationResult {
  simulationId: string;
  evaluation: SimulationEvaluation;
  answers: string[];
  completedAt: string;
}

/** Guarda el resultado de una simulación del usuario. */
export async function saveUserSimulationResult(
  uid: string,
  simulationId: string,
  data: { evaluation: SimulationEvaluation; answers: string[] }
): Promise<void> {
  const ref = db().collection(USERS).doc(uid).collection(USER_SIMULATIONS).doc(simulationId);
  await ref.set({
    simulationId,
    evaluation: data.evaluation,
    answers: data.answers,
    completedAt: new Date().toISOString(),
  });
}

/** Obtiene el resultado previo del usuario para una simulación. */
export async function getUserSimulationResult(
  uid: string,
  simulationId: string
): Promise<UserSimulationResult | null> {
  const snap = await db()
    .collection(USERS)
    .doc(uid)
    .collection(USER_SIMULATIONS)
    .doc(simulationId)
    .get();
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown>;
  return {
    simulationId: d.simulationId as string,
    evaluation: d.evaluation as SimulationEvaluation,
    answers: (d.answers as string[]) ?? [],
    completedAt: (d.completedAt as string) ?? "",
  };
}

/** Promedio de score por simulación en el grupo (anónimo). */
export async function getCohortAverageScore(simulationId: string): Promise<number | null> {
  try {
    const snap = await db()
      .collectionGroup(USER_SIMULATIONS)
      .where("simulationId", "==", simulationId)
      .get();
    if (snap.empty) return null;
    let sum = 0;
    let count = 0;
    snap.docs.forEach((d) => {
      const ev = (d.data().evaluation as SimulationEvaluation)?.scoreTotal;
      if (typeof ev === "number") {
        sum += ev;
        count++;
      }
    });
    return count > 0 ? Math.round(sum / count) : null;
  } catch {
    return null;
  }
}

// --- Micro-simulaciones (admin CRUD) ---

function microColl() {
  return db().collection(MICRO_SIMULATIONS_COLL);
}

/** Lista micro-simulaciones, opcionalmente filtradas por moduleId o lessonId. */
export async function listSimulations(filters?: {
  moduleId?: string;
  lessonId?: string;
}): Promise<MicroSimulation[]> {
  try {
    const snap = await microColl().orderBy("order", "asc").get();
    let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MicroSimulation));
    if (filters?.moduleId) docs = docs.filter((s) => s.moduleId === filters.moduleId);
    if (filters?.lessonId) docs = docs.filter((s) => s.lessonId === filters.lessonId);
    return docs;
  } catch {
    return [];
  }
}

/** Crea una micro-simulación. */
export async function createSimulation(data: {
  scenario: string;
  options: SimulationOption[];
  reflection: string;
  moduleId: string | null;
  lessonId: string | null;
  order: number;
}): Promise<MicroSimulation> {
  const ref = await microColl().add({
    scenario: data.scenario,
    options: data.options ?? [],
    reflection: data.reflection ?? "",
    moduleId: data.moduleId ?? null,
    lessonId: data.lessonId ?? null,
    order: data.order ?? 0,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as MicroSimulation;
}

/** Actualiza una micro-simulación. */
export async function updateSimulation(
  id: string,
  data: Partial<{
    scenario: string;
    options: SimulationOption[];
    reflection: string;
    moduleId: string | null;
    lessonId: string | null;
    order: number;
  }>
): Promise<MicroSimulation> {
  const ref = microColl().doc(id);
  const update: Record<string, unknown> = {};
  if (data.scenario !== undefined) update.scenario = data.scenario;
  if (data.options !== undefined) update.options = data.options;
  if (data.reflection !== undefined) update.reflection = data.reflection;
  if (data.moduleId !== undefined) update.moduleId = data.moduleId;
  if (data.lessonId !== undefined) update.lessonId = data.lessonId;
  if (data.order !== undefined) update.order = data.order;
  await ref.update(update);
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as MicroSimulation;
}

/** Elimina una micro-simulación. */
export async function deleteSimulation(id: string): Promise<void> {
  await microColl().doc(id).delete();
}
