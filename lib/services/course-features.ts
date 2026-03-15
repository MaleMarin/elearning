/**
 * Feature flags por curso. Firestore: /courses/{courseId}/features/config
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { CourseFeatures } from "@/lib/types/course-features";
import { DEFAULT_COURSE_FEATURES } from "@/lib/types/course-features";

const FEATURES_DOC_ID = "config";

function db() {
  return getFirebaseAdminFirestore();
}

/**
 * Obtiene los feature flags de un curso. Si no existe el documento, devuelve defaults.
 */
export async function getCourseFeatures(courseId: string): Promise<CourseFeatures> {
  const ref = db().collection("courses").doc(courseId).collection("features").doc(FEATURES_DOC_ID);
  const snap = await ref.get();
  if (!snap.exists) return { ...DEFAULT_COURSE_FEATURES };
  const data = snap.data() as Record<string, unknown> | undefined;
  if (!data) return { ...DEFAULT_COURSE_FEATURES };
  return mergeWithDefaults(data as Partial<CourseFeatures>);
}

/**
 * Actualiza los feature flags de un curso (merge con lo existente).
 */
export async function updateCourseFeatures(
  courseId: string,
  updates: Partial<CourseFeatures>
): Promise<CourseFeatures> {
  const ref = db().collection("courses").doc(courseId).collection("features").doc(FEATURES_DOC_ID);
  const current = await getCourseFeatures(courseId);
  const next: CourseFeatures = { ...current, ...updates };
  await ref.set(
    {
      ...next,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
  return next;
}

/**
 * Establece todos los flags de una vez (p. ej. al aplicar una plantilla).
 */
export async function setCourseFeatures(
  courseId: string,
  features: CourseFeatures
): Promise<CourseFeatures> {
  const ref = db().collection("courses").doc(courseId).collection("features").doc(FEATURES_DOC_ID);
  await ref.set(
    {
      ...features,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
  return features;
}

function mergeWithDefaults(partial: Partial<CourseFeatures>): CourseFeatures {
  const keys = Object.keys(DEFAULT_COURSE_FEATURES) as (keyof CourseFeatures)[];
  const out = { ...DEFAULT_COURSE_FEATURES };
  for (const k of keys) {
    if (typeof partial[k] === "boolean") out[k] = partial[k] as boolean;
  }
  return out;
}
