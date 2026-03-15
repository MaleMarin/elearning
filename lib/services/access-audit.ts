/**
 * Auditoría de accesos: login, logout, lesson_view, lesson_complete, course_view.
 * Solo se usa en modo real (no demo). Escritura vía Admin SDK; reglas Firestore deniegan cliente.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export type AccessAuditAction =
  | "lesson_view"
  | "lesson_complete"
  | "login"
  | "logout"
  | "course_view";

export interface AccessAuditEvent {
  userId: string;
  userEmail: string;
  action: AccessAuditAction;
  resourceId: string;
  resourceName: string;
  timestamp: Timestamp;
  device: {
    browser: string;
    os: string;
    isMobile: boolean;
  };
  sessionId: string;
}

function parseUserAgent(ua: string): { browser: string; os: string; isMobile: boolean } {
  let browser = "Unknown";
  let os = "Unknown";
  const isMobile = /Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";

  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua) || /Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { browser, os, isMobile };
}

export function parseDeviceFromUserAgent(userAgent: string | null): AccessAuditEvent["device"] {
  return parseUserAgent(userAgent ?? "");
}

/**
 * Registra un evento de acceso en Firestore (audit_logs).
 * Llamar desde API routes con Admin SDK; no usar desde cliente.
 */
export async function logAccessAudit(params: {
  userId: string;
  userEmail: string;
  action: AccessAuditAction;
  resourceId: string;
  resourceName: string;
  device: AccessAuditEvent["device"];
  sessionId: string;
}): Promise<void> {
  try {
    const db = getFirebaseAdminFirestore();
    await db.collection("audit_logs").add({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      timestamp: Timestamp.now(),
      device: params.device,
      sessionId: params.sessionId,
    });
  } catch (e) {
    console.error("[access-audit]", e);
  }
}
