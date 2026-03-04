"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NoInscritoPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

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
        setError(data.error ?? "Error al canjear el código");
        return;
      }
      setSuccess(true);
      setTimeout(() => window.location.replace("/"), 1500);
    } catch {
      setError("Error de conexión");
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
          details: "El usuario ha solicitado acceso mediante la página /no-inscrito.",
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--cream)]">
        <div className="card-white p-8 max-w-md text-center">
          <p className="text-lg text-[var(--success)] font-medium">Inscripción correcta. Redirigiendo…</p>
        </div>
      </div>
    );
  }

  if (signedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--cream)]">
        <p className="text-[var(--text-muted)]">Cargando…</p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--cream)]">
        <div className="card-white p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Acceso solo con inscripción</h1>
          <p className="text-[var(--text-muted)] mb-6">
            Inicia sesión para poder canjear un código de invitación o solicitar acceso.
          </p>
          <Link href="/login" className="btn-primary inline-block min-h-[44px]">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--cream)]">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
            Acceso solo con inscripción
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            Para usar la plataforma necesitas estar inscrito en un programa. Elige una opción:
          </p>
        </div>

        <section className="card-white p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
            1. Ingresar código de invitación (recomendado)
          </h2>
          <p className="text-[var(--text-muted)] text-base mb-4">
            Si tienes un código que te envió tu organización, introdúcelo aquí.
          </p>
          <form onSubmit={handleRedeem} className="flex flex-wrap gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código"
              className="flex-1 min-w-[120px] px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              aria-label="Código de invitación"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-primary disabled:opacity-50 min-h-[44px]"
            >
              {loading ? "Comprobando…" : "Canjear código"}
            </button>
          </form>
        </section>

        <section className="card-white p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
            2. Solicitar acceso
          </h2>
          <p className="text-[var(--text-muted)] text-base mb-4">
            Si no tienes código, puedes solicitar acceso. Crearemos un ticket y te contactaremos.
          </p>
          {requestSent ? (
            <p className="text-[var(--success)] font-medium">
              Solicitud enviada. Revisaremos tu acceso y te avisaremos.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleRequestAccess}
              disabled={requestLoading}
              className="btn-primary disabled:opacity-50 min-h-[44px]"
            >
              {requestLoading ? "Enviando…" : "Solicitar acceso"}
            </button>
          )}
        </section>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-[var(--error)] text-base" role="alert">
            {error}
          </div>
        )}

        <p className="text-center text-[var(--text-muted)] text-base">
          <Link href="/" className="text-[var(--accent)] underline">
            Volver al inicio
          </Link>
          {" · "}
          <button
            type="button"
            onClick={() => window.location.replace("/login")}
            className="text-[var(--accent)] underline"
          >
            Cerrar sesión
          </button>
        </p>
      </div>
    </div>
  );
}
