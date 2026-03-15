/**
 * Audit log global: registro de accesos y acciones para auditoría (gobierno).
 * Escribe en Firestore collection audit_logs.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export type AuditAction =
  | "lesson_viewed"
  | "lesson_completed"
  | "quiz_submitted"
  | "login"
  | "logout"
  | "portafolio_created"
  | "certificate_downloaded";

export interface AuditEntry {
  userId: string;
  action: AuditAction;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const db = getFirebaseAdminFirestore();
    const date = new Date().toISOString().split("T")[0];
    await db.collection("audit_logs").add({
      ...entry,
      timestamp: FieldValue.serverTimestamp(),
      date,
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
