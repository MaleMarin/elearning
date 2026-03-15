/**
 * Sistema de puntos por actividad (gamificación).
 * Persiste totalPoints en users/{uid} y opcionalmente eventos en users/{uid}/points_events.
 * @see docs/AUDITORIA_COMPLETA_113.md — ítem 79.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const USERS = "users";
const POINTS_EVENTS = "points_events";

export type PointsActivityType =
  | "lesson_complete"
  | "quiz_final_passed"
  | "diagnostic_completed"
  | "module_complete"
  | "certificate_earned";

/** Puntos por tipo de actividad (genérico y extensible). */
export const POINTS_BY_ACTIVITY: Record<PointsActivityType, number> = {
  lesson_complete: 10,
  quiz_final_passed: 50,
  diagnostic_completed: 5,
  module_complete: 20,
  certificate_earned: 30,
};

export interface PointsEvent {
  activityType: PointsActivityType;
  points: number;
  at: string;
  metadata?: Record<string, string>;
}

function db() {
  return getFirebaseAdminFirestore();
}

/**
 * Suma puntos por una actividad (idempotente por activityType + metadata opcional si se requiere).
 * Actualiza users/{uid}.totalPoints y opcionalmente registra en users/{uid}/points_events.
 */
export async function addPoints(
  uid: string,
  activityType: PointsActivityType,
  metadata?: Record<string, string>
): Promise<{ totalPoints: number; added: number }> {
  const points = POINTS_BY_ACTIVITY[activityType];
  const userRef = db().collection(USERS).doc(uid);
  const eventsRef = userRef.collection(POINTS_EVENTS);
  const now = new Date().toISOString();

  const result = await db().runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const current = (snap.data() as { totalPoints?: number } | undefined)?.totalPoints ?? 0;
    const newTotal = current + points;
    tx.set(userRef, { totalPoints: newTotal, updatedAt: now }, { merge: true });
    const eventId = `${activityType}_${Date.now()}`;
    tx.set(eventsRef.doc(eventId), {
      activityType,
      points,
      at: now,
      ...(metadata && { metadata }),
    });
    return { totalPoints: newTotal, added: points };
  });

  return result;
}

/**
 * Obtiene el total de puntos del usuario desde users/{uid}.totalPoints.
 */
export async function getPoints(uid: string): Promise<number> {
  const snap = await db().collection(USERS).doc(uid).get();
  const data = snap.data() as { totalPoints?: number } | undefined;
  return data?.totalPoints ?? 0;
}
