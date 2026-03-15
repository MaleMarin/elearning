/**
 * Show & Tell semanal: alumno comparte cómo aplicó lo aprendido.
 * Video 2 min (Loom URL) o texto máx 400 chars. Comentarios máx 200 chars.
 * Admin puede destacar.
 *
 * Firestore: /show_tell/{cohortId}/posts/{postId}
 *   - userId, userName, type: "video" | "text"
 *   - videoUrl?: string, textContent?: string
 *   - weekLabel: string (ej. "2025-W12"), createdAt, isHighlighted
 * Subcollection: .../posts/{postId}/comments/{commentId}
 *   - userId, userName, text (max 200), createdAt
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const MAX_TEXT = 400;
const MAX_COMMENT = 200;

export interface ShowTellPost {
  id: string;
  userId: string;
  userName: string;
  type: "video" | "text";
  videoUrl?: string | null;
  textContent?: string | null;
  weekLabel: string;
  createdAt: string;
  isHighlighted: boolean;
}

export interface ShowTellComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

const COLLECTION = "show_tell";

function db() {
  return getFirebaseAdminFirestore();
}

function postsRef(cohortId: string) {
  return db().collection(COLLECTION).doc(cohortId).collection("posts");
}

export function getWeekLabel(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 4);
  const first = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - first.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function listPosts(cohortId: string, limit = 50): Promise<ShowTellPost[]> {
  try {
    const snap = await postsRef(cohortId).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: (data.userId as string) ?? "",
        userName: (data.userName as string) ?? "Alumno",
        type: (data.type as "video" | "text") ?? "text",
        videoUrl: (data.videoUrl as string) ?? null,
        textContent: (data.textContent as string) ?? null,
        weekLabel: (data.weekLabel as string) ?? "",
        createdAt: (data.createdAt as string) ?? "",
        isHighlighted: (data.isHighlighted as boolean) ?? false,
      };
    });
  } catch {
    return [];
  }
}

export async function createPost(
  cohortId: string,
  userId: string,
  userName: string,
  payload: { type: "video"; videoUrl: string } | { type: "text"; textContent: string }
): Promise<ShowTellPost> {
  const ref = postsRef(cohortId).doc();
  const now = new Date().toISOString();
  const weekLabel = getWeekLabel();
  const data: Record<string, unknown> = {
    userId,
    userName: userName.trim() || "Alumno",
    type: payload.type,
    weekLabel,
    createdAt: now,
    isHighlighted: false,
  };
  if (payload.type === "video") {
    data.videoUrl = payload.videoUrl.trim();
    data.textContent = null;
  } else {
    data.textContent = payload.textContent.trim().slice(0, MAX_TEXT);
    data.videoUrl = null;
  }
  await ref.set(data);
  const snap = await ref.get();
  const d = snap.data()!;
  return {
    id: snap.id,
    userId: (d.userId as string) ?? userId,
    userName: (d.userName as string) ?? "Alumno",
    type: (d.type as "video" | "text") ?? "text",
    videoUrl: (d.videoUrl as string) ?? null,
    textContent: (d.textContent as string) ?? null,
    weekLabel: (d.weekLabel as string) ?? weekLabel,
    createdAt: (d.createdAt as string) ?? now,
    isHighlighted: false,
  };
}

export async function listComments(cohortId: string, postId: string): Promise<ShowTellComment[]> {
  try {
    const snap = await postsRef(cohortId).doc(postId).collection("comments").orderBy("createdAt", "asc").get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: (data.userId as string) ?? "",
        userName: (data.userName as string) ?? "Alumno",
        text: (data.text as string) ?? "",
        createdAt: (data.createdAt as string) ?? "",
      };
    });
  } catch {
    return [];
  }
}

export async function addComment(
  cohortId: string,
  postId: string,
  userId: string,
  userName: string,
  text: string
): Promise<ShowTellComment> {
  const trimmed = text.trim().slice(0, MAX_COMMENT);
  if (!trimmed) throw new Error("Comentario vacío");
  const ref = postsRef(cohortId).doc(postId).collection("comments").doc();
  const now = new Date().toISOString();
  await ref.set({
    userId,
    userName: userName.trim() || "Alumno",
    text: trimmed,
    createdAt: now,
  });
  const snap = await ref.get();
  const d = snap.data()!;
  return {
    id: snap.id,
    userId: (d.userId as string) ?? userId,
    userName: (d.userName as string) ?? "Alumno",
    text: (d.text as string) ?? "",
    createdAt: (d.createdAt as string) ?? now,
  };
}

export async function setPostHighlighted(cohortId: string, postId: string, highlighted: boolean): Promise<void> {
  await postsRef(cohortId).doc(postId).update({ isHighlighted: highlighted });
}
