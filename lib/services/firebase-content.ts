/**
 * Capa de contenido (cursos, módulos, lecciones, grupos) sobre Firestore.
 * Usar cuando useFirebase() === true.
 */

import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { PublishStatus } from "@/lib/types/content";
import type { CohortEstado, CohortConfiguracion } from "@/lib/types/cohort";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as profileService from "@/lib/services/profile";

const db = () => getFirebaseAdminFirestore();

type WithId<T> = T & { id: string };

// --- Courses ---
export async function listCourses(): Promise<WithId<{ title: string; status: string; created_at: string; updated_at: string }>[]> {
  const snap = await db().collection("courses").orderBy("created_at", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WithId<Record<string, unknown>>)) as WithId<{ title: string; status: string; created_at: string; updated_at: string }>[];
}

export async function getCourse(courseId: string) {
  const doc = await db().collection("courses").doc(courseId).get();
  if (!doc.exists) throw new Error("Curso no encontrado");
  return { id: doc.id, ...doc.data() } as Record<string, unknown>;
}

export async function createCourse(
  createdBy: string,
  title: string,
  status: PublishStatus = "draft",
  description?: string | null
) {
  const ref = db().collection("courses").doc();
  const now = new Date().toISOString();
  await ref.set({
    title,
    status,
    description: description ?? null,
    created_by: createdBy,
    created_at: now,
    updated_at: now,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

export async function updateCourse(
  courseId: string,
  updates: { title?: string; description?: string | null; status?: PublishStatus; coAuthors?: string[] }
) {
  const ref = db().collection("courses").doc(courseId);
  const clean: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) clean.title = updates.title;
  if (updates.description !== undefined) clean.description = updates.description;
  if (updates.status !== undefined) clean.status = updates.status;
  if (updates.coAuthors !== undefined) clean.coAuthors = updates.coAuthors;
  await ref.update(clean);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Curso no encontrado");
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

/** Lock de edición por lección: { [lessonId]: { userId, userName, since } } */
export async function setLessonEditingLock(
  courseId: string,
  lessonId: string,
  userId: string,
  userName: string
): Promise<void> {
  const ref = db().collection("courses").doc(courseId);
  await ref.update({
    [`editingLocks.${lessonId}`]: {
      userId,
      userName,
      since: FieldValue.serverTimestamp(),
    },
    updated_at: new Date().toISOString(),
  });
}

export async function clearLessonEditingLock(courseId: string, lessonId: string): Promise<void> {
  const ref = db().collection("courses").doc(courseId);
  await ref.update({
    [`editingLocks.${lessonId}`]: FieldValue.delete(),
    updated_at: new Date().toISOString(),
  });
}

// --- Modules ---
export async function getModules(courseId: string) {
  const snap = await db().collection("modules").where("course_id", "==", courseId).orderBy("order_index", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
}

export async function getModule(moduleId: string) {
  const doc = await db().collection("modules").doc(moduleId).get();
  if (!doc.exists) throw new Error("Módulo no encontrado");
  return { id: doc.id, ...doc.data() } as Record<string, unknown>;
}

export async function createModule(
  courseId: string,
  title: string,
  orderIndex: number,
  status: PublishStatus = "draft",
  description?: string | null
) {
  const ref = db().collection("modules").doc();
  const now = new Date().toISOString();
  await ref.set({
    course_id: courseId,
    title,
    order_index: orderIndex,
    description: description ?? null,
    status,
    created_at: now,
    updated_at: now,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

export async function updateModule(
  moduleId: string,
  updates: {
    title?: string;
    description?: string | null;
    order_index?: number;
    status?: PublishStatus;
    requiresCompletion?: string[];
    requiresQuiz?: string[];
    visibilityMode?: "locked" | "preview" | "full";
    bibliography?: unknown[];
    podcasts?: unknown[];
    videos?: unknown[];
    liveRecording?: unknown;
    /** Objetivos de aprendizaje (landing por módulo). */
    objectives?: string[];
    /** Recompensa/insignia al completar el módulo. */
    reward_label?: string | null;
  }
) {
  const ref = db().collection("modules").doc(moduleId);
  const clean: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(updates)) {
    if (v !== undefined) clean[k] = v;
  }
  await ref.update(clean);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Módulo no encontrado");
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

/** Módulo anterior en el curso (por order_index). */
export async function getPreviousModule(courseId: string, currentModuleId: string): Promise<Record<string, unknown> | null> {
  const modules = await getModules(courseId);
  const sorted = modules.sort((a, b) => (a.order_index as number) - (b.order_index as number));
  const idx = sorted.findIndex((m) => m.id === currentModuleId);
  if (idx <= 0) return null;
  return sorted[idx - 1] ?? null;
}

/** True si el usuario completó todas las lecciones publicadas del módulo. */
export async function isModuleCompleted(userId: string, courseId: string, moduleId: string): Promise<boolean> {
  const lessons = await getLessons(moduleId);
  const published = lessons.filter((l) => l.status === "published");
  if (published.length === 0) return true;
  const progress = await firebaseProgress.getProgress(userId, courseId);
  const completed = new Set(progress.completedLessonIds);
  return published.every((l) => completed.has(l.id as string));
}

export async function deleteModule(moduleId: string) {
  await db().collection("modules").doc(moduleId).delete();
}

// --- Lessons ---
export async function getLessons(moduleId: string) {
  const snap = await db().collection("lessons").where("module_id", "==", moduleId).orderBy("order_index", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
}

export async function getLesson(lessonId: string) {
  const doc = await db().collection("lessons").doc(lessonId).get();
  if (!doc.exists) throw new Error("Lección no encontrada");
  return { id: doc.id, ...doc.data() } as Record<string, unknown>;
}

export async function createLesson(
  moduleId: string,
  payload: {
    title: string;
    summary: string;
    content: string;
    video_embed_url?: string | null;
    estimated_minutes?: number | null;
    order_index: number;
    status: PublishStatus;
    source_community?: boolean;
    proposal_id?: string | null;
    community_author_id?: string | null;
  }
) {
  const ref = db().collection("lessons").doc();
  const now = new Date().toISOString();
  await ref.set({
    module_id: moduleId,
    title: payload.title,
    summary: payload.summary ?? "",
    content: payload.content ?? "",
    video_embed_url: payload.video_embed_url ?? null,
    estimated_minutes: payload.estimated_minutes ?? null,
    order_index: payload.order_index,
    status: payload.status ?? "draft",
    source_community: payload.source_community ?? false,
    proposal_id: payload.proposal_id ?? null,
    community_author_id: payload.community_author_id ?? null,
    created_at: now,
    updated_at: now,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

export async function updateLesson(
  lessonId: string,
  updates: Partial<{
    title: string;
    summary: string;
    content: string;
    video_embed_url: string | null;
    estimated_minutes: number | null;
    order_index: number;
    status: PublishStatus;
    h5p_content_id: string | null;
    blocks: unknown[];
    competencias: { id: string; nivel: string }[];
    subtitulosUrl: string | null;
    subtitulosGenerados: boolean;
  }>
) {
  const ref = db().collection("lessons").doc(lessonId);
  await ref.update({
    ...updates,
    updated_at: new Date().toISOString(),
  });
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Lección no encontrada");
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

export async function deleteLesson(lessonId: string) {
  await db().collection("lessons").doc(lessonId).delete();
}

// --- Cohort courses ---
export async function getCohortCoursesByCourse(courseId: string) {
  const snap = await db().collection("cohort_courses").where("course_id", "==", courseId).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
}

export async function assignCourseToCohort(courseId: string, cohortId: string, isPrimary = true) {
  const ref = db().collection("cohort_courses").doc();
  await ref.set({
    course_id: courseId,
    cohort_id: cohortId,
    is_primary: isPrimary,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

export async function unassignCourseFromCohort(cohortId: string, courseId: string) {
  const snap = await db().collection("cohort_courses").where("course_id", "==", courseId).where("cohort_id", "==", cohortId).get();
  const batch = db().batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// --- Enrollments (for /api/enroll/status, /api/curso) ---
export async function getActiveEnrollmentForUser(uid: string): Promise<{ cohort_id: string } | null> {
  const snap = await db()
    .collection("enrollments")
    .where("user_id", "==", uid)
    .where("status", "==", "active")
    .get();
  if (snap.empty) return null;
  const sorted = snap.docs.sort((a, b) => {
    const at = (a.data().created_at as { toMillis?: () => number } | string) ?? 0;
    const bt = (b.data().created_at as { toMillis?: () => number } | string) ?? 0;
    const atMs = typeof at === "object" && at?.toMillis ? at.toMillis() : typeof at === "string" ? new Date(at).getTime() : 0;
    const btMs = typeof bt === "object" && bt?.toMillis ? bt.toMillis() : typeof bt === "string" ? new Date(bt).getTime() : 0;
    return btMs - atMs;
  });
  const d = sorted[0].data();
  return { cohort_id: d.cohort_id as string };
}

/** Lista user_id de alumnos activos en un grupo (para emparejamiento). */
export async function listActiveEnrollmentUserIdsInCohort(cohortId: string): Promise<string[]> {
  const snap = await db()
    .collection("enrollments")
    .where("cohort_id", "==", cohortId)
    .where("status", "==", "active")
    .get();
  return snap.docs.map((d) => d.data().user_id as string).filter(Boolean);
}

export async function getPrimaryCourseForCohort(cohortId: string): Promise<string | null> {
  let snap = await db().collection("cohort_courses").where("cohort_id", "==", cohortId).where("is_primary", "==", true).limit(1).get();
  if (!snap.empty) return snap.docs[0].data().course_id as string;
  snap = await db().collection("cohort_courses").where("cohort_id", "==", cohortId).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data().course_id as string;
}

// --- Cohorts (for admin) ---
export async function listCohorts() {
  const snap = await db().collection("cohorts").orderBy("created_at", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
}

// --- Published content for /curso (alumno) ---
export async function getPublishedCourse(courseId: string): Promise<{ id: string; title: string; description: string | null } | null> {
  const doc = await db().collection("courses").doc(courseId).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  if (d.status !== "published") return null;
  return { id: doc.id, title: d.title as string, description: (d.description as string) ?? null };
}

export async function getPublishedModules(courseId: string): Promise<{ id: string; title: string; description: string | null; order_index: number }[]> {
  const snap = await db().collection("modules").where("course_id", "==", courseId).where("status", "==", "published").orderBy("order_index", "asc").get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title as string,
      description: (data.description as string) ?? null,
      order_index: (data.order_index as number) ?? 0,
    };
  });
}

export async function getPublishedLessons(moduleIds: string[]): Promise<{ id: string; title: string; summary: string; estimated_minutes: number | null; order_index: number; module_id: string; source_community?: boolean }[]> {
  if (moduleIds.length === 0) return [];
  const out: { id: string; title: string; summary: string; estimated_minutes: number | null; order_index: number; module_id: string; source_community?: boolean }[] = [];
  for (const mid of moduleIds) {
    const snap = await db().collection("lessons").where("module_id", "==", mid).where("status", "==", "published").orderBy("order_index", "asc").get();
    snap.docs.forEach((d) => {
      const data = d.data();
      out.push({
        id: d.id,
        title: data.title as string,
        summary: (data.summary as string) ?? "",
        estimated_minutes: (data.estimated_minutes as number) ?? null,
        order_index: (data.order_index as number) ?? 0,
        module_id: mid,
        source_community: (data.source_community as boolean) ?? false,
      });
    });
  }
  out.sort((a, b) => {
    const ai = moduleIds.indexOf(a.module_id);
    const bi = moduleIds.indexOf(b.module_id);
    if (ai !== bi) return ai - bi;
    return a.order_index - b.order_index;
  });
  return out;
}

// --- Permission helpers (module/lesson belong to editable course) ---
export async function canEditModule(moduleId: string, userId: string, role: string): Promise<boolean> {
  const mod = await getModule(moduleId).catch(() => null);
  if (!mod) return false;
  const courseId = mod.course_id as string;
  const ids = await getEditableCourseIds(userId, role);
  return ids.includes(courseId);
}

export async function canEditLesson(lessonId: string, userId: string, role: string): Promise<boolean> {
  const lesson = await getLesson(lessonId).catch(() => null);
  if (!lesson) return false;
  const moduleId = lesson.module_id as string;
  return canEditModule(moduleId, userId, role);
}

// --- Cohorts (create, get one) ---
export async function getCohort(cohortId: string) {
  const doc = await db().collection("cohorts").doc(cohortId).get();
  if (!doc.exists) throw new Error("Grupo no encontrado");
  return { id: doc.id, ...doc.data() } as Record<string, unknown>;
}

export async function createCohort(payload: {
  name: string;
  description?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string;
  capacity?: number;
  is_active?: boolean;
}) {
  const ref = db().collection("cohorts").doc();
  const now = new Date().toISOString();
  await ref.set({
    name: payload.name,
    description: payload.description ?? null,
    starts_at: payload.starts_at ?? null,
    ends_at: payload.ends_at ?? null,
    timezone: payload.timezone ?? "UTC",
    capacity: payload.capacity ?? 0,
    is_active: payload.is_active !== false,
    created_at: now,
    updated_at: now,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateCohortInviteCode6(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  return s;
}

function computeCohortEstado(fechaInicio: Date, fechaFin: Date): CohortEstado {
  const now = new Date();
  if (now < fechaInicio) return "proxima";
  if (now > fechaFin) return "finalizada";
  return "activa";
}

/** Crea un grupo con el modelo BRECHA 4 (nombre, courseId, facilitadorId, fechas, estado, codigoInvitacion 6 chars, config). */
export async function createCohortV2(payload: {
  nombre: string;
  courseId: string;
  facilitadorId: string;
  fechaInicio: Date;
  fechaFin: Date;
  configuracion?: Partial<CohortConfiguracion>;
}) {
  const firestore = db();
  const ref = firestore.collection("cohorts").doc();
  const ts = (d: Date) => Timestamp.fromDate(d);
  const fechaInicio = payload.fechaInicio;
  const fechaFin = payload.fechaFin;
  const estado = computeCohortEstado(fechaInicio, fechaFin);
  const config: CohortConfiguracion = {
    permitirAutoInscripcion: payload.configuracion?.permitirAutoInscripcion ?? false,
    maxAlumnos: payload.configuracion?.maxAlumnos ?? 0,
    esPrivada: payload.configuracion?.esPrivada ?? true,
  };
  let codigoInvitacion = generateCohortInviteCode6();
  for (let attempt = 0; attempt < 20; attempt++) {
    const existing = await firestore.collection("cohorts").where("codigoInvitacion", "==", codigoInvitacion).limit(1).get();
    if (existing.empty) break;
    codigoInvitacion = generateCohortInviteCode6();
  }
  const now = new Date().toISOString();
  await ref.set({
    nombre: payload.nombre,
    courseId: payload.courseId,
    facilitadorId: payload.facilitadorId,
    fechaInicio: ts(fechaInicio),
    fechaFin: ts(fechaFin),
    estado,
    alumnos: [],
    codigoInvitacion,
    limiteFechasPorModulo: {},
    configuracion: config,
    name: payload.nombre,
    created_at: now,
    updated_at: now,
    is_active: true,
  });
  await assignCourseToCohort(payload.courseId, ref.id, true);
  await firestore.collection("cohort_members").doc().set({
    cohort_id: ref.id,
    user_id: payload.facilitadorId,
    role: "mentor",
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

/** Busca grupo por código de invitación de 6 caracteres. */
export async function getCohortByCodigoInvitacion(code: string): Promise<Record<string, unknown> | null> {
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== 6) return null;
  const snap = await db().collection("cohorts").where("codigoInvitacion", "==", normalized).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Record<string, unknown>;
}

/** Canjea código de 6 caracteres (codigoInvitacion del grupo). Añade enrollment y actualiza cohort.alumnos. */
export async function redeemCohortCode(code: string, userId: string): Promise<{ cohortId: string }> {
  const cohort = await getCohortByCodigoInvitacion(code);
  if (!cohort) throw new Error("Código no válido");
  const config = (cohort.configuracion as CohortConfiguracion) ?? {};
  if (!config.permitirAutoInscripcion) throw new Error("Este grupo no permite autoinscripción con código");
  const maxAlumnos = config.maxAlumnos ?? 0;
  const alumnos = (cohort.alumnos as string[]) ?? [];
  if (maxAlumnos > 0 && alumnos.length >= maxAlumnos) throw new Error("El grupo ha alcanzado el límite de alumnos");
  const cohortId = cohort.id as string;
  const already = await db().collection("enrollments").where("user_id", "==", userId).where("cohort_id", "==", cohortId).limit(1).get();
  if (!already.empty) return { cohortId };
  await db().collection("enrollments").doc().set({
    user_id: userId,
    cohort_id: cohortId,
    status: "active",
    created_at: new Date(),
  });
  await db().collection("cohorts").doc(cohortId).update({
    alumnos: [...alumnos, userId],
    updated_at: new Date().toISOString(),
  });
  return { cohortId };
}

/** Progreso por alumno: userId, displayName, progressPct (0–100). */
export async function listCohortAlumnosWithProgress(cohortId: string): Promise<{ userId: string; displayName: string | null; progressPct: number }[]> {
  const cohortDoc = await db().collection("cohorts").doc(cohortId).get();
  if (!cohortDoc.exists) return [];
  const cohort = cohortDoc.data()!;
  let courseId = cohort.courseId as string | undefined;
  if (!courseId) {
    const primary = await getPrimaryCourseForCohort(cohortId);
    if (!primary) return [];
    courseId = primary;
  }
  let alumnos = (cohort.alumnos as string[] | undefined) ?? [];
  if (alumnos.length === 0) {
    alumnos = await listActiveEnrollmentUserIdsInCohort(cohortId);
  }
  const modules = await getPublishedModules(courseId);
  const allLessons = await getPublishedLessons(modules.map((m) => m.id));
  const totalLessons = allLessons.length;
  const result: { userId: string; displayName: string | null; progressPct: number }[] = [];
  for (const uid of alumnos) {
    const progress = await firebaseProgress.getProgress(uid, courseId);
    const done = progress.completedLessonIds.length;
    const pct = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
    const profile = await profileService.getProfile(uid).catch(() => null);
    result.push({
      userId: uid,
      displayName: profile?.fullName ?? null,
      progressPct: pct,
    });
  }
  return result;
}

/** Ranking del grupo por % avance (desc). */
export async function getCohortRanking(cohortId: string): Promise<{ userId: string; displayName: string | null; progressPct: number; rank: number }[]> {
  const list = await listCohortAlumnosWithProgress(cohortId);
  list.sort((a, b) => b.progressPct - a.progressPct);
  return list.map((row, i) => ({ ...row, rank: i + 1 }));
}

// --- Cohort-courses by cohort (for admin UI) ---
export async function getCohortCoursesByCohort(cohortId: string): Promise<{ cohortCourses: Record<string, unknown>[]; courses: Record<string, unknown>[] }> {
  const linksSnap = await db().collection("cohort_courses").where("cohort_id", "==", cohortId).get();
  const cohortCourses = linksSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
  const courseIds = Array.from(new Set(cohortCourses.map((l) => (l as { course_id: string }).course_id)));
  const courses: Record<string, unknown>[] = [];
  for (const cid of courseIds) {
    const doc = await db().collection("courses").doc(cid).get();
    if (doc.exists) courses.push({ id: doc.id, ...doc.data() });
  }
  return { cohortCourses, courses };
}

// --- Invitations ---
export async function listInvitations(cohortId: string) {
  const snap = await db().collection("invitations").where("cohort_id", "==", cohortId).get();
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
  list.sort((a, b) => {
    const at = (a.created_at as { toMillis?: () => number } | string) ?? 0;
    const bt = (b.created_at as { toMillis?: () => number } | string) ?? 0;
    const atMs = typeof at === "object" && at?.toMillis ? at.toMillis() : typeof at === "string" ? new Date(at).getTime() : 0;
    const btMs = typeof bt === "object" && bt?.toMillis ? bt.toMillis() : typeof bt === "string" ? new Date(bt).getTime() : 0;
    return btMs - atMs;
  });
  return list;
}

function generateInvitationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  s += "-";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function createInvitation(
  cohortId: string,
  createdBy: string,
  options: { max_uses?: number; expires_at?: string | null; is_active?: boolean }
) {
  let code = generateInvitationCode();
  for (let attempt = 0; attempt < 10; attempt++) {
    const existing = await db().collection("invitations").where("code", "==", code).limit(1).get();
    if (existing.empty) break;
    code = generateInvitationCode();
  }
  const ref = db().collection("invitations").doc();
  const now = new Date();
  await ref.set({
    code,
    cohort_id: cohortId,
    max_uses: options.max_uses ?? 1,
    uses: 0,
    expires_at: options.expires_at ?? null,
    is_active: options.is_active !== false,
    created_by: createdBy,
    created_at: now,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

export async function getInvitationByCode(code: string): Promise<Record<string, unknown> | null> {
  const snap = await db().collection("invitations").where("code", "==", code.toUpperCase()).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Record<string, unknown>;
}

export async function redeemInvitation(code: string, userId: string): Promise<{ cohortId: string }> {
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length === 6) {
    try {
      return await redeemCohortCode(trimmed, userId);
    } catch {
      throw new Error("Código no válido o el grupo no permite inscripción");
    }
  }
  const inv = await getInvitationByCode(code);
  if (!inv) throw new Error("Código no válido");
  if (!(inv.is_active as boolean)) throw new Error("La invitación no está activa");
  const uses = (inv.uses as number) ?? 0;
  const maxUses = (inv.max_uses as number) ?? 1;
  if (uses >= maxUses) throw new Error("No quedan usos disponibles para este código");
  const expiresAt = inv.expires_at as string | null;
  if (expiresAt && new Date(expiresAt) < new Date()) throw new Error("El código ha caducado");
  const cohortId = inv.cohort_id as string;
  const cohortDoc = await db().collection("cohorts").doc(cohortId).get();
  if (!cohortDoc.exists) throw new Error("El grupo no existe");
  const cohortData = cohortDoc.data()!;
  if (cohortData.is_active === false) throw new Error("El grupo no está activo");

  const enrollmentRef = db().collection("enrollments").doc();
  await enrollmentRef.set({
    user_id: userId,
    cohort_id: cohortId,
    status: "active",
    created_at: new Date(),
  });
  const alumnos = (cohortData.alumnos as string[]) ?? [];
  if (!alumnos.includes(userId)) {
    await db().collection("cohorts").doc(cohortId).update({
      alumnos: [...alumnos, userId],
      updated_at: new Date().toISOString(),
    });
  }
  await db().collection("invitations").doc(inv.id as string).update({
    uses: (inv.uses as number) + 1,
  });
  return { cohortId };
}

// --- Editable courses for mentor/admin/co-author ---
export async function getEditableCourseIds(userId: string, role: string): Promise<string[]> {
  const courseIds = new Set<string>();
  if (role === "admin") {
    const snap = await db().collection("courses").orderBy("updated_at", "desc").get();
    snap.docs.forEach((d) => courseIds.add(d.id));
  }
  if (role === "mentor") {
    const membersSnap = await db().collection("cohort_members").where("user_id", "==", userId).where("role", "==", "mentor").get();
    const cohortIds = membersSnap.docs.map((d) => d.data().cohort_id as string);
    if (cohortIds.length > 0) {
      const linksSnap = await db().collection("cohort_courses").get();
      linksSnap.docs.forEach((d) => {
        const data = d.data();
        if (cohortIds.includes(data.cohort_id as string)) courseIds.add(data.course_id as string);
      });
    }
  }
  const coAuthoredSnap = await db().collection("courses").where("coAuthors", "array-contains", userId).get();
  coAuthoredSnap.docs.forEach((d) => courseIds.add(d.id));
  return Array.from(courseIds);
}
