/**
 * Escape room de aprendizaje: salas con desafíos, timer, estado en Firestore.
 * El bot Claude actúa como narrador.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getDemoMode } from "@/lib/env";

const COLLECTION = "escape_rooms";
const USER_PROGRESS = "escape_room_progress";

export interface EscapeRoomChallenge {
  id: string;
  title: string;
  content: string;
  /** Pregunta o desafío para desbloquear la siguiente sala. */
  question?: string;
  /** Respuesta correcta (o múltiples aceptadas) para validar. */
  correctAnswer?: string | string[];
}

export interface EscapeRoom {
  id: string;
  title: string;
  description: string;
  /** Duración en minutos. */
  durationMinutes: number;
  /** Máximo de pistas por sala. */
  maxHintsPerRoom: number;
  rooms: EscapeRoomChallenge[];
  /** Badge al completar (ej. "Agente de Innovación"). */
  completionBadge: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscapeRoomProgress {
  roomId: string;
  userId: string;
  currentRoomIndex: number;
  startedAt: string;
  completedAt: string | null;
  hintsUsedByRoom: Record<number, number>;
  answersByRoom: Record<number, string>;
}

const DEMO_ROOM: EscapeRoom = {
  id: "demo-escape",
  title: "Crisis en el municipio",
  description: "Eres un funcionario público. Hay una crisis en tu municipio. Necesitas aplicar innovación pública para resolverla. Tienes 45 minutos y 5 pistas por desbloquear.",
  durationMinutes: 45,
  maxHintsPerRoom: 3,
  completionBadge: "Agente de Innovación",
  rooms: [
    { id: "r1", title: "Sala 1: El diagnóstico", content: "La primera etapa es entender el problema. Lee el fragmento sobre diagnóstico de problemas públicos.", question: "¿Cuál es el primer paso en el diagnóstico?", correctAnswer: ["entender el problema", "diagnóstico", "identificar el problema"] },
    { id: "r2", title: "Sala 2: Los actores", content: "Identifica a los actores clave en la crisis.", question: "¿Quiénes son los actores principales?", correctAnswer: ["ciudadanos", "gobierno", "actores"] },
    { id: "r3", title: "Sala 3: Soluciones", content: "Propón una solución basada en innovación pública.", question: "¿Qué tipo de innovación aplicas?", correctAnswer: ["innovación pública", "colaboración", "innovación"] },
    { id: "r4", title: "Sala 4: Implementación", content: "Plan de implementación en 90 días.", question: "¿Cuál es el primer mes de acción?", correctAnswer: ["mes 1", "primer mes", "plan"] },
    { id: "r5", title: "Sala 5: Cierre", content: "Has completado el escape room. Reflexiona sobre lo aprendido.", question: "¿Completaste el desafío?", correctAnswer: ["sí", "si", "completado"] },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function db() {
  return getFirebaseAdminFirestore();
}

export function getDemoEscapeRoom(): EscapeRoom {
  return DEMO_ROOM;
}

export async function listEscapeRooms(): Promise<EscapeRoom[]> {
  if (getDemoMode()) return [DEMO_ROOM];
  try {
    const snap = await db().collection(COLLECTION).orderBy("updatedAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EscapeRoom));
  } catch {
    return [DEMO_ROOM];
  }
}

export async function getEscapeRoom(roomId: string): Promise<EscapeRoom | null> {
  if (getDemoMode()) return roomId === DEMO_ROOM.id ? DEMO_ROOM : null;
  try {
    const doc = await db().collection(COLLECTION).doc(roomId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as EscapeRoom;
  } catch {
    return roomId === DEMO_ROOM.id ? DEMO_ROOM : null;
  }
}

export async function getProgress(userId: string, roomId: string): Promise<EscapeRoomProgress | null> {
  if (getDemoMode()) return null;
  try {
    const doc = await db().collection("users").doc(userId).collection(USER_PROGRESS).doc(roomId).get();
    if (!doc.exists) return null;
    return { roomId, userId, ...doc.data() } as EscapeRoomProgress;
  } catch {
    return null;
  }
}

export async function startEscapeRoom(userId: string, roomId: string): Promise<EscapeRoomProgress> {
  if (getDemoMode()) {
    return {
      roomId,
      userId,
      currentRoomIndex: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      hintsUsedByRoom: {},
      answersByRoom: {},
    };
  }
  const ref = db().collection("users").doc(userId).collection(USER_PROGRESS).doc(roomId);
  const existing = await ref.get();
  if (existing.exists) {
    const d = existing.data() as EscapeRoomProgress;
    if (d.completedAt) {
      return { ...d, roomId, userId };
    }
    return { ...d, roomId, userId } as EscapeRoomProgress;
  }
  const progress: Omit<EscapeRoomProgress, "roomId" | "userId"> = {
    currentRoomIndex: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    hintsUsedByRoom: {},
    answersByRoom: {},
  };
  await ref.set(progress);
  return { roomId, userId, ...progress };
}

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function isAnswerCorrect(given: string, correct: string | string[]): boolean {
  const normalized = normalizeAnswer(given);
  const options = Array.isArray(correct) ? correct : [correct];
  return options.some((c) => normalizeAnswer(c) === normalized || normalized.includes(normalizeAnswer(c)));
}

export async function submitRoomAnswer(
  userId: string,
  roomId: string,
  roomIndex: number,
  answer: string,
  room: EscapeRoom
): Promise<{ correct: boolean; nextIndex: number; completed: boolean }> {
  const challenge = room.rooms[roomIndex];
  if (!challenge?.correctAnswer) {
    return { correct: true, nextIndex: roomIndex + 1, completed: roomIndex + 1 >= room.rooms.length };
  }
  const correct = isAnswerCorrect(answer, challenge.correctAnswer);
  if (!getDemoMode()) {
    const ref = db().collection("users").doc(userId).collection(USER_PROGRESS).doc(roomId);
    const snap = await ref.get();
    const data = (snap.data() ?? {}) as { answersByRoom?: Record<number, string> };
    const answersByRoom = { ...(data.answersByRoom ?? {}), [roomIndex]: answer };
    const updates: Record<string, unknown> = { answersByRoom };
    if (correct) {
      updates.currentRoomIndex = Math.min(roomIndex + 1, room.rooms.length);
      if (roomIndex + 1 >= room.rooms.length) updates.completedAt = new Date().toISOString();
    }
    await ref.set(updates, { merge: true });
  }
  const nextIndex = correct ? roomIndex + 1 : roomIndex;
  const completed = correct && nextIndex >= room.rooms.length;
  return { correct, nextIndex, completed };
}

export async function useHint(userId: string, roomId: string, roomIndex: number, room: EscapeRoom): Promise<{ hintsUsed: number; allowed: boolean }> {
  if (getDemoMode()) return { hintsUsed: 1, allowed: true };
  const progress = await getProgress(userId, roomId);
  const hintsByRoom = progress?.hintsUsedByRoom ?? {};
  const used = hintsByRoom[roomIndex] ?? 0;
  const allowed = used < room.maxHintsPerRoom;
  if (allowed) {
    const ref = db().collection("users").doc(userId).collection(USER_PROGRESS).doc(roomId);
    const updated = { ...hintsByRoom, [roomIndex]: used + 1 };
    await ref.set({ hintsUsedByRoom: updated }, { merge: true });
  }
  return { hintsUsed: used + (allowed ? 1 : 0), allowed };
}
