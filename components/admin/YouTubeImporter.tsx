"use client";

import { useState } from "react";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Youtube, Loader2 } from "lucide-react";

export interface YouTubeMicroLesson {
  title: string;
  keyConcepts: { concept: string; timestamp: string }[];
  summaryParagraphs: string[];
  reflectionQuestions: string[];
  videoId: string;
  embedUrl: string;
}

interface YouTubeImporterProps {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  orderIndex: number;
  onSaved: () => void;
  onError: (msg: string) => void;
}

export function YouTubeImporter({
  moduleId,
  moduleTitle,
  orderIndex,
  onSaved,
  onError,
}: YouTubeImporterProps) {
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<YouTubeMicroLesson | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!url.trim()) {
      onError("Pega una URL de YouTube.");
      return;
    }
    setGenerating(true);
    onError("");
    try {
      const res = await fetch("/api/admin/import-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al importar");
      setEditing(data.lesson);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error");
    } finally {
      setGenerating(false);
    }
  };

  const buildContent = (lesson: YouTubeMicroLesson): string => {
    const parts: string[] = [];
    parts.push(`## Conceptos clave\n`);
    lesson.keyConcepts.forEach((c) => parts.push(`- **${c.concept}** (${c.timestamp})\n`));
    parts.push("\n## Resumen\n\n");
    lesson.summaryParagraphs.forEach((p) => parts.push(`${p}\n\n`));
    parts.push("## Preguntas de reflexión\n\n");
    lesson.reflectionQuestions.forEach((q) => parts.push(`- ${q}\n`));
    return parts.join("");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    onError("");
    try {
      const content = buildContent(editing);
      const res = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editing.title,
          summary: editing.keyConcepts.map((c) => c.concept).join(". "),
          content,
          video_embed_url: editing.embedUrl,
          order_index: orderIndex,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setEditing(null);
      setUrl("");
      onSaved();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SurfaceCard padding="lg" clickable={false} className="mb-6">
      <h3 className="text-lg font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
        <Youtube className="w-5 h-5 text-red-600" />
        Microlección desde YouTube
      </h3>
      <p className="text-sm text-[var(--ink-muted)] mb-4">
        Pega la URL de un video. Se usará la transcripción (subtítulos) para generar título, 3 conceptos clave con timestamp, resumen y 2 preguntas de reflexión. La lección incluirá el video embebido.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-sm"
        />
        <PrimaryButton onClick={handleGenerate} disabled={generating || !url.trim()}>
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando…</> : "Importar"}
        </PrimaryButton>
      </div>

      {editing && (
        <div className="border-t border-[var(--line)] pt-4 mt-4 space-y-4">
          <h4 className="font-medium text-[var(--ink)]">Vista previa</h4>
          <div className="rounded-xl overflow-hidden border border-[var(--line)] aspect-video bg-black">
            <iframe
              src={editing.embedUrl}
              title={editing.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título</label>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : `Guardar en "${moduleTitle}"`}
            </PrimaryButton>
            <SecondaryButton onClick={() => setEditing(null)}>Descartar</SecondaryButton>
          </div>
        </div>
      )}
    </SurfaceCard>
  );
}
