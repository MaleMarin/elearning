/**
 * Almacenamiento de moderación en Firestore.
 * Cola de revisión, historial de decisiones, baneos y reportes.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { NivelModeracion } from "./moderacion";

const COLLECTION_QUEUE = "moderationQueue";
const COLLECTION_HISTORY = "moderationHistory";
const COLLECTION_BANS = "userBans";
const COLLECTION_REPORTS = "contentReports";
const COLLECTION_HIDDEN = "hiddenContent";

export type ModerationSource = "comunidad_post" | "comunidad_comment" | "glosario_term" | "showntell_submission";

export interface ModerationQueueItem {
  id: string;
  source: ModerationSource;
  contentId: string;
  authorId: string;
  authorEmail?: string;
  texto: string;
  nivel: NivelModeracion;
  razon: string;
  createdAt: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolution?: "aprobado" | "rechazado" | null;
}

export interface ModerationHistoryItem {
  id: string;
  source: ModerationSource;
  contentId: string;
  authorId: string;
  texto: string;
  nivel: NivelModeracion;
  razon: string;
  decision: "bloqueado" | "aprobado" | "revisado_aprobado" | "revisado_rechazado";
  decidedBy: string;
  decidedAt: Date;
}

export interface UserBan {
  userId: string;
  reason: string;
  bannedUntil: Date;
  bannedBy: string;
  createdAt: Date;
}

function db() {
  return getFirebaseAdminFirestore();
}

function toDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === "function") return (v as { toDate: () => Date }).toDate();
  if (typeof v === "string") return new Date(v);
  return v instanceof Date ? v : null;
}

/** Añade un ítem a la cola de revisión (nivel === "revision"). */
export async function addToModerationQueue(params: {
  source: ModerationSource;
  contentId: string;
  authorId: string;
  authorEmail?: string;
  texto: string;
  nivel: NivelModeracion;
  razon: string;
}): Promise<string> {
  const ref = db().collection(COLLECTION_QUEUE).doc();
  await ref.set({
    source: params.source,
    contentId: params.contentId,
    authorId: params.authorId,
    authorEmail: params.authorEmail ?? null,
    texto: (params.texto ?? "").slice(0, 4000),
    nivel: params.nivel,
    razon: (params.razon ?? "").slice(0, 500),
    createdAt: new Date(),
    resolvedAt: null,
    resolvedBy: null,
    resolution: null,
  });
  return ref.id;
}

/** Registra en historial (bloqueado o para auditoría). */
export async function addToModerationHistory(params: {
  source: ModerationSource;
  contentId: string;
  authorId: string;
  texto: string;
  nivel: NivelModeracion;
  razon: string;
  decision: ModerationHistoryItem["decision"];
  decidedBy: string;
}): Promise<string> {
  const ref = db().collection(COLLECTION_HISTORY).doc();
  await ref.set({
    ...params,
    texto: (params.texto ?? "").slice(0, 4000),
    razon: (params.razon ?? "").slice(0, 500),
    decidedAt: new Date(),
  });
  return ref.id;
}

/** Lista la cola de contenido en revisión (sin resolver). */
export async function listModerationQueue(limit = 50): Promise<ModerationQueueItem[]> {
  const snap = await db()
    .collection(COLLECTION_QUEUE)
    .orderBy("createdAt", "desc")
    .limit(limit * 2)
    .get();

  const items = snap.docs
    .map((d) => {
    const data = d.data();
    return {
      id: d.id,
      source: (data.source as ModerationSource) ?? "comunidad_post",
      contentId: (data.contentId as string) ?? "",
      authorId: (data.authorId as string) ?? "",
      authorEmail: (data.authorEmail as string) ?? undefined,
      texto: (data.texto as string) ?? "",
      nivel: (data.nivel as NivelModeracion) ?? "revision",
      razon: (data.razon as string) ?? "",
      createdAt: toDate(data.createdAt) ?? new Date(),
      resolvedAt: toDate(data.resolvedAt),
      resolvedBy: (data.resolvedBy as string) ?? null,
      resolution: (data.resolution as "aprobado" | "rechazado") ?? null,
    };
  })
    .filter((x) => x.resolvedAt == null)
    .slice(0, limit);
  return items;
}

/** Obtiene un ítem de la cola por id. */
export async function getQueueItem(queueId: string): Promise<ModerationQueueItem | null> {
  const doc = await db().collection(COLLECTION_QUEUE).doc(queueId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    source: (data.source as ModerationSource) ?? "comunidad_post",
    contentId: (data.contentId as string) ?? "",
    authorId: (data.authorId as string) ?? "",
    authorEmail: (data.authorEmail as string) ?? undefined,
    texto: (data.texto as string) ?? "",
    nivel: (data.nivel as NivelModeracion) ?? "revision",
    razon: (data.razon as string) ?? "",
    createdAt: toDate(data.createdAt) ?? new Date(),
    resolvedAt: toDate(data.resolvedAt),
    resolvedBy: (data.resolvedBy as string) ?? null,
    resolution: (data.resolution as "aprobado" | "rechazado") ?? null,
  };
}

