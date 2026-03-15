/**
 * Pre-descarga inteligente: próximas lecciones cuando hay WiFi y batería > 20% (Brecha 7).
 */
import { saveForOffline } from "./sync-manager";

const NEXT_MODULES_COUNT = 3;

interface CursoModule {
  id: string;
  title: string;
  lessons?: { id: string; title?: string }[];
}

interface CursoResponse {
  modules?: CursoModule[];
  lessons?: { id: string; module_id?: string }[];
}

function getEffectiveConnection(): "wifi" | "cellular" | "unknown" {
  if (typeof navigator === "undefined" || !(navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection) {
    return "unknown";
  }
  const conn = (navigator as unknown as { connection: { effectiveType?: string; saveData?: boolean } }).connection;
  if (conn.saveData) return "cellular";
  const et = conn.effectiveType;
  if (et === "4g" || et === "3g") return "wifi";
  return "cellular";
}

export async function isPrefetchAllowed(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.onLine) return false;
  const conn = getEffectiveConnection();
  if (conn === "cellular") return false;
  try {
    if ("getBattery" in navigator) {
      const bat = await (navigator as unknown as { getBattery(): Promise<{ level: number }> }).getBattery();
      if (bat.level < 0.2) return false;
    }
  } catch {
    // Sin API de batería: permitir prefetch
  }
  return true;
}

async function fetchLessonContent(lessonId: string, baseUrl: string): Promise<object | null> {
  try {
    const res = await fetch(`${baseUrl}/api/curso/lecciones/${lessonId}`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data as object;
  } catch {
    return null;
  }
}

/**
 * Pre-descarga los 3 módulos siguientes al actual (y sus lecciones).
 * Ejecutar cuando: usuario abre la app o entra a una lección + hay WiFi + batería > 20%.
 */
export async function prefetchNextModules(currentModuleIndex: number): Promise<{ prefetched: number }> {
  if (typeof window === "undefined") return { prefetched: 0 };
  const allowed = await isPrefetchAllowed();
  if (!allowed) return { prefetched: 0 };

  const baseUrl = window.location.origin;
  let curso: CursoResponse;
  try {
    const res = await fetch(`${baseUrl}/api/curso`, { credentials: "include" });
    if (!res.ok) return { prefetched: 0 };
    curso = (await res.json()) as CursoResponse;
  } catch {
    return { prefetched: 0 };
  }

  const modules = curso.modules ?? [];
  const nextModules = modules.slice(
    currentModuleIndex + 1,
    currentModuleIndex + 1 + NEXT_MODULES_COUNT
  );

  let prefetched = 0;
  for (const mod of nextModules) {
    const lessons = mod.lessons ?? curso.lessons?.filter((l) => l.module_id === mod.id) ?? [];
    for (const lesson of lessons) {
      const lessonId = typeof lesson === "object" && lesson !== null && "id" in lesson ? (lesson as { id: string }).id : String(lesson);
      const content = await fetchLessonContent(lessonId, baseUrl);
      if (content) {
        await saveForOffline(lessonId, content);
        prefetched++;
      }
    }
  }
  return { prefetched };
}
