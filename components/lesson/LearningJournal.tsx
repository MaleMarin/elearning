"use client";

import { useState, useEffect } from "react";
import { encrypt, decrypt } from "@/lib/crypto/encryption";
import { VoiceInput } from "@/components/ui/VoiceInput";
import { addPendingJournal } from "@/lib/offline/sync-manager";

interface LearningJournalProps {
  lessonId: string;
  userId: string | undefined;
}

export function LearningJournal({ lessonId, userId }: LearningJournalProps) {
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !lessonId) {
      setLoading(false);
      return;
    }
    fetch(`/api/journal?lessonId=${encodeURIComponent(lessonId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { content?: string; reflection?: string } | null) => {
        if (d?.content == null && d?.reflection == null) return;
        const decContent = d?.content ? decrypt(d.content, userId) : "";
        setEntry(decContent || d?.content || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, lessonId]);

  const handleSave = async () => {
    if (!userId || !lessonId) return;
    const plain = entry.trim();
    const content = plain ? encrypt(plain, userId) : "";
    const reflectionPlain = "";
    const reflection = reflectionPlain ? encrypt(reflectionPlain, userId) : "";
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId, content, reflection }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        addPendingJournal(lessonId, content, reflection);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }
  };

  if (!userId || loading) return null;

  return (
    <div
      style={{
        background: "var(--neu-bg)",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "var(--neu-shadow-out-sm)",
        marginTop: "24px",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#9ca3af",
          marginBottom: "10px",
        }}
      >
        ✏️ Tu reflexión de hoy
      </p>
      <VoiceInput
        value={entry}
        onChange={setEntry}
        placeholder="¿Qué aprendiste? ¿Cómo lo aplicarías en tu institución? Escribe o usa el micrófono."
        rows={4}
        aria-label="Reflexión de la lección"
      />
      <button
        type="button"
        onClick={handleSave}
        style={{
          marginTop: "10px",
          padding: "9px 20px",
          background: "var(--neu-bg)",
          border: "none",
          borderRadius: "50px",
          boxShadow: "var(--neu-shadow-out-sm)",
          fontSize: "12px",
          fontWeight: 600,
          color: saved ? "#00e5a0" : "var(--azul)",
          fontFamily: "var(--font)",
          cursor: "pointer",
        }}
      >
        {saved ? "✓ Guardado" : "Guardar reflexión"}
      </button>
    </div>
  );
}
