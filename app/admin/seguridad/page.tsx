"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SurfaceCard, PageSection, Alert } from "@/components/ui";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getDemoMode } from "@/lib/env";
import { MFASetup } from "@/components/auth/MFASetup";
import type { User } from "firebase/auth";

export default function AdminSeguridadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (getDemoMode()) {
      setLoading(false);
      return;
    }
    (async () => {
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      if (meRes.status === 401 || meRes.status === 403) {
        setLoading(false);
        return;
      }
      const me = await meRes.json().catch(() => ({}));
      setRole((me as { role?: string }).role ?? null);
      const auth = getFirebaseAuth();
      setUser(auth?.currentUser ?? null);
      setLoading(false);
    })();
  }, []);

  if (getDemoMode()) {
    return (
      <div className="max-w-xl w-full space-y-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] no-underline">
          <ChevronLeft className="w-5 h-5" /> Volver al panel
        </Link>
        <SurfaceCard padding="md" clickable={false}>
          <p className="text-[var(--muted)]">La verificación en dos pasos no está disponible en modo demo.</p>
        </SurfaceCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-xl w-full space-y-6">
        <p className="text-[var(--muted)]">Cargando…</p>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="max-w-xl w-full space-y-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] no-underline">
          <ChevronLeft className="w-5 h-5" /> Volver al panel
        </Link>
        <Alert message="Solo los administradores pueden acceder a esta página." variant="error" />
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] no-underline">
        <ChevronLeft className="w-5 h-5" /> Volver al panel
      </Link>
      <PageSection
        title="Seguridad"
        subtitle="Verificación en dos pasos (MFA) para tu cuenta de administrador."
      >
        <></>
      </PageSection>
      <SurfaceCard padding="md" clickable={false}>
        {error && <Alert message={error} variant="error" className="mb-4" />}
        {user ? (
          <MFASetup
            user={user}
            onError={setError}
            onSuccess={() => setError("")}
          />
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Para activar la verificación en dos pasos, cierra sesión e inicia sesión de nuevo desde esta misma ventana; luego vuelve a esta página.
          </p>
        )}
      </SurfaceCard>
    </div>
  );
}
