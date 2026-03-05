"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getDemoMode } from "@/lib/env";

export interface AccessGuardProps {
  children: React.ReactNode;
  /** Si true, requiere enrollment activo (no solo sesión). Por defecto true. */
  requireEnrollment?: boolean;
}

/**
 * Guardia de acceso opcional para uso en cliente.
 * El middleware ya protege las rutas; este componente sirve para páginas
 * que quieran mostrar un estado de carga o redirigir antes de renderizar.
 */
export function AccessGuard({ children, requireEnrollment = true }: AccessGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (getDemoMode()) {
      setAllowed(true);
      setReady(true);
      return;
    }

    let cancelled = false;

    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.replace("/login");
        return;
      }
      if (!requireEnrollment) {
        setAllowed(true);
        setReady(true);
        return;
      }
      const res = await fetch("/api/enroll/status", { cache: "no-store" });
      const data = await res.json();
      if (cancelled) return;
      if (data.enrolled !== true) {
        router.replace("/no-inscrito");
        return;
      }
      setAllowed(true);
      setReady(true);
    }

    check();
    return () => { cancelled = true; };
  }, [router, requireEnrollment]);

  if (!ready || !allowed) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <p className="text-[var(--ink-muted)]">Comprobando acceso…</p>
      </div>
    );
  }

  return <>{children}</>;
}
