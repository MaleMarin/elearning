/**
 * Rutas de aprendizaje por cargo e institución.
 * Firestore: learningPaths/{pathId}
 */

import type { DocumentSnapshot } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";

const db = () => getFirebaseAdminFirestore();
const COLLECTION = "learningPaths";

export interface LearningPathCourse {
  courseId: string;
  orden: number;
  obligatorio: boolean;
  diasParaCompletar?: number;
}

export interface LearningPath {
  id: string;
  nombre: string;
  descripcion: string;
  cargosTarget: string[];
  institucionesTarget: string[];
  cursos: LearningPathCourse[];
  activa: boolean;
  created_at?: string;
  updated_at?: string;
}

function toPath(doc: DocumentSnapshot): LearningPath {
  const d = doc.data()!;
  return {
    id: doc.id,
    nombre: (d.nombre as string) ?? "",
    descripcion: (d.descripcion as string) ?? "",
    cargosTarget: Array.isArray(d.cargosTarget) ? (d.cargosTarget as string[]) : [],
    institucionesTarget: Array.isArray(d.institucionesTarget) ? (d.institucionesTarget as string[]) : [],
    cursos: Array.isArray(d.cursos) ? (d.cursos as LearningPathCourse[]) : [],
    activa: (d.activa as boolean) ?? true,
    created_at: typeof d.created_at === "string" ? d.created_at : undefined,
    updated_at: typeof d.updated_at === "string" ? d.updated_at : undefined,
  };
}

export async function listLearningPaths(activeOnly = true): Promise<LearningPath[]> {
  let query = db().collection(COLLECTION).orderBy("updated_at", "desc");
  if (activeOnly) query = query.where("activa", "==", true) as ReturnType<typeof query.where>;
  const snap = await query.get();
  return snap.docs.map((d) => toPath(d));
}

export async function getLearningPath(id: string): Promise<LearningPath | null> {
  const doc = await db().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toPath(doc);
}

export async function createLearningPath(data: Omit<LearningPath, "id" | "created_at" | "updated_at">): Promise<LearningPath> {
  const now = new Date().toISOString();
  const ref = await db().collection(COLLECTION).add({
    ...data,
    created_at: now,
    updated_at: now,
  });
  const snap = await ref.get();
  return toPath(snap);
}

export async function updateLearningPath(id: string, data: Partial<Omit<LearningPath, "id">>): Promise<LearningPath | null> {
  const ref = db().collection(COLLECTION).doc(id);
  await ref.update({ ...data, updated_at: new Date().toISOString() });
  const snap = await ref.get();
  if (!snap.exists) return null;
  return toPath(snap);
}

/**
 * Asigna una ruta al usuario según su cargo e institución (onboarding).
 * Inscribe en los cursos de la ruta y guarda learningPathId en el perfil.
 */
export async function assignLearningPath(
  userId: string,
  cargo: string,
  institucion: string
): Promise<{ pathId: string } | null> {
  const paths = await listLearningPaths(true);
  const cargoLower = cargo.trim().toLowerCase();
  const instTrim = institucion.trim();
  for (const path of paths) {
    const matchesCargo = path.cargosTarget.some((c) => cargoLower.includes(c.toLowerCase()));
    const matchesInst = path.institucionesTarget.length === 0 || path.institucionesTarget.some((i) => i === instTrim);
    if (matchesCargo && matchesInst) {
      for (const item of path.cursos) {
        const cohortCourses = await firebaseContent.getCohortCoursesByCourse(item.courseId);
        const first = cohortCourses[0] as { cohort_id?: string } | undefined;
        if (first?.cohort_id) {
          const existing = await db().collection("enrollments").where("user_id", "==", userId).where("cohort_id", "==", first.cohort_id).limit(1).get();
          if (existing.empty) {
            await db().collection("enrollments").doc().set({
              user_id: userId,
              cohort_id: first.cohort_id,
              status: "active",
              created_at: new Date(),
            });
            const cohortDoc = await db().collection("cohorts").doc(first.cohort_id).get();
            if (cohortDoc.exists) {
              const cohortData = cohortDoc.data()!;
              const alumnos = (cohortData.alumnos as string[]) ?? [];
              if (!alumnos.includes(userId)) {
                await db().collection("cohorts").doc(first.cohort_id).update({
                  alumnos: [...alumnos, userId],
                  updated_at: new Date().toISOString(),
                });
              }
            }
          }
        }
      }
      await db().collection("profiles").doc(userId).set(
        { learningPathId: path.id, updated_at: new Date().toISOString() },
        { merge: true }
      );
      return { pathId: path.id };
    }
  }
  return null;
}
