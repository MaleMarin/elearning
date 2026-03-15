"use client";

import { useState } from "react";
import { decrypt } from "@/lib/crypto/encryption";
import { Lock, Download, Trash2 } from "lucide-react";

interface PrivacySectionProps {
  userId: string | null;
  demo?: boolean;
}

export function PrivacySection({ userId, demo }: PrivacySectionProps) {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    if (!userId || demo) return;
    setExporting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile/export", { credentials: "include" });
      if (!res.ok) throw new Error("Error al exportar");
      const data = await res.json();
      const decrypted: Record<string, unknown> = {
        journal: {},
        futureLetter: { content: "", writtenAt: null },
        diagnostic: {},
        closingSurvey: {},
        exportedAt: data.exportedAt,
      };
      for (const [lessonId, entry] of Object.entries(data.journal as Record<string, { content: string; reflection: string }>)) {
        (decrypted.journal as Record<string, unknown>)[lessonId] = {
          content: entry.content ? decrypt(entry.content, userId) : "",
          reflection: entry.reflection ? decrypt(entry.reflection, userId) : "",
        };
      }
      if (data.futureLetter?.content) {
        (decrypted.futureLetter as Record<string, unknown>).content = decrypt(data.futureLetter.content, userId);
        (decrypted.futureLetter as Record<string, unknown>).writtenAt = data.futureLetter.writtenAt;
      }
      if (data.diagnostic?.encryptedAnswers) {
        try {
          (decrypted.diagnostic as Record<string, unknown>).answers = JSON.parse(
            decrypt(data.diagnostic.encryptedAnswers, userId)
          );
        } catch {
          (decrypted.diagnostic as Record<string, unknown>).encrypted = true;
        }
        (decrypted.diagnostic as Record<string, unknown>).completedAt = data.diagnostic.completedAt;
        (decrypted.diagnostic as Record<string, unknown>).skipped = data.diagnostic.skipped;
      }
      if (data.closingSurvey?.encryptedPayload) {
        try {
          (decrypted.closingSurvey as Record<string, unknown>).data = JSON.parse(
            decrypt(data.closingSurvey.encryptedPayload, userId)
          );
        } catch {
          (decrypted.closingSurvey as Record<string, unknown>).encrypted = true;
        }
      }
      const blob = new Blob([JSON.stringify(decrypted, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `politica-digital-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Descarga iniciada.");
    } catch {
      setMessage("Error al exportar. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!userId || demo) return;
    if (!confirm("¿Borrar tu diario, carta al yo futuro, diagnóstico y encuesta de cierre? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile/delete-my-data", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al borrar");
      setMessage("Tus datos sensibles han sido borrados.");
    } catch {
      setMessage("Error al borrar. Intenta de nuevo.");
    } finally {
      setDeleting(false);
    }
  };

  if (demo) return null;

  return (
    <div className="card-premium p-6">
      <p className="section-label mb-2">Privacidad</p>
      <h2 className="heading-section mb-4">Tu privacidad</h2>
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line-subtle)] mb-4">
        <Lock className="w-6 h-6 text-[var(--success)] shrink-0 mt-0.5" aria-hidden />
        <p className="text-[var(--ink)] text-sm">
          Tu diario y carta al yo futuro están cifrados. Ni el equipo de Política Digital puede leerlos.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || !userId}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--ink)] disabled:opacity-50 min-h-[48px]"
        >
          <Download className="w-5 h-5" aria-hidden />
          {exporting ? "Preparando…" : "Exportar mis datos"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || !userId}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--error)] disabled:opacity-50 min-h-[48px]"
        >
          <Trash2 className="w-5 h-5" aria-hidden />
          {deleting ? "Borrando…" : "Borrar mis datos"}
        </button>
      </div>
      {message && (
        <p className="mt-3 text-sm text-[var(--muted)]" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
