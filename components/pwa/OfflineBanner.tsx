"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const OFFLINE_BANNER_DISMISSED_KEY = "offline_banner_dismissed";

/**
 * Banner cuando no hay conexión. Mensaje: "Estás sin conexión — modo lectura activo".
 * Solo se muestra una vez; tras mostrarse se guarda en localStorage "offline_banner_dismissed".
 * Al volver online: toast "Conexión restaurada" y evento app:online para sincronizar (Brecha 7).
 * Escucha app:sync-toast para mostrar "✓ Cambios sincronizados con la nube".
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const restoredTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncMessageRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setShowRestored(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:online"));
    }
    if (restoredTimeoutRef.current) clearTimeout(restoredTimeoutRef.current);
    restoredTimeoutRef.current = setTimeout(() => setShowRestored(false), 4000);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const online = navigator.onLine;
    setIsOnline(online);
    if (!online && localStorage.getItem(OFFLINE_BANNER_DISMISSED_KEY) !== "1") {
      setShowOfflineBanner(true);
      localStorage.setItem(OFFLINE_BANNER_DISMISSED_KEY, "1");
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", () => {
      setIsOnline(false);
      if (localStorage.getItem(OFFLINE_BANNER_DISMISSED_KEY) !== "1") {
        setShowOfflineBanner(true);
        localStorage.setItem(OFFLINE_BANNER_DISMISSED_KEY, "1");
      }
    });
    const handleSyncToast = (e: Event) => {
      const message = (e as CustomEvent<{ message: string }>).detail?.message;
      if (message) {
        setSyncMessage(message);
        if (syncMessageRef.current) clearTimeout(syncMessageRef.current);
        syncMessageRef.current = setTimeout(() => setSyncMessage(null), 4000);
      }
    };
    window.addEventListener("app:sync-toast", handleSyncToast);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", () => setIsOnline(false));
      window.removeEventListener("app:sync-toast", handleSyncToast);
      if (restoredTimeoutRef.current) clearTimeout(restoredTimeoutRef.current);
      if (syncMessageRef.current) clearTimeout(syncMessageRef.current);
    };
  }, [handleOnline]);

  if (isOnline && !showRestored && !syncMessage) return null;

  if (!isOnline && showOfflineBanner) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[200] bg-[var(--amber)] text-[var(--ink)] py-2 px-4 text-center text-sm font-medium shadow-md"
      >
        Estás sin conexión — modo lectura activo. Las lecciones ya visitadas siguen disponibles.
      </div>
    );
  }

  const message = syncMessage || "Conexión restaurada. El progreso se actualizará.";
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] bg-[var(--surface)] text-[var(--ink)] py-2 px-4 rounded-xl text-sm font-medium shadow-lg border border-[var(--success)]"
    >
      {message}
    </div>
  );
}
