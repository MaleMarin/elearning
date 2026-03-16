"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/hooks/useTheme";
import type { ContentMode } from "@/lib/services/profile";

const MODOS: { id: ContentMode; emoji: string; label: string }[] = [
  { id: "leer", emoji: "📖", label: "Leer" },
  { id: "escuchar", emoji: "🎧", label: "Escuchar" },
  { id: "ver", emoji: "🎥", label: "Ver" },
];

interface LearningPreferencesProps {
  preferredLanguage: "es" | "en";
  reminderFrequency: "daily" | "weekly" | "live_only" | "never";
  contentMode?: ContentMode;
  onSave: (data: {
    preferredLanguage?: "es" | "en";
    reminderFrequency?: string;
    contentMode?: ContentMode;
  }) => Promise<void>;
  demo?: boolean;
}

const INPUT_STYLE = {
  background: "#e8eaf0",
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  fontFamily: "var(--font-heading)",
  fontSize: 13,
  color: "#0a0f8a",
  outline: "none",
  boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
  width: "100%",
  maxWidth: 240,
} as const;

export function LearningPreferences({
  preferredLanguage: initialLang,
  reminderFrequency: initialFreq,
  contentMode: initialContentMode = "leer",
  onSave,
  demo = false,
}: LearningPreferencesProps) {
  const [preferredLanguage, setPreferredLanguage] = useState<"es" | "en">(initialLang);
  const [reminderFrequency, setReminderFrequency] = useState(initialFreq);
  const [contentMode, setContentMode] = useState<ContentMode>(initialContentMode);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setPreferredLanguage(initialLang);
    setReminderFrequency(initialFreq);
    setContentMode(initialContentMode);
  }, [initialLang, initialFreq, initialContentMode]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ preferredLanguage, reminderFrequency, contentMode });
      setToast("Preferencias actualizadas");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Aprendizaje</p>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 16, fontFamily: "var(--font-heading)" }}>Modo de contenido y notificaciones</h2>

      <div style={{ marginBottom: 16 }}>
        <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a", marginBottom: 8 }}>Modo de contenido preferido</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {MODOS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setContentMode(m.id)}
              aria-pressed={contentMode === m.id}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                fontWeight: 600,
                color: contentMode === m.id ? "#fff" : "#0a0f8a",
                background: contentMode === m.id ? "linear-gradient(135deg, #1428d4, #0a0f8a)" : "#e8eaf0",
                boxShadow: contentMode === m.id ? "inset 2px 2px 6px rgba(0,0,0,0.2)" : "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
              }}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a", marginBottom: 6 }}>Idioma preferido</label>
        <select
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value as "es" | "en")}
          style={INPUT_STYLE}
        >
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "8px 0" }}>
        <div>
          <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a" }}>Modo de pantalla</span>
          <span style={{ fontSize: 12, color: "#8892b0" }}>{theme === "dark" ? "Oscuro" : "Claro"}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={theme === "dark"}
          aria-label="Cambiar a tema oscuro o claro"
          onClick={handleThemeToggle}
          style={{
            position: "relative",
            width: 48,
            height: 26,
            borderRadius: 13,
            border: "none",
            cursor: "pointer",
            background: "#e8eaf0",
            boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: theme === "dark" ? 25 : 3,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: theme === "dark" ? "linear-gradient(135deg, #1428d4, #0a0f8a)" : "#e8eaf0",
              boxShadow: theme === "dark" ? "2px 2px 6px rgba(0,0,0,0.25)" : "4px 4px 8px #c2c8d6, -4px -4px 8px #ffffff",
              transition: "left 0.2s ease",
            }}
          />
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a", marginBottom: 6 }}>Frecuencia de recordatorios</label>
        <select
          value={reminderFrequency}
          onChange={(e) => setReminderFrequency(e.target.value as LearningPreferencesProps["reminderFrequency"])}
          style={INPUT_STYLE}
        >
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="live_only">Solo sesiones en vivo</option>
          <option value="never">Nunca</option>
        </select>
      </div>

      {toast && <p style={{ fontSize: 12, marginBottom: 12, color: "#00b87d" }} role="status">{toast}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || demo}
        style={{
          padding: "11px 24px",
          borderRadius: 14,
          border: "none",
          cursor: saving || demo ? "not-allowed" : "pointer",
          fontFamily: "var(--font-heading)",
          fontSize: 13,
          fontWeight: 700,
          background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
          color: "white",
          boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
        }}
      >
        {saving ? "Guardando…" : "Guardar preferencias"}
      </button>
    </div>
  );
}
