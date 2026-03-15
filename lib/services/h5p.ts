/**
 * Contenido H5P-like: guardado en Firestore y opcionalmente en Storage.
 * Tipos soportados: interactive_video, flashcards, quiz, image_hotspot.
 * Compatible con reproductor propio; integración @lumieducation/h5p-react
 * puede añadirse cuando exista un servidor H5P.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getFirebaseAdminStorage } from "@/lib/firebase/admin";

const COLLECTION = "h5p_content";

export type H5PContentType = "interactive_video" | "flashcards" | "quiz" | "image_hotspot";

export interface H5PInteractiveVideoItem {
  timestamp: number; // segundos
  question: string;
  options: string[];
  correctIndex: number;
}

export interface H5PInteractiveVideo {
  type: "interactive_video";
  videoUrl: string;
  questions: H5PInteractiveVideoItem[];
}

export interface H5PFlashcard {
  front: string;
  back: string;
}

export interface H5PFlashcards {
  type: "flashcards";
  cards: H5PFlashcard[];
}

export interface H5PQuizItem {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface H5PQuiz {
  type: "quiz";
  questions: H5PQuizItem[];
}

export interface H5PHotspotArea {
  id: string;
  x: number; // % 0-100
  y: number;
  width: number;
  height: number;
  tooltip: string;
}

export interface H5PImageHotspot {
  type: "image_hotspot";
  imageUrl: string;
  areas: H5PHotspotArea[];
}

export type H5PContentPayload =
  | H5PInteractiveVideo
  | H5PFlashcards
  | H5PQuiz
  | H5PImageHotspot;

export interface H5PContentDoc {
  id: string;
  title: string;
  contentType: H5PContentType;
  content: H5PContentPayload;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Referencia a archivo .h5p en Storage (opcional). */
  storagePath?: string | null;
}

function db() {
  return getFirebaseAdminFirestore();
}

export async function getH5PContent(contentId: string): Promise<H5PContentDoc | null> {
  const doc = await db().collection(COLLECTION).doc(contentId).get();
  if (!doc.exists) return null;
  const d = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    title: (d.title as string) ?? "",
    contentType: (d.contentType as H5PContentType) ?? "quiz",
    content: d.content as H5PContentPayload,
    createdBy: (d.createdBy as string) ?? "",
    createdAt: (d.createdAt as string) ?? "",
    updatedAt: (d.updatedAt as string) ?? "",
    storagePath: (d.storagePath as string) ?? null,
  };
}

export async function createH5PContent(
  userId: string,
  title: string,
  content: H5PContentPayload,
  storagePath?: string | null
): Promise<H5PContentDoc> {
  const ref = db().collection(COLLECTION).doc();
  const now = new Date().toISOString();
  const type = content.type as H5PContentType;
  await ref.set({
    title,
    contentType: type,
    content,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
    storagePath: storagePath ?? null,
  });
  const snap = await ref.get();
  const d = snap.data() as Record<string, unknown>;
  return {
    id: snap.id,
    title: (d.title as string) ?? "",
    contentType: (d.contentType as H5PContentType) ?? type,
    content: d.content as H5PContentPayload,
    createdBy: (d.createdBy as string) ?? userId,
    createdAt: (d.createdAt as string) ?? now,
    updatedAt: (d.updatedAt as string) ?? now,
    storagePath: (d.storagePath as string) ?? null,
  };
}

export async function updateH5PContent(
  contentId: string,
  updates: { title?: string; content?: H5PContentPayload; storagePath?: string | null }
): Promise<void> {
  const ref = db().collection(COLLECTION).doc(contentId);
  const now = new Date().toISOString();
  const data: Record<string, unknown> = { updatedAt: now };
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.content !== undefined) {
    data.content = updates.content;
    data.contentType = updates.content.type;
  }
  if (updates.storagePath !== undefined) data.storagePath = updates.storagePath;
  await ref.update(data);
}

export async function listH5PContentByUser(userId: string): Promise<H5PContentDoc[]> {
  const snap = await db().collection(COLLECTION).where("createdBy", "==", userId).orderBy("updatedAt", "desc").get();
  return snap.docs.map((doc) => {
    const d = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      title: (d.title as string) ?? "",
      contentType: (d.contentType as H5PContentType) ?? "quiz",
      content: d.content as H5PContentPayload,
      createdBy: (d.createdBy as string) ?? "",
      createdAt: (d.createdAt as string) ?? "",
      updatedAt: (d.updatedAt as string) ?? "",
      storagePath: (d.storagePath as string) ?? null,
    };
  });
}

/** Subir archivo a Storage en h5p/{contentId}/file.h5p o similar. Retorna path. */
export async function uploadH5PFile(contentId: string, buffer: Buffer, mimeType: string): Promise<string> {
  const storage = getFirebaseAdminStorage();
  const bucket = storage.bucket();
  const path = `h5p/${contentId}/content.h5p`;
  const file = bucket.file(path);
  await file.save(buffer, { contentType: mimeType, metadata: { cacheControl: "public, max-age=31536000" } });
  return path;
}
