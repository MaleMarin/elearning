/**
 * Generación y almacenamiento de certificados.
 * Firestore: users/{userId}/certificates/{courseId}, certificate_by_id/{idCert}
 * Storage: certificados/{userId}/{courseId}.pdf
 */

import { getFirebaseAdminFirestore, getFirebaseAdminStorage } from "@/lib/firebase/admin";
import { getDemoMode } from "@/lib/env";
import * as grades from "@/lib/services/grades";
import * as firebaseContent from "@/lib/services/firebase-content";

const USERS_COLL = "users";
const CERT_SUBCOLL = "certificates";
const BY_ID_COLL = "certificate_by_id";
const STORAGE_PREFIX = "certificados";

export interface CertificateRecord {
  idCert: string;
  nombre: string;
  curso: string;
  fecha: string;
  calificacion: string;
  storageUrl: string;
  emitidoPor: "sistema" | "admin";
  adminId?: string | null;
  createdAt: string;
  verifyUrl: string;
}

/** Genera ID único: PD-{año}-{4 dígitos}-MX */
export function generarIdCert(_userId: string, _courseId: string): string {
  const año = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `PD-${año}-${seq}-MX`;
}

function db() {
  return getFirebaseAdminFirestore();
}

export async function getCertificate(userId: string, courseId: string): Promise<CertificateRecord | null> {
  if (getDemoMode()) return null;
  const ref = db().collection(USERS_COLL).doc(userId).collection(CERT_SUBCOLL).doc(courseId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown>;
  return {
    idCert: d.idCert as string,
    nombre: d.nombre as string,
    curso: d.curso as string,
    fecha: d.fecha as string,
    calificacion: d.calificacion as string,
    storageUrl: d.storageUrl as string,
    emitidoPor: (d.emitidoPor as "sistema" | "admin") ?? "sistema",
    adminId: (d.adminId as string | null) ?? null,
    createdAt: d.createdAt as string,
    verifyUrl: d.verifyUrl as string,
  };
}

/** Busca certificado por idCert (para verificación pública). */
export async function getCertificateByIdCert(idCert: string): Promise<CertificateRecord | null> {
  if (getDemoMode()) return null;
  const ref = db().collection(BY_ID_COLL).doc(idCert);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const d = snap.data() as { userId?: string; courseId?: string };
  if (!d?.userId || !d?.courseId) return null;
  return getCertificate(d.userId, d.courseId);
}

export async function getCertificatesForUser(userId: string): Promise<CertificateRecord[]> {
  if (getDemoMode()) return [];
  const snap = await db().collection(USERS_COLL).doc(userId).collection(CERT_SUBCOLL).get();
  return snap.docs.map((doc) => {
    const d = doc.data() as Record<string, unknown>;
    return {
      idCert: d.idCert as string,
      nombre: d.nombre as string,
      curso: d.curso as string,
      fecha: d.fecha as string,
      calificacion: d.calificacion as string,
      storageUrl: d.storageUrl as string,
      emitidoPor: (d.emitidoPor as "sistema" | "admin") ?? "sistema",
      adminId: (d.adminId as string | null) ?? null,
      createdAt: d.createdAt as string,
      verifyUrl: d.verifyUrl as string,
    };
  });
}

/** Verifica si el alumno completó 100% del curso (lecciones publicadas). */
export async function hasCompleted100(userId: string, courseId: string): Promise<boolean> {
  const summary = await grades.getStudentGradeSummary(userId, courseId);
  return summary.progressPercent >= 100;
}

/**
 * Crea el certificado: metadata en Firestore, índice por idCert, y opcionalmente sube PDF a Storage.
 * Si ya existe certificado para userId+courseId, retorna el existente sin crear otro.
 */
export async function createCertificate(params: {
  userId: string;
  courseId: string;
  forzar: boolean;
  adminId?: string | null;
  nombre: string;
  curso: string;
  calificacion: string;
  pdfBuffer?: Buffer | null;
  appUrl: string;
}): Promise<{ url: string; idCert: string; record: CertificateRecord }> {
  const { userId, courseId, forzar, adminId, nombre, curso, calificacion, pdfBuffer, appUrl } = params;
  const existing = await getCertificate(userId, courseId);
  if (existing) {
    return { url: existing.storageUrl, idCert: existing.idCert, record: existing };
  }

  if (getDemoMode()) {
    const idCert = generarIdCert(userId, courseId);
    const now = new Date().toISOString();
    const verifyUrl = `${appUrl}/verificar/${idCert}`;
    const demoRecord: CertificateRecord = {
      idCert,
      nombre,
      curso,
      fecha: now,
      calificacion,
      storageUrl: `${appUrl}/certificado?demo=1`,
      emitidoPor: forzar ? "admin" : "sistema",
      adminId: forzar ? adminId ?? null : null,
      createdAt: now,
      verifyUrl,
    };
    return { url: demoRecord.storageUrl, idCert, record: demoRecord };
  }

  const idCert = generarIdCert(userId, courseId);
  const now = new Date().toISOString();
  const verifyUrl = `${appUrl}/verificar/${idCert}`;
  let storageUrl = verifyUrl;

  if (pdfBuffer && pdfBuffer.length > 0) {
    const storage = getFirebaseAdminStorage();
    const bucket = storage.bucket();
    const path = `${STORAGE_PREFIX}/${userId}/${courseId}.pdf`;
    const file = bucket.file(path);
    await file.save(pdfBuffer, { contentType: "application/pdf", metadata: { cacheControl: "public, max-age=31536000" } });
    const [signedUrl] = await file.getSignedUrl({ action: "read", expires: "03-01-2500" });
    storageUrl = signedUrl;
  }

  const record: CertificateRecord = {
    idCert,
    nombre,
    curso,
    fecha: now,
    calificacion,
    storageUrl,
    emitidoPor: forzar ? "admin" : "sistema",
    adminId: forzar ? adminId ?? null : null,
    createdAt: now,
    verifyUrl,
  };

  const batch = db().batch();
  const userCertRef = db().collection(USERS_COLL).doc(userId).collection(CERT_SUBCOLL).doc(courseId);
  batch.set(userCertRef, record);
  const byIdRef = db().collection(BY_ID_COLL).doc(idCert);
  batch.set(byIdRef, { userId, courseId });
  await batch.commit();

  return { url: storageUrl, idCert, record };
}
