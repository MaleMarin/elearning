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
    <div className="mb-4">
      <p className="font-medium text-[var(--text)] mb-2">Notificaciones en el navegador</p>
      <p className="text-[var(--text-muted)] text-sm mb-3">
        Activa las notificaciones push para recibir recordatorios de sesiones y tareas aunque no tengas la pestaña abierta.
      </p>
      <button
        type="button"
        onClick={activarNotificaciones}
        disabled={status === "loading" || !vapidPublic}
        className="btn-primary disabled:opacity-50"
      >
        {status === "loading" ? "Activando…" : "Activar notificaciones push"}
      </button>
      {message && (
        <p
          className={`text-sm mt-2 ${status === "error" ? "text-[var(--error)]" : "text-[var(--success)]"}`}
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  );
}
