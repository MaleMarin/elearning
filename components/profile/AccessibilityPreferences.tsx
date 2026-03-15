"use client";

import { useState, useEffect } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import type { AccessibilityPrefs } from "@/lib/services/profile";
import { SurfaceCard } from "@/components/ui";
import { PrimaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";

type Props = {
  /** Valores iniciales desde el perfil (servidor). */
  initial?: AccessibilityPrefs | null;
  /** Al guardar, persistir también en el backend (PUT /api/profile). */
  onSaveToProfile?: (prefs: AccessibilityPrefs) => Promise<void>;
  demo?: boolean;
};

export function AccessibilityPreferences({ initial, onSaveToProfile, demo }: Props) {
  const { prefs, setPrefs } = useAccessibility();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fontSize = prefs.fontSize ?? initial?.fontSize ?? "normal";
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
        await onSaveToProfile({
          fontSize,
          reduceMotion,
          highContrast,
        });
      }
      setPrefs({ fontSize, reduceMotion, highContrast });
      setMessage("Preferencias de accesibilidad guardadas.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SurfaceCard padding="lg" clickable={false} className="space-y-4">
      <p className="section-label mb-0 text-[var(--ink-muted)]">Accesibilidad</p>
      <h2 className="heading-section mb-2 text-[var(--ink)]">Preferencias de accesibilidad</h2>
      <p className="text-sm text-[var(--ink-muted)]">
        Ajustes para mejorar la lectura y reducir barreras (cumplimiento de estándares de accesibilidad).
      </p>

      <label className="flex flex-col gap-1">
        <span className="font-medium text-[var(--ink)]">Tamaño de texto</span>
        <select
          value={fontSize}
          onChange={(e) => setPrefs({ ...prefs, fontSize: e.target.value as "normal" | "large" })}
          className="w-full max-w-xs px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] min-h-[48px]"
          aria-describedby="a11y-font-desc"
        >
          <option value="normal">Normal</option>
          <option value="large">Grande</option>
        </select>
        <span id="a11y-font-desc" className="text-xs text-[var(--ink-muted)]">Recomendado para lectura prolongada.</span>
      </label>

      <label className="flex items-center gap-3 min-h-[48px] cursor-pointer">
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => setPrefs({ ...prefs, reduceMotion: e.target.checked })}
          className="w-5 h-5 rounded border-[var(--line)]"
          aria-describedby="a11y-motion-desc"
        />
        <span id="a11y-motion-desc" className="text-[var(--ink)]">Reducir animaciones y movimiento</span>
      </label>

      <label className="flex items-center gap-3 min-h-[48px] cursor-pointer">
        <input
          type="checkbox"
          checked={highContrast}
          onChange={(e) => setPrefs({ ...prefs, highContrast: e.target.checked })}
          className="w-5 h-5 rounded border-[var(--line)]"
          aria-describedby="a11y-contrast-desc"
        />
        <span id="a11y-contrast-desc" className="text-[var(--ink)]">Mayor contraste (texto y bordes)</span>
      </label>

      {message && (
        <Alert
          message={message}
          variant={message.startsWith("Error") ? "error" : "info"}
        />
      )}
      <PrimaryButton onClick={handleSave} disabled={saving}>
        {saving ? "Guardando…" : "Guardar preferencias"}
      </PrimaryButton>
    </SurfaceCard>
  );
}
