"use client";

import { useState } from "react";
import Link from "next/link";
import { decrypt } from "@/lib/crypto/encryption";

function LockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function DownloadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

interface PrivacySectionProps {
  userId: string | null;
  demo?: boolean;
}

export function PrivacySection({ userId, demo }: PrivacySectionProps) {
  const [exporting, setExporting] = useState(false);
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

  if (demo) return null;

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Privacidad</p>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Tu privacidad</h2>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 12, background: "#e8eaf0", boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff", marginBottom: 16 }}>
        <span style={{ color: "#00b87d", flexShrink: 0 }}><LockIcon size={24} /></span>
        <p style={{ margin: 0, fontSize: 13, color: "#0a0f8a", lineHeight: 1.5, fontFamily: "'Syne', sans-serif" }}>
          Tu diario y carta al yo futuro están cifrados con AES-256. Ni el equipo de Política Digital puede leerlos.
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || !userId}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: 12,
            border: "none",
            cursor: exporting || !userId ? "not-allowed" : "pointer",
            fontFamily: "'Syne', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            background: "#e8eaf0",
            color: "#1428d4",
            boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
          }}
        >
          <DownloadIcon size={18} />
          {exporting ? "Preparando…" : "Exportar mis datos"}
        </button>
        <Link
          href="/privacidad"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: 12,
            border: "none",
            fontFamily: "'Syne', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            background: "#e8eaf0",
            color: "#1428d4",
            textDecoration: "none",
            boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
          }}
        >
          Ver aviso de privacidad
        </Link>
      </div>
      {message && <p style={{ marginTop: 12, fontSize: 12, color: "#8892b0" }} role="status">{message}</p>}
    </div>
  );
}
