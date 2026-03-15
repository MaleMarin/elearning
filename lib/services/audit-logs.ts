/**
 * Audit logs en /users/{userId}/audit_logs.
 * Solo el backend escribe; el usuario (o admin) puede leer.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export type AuditAction =
  | "login"
  | "logout"
  | "lesson_view"
  | "lesson_complete"
  | "quiz_attempt"
  | "certificate_download"
  | "profile_update"
  | "admin_action";

export async function logAudit(
  userId: string,
  action: AuditAction,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db
    .collection("users")
    .doc(userId)
    .collection("audit_logs")
    .add({
      action,
      metadata,
      timestamp: FieldValue.serverTimestamp(),
      userAgent: metadata.userAgent ?? null,
    });
}
