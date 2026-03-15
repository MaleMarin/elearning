/**
 * GET: contenido del módulo para edición admin.
 * PATCH: actualiza bibliografía, podcasts, videos, liveRecording.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { parseModuleContent } from "@/lib/services/module-content";
import type { BibliographyItem, PodcastItem, VideoItem, LiveRecording } from "@/lib/types/module-content";

export const dynamic = "force-dynamic";

function safeBibList(raw: unknown): BibliographyItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x): BibliographyItem | null => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const titulo = String(o.titulo ?? "").trim();
      if (!titulo) return null;
      return {
        id: typeof o.id === "string" ? o.id : crypto.randomUUID(),
        tipo: ["libro", "articulo", "paper", "reporte", "web"].includes(o.tipo as string) ? (o.tipo as BibliographyItem["tipo"]) : "articulo",
        titulo,
        autor: String(o.autor ?? ""),
        año: typeof o.año === "number" ? o.año : new Date().getFullYear(),
        descripcion: String(o.descripcion ?? ""),
        ...(typeof o.url === "string" && o.url ? { url: o.url } : {}),
        obligatorio: Boolean(o.obligatorio),
      };
    })
    .filter((b): b is BibliographyItem => b !== null);
}

function safePodcastList(raw: unknown): PodcastItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x): PodcastItem | null => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const titulo = String(o.titulo ?? "").trim();
      const url = String(o.url ?? "").trim();
      if (!titulo || !url) return null;
      return {
        id: typeof o.id === "string" ? o.id : crypto.randomUUID(),
        titulo,
        programa: String(o.programa ?? ""),
        descripcion: String(o.descripcion ?? ""),
        duracion: String(o.duracion ?? ""),
        url,
        ...(typeof o.embedUrl === "string" && o.embedUrl ? { embedUrl: o.embedUrl } : {}),
        ...(typeof o.imagen === "string" && o.imagen ? { imagen: o.imagen } : {}),
      };
    })
    .filter((b): b is PodcastItem => b !== null);
}

function safeVideoList(raw: unknown): VideoItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const titulo = String(o.titulo ?? "");
      const youtubeId = String(o.youtubeId ?? "").trim();
      if (!titulo || !youtubeId) return null;
      return {
        id: typeof o.id === "string" ? o.id : crypto.randomUUID(),
        titulo,
        canal: String(o.canal ?? ""),
        descripcion: String(o.descripcion ?? ""),
        duracion: String(o.duracion ?? ""),
        youtubeId,
        esObligatorio: Boolean(o.esObligatorio),
      };
    })
    .filter((b): b is VideoItem => b !== null);
}

function safeLiveRecording(raw: unknown): LiveRecording | null {
  if (raw == null) return null;
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const sessionDate = String(o.sessionDate ?? "");
  const titulo = String(o.titulo ?? "");
  if (!sessionDate || !titulo) return null;
  return {
    sessionDate,
    titulo,
    facilitador: String(o.facilitador ?? ""),
    duracion: String(o.duracion ?? ""),
    youtubeId: typeof o.youtubeId === "string" ? o.youtubeId : undefined,
    storageUrl: typeof o.storageUrl === "string" ? o.storageUrl : undefined,
    transcripcion: typeof o.transcripcion === "string" ? o.transcripcion : undefined,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Record<string, unknown> | { error: string }>> {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Falta id del módulo" }, { status: 400 });

  if (getDemoMode()) {
    return NextResponse.json({
      module: { id, title: "Módulo 1", visibilityMode: "preview" },
      content: { bibliography: [], podcasts: [], videos: [], liveRecording: null },
    });
  }

  if (!useFirebase()) return NextResponse.json({ error: "Backend no disponible" }, { status: 503 });

  try {
    const auth = await getAuthFromRequest(req);
    const canEdit = await firebaseContent.canEditModule(id, auth.uid, auth.role);
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const moduleDoc = await firebaseContent.getModule(id);
    const content = parseModuleContent(moduleDoc as Record<string, unknown>);
    return NextResponse.json({
      module: {
        id: moduleDoc.id,
        title: moduleDoc.title,
        description: moduleDoc.description,
        order_index: moduleDoc.order_index,
        visibilityMode: content.visibilityMode,
        status: moduleDoc.status,
      },
      content: {
        bibliography: content.bibliography,
        podcasts: content.podcasts,
        videos: content.videos,
        liveRecording: content.liveRecording,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : msg === "Módulo no encontrado" ? 404 : 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ module?: Record<string, unknown>; error?: string }>> {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Falta id del módulo" }, { status: 400 });

  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });

  if (!useFirebase()) return NextResponse.json({ error: "Backend no disponible" }, { status: 503 });

  try {
    const auth = await getAuthFromRequest(req);
    const canEdit = await firebaseContent.canEditModule(id, auth.uid, auth.role);
    if (!canEdit) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const updates: {
      bibliography?: BibliographyItem[];
      podcasts?: PodcastItem[];
      videos?: VideoItem[];
      liveRecording?: LiveRecording | null;
    } = {};

    if (body.bibliography !== undefined) updates.bibliography = safeBibList(body.bibliography);
    if (body.podcasts !== undefined) updates.podcasts = safePodcastList(body.podcasts);
    if (body.videos !== undefined) updates.videos = safeVideoList(body.videos);
    if (body.liveRecording !== undefined) updates.liveRecording = safeLiveRecording(body.liveRecording);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Ningún campo de contenido enviado" }, { status: 400 });
    }

    const module_ = await firebaseContent.updateModule(id, updates as Record<string, unknown>);
    revalidateTag("courses");
    revalidateTag("lessons");
    return NextResponse.json({ module: module_ as Record<string, unknown> });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
