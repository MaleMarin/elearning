"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { startInactivityWatcher } from "@/lib/auth/inactivity-logout";

const WARNING_BEFORE = 2 * 60 * 1000; // advertir 2 min antes
const TIMEOUT = 30 * 60 * 1000;

export default function InactivityGuard() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleWarning = () => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    setShowWarning(false);
    warnTimerRef.current = setTimeout(() => setShowWarning(true), TIMEOUT - WARNING_BEFORE);
  };

  useEffect(() => {
    scheduleWarning();

    const cleanup = startInactivityWatcher(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login?reason=inactividad");
    });

    return () => {
      cleanup();
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    };
  }, [router]);

  const handleStay = () => {
    setShowWarning(false);
    scheduleWarning();
  };

  if (!showWarning) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 100,
        background: "#e8eaf0",
        borderRadius: 16,
        padding: "16px 20px",
        boxShadow: "8px 8px 18px #c2c8d6, -8px -8px 18px #ffffff",
        maxWidth: 320,
        fontFamily: "var(--font-heading)",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0f8a", marginBottom: 6 }}>
        ⚠️ Sesión por expirar
      </p>
      <p style={{ fontSize: 12, color: "#4a5580", marginBottom: 12 }}>
        Tu sesión cerrará en 2 minutos por inactividad.
      </p>
      <button
        type="button"
        onClick={handleStay}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-heading)",
          fontSize: 12,
          fontWeight: 700,
          background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
          color: "white",
          boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
        }}
      >
        Seguir trabajando
      </button>
    </div>
  );
}
