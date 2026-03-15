"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { Alert } from "@/components/ui/Alert";
import { HelpCircle, LogOut, KeyRound, Mail, Sparkles } from "lucide-react";

const isDemoMode = typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function NoInscritoPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [showEscape, setShowEscape] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const fallbackTimeout = window.setTimeout(() => {
      if (!cancelled) setSignedIn(false);
    }, 3000);
    const escapeTimeout = window.setTimeout(() => {
      if (!cancelled) setShowEscape(true);
    }, 2000);

    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (!cancelled) setSignedIn(r.ok);
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      })
      .finally(() => {
        window.clearTimeout(fallbackTimeout);
        window.clearTimeout(escapeTimeout);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimeout);
      window.clearTimeout(escapeTimeout);
    };
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/enroll/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo activar el acceso. Inténtalo de nuevo.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.replace("/inicio"), 1200);
    } catch {
      setError("Error de conexión. Comprueba tu red e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    setError(null);
    setRequestLoading(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "acceso",
          summary: "Solicitud de acceso a la plataforma",
          details: "El usuario ha solicitado acceso desde la página de inscripción.",
          cohortId: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al enviar la solicitud");
        return;
      }
      setRequestSent(true);
    } catch {
      setError("Error de conexión");
    } finally {
      setRequestLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <SurfaceCard padding="lg" clickable={false} className="max-w-md text-center">
          <p className="text-lg text-[var(--success)] font-medium">
            Acceso activado. Redirigiendo a tu panel…
          </p>
        </SurfaceCard>
      </div>
    );
  }

  if (signedIn === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-[var(--bg)]">
        <p className="text-[var(--muted)]">Cargando…</p>
        {showEscape && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-[var(--ink-muted)]">¿Sigue sin cargar?</p>
            <PrimaryButton onClick={() => router.replace("/login")}>
              Ir a iniciar sesión
            </PrimaryButton>
            {isDemoMode && (
              <SecondaryButton onClick={() => router.replace("/inicio")}>
                Ir a Inicio (modo demo)
              </SecondaryButton>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <SurfaceCard padding="lg" clickable={false} className="max-w-md text-center">
          <h1 className="text-xl font-bold text-[var(--ink)] mb-2">
            Acceso con inscripción
          </h1>
          <p className="text-[var(--muted)] mb-6">
            Inicia sesión para canjear un código o solicitar acceso a un programa.
          </p>
          <PrimaryButton href="/login">
            Ir a iniciar sesión
          </PrimaryButton>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-lg space-y-6">
        {isDemoMode && (
          <SurfaceCard padding="lg" clickable={false} className="border-2 border-[var(--acento)] bg-[rgba(0,229,160,0.06)]">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[var(--acento)] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)] mb-1">Modo demo</h2>
                <p className="text-sm text-[var(--ink-muted)] mb-3">
                  En este entorno no se envían correos. Escribe <strong>DEMO</strong> en el código de invitación y pulsa «Activar acceso», o usa el botón para ir directo al inicio.
                </p>
                <PrimaryButton onClick={() => router.replace("/inicio")}>
                  Ir a Inicio sin código
                </PrimaryButton>
              </div>
            </div>
          </SurfaceCard>
        )}

        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight mb-2">
            Tu cuenta está lista
          </h1>
          <p className="text-[var(--ink-muted)] text-base leading-relaxed max-w-md mx-auto">
            Falta activar tu acceso. Introduce el código de invitación que te hayan enviado y pulsa «Activar acceso».
          </p>
        </div>

        <SurfaceCard padding="lg" clickable={false}>
          <h2 className="text-base font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[var(--primary)]" />
            Código de invitación
          </h2>
          <p className="text-[var(--muted)] text-sm mb-4">
            Si te enviaron un código, introdúcelo a continuación.
          </p>
          <form onSubmit={handleRedeem} className="flex flex-wrap gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej. ABCD-1234"
              className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] input-premium"
              aria-label="Código de invitación"
              autoComplete="off"
              disabled={loading}
            />
            <PrimaryButton type="submit" disabled={loading || !code.trim()}>
              {loading ? "Comprobando…" : "Activar acceso"}
            </PrimaryButton>
          </form>
        </SurfaceCard>

        <SurfaceCard padding="lg" clickable={false}>
          <h2 className="text-base font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--primary)]" />
            Solicitar acceso
          </h2>
          <p className="text-[var(--muted)] text-sm mb-4">
            Si no tienes código, envía una solicitud y te contactaremos.
          </p>
          {requestSent ? (
            <p className="text-[var(--success)] font-medium text-sm">
              Solicitud enviada. Revisaremos tu acceso y te avisaremos.
            </p>
          ) : (
            <SecondaryButton
              type="button"
              onClick={handleRequestAccess}
              disabled={requestLoading}
            >
              {requestLoading ? "Enviando…" : "Solicitar acceso"}
            </SecondaryButton>
          )}
        </SurfaceCard>

        {error && (
          <Alert message={error} variant="error" />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <SecondaryButton href="/soporte" className="inline-flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Contactar soporte
          </SecondaryButton>
          <SecondaryButton type="button" onClick={handleSignOut} className="inline-flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
