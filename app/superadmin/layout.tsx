"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, LayoutDashboard, ChevronLeft } from "lucide-react";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/superadmin/me", { credentials: "include" })
      .then((r) => {
        if (r.status === 403 || r.status === 401) setAllowed(false);
        else setAllowed(true);
      })
      .catch(() => setAllowed(false));
  }, []);

  useEffect(() => {
    if (allowed === false) router.replace("/login?redirect=" + encodeURIComponent(pathname || "/superadmin"));
  }, [allowed, router, pathname]);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-[var(--ink-muted)]">Verificando acceso…</p>
      </div>
    );
  }

  if (allowed === false) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/superadmin" className="font-semibold text-[var(--ink)] flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[var(--primary)]" /> Superadmin
            </Link>
            <nav className="flex gap-2">
              <Link
                href="/superadmin"
                className={`px-3 py-1.5 rounded-lg text-sm ${pathname === "/superadmin" ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"}`}
              >
                <LayoutDashboard className="w-4 h-4 inline mr-1" /> Dashboard
              </Link>
              <Link
                href="/superadmin/tenants"
                className={`px-3 py-1.5 rounded-lg text-sm ${pathname === "/superadmin/tenants" ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"}`}
              >
                <Building2 className="w-4 h-4 inline mr-1" /> Tenants
              </Link>
              <Link
                href="/superadmin/billing"
                className={`px-3 py-1.5 rounded-lg text-sm ${pathname === "/superadmin/billing" ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"}`}
              >
                Facturación
              </Link>
            </nav>
          </div>
          <Link href="/admin" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Volver a Admin
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
