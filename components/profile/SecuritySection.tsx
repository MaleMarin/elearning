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
    <div className="card-premium p-6">
      <p className="section-label mb-2">Seguridad</p>
      <h2 className="heading-section mb-4">Cuenta y acceso</h2>

      <div className="space-y-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[var(--text)]">Verificación en 2 pasos (MFA)</span>
          {mfaEnabled ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--success-soft)] text-[var(--success)]">
              Activada
            </span>
          ) : (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--coral-soft)] text-[var(--coral)]">
                No activada
              </span>
              <Link
                href="/admin/seguridad"
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Activar en Seguridad
              </Link>
            </>
          )}
        </div>

        <div>
          <p className="font-medium text-[var(--text)] mb-1">Último acceso</p>
          {lastLoginData?.timestamp ? (
            <p className="text-sm text-[var(--muted)]">
              {new Date(lastLoginData.timestamp).toLocaleString("es")}
              {deviceText && ` · ${deviceText}`}
            </p>
          ) : (
            <p className="text-sm text-[var(--muted)]">No registrado</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleChangePassword}
        disabled={resetting || demo}
        className="btn-coral disabled:opacity-50"
      >
        {resetting ? "Enviando…" : "Cambiar contraseña"}
      </button>
      {resetMessage && (
        <p
          className={`mt-3 text-sm ${resetMessage.startsWith("Revisa") ? "text-[var(--success)]" : "text-[var(--error)]"}`}
          role="alert"
        >
          {resetMessage}
        </p>
      )}
    </div>
  );
}
