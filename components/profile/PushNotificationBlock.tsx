"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function PushNotificationBlock({ demo }: { demo: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const vapidPublic =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;

  const activarNotificaciones = async () => {
    if (demo || !vapidPublic) {
      setMessage("Las notificaciones push no están configuradas en este entorno.");
      setStatus("error");
      return;
    }
    if (typeof window === "undefined" || !("Notification" in window)) {
      setMessage("Tu navegador no soporta notificaciones.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Has bloqueado las notificaciones. Puedes activarlas desde la configuración del navegador.");
        setStatus("error");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(vapidPublic);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Error al activar");
      }

      setMessage("Notificaciones push activadas. Recibirás avisos en este dispositivo.");
      setStatus("ok");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al activar notificaciones.");
      setStatus("error");
    }
  };

  if (demo) return null;

  return (
    <div>
      <button
        type="button"
        onClick={activarNotificaciones}
        disabled={status === "loading" || !vapidPublic}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 18px",
          borderRadius: 12,
          border: "none",
          cursor: status === "loading" || !vapidPublic ? "not-allowed" : "pointer",
          fontFamily: "var(--font-heading)",
          fontSize: 12,
          fontWeight: 600,
          background: "#e8eaf0",
          color: "#1428d4",
          boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
        }}
      >
        <BellIcon size={18} />
        {status === "loading" ? "Activando…" : "Activar notificaciones push"}
      </button>
      {message && (
        <p style={{ marginTop: 8, fontSize: 12, color: status === "error" ? "#d84040" : "#00b87d" }} role="alert">{message}</p>
      )}
    </div>
  );
}
