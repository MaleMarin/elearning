/**
 * "Sabías que..." — Hallazgos del trabajo real por módulo.
 * Alumno comparte texto corto (máx 300 chars) + opcional institución.
 * Reacciones: 👍 (like) o ❤️ (love). Admin puede destacar.
 *
 * Firestore: /module_insights/{moduleId}/items/{itemId}
 *   - userId, userName, text, institution?, createdAt, likes, loves, isHighlighted
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const MAX_TEXT = 300;

export interface InsightItem {
  id: string;
  userId: string;
  userName: string;
  text: string;
  institution: string | null;
  createdAt: string;
  likes: number;
  loves: number;
  isHighlighted: boolean;
}

const COLLECTION = "module_insights";

function db() {
  return getFirebaseAdminFirestore();
}

function itemsRef(moduleId: string) {
  return db().collection(COLLECTION).doc(moduleId).collection("items");
}

export async function listInsights(moduleId: string): Promise<InsightItem[]> {
  try {
    const snap = await itemsRef(moduleId)
      .orderBy("isHighlighted", "desc")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: (data.userId as string) ?? "",
        userName: (data.userName as string) ?? "Alumno",
        text: (data.text as string) ?? "",
        institution: (data.institution as string) ?? null,
        createdAt: (data.createdAt as string) ?? "",
        likes: (data.likes as number) ?? 0,
        loves: (data.loves as number) ?? 0,
        isHighlighted: (data.isHighlighted as boolean) ?? false,
      };
    });
  } catch {
    return [];
  }
}

export async function createInsight(
  moduleId: string,
  userId: string,
  userName: string,
  text: string,
  institution?: string | null
): Promise<InsightItem> {
  const trimmed = text.trim().slice(0, MAX_TEXT);
  if (!trimmed) throw new Error("Texto requerido");
  const ref = itemsRef(moduleId).doc();
  const now = new Date().toISOString();
  await ref.set({
    userId,
    userName: userName.trim() || "Alumno",
    text: trimmed,
    institution: (institution?.trim() ?? null) || null,
    createdAt: now,
    likes: 0,
    loves: 0,
    isHighlighted: false,
  });
  const snap = await ref.get();
  const data = snap.data()!;
  return {
    id: snap.id,
    userId: (data.userId as string) ?? userId,
    userName: (data.userName as string) ?? "Alumno",
    text: (data.text as string) ?? "",
    institution: (data.institution as string) ?? null,
    createdAt: (data.createdAt as string) ?? now,
    likes: 0,
    loves: 0,
    isHighlighted: false,
  };
}

export async function react(
  moduleId: string,
  itemId: string,
  reaction: "like" | "love",
  delta: 1 | -1
): Promise<void> {
  const ref = itemsRef(moduleId).doc(itemId);
  const doc = await ref.get();
  if (!doc.exists) return;
  const data = doc.data()!;
  const likes = ((data.likes as number) ?? 0) + (reaction === "like" ? delta : 0);
  const loves = ((data.loves as number) ?? 0) + (reaction === "love" ? delta : 0);
  await ref.update({ likes: Math.max(0, likes), loves: Math.max(0, loves) });
}

export async function setHighlighted(moduleId: string, itemId: string, highlighted: boolean): Promise<void> {
  await itemsRef(moduleId).doc(itemId).update({ isHighlighted: highlighted });
}
