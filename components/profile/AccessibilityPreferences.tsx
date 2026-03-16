"use client";

import { useState, useEffect } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import type { AccessibilityPrefs } from "@/lib/services/profile";

type Props = {
  initial?: AccessibilityPrefs | null;
  onSaveToProfile?: (prefs: AccessibilityPrefs) => Promise<void>;
  demo?: boolean;
};

type FontSizeOption = "normal" | "large";

export function AccessibilityPreferences({ initial, onSaveToProfile, demo }: Props) {
  const { prefs, setPrefs } = useAccessibility();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fontSize: FontSizeOption = (prefs.fontSize ?? initial?.fontSize ?? "normal") as FontSizeOption;
  const reduceMotion = prefs.reduceMotion ?? initial?.reduceMotion ?? false;
  const highContrast = prefs.highContrast ?? initial?.highContrast ?? false;

  useEffect(() => {
    if (!initial) return;
    setPrefs({
      fontSize: initial.fontSize ?? "normal",
      reduceMotion: !!initial.reduceMotion,
      highContrast: !!initial.highContrast,
    });
  }, [initial]);

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      if (onSaveToProfile && !demo) {
        await onSaveToProfile({ fontSize, reduceMotion, highContrast });
      }
      setPrefs({ fontSize, reduceMotion, highContrast });
      setMessage("Preferencias de accesibilidad guardadas.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const setFontSize = (v: FontSizeOption) => setPrefs({ ...prefs, fontSize: v });

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Accesibilidad</p>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Preferencias de accesibilidad</h2>

      <div style={{ marginBottom: 16 }}>
        <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a", marginBottom: 8 }}>Tamaño de texto</span>
        <div style={{ display: "flex", gap: 10 }}>
          {(["A", "AA", "AAA"] as const).map((label, i) => {
            const value: FontSizeOption = i === 0 ? "normal" : "large";
            const isActive = fontSize === value || (label === "AAA" && fontSize === "large");
            return (
              <button
                key={label}
                type="button"
                onClick={() => setFontSize(value)}
                aria-pressed={isActive}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: label === "AAA" ? 11 : 14,
                  fontWeight: 700,
                  color: isActive ? "#fff" : "#0a0f8a",
                  background: isActive ? "linear-gradient(135deg, #1428d4, #0a0f8a)" : "#e8eaf0",
                  boxShadow: isActive ? "inset 2px 2px 6px rgba(0,0,0,0.2)" : "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
        <button
          type="button"
          role="checkbox"
          aria-checked={reduceMotion}
          onClick={() => setPrefs({ ...prefs, reduceMotion: !reduceMotion })}
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: reduceMotion ? "#e8eaf0" : "#e8eaf0",
            boxShadow: reduceMotion ? "inset 2px 2px 5px #c2c8d6" : "4px 4px 8px #c2c8d6, -4px -4px 8px #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {reduceMotion && <span style={{ color: "#1428d4", fontWeight: 800, fontSize: 14 }}>✓</span>}
        </button>
        <span style={{ fontSize: 13, color: "#0a0f8a", fontWeight: 500 }}>Reducir animaciones</span>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer" }}>
        <button
          type="button"
          role="checkbox"
          aria-checked={highContrast}
          onClick={() => setPrefs({ ...prefs, highContrast: !highContrast })}
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#e8eaf0",
            boxShadow: highContrast ? "inset 2px 2px 5px #c2c8d6" : "4px 4px 8px #c2c8d6, -4px -4px 8px #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {highContrast && <span style={{ color: "#1428d4", fontWeight: 800, fontSize: 14 }}>✓</span>}
        </button>
        <span style={{ fontSize: 13, color: "#0a0f8a", fontWeight: 500 }}>Mayor contraste</span>
      </label>

      {message && (
        <p style={{ fontSize: 12, marginBottom: 12, color: message.startsWith("Error") ? "#d84040" : "#00b87d" }} role="alert">{message}</p>
      )}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "11px 24px",
          borderRadius: 14,
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "'Syne', sans-serif",
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
