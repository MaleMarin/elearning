"use client";

import { useState } from "react";
import type { H5PContentPayload, H5PContentType } from "@/lib/services/h5p";

interface H5PUploaderProps {
  onCreated: (contentId: string, title: string) => void;
  onError?: (message: string) => void;
}

const CONTENT_TYPE_LABELS: Record<H5PContentType, string> = {
  interactive_video: "Video interactivo",
  flashcards: "Flashcards",
  quiz: "Quiz",
  image_hotspot: "Imagen hotspot",
};

function parseJsonPayload(text: string): H5PContentPayload | null {
  try {
    const o = JSON.parse(text) as Record<string, unknown>;
    if (o && typeof o.type === "string" && ["interactive_video", "flashcards", "quiz", "image_hotspot"].includes(o.type)) {
      return o as unknown as H5PContentPayload;
    }
  } catch {
    return null;
  }
  return null;
}

export function H5PUploader({ onCreated, onError }: H5PUploaderProps) {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [jsonText, setJsonText] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = parseJsonPayload(jsonText.trim());
    if (!payload) {
      onError?.("JSON no válido. Debe tener 'type': 'interactive_video' | 'flashcards' | 'quiz' | 'image_hotspot'.");
      return;
    }
    const name = title.trim() || CONTENT_TYPE_LABELS[payload.type] || "Contenido H5P";
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/h5p/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: name, content: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear");
      onCreated(data.id, data.title ?? name);
      setJsonText("");
      setTitle("");
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isJson = file.name.endsWith(".json") || file.type === "application/json";
    if (!isJson) {
      onError?.("Solo se aceptan archivos .json con contenido H5P. Para .h5p se requiere integración adicional.");
      return;
    }
    const text = await file.text();
    const payload = parseJsonPayload(text);
    if (!payload) {
      onError?.("El archivo JSON no tiene un formato de contenido H5P válido.");
      return;
    }
    setJsonText(text);
    setTitle(title || file.name.replace(/\.json$/i, ""));
    setMode("paste");
    e.target.value = "";
  };

  return (
    <div className="rounded-xl border border-[var(--line)] p-4 space-y-3">
      <h4 className="text-sm font-semibold text-[var(--ink)]">Agregar contenido H5P</h4>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`px-3 py-1.5 rounded-lg text-sm ${mode === "paste" ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-soft)] text-[var(--ink)]"}`}
        >
          Pegar JSON
        </button>
        <label className="px-3 py-1.5 rounded-lg text-sm bg-[var(--surface-soft)] text-[var(--ink)] cursor-pointer">
          Subir .json
          <input type="file" accept=".json,application/json" className="sr-only" onChange={handleFileChange} />
        </label>
      </div>
      <form onSubmit={handlePasteSubmit} className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del contenido"
          className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)] text-sm"
        />
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='{"type":"flashcards","cards":[{"front":"...","back":"..."}]}'
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-[var(--line)] font-mono text-xs text-[var(--ink)]"
        />
        <p className="text-xs text-[var(--text-muted)]">
          Tipos: interactive_video, flashcards, quiz, image_hotspot. Ver documentación del formato.
        </p>
        <button type="submit" disabled={submitting || !jsonText.trim()} className="btn-primary text-sm disabled:opacity-50">
          {submitting ? "Creando…" : "Crear contenido H5P"}
        </button>
      </form>
    </div>
  );
}
