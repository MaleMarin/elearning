/**
 * IndexedDB para modo offline (Brecha 7).
 * Estructura: lessons (contenido), progress, quizAnswers, journalEntries, pendingSync.
 */
import { openDB } from "idb";

export const DB_NAME = "politica-digital-offline";
export const DB_VERSION = 1;

export type OfflineDB = {
  lessons: { key: string; value: { id: string; content: object; savedAt: number } };
  progress: { key: string; value: { id: string; courseId: string; lessonId: string; savedAt: number } };
  quizAnswers: { key: string; value: { id: string; attemptId: string; payload: object; savedAt: number } };
  journalEntries: { key: string; value: { id: string; lessonId: string; content: string; reflection?: string; savedAt: number } };
  pendingSync: { key: string; value: SyncItem };
};

export type SyncItemType = "progress" | "quiz" | "journal";

export interface SyncItem {
  id: string;
  type: SyncItemType;
  payload: object;
  savedAt: number;
}

export async function getDB() {
  return openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("lessons")) {
        db.createObjectStore("lessons", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("progress")) {
        db.createObjectStore("progress", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("quizAnswers")) {
        db.createObjectStore("quizAnswers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("journalEntries")) {
        db.createObjectStore("journalEntries", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pendingSync")) {
        db.createObjectStore("pendingSync", { keyPath: "id" });
      }
    },
  });
}
