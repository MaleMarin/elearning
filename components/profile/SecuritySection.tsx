"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";

export interface LastLoginData {
  timestamp: string | null;
  device: { browser: string; os: string; isMobile: boolean } | null;
}

interface SecuritySectionProps {
  email: string;
  mfaEnabled: boolean;
  lastLogin: LastLoginData | null;
  demo?: boolean;
}

export function SecuritySection({
  email,
  mfaEnabled,
  lastLogin,
  demo = false,
}: SecuritySectionProps) {
  const [lastLoginData, setLastLoginData] = useState<LastLoginData | null>(lastLogin);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (lastLogin) setLastLoginData(lastLogin);
    else if (!demo) {
      fetch("/api/profile/last-login")
        .then((r) => r.json())
        .then((d) => setLastLoginData(d))
        .catch(() => {});
    }
  }, [lastLogin, demo]);

  const handleChangePassword = async () => {
    if (demo) return;
    const auth = getFirebaseAuth();
    if (!auth || !email) {
      setResetMessage("No se puede enviar el correo de restablecimiento.");
      return;
    }
    setResetting(true);
    setResetMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Revisa tu correo para restablecer la contraseña.");
    } catch (e) {
      setResetMessage(e instanceof Error ? e.message : "Error al enviar el correo.");
    } finally {
      setResetting(false);
    }
  };

  const deviceText =
    lastLoginData?.device &&
    `${lastLoginData.device.browser} · ${lastLoginData.device.os}${lastLoginData.device.isMobile ? " (móvil)" : ""}`;

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Seguridad</p>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Cuenta y acceso</h2>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0a0f8a" }}>Verificación en 2 pasos</span>
          {mfaEnabled ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#00b87d", padding: "4px 10px", borderRadius: 20, background: "rgba(0,184,125,0.15)", fontFamily: "'Space Mono', monospace" }}>Activa</span>
          ) : (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#d84040", padding: "4px 10px", borderRadius: 20, background: "rgba(216,64,64,0.12)", fontFamily: "'Space Mono', monospace" }}>No activada</span>
              <Link href="/admin/seguridad" style={{ fontSize: 12, color: "#1428d4", fontWeight: 600, textDecoration: "underline" }}>Activar en Seguridad</Link>
            </>
          )}
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0a0f8a", marginBottom: 4 }}>Último acceso</p>
          {lastLoginData?.timestamp ? (
            <p style={{ fontSize: 12, color: "#8892b0", fontFamily: "'Space Mono', monospace" }}>
              {new Date(lastLoginData.timestamp).toLocaleString("es")}
              {deviceText && ` · ${deviceText}`}
            </p>
          ) : (
            <p style={{ fontSize: 12, color: "#8892b0" }}>No registrado</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleChangePassword}
        disabled={resetting || demo}
        style={{
          padding: "9px 18px",
          borderRadius: 12,
          border: "none",
          cursor: resetting || demo ? "not-allowed" : "pointer",
          fontFamily: "'Syne', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          background: "#e8eaf0",
          color: "#1428d4",
          boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
        }}
      >
        {resetting ? "Enviando…" : "Cambiar contraseña"}
      </button>
      {resetMessage && (
        <p style={{ marginTop: 12, fontSize: 12, color: resetMessage.startsWith("Revisa") ? "#00b87d" : "#d84040" }} role="alert">{resetMessage}</p>
      )}
    </div>
  );
}
