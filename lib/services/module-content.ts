/**
 * Normalización del contenido de módulo desde Firestore.
 */

import type {
  BibliographyItem,
  PodcastItem,
  VideoItem,
  LiveRecording,
  VisibilityMode,
  ModuleContentData,
} from "@/lib/types/module-content";

function ensureArray<T>(x: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(x)) return [];
  return x.map(parse).filter((item): item is T => item != null);
}

function parseBibliographyItem(raw: unknown): BibliographyItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const tipo = ["libro", "articulo", "paper", "reporte", "web"].includes(o.tipo as string) ? (o.tipo as BibliographyItem["tipo"]) : "articulo";
  const titulo = typeof o.titulo === "string" ? o.titulo : "";
  const autor = typeof o.autor === "string" ? o.autor : "";
  const año = typeof o.año === "number" ? o.año : new Date().getFullYear();
  const descripcion = typeof o.descripcion === "string" ? o.descripcion : "";
  const url = typeof o.url === "string" ? o.url : undefined;
  const obligatorio = Boolean(o.obligatorio);
  if (!titulo) return null;
  return { id: id || crypto.randomUUID(), tipo, titulo, autor, año, descripcion, url, obligatorio };
}

function parsePodcastItem(raw: unknown): PodcastItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const titulo = typeof o.titulo === "string" ? o.titulo : "";
  const programa = typeof o.programa === "string" ? o.programa : "";
  const descripcion = typeof o.descripcion === "string" ? o.descripcion : "";
  const duracion = typeof o.duracion === "string" ? o.duracion : "";
  const url = typeof o.url === "string" ? o.url : "";
  const embedUrl = typeof o.embedUrl === "string" ? o.embedUrl : undefined;
  const imagen = typeof o.imagen === "string" ? o.imagen : undefined;
  if (!titulo || !url) return null;
  return { id: id || crypto.randomUUID(), titulo, programa, descripcion, duracion, url, embedUrl, imagen };
}

function parseVideoItem(raw: unknown): VideoItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const titulo = typeof o.titulo === "string" ? o.titulo : "";
  const canal = typeof o.canal === "string" ? o.canal : "";
  const descripcion = typeof o.descripcion === "string" ? o.descripcion : "";
  const duracion = typeof o.duracion === "string" ? o.duracion : "";
  const youtubeId = typeof o.youtubeId === "string" ? o.youtubeId : "";
  const esObligatorio = Boolean(o.esObligatorio);
  if (!titulo || !youtubeId) return null;
  return { id: id || crypto.randomUUID(), titulo, canal, descripcion, duracion, youtubeId, esObligatorio };
}

function parseLiveRecording(raw: unknown): LiveRecording | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const sessionDate = typeof o.sessionDate === "string" ? o.sessionDate : "";
  const titulo = typeof o.titulo === "string" ? o.titulo : "";
  const facilitador = typeof o.facilitador === "string" ? o.facilitador : "";
  const duracion = typeof o.duracion === "string" ? o.duracion : "";
  const youtubeId = typeof o.youtubeId === "string" ? o.youtubeId : undefined;
  const storageUrl = typeof o.storageUrl === "string" ? o.storageUrl : undefined;
  const transcripcion = typeof o.transcripcion === "string" ? o.transcripcion : undefined;
  if (!sessionDate || !titulo) return null;
  return { sessionDate, titulo, facilitador, duracion, youtubeId, storageUrl, transcripcion };
}

/**
 * Extrae contenido tipado desde el documento del módulo en Firestore.
 */
export function parseModuleContent(moduleDoc: Record<string, unknown>): ModuleContentData {
  const visibilityMode = ["locked", "preview", "full"].includes(moduleDoc.visibilityMode as string)
    ? (moduleDoc.visibilityMode as VisibilityMode)
    : "locked";
  const bibliography = ensureArray(moduleDoc.bibliography, parseBibliographyItem);
  const podcasts = ensureArray(moduleDoc.podcasts, parsePodcastItem);
  const videos = ensureArray(moduleDoc.videos, parseVideoItem);
  const liveRecording = moduleDoc.liveRecording != null ? parseLiveRecording(moduleDoc.liveRecording) : null;
  return {
    visibilityMode,
    bibliography,
    podcasts,
    videos,
    liveRecording,
  };
}
