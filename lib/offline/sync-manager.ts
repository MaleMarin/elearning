/**
 * Sincronización offline: guardar para offline y cola de pendientes (Brecha 7).
 * Cuando vuelve la conexión se envían los ítems pendientes y se muestra toast.
 */
import { getDB } from "./db";
import type { SyncItem } from "./db";

export async function saveForOffline(lessonId: string, content: object): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await getDB();
  await db.put("lessons", { id: lessonId, content, savedAt: Date.now() });
}

export async function getLessonFromOffline(lessonId: string): Promise<object | null> {
  if (typeof window === "undefined") return null;
  const db = await getDB();
  const row = await db.get("lessons", lessonId);
  return row?.content ?? null;
}

export async function getPendingSync(): Promise<SyncItem[]> {
  if (typeof window === "undefined") return [];
  const db = await getDB();
  const list = await db.getAll("pendingSync");
  return list.sort((a, b) => a.savedAt - b.savedAt);
}

export async function addPendingProgress(courseId: string, lessonId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await getDB();
  const id = `progress-${courseId}-${lessonId}-${Date.now()}`;
  await db.add("pendingSync", {
    id,
    type: "progress",
    payload: { courseId, lessonId },
    savedAt: Date.now(),
  });
}

export async function addPendingJournal(lessonId: string, content: string, reflection?: string): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await getDB();
  const id = `journal-${lessonId}-${Date.now()}`;
  await db.add("pendingSync", {
    id,
    type: "journal",
    payload: { lessonId, content, reflection },
    savedAt: Date.now(),
  });
}

export async function addPendingQuiz(attemptId: string, answers: unknown): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await getDB();
  const id = `quiz-${attemptId}-${Date.now()}`;
  await db.add("pendingSync", {
    id,
    type: "quiz",
    payload: { attemptId, answers },
    savedAt: Date.now(),
  });
}

async function syncItem(item: SyncItem, baseUrl: string): Promise<boolean> {
  try {
    if (item.type === "progress") {
      const { courseId, lessonId } = item.payload as { courseId: string; lessonId: string };
      const res = await fetch(`${baseUrl}/api/progress/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId, lessonId }),
      });
      if (!res.ok) return false;
    } else if (item.type === "journal") {
      const { lessonId, content, reflection } = item.payload as { lessonId: string; content: string; reflection?: string };
      const res = await fetch(`${baseUrl}/api/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId, content, reflection }),
      });
      if (!res.ok) return false;
    } else if (item.type === "quiz") {
      const { attemptId, answers } = item.payload as { attemptId: string; answers: unknown };
      const res = await fetch(`${baseUrl}/api/curso/quiz/attempt/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) return false;
    }
    const db = await getDB();
    await db.delete("pendingSync", item.id);
    return true;
  } catch {
    return false;
  }
}

export type SyncResult = { synced: number; failed: number };

export async function syncPendingItems(): Promise<SyncResult> {
  if (typeof window === "undefined") return { synced: 0, failed: 0 };
  const baseUrl = window.location.origin;
  const pending = await getPendingSync();
  let synced = 0;
  let failed = 0;
  for (const item of pending) {
    const ok = await syncItem(item, baseUrl);
    if (ok) synced++;
    else failed++;
  }
  return { synced, failed };
}

export type ToastCallback = (message: string) => void;

let toastCallback: ToastCallback | null = null;

export function setSyncToastCallback(cb: ToastCallback | null): void {
  toastCallback = cb;
}

function showSyncToast(message: string): void {
  if (toastCallback) toastCallback(message);
  else if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:sync-toast", { detail: { message } }));
  }
}

/**
 * Registrar listener de "online" para sincronizar automáticamente.
 * Llamar desde un componente cliente (ej. OfflineBanner o layout).
 */
export function registerOnlineSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = async () => {
    window.dispatchEvent(new CustomEvent("app:syncing", { detail: { syncing: true } }));
    const result = await syncPendingItems();
    window.dispatchEvent(new CustomEvent("app:syncing", { detail: { syncing: false } }));
    if (result.synced > 0 || result.failed === 0) {
      showSyncToast("✓ Cambios sincronizados con la nube");
    } else if (result.failed > 0) {
      showSyncToast("Algunos cambios no se pudieron sincronizar. Se reintentará más tarde.");
    }
  };

  window.addEventListener("online", handleOnline);
  return () => window.removeEventListener("online", handleOnline);
}
