"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PrimaryButton } from "@/components/ui/Buttons";
import { Alert } from "@/components/ui/Alert";
import { HelpCircle, LogOut, KeyRound, Mail } from "lucide-react";

export default function NoInscritoPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setSignedIn(!!data.user));
  }, []);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
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

  const pageBg = { backgroundColor: "#F3F2EF" };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={pageBg}>
        <SurfaceCard padding="lg" className="max-w-md text-center">
          <p className="text-lg text-[var(--success)] font-medium">
            Acceso activado. Redirigiendo a tu panel…
          </p>
        </SurfaceCard>
      </div>
    );
  }

  if (signedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={pageBg}>
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={pageBg}>
        <SurfaceCard padding="lg" className="max-w-md text-center">
          <h1 className="text-xl font-bold text-[var(--ink)] mb-2">
            Acceso con inscripción
          </h1>
          <p className="text-[var(--ink-muted)] mb-6">
            Inicia sesión para canjear un código o solicitar acceso a un programa.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-full font-medium bg-[var(--primary)] text-white no-underline hover:bg-[var(--primary-hover)]"
          >
            Ir a iniciar sesión
          </Link>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={pageBg}>
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight mb-2">
            Tu cuenta está lista
          </h1>
          <p className="text-[var(--ink-muted)] text-base leading-relaxed max-w-md mx-auto">
            Falta activar tu acceso. Introduce el código de invitación que te hayan enviado y pulsa «Activar acceso».
          </p>
        </div>

        <SurfaceCard padding="lg">
          <h2 className="text-base font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[var(--primary)]" />
            Código de invitación
          </h2>
          <p className="text-[var(--ink-muted)] text-sm mb-4">
            Si te enviaron un código, introdúcelo a continuación.
          </p>
          <form onSubmit={handleRedeem} className="flex flex-wrap gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej. ABCD-1234"
              className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              aria-label="Código de invitación"
              autoComplete="off"
              disabled={loading}
            />
            <PrimaryButton type="submit" disabled={loading || !code.trim()}>
              {loading ? "Comprobando…" : "Activar acceso"}
            </PrimaryButton>
          </form>
        </SurfaceCard>

        <SurfaceCard padding="lg">
          <h2 className="text-base font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--primary)]" />
            Solicitar acceso
          </h2>
          <p className="text-[var(--ink-muted)] text-sm mb-4">
            Si no tienes código, envía una solicitud y te contactaremos.
          </p>
          {requestSent ? (
            <p className="text-[var(--success)] font-medium text-sm">
              Solicitud enviada. Revisaremos tu acceso y te avisaremos.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleRequestAccess}
              disabled={requestLoading}
              className="text-[var(--primary)] font-medium hover:underline disabled:opacity-50 min-h-[44px]"
            >
              {requestLoading ? "Enviando…" : "Solicitar acceso"}
            </button>
          )}
        </SurfaceCard>

        {error && (
          <Alert message={error} variant="error" />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/soporte"
            className="inline-flex items-center gap-2 text-[var(--ink)] hover:text-[var(--primary)] no-underline text-sm font-medium min-h-[44px] items-center"
          >
            <HelpCircle className="w-4 h-4" />
            Contactar soporte
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] bg-transparent border border-[var(--line-subtle)] rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
