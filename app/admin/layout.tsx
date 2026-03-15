"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDemoMode } from "@/lib/env";
import { Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [showMfaBanner, setShowMfaBanner] = useState(false);

  useEffect(() => {
    if (getDemoMode()) return;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { role?: string; mfaEnabled?: boolean }) => {
        if (data?.role === "admin" && data?.mfaEnabled === false) {
          setShowMfaBanner(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {showMfaBanner && (
        <div
          role="alert"
          className="bg-[var(--amber-soft)] border-b border-[var(--amber)] text-[var(--ink)] py-3 px-4 flex flex-wrap items-center justify-center gap-2 text-sm"
        >
          <Shield className="w-4 h-4 flex-shrink-0" aria-hidden />
          <span>Tu cuenta no tiene verificación en dos pasos activada. Actívala ahora para proteger la plataforma.</span>
          <Link
            href="/admin/seguridad"
            className="font-medium text-[var(--primary)] underline hover:no-underline"
          >
            Activar en Seguridad
          </Link>
        </div>
      )}
      {children}
    </>
  );
}
