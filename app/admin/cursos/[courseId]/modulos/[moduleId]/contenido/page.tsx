"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock, Eye, CheckCircle, Plus, Trash2 } from "lucide-react";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import type {
  VisibilityMode,
  BibliographyItem,
  PodcastItem,
  VideoItem,
  LiveRecording,
  BibliographyTipo,
} from "@/lib/types/module-content";

function extractYoutubeId(urlOrId: string): string {
  const s = urlOrId.trim();
  const match = s.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1]! : s;
}

export default function AdminModuloContenidoPage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const moduleId = String(params?.moduleId ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("locked");
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [bibliography, setBibliography] = useState<BibliographyItem[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [liveRecording, setLiveRecording] = useState<LiveRecording | null>(null);
  const [contentSaving, setContentSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishSaving, setPublishSaving] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    Promise.all([
      fetch(`/api/admin/modules/${moduleId}`).then((r) => r.json()),
      fetch(`/api/admin/modules/${moduleId}/content`).then((r) => r.json()),
    ])
      .then(([modRes, contentRes]) => {
        if (modRes.module) {
          setModuleTitle(modRes.module.title ?? "");
          setVisibilityMode((modRes.module.visibilityMode as VisibilityMode) ?? "locked");
          setPublished(modRes.module.status === "published");
        }
        if (contentRes.content) {
          setBibliography(Array.isArray(contentRes.content.bibliography) ? contentRes.content.bibliography : []);
          setPodcasts(Array.isArray(contentRes.content.podcasts) ? contentRes.content.podcasts : []);
          setVideos(Array.isArray(contentRes.content.videos) ? contentRes.content.videos : []);
          setLiveRecording(contentRes.content.liveRecording ?? null);
        }
      })
      .catch(() => setError("Error al cargar"))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const saveVisibility = async () => {
    setError(null);
    setVisibilitySaving(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibilityMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setVisibilitySaving(false);
    }
  };

  const saveContent = async () => {
    setError(null);
    setContentSaving(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/content`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bibliography,
          podcasts,
          videos,
          liveRecording,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setContentSaving(false);
    }
  };

  const togglePublish = async () => {
    setError(null);
    setPublishSaving(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: published ? "draft" : "published" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setPublished(data.module?.status === "published");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPublishSaving(false);
    }
  };

  const addBib = () => {
    setBibliography((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        tipo: "articulo",
        titulo: "",
        autor: "",
        año: new Date().getFullYear(),
        descripcion: "",
        obligatorio: false,
      },
    ]);
  };
  const updateBib = (id: string, upd: Partial<BibliographyItem>) => {
    setBibliography((prev) => prev.map((b) => (b.id === id ? { ...b, ...upd } : b)));
  };
  const removeBib = (id: string) => setBibliography((prev) => prev.filter((b) => b.id !== id));

  const addPodcast = () => {
    setPodcasts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), titulo: "", programa: "", descripcion: "", duracion: "", url: "" },
    ]);
  };
  const updatePodcast = (id: string, upd: Partial<PodcastItem>) => {
    setPodcasts((prev) => prev.map((p) => (p.id === id ? { ...p, ...upd } : p)));
  };
  const removePodcast = (id: string) => setPodcasts((prev) => prev.filter((p) => p.id !== id));

  const addVideo = () => {
    setVideos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), titulo: "", canal: "", descripcion: "", duracion: "", youtubeId: "", esObligatorio: false },
    ]);
  };
  const updateVideo = (id: string, upd: Partial<VideoItem>) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...upd } : v)));
  };
  const removeVideo = (id: string) => setVideos((prev) => prev.filter((v) => v.id !== id));

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--neu-bg)] flex items-center justify-center">
        <p className="text-[var(--texto-sub)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--neu-bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/admin/cursos/${courseId}/modulos/${moduleId}`}
            className="inline-flex items-center gap-2 text-[var(--texto-sub)] hover:text-[var(--azul)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Módulo {moduleTitle || moduleId}
          </Link>
        </div>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        {/* A — Visibilidad */}
        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">Visibilidad del módulo</h3>
          <p className="text-sm text-[var(--texto-sub)] mb-4">
            Define qué pueden ver los alumnos antes de completar el módulo anterior.
          </p>
          <div className="space-y-3">
            {(
              [
                {
                  value: "locked" as const,
                  icon: Lock,
                  label: "Bloqueado",
                  desc: "Solo el título. Todo el contenido se desbloquea al completar el módulo anterior.",
                },
                {
                  value: "preview" as const,
                  icon: Eye,
                  label: "Vista previa",
                  desc: "Bibliografía, podcasts y videos siempre visibles. Lecciones y quiz se desbloquean al completar el módulo anterior.",
                },
                {
                  value: "full" as const,
                  icon: CheckCircle,
                  label: "Acceso completo",
                  desc: "Todo el módulo visible desde el inicio, sin prerequisitos.",
                },
              ] as const
            ).map(({ value, icon: Icon, label, desc }) => (
              <label
                key={value}
                className={`flex gap-3 p-4 rounded-xl border cursor-pointer ${
                  visibilityMode === value ? "border-[var(--azul)] bg-[var(--primary-soft)]" : "border-[var(--line)]"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={value}
                  checked={visibilityMode === value}
                  onChange={() => setVisibilityMode(value)}
                  className="sr-only"
                />
                <Icon className="w-5 h-5 text-[var(--azul)] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)]">{label}</strong>
                  <p className="text-sm text-[var(--texto-sub)] mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </div>
          <PrimaryButton onClick={saveVisibility} disabled={visibilitySaving} className="mt-4">
            {visibilitySaving ? "Guardando…" : "Guardar configuración"}
          </PrimaryButton>
        </SurfaceCard>

        {/* B — Bibliografía */}
        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Bibliografía</h3>
            <SecondaryButton onClick={addBib}><Plus className="w-4 h-4" /> Agregar recurso</SecondaryButton>
          </div>
          <div className="space-y-4">
            {bibliography.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--line)] space-y-3">
                <div className="flex justify-between gap-2">
                  <select
                    value={item.tipo}
                    onChange={(e) => updateBib(item.id, { tipo: e.target.value as BibliographyTipo })}
                    className="px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
                  >
                    {(["libro", "articulo", "paper", "reporte", "web"] as const).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeBib(item.id)} className="text-red-600 hover:underline" aria-label="Eliminar"><Trash2 className="w-4 h-4" /></button>
                </div>
                <input
                  type="text"
                  placeholder="Título"
                  value={item.titulo}
                  onChange={(e) => updateBib(item.id, { titulo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
                />
                <input
                  type="text"
                  placeholder="Autor"
                  value={item.autor}
                  onChange={(e) => updateBib(item.id, { autor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Año"
                  value={item.año || ""}
                  onChange={(e) => updateBib(item.id, { año: parseInt(e.target.value, 10) || new Date().getFullYear() })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
                />
                <textarea
                  placeholder="Descripción (1-2 líneas)"
                  value={item.descripcion}
                  onChange={(e) => updateBib(item.id, { descripcion: e.target.value.slice(0, 200) })}
                  rows={2}
                  maxLength={200}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
                />
                <input
                  type="url"
                  placeholder="URL (opcional)"
                  value={item.url ?? ""}
                  onChange={(e) => updateBib(item.id, { url: e.target.value || undefined })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.obligatorio}
                    onChange={(e) => updateBib(item.id, { obligatorio: e.target.checked })}
                  />
                  Obligatorio
                </label>
              </div>
            ))}
          </div>
        </SurfaceCard>

        {/* C — Podcasts */}
        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Podcasts</h3>
            <SecondaryButton onClick={addPodcast}><Plus className="w-4 h-4" /> Agregar</SecondaryButton>
          </div>
          <div className="space-y-4">
            {podcasts.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--line)] space-y-3">
                <div className="flex justify-end"><button type="button" onClick={() => removePodcast(item.id)} className="text-red-600 hover:underline" aria-label="Eliminar"><Trash2 className="w-4 h-4" /></button></div>
                <input type="text" placeholder="Título del episodio" value={item.titulo} onChange={(e) => updatePodcast(item.id, { titulo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <input type="text" placeholder="Nombre del programa" value={item.programa} onChange={(e) => updatePodcast(item.id, { programa: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <textarea placeholder="Descripción (máx 150)" value={item.descripcion} onChange={(e) => updatePodcast(item.id, { descripcion: e.target.value.slice(0, 150) })} rows={2} maxLength={150} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <input type="text" placeholder="Duración (ej: 32 min)" value={item.duracion} onChange={(e) => updatePodcast(item.id, { duracion: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <input type="url" placeholder="URL del episodio" value={item.url} onChange={(e) => updatePodcast(item.id, { url: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <input type="url" placeholder="URL de embed (opcional)" value={item.embedUrl ?? ""} onChange={(e) => updatePodcast(item.id, { embedUrl: e.target.value || undefined })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
              </div>
            ))}
          </div>
        </SurfaceCard>

        {/* D — Videos */}
        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Videos</h3>
            <SecondaryButton onClick={addVideo}><Plus className="w-4 h-4" /> Agregar</SecondaryButton>
          </div>
          <div className="space-y-4">
            {videos.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--line)] space-y-3">
                <div className="flex justify-end"><button type="button" onClick={() => removeVideo(item.id)} className="text-red-600 hover:underline" aria-label="Eliminar"><Trash2 className="w-4 h-4" /></button></div>
                <input type="text" placeholder="Título" value={item.titulo} onChange={(e) => updateVideo(item.id, { titulo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <input type="text" placeholder="Canal de YouTube" value={item.canal} onChange={(e) => updateVideo(item.id, { canal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <input
                  type="text"
                  placeholder="URL o ID de YouTube"
                  value={item.youtubeId}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateVideo(item.id, { youtubeId: v.includes("youtube") || v.includes("youtu.be") ? extractYoutubeId(v) : v });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
                />
                {item.youtubeId && (
                  <img src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`} alt="" className="rounded-lg w-full max-w-xs aspect-video object-cover" />
                )}
                <textarea placeholder="Descripción (máx 150)" value={item.descripcion} onChange={(e) => updateVideo(item.id, { descripcion: e.target.value.slice(0, 150) })} rows={2} maxLength={150} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <input type="text" placeholder="Duración (ej: 15 min)" value={item.duracion} onChange={(e) => updateVideo(item.id, { duracion: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={item.esObligatorio} onChange={(e) => updateVideo(item.id, { esObligatorio: e.target.checked })} />
                  Obligatorio
                </label>
              </div>
            ))}
          </div>
        </SurfaceCard>

        {/* E — Grabación en vivo */}
        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Grabación de sesión en vivo</h3>
          <div className="space-y-3">
            {(() => {
              const rec = liveRecording ?? { sessionDate: "", titulo: "", facilitador: "", duracion: "" };
              const upd = (u: Partial<LiveRecording>) => setLiveRecording({ ...rec, ...u });
              return (
                <>
                  <input type="text" placeholder="Fecha (ej: 2025-02-15)" value={rec.sessionDate} onChange={(e) => upd({ sessionDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                  <input type="text" placeholder="Título de la sesión" value={rec.titulo} onChange={(e) => upd({ titulo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                  <input type="text" placeholder="Facilitador" value={rec.facilitador} onChange={(e) => upd({ facilitador: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                  <input type="text" placeholder="Duración" value={rec.duracion} onChange={(e) => upd({ duracion: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                  <input type="text" placeholder="YouTube ID (si está en YouTube)" value={rec.youtubeId ?? ""} onChange={(e) => upd({ youtubeId: e.target.value || undefined })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                  <input type="url" placeholder="URL de Firebase Storage (si subiste el video)" value={rec.storageUrl ?? ""} onChange={(e) => upd({ storageUrl: e.target.value || undefined })} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                  <textarea placeholder="Transcripción (opcional)" value={rec.transcripcion ?? ""} onChange={(e) => upd({ transcripcion: e.target.value || undefined })} rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm" />
                </>
              );
            })()}
          </div>
        </SurfaceCard>

        <div className="flex flex-wrap gap-4 mb-8">
          <PrimaryButton onClick={saveContent} disabled={contentSaving}>
            {contentSaving ? "Guardando…" : "Guardar contenido"}
          </PrimaryButton>
        </div>

        {/* Publicar */}
        <SurfaceCard padding="lg" clickable={false}>
          <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">Estado de publicación</h3>
          <p className="text-sm text-[var(--texto-sub)] mb-2">
            Módulo {published ? "publicado" : "en borrador"}
          </p>
          <PrimaryButton onClick={togglePublish} disabled={publishSaving}>
            {published ? "Despublicar" : "Publicar módulo"}
          </PrimaryButton>
          <p className="text-xs text-[var(--texto-hint)] mt-3">
            Al publicar, el módulo aparece para los alumnos según la configuración de visibilidad seleccionada arriba.
          </p>
        </SurfaceCard>
      </div>
    </div>
  );
}
