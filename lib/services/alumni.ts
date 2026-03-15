/**
 * Red de egresados: directorio de quienes completaron el programa.
 * Firestore: alumni/{userId}
 * Badge "Egresado Política Digital" = certificate badge en perfil.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const COLLECTION = "alumni";

function db() {
  return getFirebaseAdminFirestore();
}

export interface AlumniProfile {
  userId: string;
  fullName: string;
  institution: string | null;
  position: string | null;
  region: string | null;
  cohortId: string | null;
  cohortName: string | null;
  linkedIn: string | null;
  createdAt: string;
}

export interface AlumniFilters {
  institution?: string | null;
  region?: string | null;
  cohortId?: string | null;
}

export async function listAlumni(filters?: AlumniFilters, limit = 100): Promise<AlumniProfile[]> {
  const col = db().collection(COLLECTION);
  const base = filters?.cohortId?.trim()
    ? col.where("cohortId", "==", filters.cohortId.trim())
    : filters?.institution?.trim()
      ? col.where("institution", "==", filters.institution.trim())
      : filters?.region?.trim()
        ? col.where("region", "==", filters.region.trim())
        : col;
  const snap = await base.orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: d.id,
      fullName: (data.fullName as string) ?? "Egresado",
      institution: (data.institution as string) ?? null,
      position: (data.position as string) ?? null,
      region: (data.region as string) ?? null,
      cohortId: (data.cohortId as string) ?? null,
      cohortName: (data.cohortName as string) ?? null,
      linkedIn: (data.linkedIn as string) ?? null,
      createdAt: (data.createdAt as string) ?? "",
    };
  });
}

export async function getAlumni(userId: string): Promise<AlumniProfile | null> {
  const doc = await db().collection(COLLECTION).doc(userId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    userId: doc.id,
    fullName: (data.fullName as string) ?? "Egresado",
    institution: (data.institution as string) ?? null,
    position: (data.position as string) ?? null,
    region: (data.region as string) ?? null,
    cohortId: (data.cohortId as string) ?? null,
    cohortName: (data.cohortName as string) ?? null,
    linkedIn: (data.linkedIn as string) ?? null,
    createdAt: (data.createdAt as string) ?? "",
  };
}

export async function joinDirectory(
  userId: string,
  data: {
    fullName: string;
    institution?: string | null;
    position?: string | null;
    region?: string | null;
    cohortId?: string | null;
    cohortName?: string | null;
    linkedIn?: string | null;
  }
): Promise<AlumniProfile> {
  const ref = db().collection(COLLECTION).doc(userId);
  const now = new Date().toISOString();
  await ref.set(
    {
      fullName: data.fullName.trim() || "Egresado",
      institution: (data.institution ?? "").trim() || null,
      position: (data.position ?? "").trim() || null,
      region: (data.region ?? "").trim() || null,
      cohortId: (data.cohortId ?? "").trim() || null,
      cohortName: (data.cohortName ?? "").trim() || null,
      linkedIn: (data.linkedIn ?? "").trim() || null,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );
  const profile = await getAlumni(userId);
  if (!profile) throw new Error("Error al unirse al directorio");
  return profile;
}
