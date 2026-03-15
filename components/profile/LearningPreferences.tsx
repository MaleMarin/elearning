"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/hooks/useTheme";

interface LearningPreferencesProps {
  preferredLanguage: "es" | "en";
  reminderFrequency: "daily" | "weekly" | "live_only" | "never";
  onSave: (data: { preferredLanguage?: "es" | "en"; reminderFrequency?: string }) => Promise<void>;
  demo?: boolean;
}

export function LearningPreferences({
  preferredLanguage: initialLang,
  reminderFrequency: initialFreq,
  onSave,
  demo = false,
}: LearningPreferencesProps) {
  const [preferredLanguage, setPreferredLanguage] = useState<"es" | "en">(initialLang);
  const [reminderFrequency, setReminderFrequency] = useState(initialFreq);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setPreferredLanguage(initialLang);
    setReminderFrequency(initialFreq);
  }, [initialLang, initialFreq]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ preferredLanguage, reminderFrequency });
      setToast("Preferencias actualizadas");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <div className="card-premium p-6">
      <p className="section-label mb-2">Preferencias</p>
      <h2 className="heading-section mb-4">Aprendizaje y notificaciones</h2>

      <label className="block mb-4">
        <span className="font-medium text-[var(--text)]">Idioma preferido</span>
        <select
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value as "es" | "en")}
          className="mt-1 block w-full max-w-xs px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
        >
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>
      </label>

      <div className="flex items-center justify-between gap-4 mb-4 py-2">
        <div>
          <span className="font-medium text-[var(--text)] block">Modo de pantalla</span>
          <span className="text-sm text-[var(--muted)]">
            {theme === "dark" ? "Oscuro" : "Claro"}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={theme === "dark"}
          aria-label="Cambiar a tema oscuro o claro"
          onClick={handleThemeToggle}
          className="relative w-12 h-7 rounded-full bg-[var(--line)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] data-[state=checked]:bg-[var(--primary)]"
          style={{ background: theme === "dark" ? "var(--primary)" : "var(--line)" }}
        >
          <span
            className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: theme === "dark" ? "translateX(22px)" : "translateX(0)" }}
          />
        </button>
      </div>

      <label className="block mb-4">
        <span className="font-medium text-[var(--text)]">Frecuencia de recordatorios</span>
        <select
          value={reminderFrequency}
          onChange={(e) => setReminderFrequency(e.target.value as LearningPreferencesProps["reminderFrequency"])}
          className="mt-1 block w-full max-w-xs px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
        >
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="live_only">Solo sesiones en vivo</option>
          <option value="never">Nunca</option>
        </select>
      </label>

      {toast && (
        <p className="text-[var(--success)] text-sm mb-4" role="status">
          {toast}
        </p>
      )}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || demo}
        className="btn-primary disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar preferencias"}
      </button>
    </div>
  );
}
