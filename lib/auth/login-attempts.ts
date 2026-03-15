/**
 * Bloqueo por 5 intentos fallidos de login (15 min). Firestore: login_attempts/{email}.
 */
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

function db() {
  return getFirebaseAdminFirestore();
}

export async function checkLoginAttempts(
  email: string
): Promise<{ blocked: boolean; remainingMinutes?: number }> {
  const ref = db().collection("login_attempts").doc(email.toLowerCase().trim());
  const doc = await ref.get();

  if (!doc.exists) return { blocked: false };

  const data = doc.data()!;
  const lockedUntil = data.lockedUntil as { toMillis?: () => number } | null | undefined;
  if (lockedUntil && typeof lockedUntil.toMillis === "function") {
    const now = Date.now();
    const until = lockedUntil.toMillis();
    if (until > now) {
      const remainingMs = until - now;
      return { blocked: true, remainingMinutes: Math.ceil(remainingMs / 60000) };
    }
  }

  return { blocked: false };
}

export async function recordFailedAttempt(email: string): Promise<{ blocked: boolean }> {
  const key = email.toLowerCase().trim();
  const ref = db().collection("login_attempts").doc(key);
  const doc = await ref.get();
  const now = Date.now();

  const attempts = doc.exists ? ((doc.data()!.attempts as number) || 0) + 1 : 1;

  if (attempts >= MAX_ATTEMPTS) {
    await ref.set({
      attempts,
      lockedUntil: new Date(now + LOCKOUT_DURATION),
      lastAttempt: FieldValue.serverTimestamp(),
    });
    return { blocked: true };
  }

  await ref.set(
    {
      attempts,
      lastAttempt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { blocked: false };
}

export async function clearLoginAttempts(email: string): Promise<void> {
  await db().collection("login_attempts").doc(email.toLowerCase().trim()).delete();
}
