/**
 * Reglas de inscripción automática (ej. al completar un curso → inscribir en otro).
 * Colección Firestore: enrollmentRules.
 */

import type { DocumentSnapshot } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";

const db = () => getFirebaseAdminFirestore();
const COLLECTION = "enrollmentRules";

export type EnrollmentRuleTrigger = "course_completed" | "institution_match" | "manual_batch";

export interface EnrollmentRuleConditions {
  completedCourseId?: string;
  institution?: string;
}

export interface EnrollmentRuleAction {
  enrollInCourseId: string;
  assignCohortId?: string;
  enviarNotificacion?: boolean;
}

export interface EnrollmentRule {
  id: string;
  name: string;
  trigger: EnrollmentRuleTrigger;
  conditions: EnrollmentRuleConditions;
  action: EnrollmentRuleAction;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

function toRule(doc: DocumentSnapshot): EnrollmentRule {
  const d = doc.data()!;
  return {
    id: doc.id,
    name: (d.name as string) ?? "",
    trigger: (d.trigger as EnrollmentRuleTrigger) ?? "course_completed",
    conditions: (d.conditions as EnrollmentRuleConditions) ?? {},
    action: (d.action as EnrollmentRuleAction) ?? { enrollInCourseId: "" },
    active: (d.active as boolean) ?? true,
    created_at: typeof d.created_at === "string" ? d.created_at : undefined,
    updated_at: typeof d.updated_at === "string" ? d.updated_at : undefined,
  };
}

export async function listEnrollmentRules(activeOnly = false): Promise<EnrollmentRule[]> {
  let query = db().collection(COLLECTION).orderBy("created_at", "desc");
  if (activeOnly) query = query.where("active", "==", true) as ReturnType<typeof query.where>;
  const snap = await query.get();
  return snap.docs.map(toRule);
}

export async function getEnrollmentRule(id: string): Promise<EnrollmentRule | null> {
  const doc = await db().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toRule(doc);
}

export async function createEnrollmentRule(rule: Omit<EnrollmentRule, "id" | "created_at" | "updated_at">): Promise<EnrollmentRule> {
  const now = new Date().toISOString();
  const ref = await db().collection(COLLECTION).add({
    name: rule.name,
    trigger: rule.trigger,
    conditions: rule.conditions,
    action: rule.action,
    active: rule.active,
    created_at: now,
    updated_at: now,
  });
  const snap = await ref.get();
  return toRule(snap);
}

export async function updateEnrollmentRule(
  id: string,
  updates: Partial<Pick<EnrollmentRule, "name" | "trigger" | "conditions" | "action" | "active">>
): Promise<EnrollmentRule | null> {
  const ref = db().collection(COLLECTION).doc(id);
  const now = new Date().toISOString();
  await ref.update({
    ...updates,
    updated_at: now,
  });
  const snap = await ref.get();
  if (!snap.exists) return null;
  return toRule(snap);
}

export async function deleteEnrollmentRule(id: string): Promise<void> {
  await db().collection(COLLECTION).doc(id).delete();
}

/** Añade usuario a un grupo (enrollment + cohort.alumnos). Idempotente. */
async function addUserToCohort(userId: string, cohortId: string): Promise<void> {
  const existing = await db()
    .collection("enrollments")
    .where("user_id", "==", userId)
    .where("cohort_id", "==", cohortId)
    .limit(1)
    .get();
  if (!existing.empty) return;

  await db().collection("enrollments").doc().set({
    user_id: userId,
    cohort_id: cohortId,
    status: "active",
    created_at: new Date(),
  });

  const cohortDoc = await db().collection("cohorts").doc(cohortId).get();
  if (!cohortDoc.exists) return;
  const cohortData = cohortDoc.data()!;
  const alumnos = (cohortData.alumnos as string[]) ?? [];
  if (!alumnos.includes(userId)) {
    await db().collection("cohorts").doc(cohortId).update({
      alumnos: [...alumnos, userId],
      updated_at: new Date().toISOString(),
    });
  }
}

/**
 * Ejecuta reglas de inscripción cuando un usuario completa un curso.
 * Llamar desde progress/complete cuando justCompletedAll === true.
 */
export async function checkEnrollmentRules(userId: string, completedCourseId: string): Promise<void> {
  const snap = await db()
    .collection(COLLECTION)
    .where("active", "==", true)
    .where("trigger", "==", "course_completed")
    .where("conditions.completedCourseId", "==", completedCourseId)
    .get();

  for (const doc of snap.docs) {
    const rule = toRule(doc);
    const courseId = rule.action?.enrollInCourseId;
    if (!courseId?.trim()) continue;

    const cohortId = rule.action?.assignCohortId;
    if (cohortId?.trim()) {
      await addUserToCohort(userId, cohortId.trim());
    } else {
      const cohortCourses = await firebaseContent.getCohortCoursesByCourse(courseId);
      const first = cohortCourses[0] as { cohort_id?: string } | undefined;
      const firstCohortId = first?.cohort_id;
      if (firstCohortId) await addUserToCohort(userId, firstCohortId);
    }
    if (rule.action?.enviarNotificacion) {
      try {
        const { sendPushNotification } = await import("@/lib/notifications/webpush");
        await sendPushNotification(userId, {
          title: "Nuevo curso disponible",
          body: "Se te ha inscrito en un nuevo curso. Entra a la plataforma para verlo.",
          url: "/curso",
        });
      } catch {
        // webpush opcional
      }
    }
  }
}
