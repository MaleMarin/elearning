/**
 * Firestore con Sentry: spans + captura de errores con tags y fallback.
 *
 * Dos patrones:
 *
 * 1) runWithFirestoreSpan — para API routes (Admin SDK), traza + re-lanza error.
 * 2) withFirestoreSentry   — para cualquier query (cliente o servidor): captura error, tags, user, devuelve null.
 *
 * Ejemplo con withFirestoreSentry (cliente, getDoc):
 *
 *   import { withFirestoreSentry } from "@/lib/sentry/firestore-with-sentry";
 *   import { getDoc } from "firebase/firestore";
 *
 *   const doc = await withFirestoreSentry(
 *     async () => getDoc(ref),
 *     { collection: "courses" },
 *     userId
 *   );
 *   if (!doc) return; // fallback
 *
 * Ejemplo con withFirestoreSentry (servidor, Admin):
 *
 *   const snap = await withFirestoreSentry(
 *     () => getFirebaseAdminFirestore().collection("profiles").doc(uid).get(),
 *     { collection: "profiles" },
 *     uid
 *   );
 *   if (!snap) return null;
 */

import * as Sentry from "@sentry/nextjs";

export async function runWithFirestoreSpan<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan({ name: `firestore.${name}`, op: "db" }, async (span) => {
    try {
      const result = await fn();
      span?.setStatus({ code: 1 });
      return result;
    } catch (err) {
      span?.setStatus({ code: 2, message: err instanceof Error ? err.message : "Unknown" });
      Sentry.captureException(err);
      throw err;
    }
  });
}

/** Tags adicionales para Sentry (ej. collection, layer). */
export type FirestoreSentryTags = Record<string, string>;

/**
 * Wrappea cualquier query de Firestore: en error captura en Sentry con tags y user, devuelve null.
 * Patrón para no crashear y seguir con fallback.
 */
export async function withFirestoreSentry<T>(
  fn: () => Promise<T>,
  tags: FirestoreSentryTags,
  userId: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    Sentry.captureException(error, {
      tags: { layer: "firestore", ...tags },
      user: { id: userId },
    });
    return null;
  }
}