/** Resuelve un ítem de la cola (aprobado o rechazado) y registra en historial. */
export async function resolveQueueItem(
  queueId: string,
  resolution: "aprobado" | "rechazado",
  decidedBy: string
): Promise<void> {
  const item = await getQueueItem(queueId);
  if (item) {
    await addToModerationHistory({
      source: item.source,
      contentId: item.contentId,
      authorId: item.authorId,
      texto: item.texto,
      nivel: item.nivel,
      razon: item.razon,
      decision: resolution === "aprobado" ? "revisado_aprobado" : "revisado_rechazado",
      decidedBy,
    });
  }
  const ref = db().collection(COLLECTION_QUEUE).doc(queueId);
  await ref.update({
    resolvedAt: new Date(),
    resolvedBy: decidedBy,
    resolution,
  });
}

/** Lista historial de decisiones (últimos N). */
export async function listModerationHistory(limit = 100): Promise<ModerationHistoryItem[]> {
  const snap = await db()
    .collection(COLLECTION_HISTORY)
    .orderBy("decidedAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      source: (data.source as ModerationSource) ?? "comunidad_post",
      contentId: (data.contentId as string) ?? "",
      authorId: (data.authorId as string) ?? "",
      texto: (data.texto as string) ?? "",
      nivel: (data.nivel as NivelModeracion) ?? "revision",
      razon: (data.razon as string) ?? "",
      decision: (data.decision as ModerationHistoryItem["decision"]) ?? "aprobado",
      decidedBy: (data.decidedBy as string) ?? "",
      decidedAt: toDate(data.decidedAt) ?? new Date(),
    };
  });
}

/** Comprueba si el usuario está baneado. */
export async function isUserBanned(userId: string): Promise<boolean> {
  const snap = await db()
    .collection(COLLECTION_BANS)
    .where("userId", "==", userId)
    .where("bannedUntil", ">", new Date())
    .limit(1)
    .get();
  return !snap.empty;
}

/** Banea a un usuario hasta una fecha. */
export async function banUser(userId: string, reason: string, bannedUntil: Date, bannedBy: string): Promise<void> {
  await db().collection(COLLECTION_BANS).doc().set({
    userId,
    reason: (reason ?? "").slice(0, 500),
    bannedUntil,
    bannedBy,
    createdAt: new Date(),
  });
}

/** Lista baneos activos. */
export async function listActiveBans(): Promise<UserBan[]> {
  const snap = await db()
    .collection(COLLECTION_BANS)
    .where("bannedUntil", ">", new Date())
    .orderBy("bannedUntil", "desc")
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: (data.userId as string) ?? "",
      reason: (data.reason as string) ?? "",
      bannedUntil: toDate(data.bannedUntil) ?? new Date(),
      bannedBy: (data.bannedBy as string) ?? "",
      createdAt: toDate(data.createdAt) ?? new Date(),
    };
  });
}

/** Clave de contenido para reportes/ocultar (ej. community_post:uuid). */
function contentKey(source: string, contentId: string): string {
  return `${source}:${contentId}`;
}

/** Añade un reporte. Si llega a 3, marca contenido como oculto. */
export async function addReport(
  source: ModerationSource,
  contentId: string,
  userId: string,
  reason: string
): Promise<{ reportCount: number; hidden: boolean }> {
  const key = contentKey(source, contentId);
  const ref = db().collection(COLLECTION_REPORTS).doc(key);
  const doc = await ref.get();
  const reports: { userId: string; reason: string; createdAt: Date }[] = doc.exists ? (doc.data()?.reports ?? []) : [];
  if (reports.some((r) => r.userId === userId)) {
    return { reportCount: reports.length, hidden: false };
  }
  reports.push({
    userId,
    reason: (reason ?? "").slice(0, 300),
    createdAt: new Date(),
  });
  await ref.set({ contentId, source, reports, updatedAt: new Date() }, { merge: true });

  const count = reports.length;
  let hidden = false;
  if (count >= 3) {
    await db().collection(COLLECTION_HIDDEN).doc(key).set({ hiddenAt: new Date(), reason: "3_reportes" });
    hidden = true;
  }
  return { reportCount: count, hidden };
}

/** Indica si el contenido está oculto por reportes. */
export async function isContentHidden(source: ModerationSource, contentId: string): Promise<boolean> {
  const key = contentKey(source, contentId);
  const doc = await db().collection(COLLECTION_HIDDEN).doc(key).get();
  return doc.exists && (doc.data()?.hiddenAt != null);
}

/** Lista de IDs ocultos para filtrar (ej. en GET posts). */
export async function getHiddenContentIds(source: ModerationSource, contentIds: string[]): Promise<Set<string>> {
  const hidden = new Set<string>();
  await Promise.all(
    contentIds.map(async (id) => {
      if (await isContentHidden(source, id)) hidden.add(id);
    })
  );
  return hidden;
}
