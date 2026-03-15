"use client";

import { useState, useEffect } from "react";

type Status = "online" | "offline" | "syncing";

/**
 * Pill neumórfica en el topbar (Brecha 7):
 * 🟢 En línea — normal
 * 🟡 Sin conexión — trabajando offline (datos guardados localmente)
 * 🔄 Sincronizando — cuando vuelve la conexión
 */
export function OfflineStatusPill() {
  const [status, setStatus] = useState<Status>("online");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setStatus(navigator.onLine ? "online" : "offline");

    const handleOnline = () => setStatus("online");
    const handleOffline = () => setStatus("offline");
    const handleSyncing = (e: Event) => {
      const syncing = (e as CustomEvent<{ syncing: boolean }>).detail?.syncing;
      setStatus(syncing ? "syncing" : "online");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("app:syncing", handleSyncing);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("app:syncing", handleSyncing);
    };
  }, []);

  const labels: Record<Status, string> = {
    online: "En línea",
    offline: "Sin conexión",
    syncing: "Sincronizando",
  };
  const icons: Record<Status, string> = {
    online: "🟢",
    offline: "🟡",
    syncing: "🔄",
  };
  const ariaLabels: Record<Status, string> = {
    online: "Conectado a internet",
    offline: "Sin conexión. Los datos se guardan localmente.",
    syncing: "Sincronizando cambios con la nube",
  };

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={ariaLabels[status]}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-[var(--surface)] text-[var(--ink)] border border-[var(--line-subtle)] shadow-[2px_2px_4px_rgba(174,183,194,0.4),-2px_-2px_4px_rgba(255,255,255,0.8)]"
      title={status === "offline" ? "Trabajando offline — datos guardados localmente" : status === "syncing" ? "Subiendo cambios…" : undefined}
    >
      <span aria-hidden>{icons[status]}</span>
      <span>{labels[status]}</span>
    </span>
  );
}
