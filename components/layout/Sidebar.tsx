"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarProfileCard } from "./SidebarProfileCard";

const NAV_TOOLTIPS: Record<string, string> = {
  "/inicio": "Tu progreso, siguiente lección y pasos de inicio",
  "/curso": "Módulos y lecciones del programa",
  "/sesiones-en-vivo": "Clases en vivo con facilitadores",
  "/tareas": "Actividades y entregas pendientes",
  "/comunidad": "Foro, preguntas y red de compañeros",
  "/mi-colega": "Aprende en pareja con otro servidor público",
  "/mentores": "Conecta con egresados expertos",
  "/egresados": "Red de alumni del programa",
  "/certificado": "Tu certificado oficial al completar el 100%",
  "/laboratorio": "Juegos y exploración sin calificaciones",
  "/soporte": "Ayuda y preguntas frecuentes",
  "/mi-perfil": "Tu información, preferencias y notificaciones",
};

const NAV_ITEMS = [
  { href: "/inicio", label: "Inicio", iconKey: "inicio" },
  { href: "/curso", label: "Mi curso", iconKey: "curso" },
  { href: "/sesiones-en-vivo", label: "Sesiones en vivo", iconKey: "sesiones" },
  { href: "/tareas", label: "Tareas", iconKey: "tareas" },
  { href: "/comunidad", label: "Comunidad", iconKey: "comunidad" },
  { href: "/mi-colega", label: "Mi colega", iconKey: "miColega" },
  { href: "/mentores", label: "Mentores", iconKey: "mentores" },
  { href: "/egresados", label: "Egresados", iconKey: "egresados" },
  { href: "/certificado", label: "Certificado", iconKey: "certificado" },
  { href: "/laboratorio", label: "El Laboratorio", iconKey: "laboratorio", authOnly: true },
  { href: "/soporte", label: "Soporte", iconKey: "soporte" },
  { href: "/mi-perfil", label: "Mi perfil", iconKey: "perfil" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [cohortName, setCohortName] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<{ id: string; fechaFin: string } | null>(null);
  const [challengeDaysLeft, setChallengeDaysLeft] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === "undefined" || role === "admin") return;
    let cancelled = false;
    fetch("/api/retos/activo", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.challenge?.id && data.challenge.estado === "activo") {
          setActiveChallenge({ id: data.challenge.id, fechaFin: data.challenge.fechaFin });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [role]);

  useEffect(() => {
    if (!activeChallenge?.fechaFin) {
      setChallengeDaysLeft(0);
      return;
    }
    const fin = new Date(activeChallenge.fechaFin).getTime();
    const update = () => setChallengeDaysLeft(Math.max(0, Math.ceil((fin - Date.now()) / (24 * 60 * 60 * 1000))));
    update();
    const t = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(t);
  }, [activeChallenge?.id, activeChallenge?.fechaFin]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setUser(
          data.uid
            ? { id: data.uid, email: data.email ?? undefined }
            : null
        );
        setRole(data.role ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || role === "admin") return;
    let cancelled = false;
    fetch("/api/enroll/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.cohortName) setCohortName(data.cohortName);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [role]);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className="w-64 min-h-screen flex flex-col text-[18px] aside-elevation [&_nav_a]:!bg-[#1428d4] [&_nav_a]:!text-white [&_nav_a]:!shadow-none [&_nav_a[aria-current=page]]:!bg-[#1428d4] [&_nav_a[aria-current=page]]:!text-white [&_nav_a[aria-current=page]]:!font-semibold [&_nav_a[aria-current=page]]:!shadow-[inset_2px_2px_6px_rgba(0,0,0,0.25)] [&_nav_a:hover]:!bg-[#1e3ed4] [&_nav_a:hover]:!text-white [&_nav_a:hover]:!shadow-none"
      aria-label="Navegación principal"
      style={{
        background: "#0a1628",
        boxShadow: "4px 0 16px rgba(0,0,0,0.3)",
        ["--muted"]: "rgba(255,255,255,0.9)",
        ["--ink"]: "#ffffff",
        ["--primary"]: "#ffffff",
        ["--surface"]: "#1428d4",
        ["--surface-soft"]: "rgba(255,255,255,0.05)",
        ["--canvas-sidebar-border"]: "rgba(255,255,255,0.08)",
        ["--shadow-card-inset"]: "inset 2px 2px 6px rgba(0,0,0,0.25)",
        ["--sidebar-bg"]: "#0a1628",
      } as React.CSSProperties}
    >
      <div className="py-5 px-4 border-b border-[var(--canvas-sidebar-border)] flex flex-col items-center sm:items-start gap-2 shrink-0">
        <Link
          href="/inicio"
          className="flex items-center justify-center sm:justify-start w-full no-underline hover:opacity-90 transition-opacity gap-3"
          aria-label="Política Digital - Inicio"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#1428d4" }}
            aria-hidden
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="10" cy="10" r="8" stroke="#ffffff" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "13px", lineHeight: 1.2 }}>
              POLÍTICA DIGITAL
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", lineHeight: 1.2 }}>
              Innovación Pública
            </span>
          </div>
        </Link>
        {cohortName && (
          <span
            className="inline-block truncate max-w-full"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "9px",
              borderRadius: "20px",
              padding: "3px 10px",
            }}
            title={cohortName}
          >
            Grupo demo
          </span>
        )}
      </div>

      <nav className="px-3 py-6 flex flex-col gap-2 flex-1" role="navigation" aria-label="Menú principal">
        <p
          className="px-4 pb-2 uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em" }}
        >
          Principal
        </p>
        {NAV_ITEMS.filter((item) => !("authOnly" in item && item.authOnly) || user).map((item) => {
          const isActive = mounted && (pathname === item.href || (item.href !== "/inicio" && pathname?.startsWith(item.href)));
          return (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActive}
              title={NAV_TOOLTIPS[item.href]}
              data-tooltip={NAV_TOOLTIPS[item.href]}
            />
          );
        })}
        {activeChallenge && (
          <Link
            href={`/reto/${activeChallenge.id}`}
            title="Reto activo de grupo"
            className="flex items-center gap-3 px-4 py-3.5 rounded-full min-h-[52px] transition-all duration-200 no-underline text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <span className="w-5 h-5 shrink-0 flex items-center justify-center" aria-hidden>🏆</span>
            <span className="flex-1 min-w-0">Reto activo</span>
            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#00e5a0", color: "#0a1628" }}>
              {challengeDaysLeft} días
            </span>
          </Link>
        )}
        {(role === "admin" || role === "mentor") && (
          <>
            <div className="my-3 border-t border-[var(--canvas-sidebar-border)]" />
            <SidebarNavItem href="/admin" label="Admin" />
            <SidebarNavItem href="/admin/cursos" label="Cursos (admin)" />
            {role === "admin" && (
              <SidebarNavItem href="/admin/cohortes" label="Grupos e invitaciones" />
            )}
            <SidebarNavItem href="/panel/contenido" label="Panel de contenido" />
            <SidebarNavItem href="/panel/comunicacion" label="Centro de Comunicación" />
            <SidebarNavItem href="/admin/notificaciones" label="Notificaciones" />
          </>
        )}
      </nav>

      <div className="p-4 pt-4 flex flex-col gap-3" style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <SidebarProfileCard user={user} onSignOut={handleSignOut} showSignOutButton={false} />
        {user && (
          <>
            <div className="my-1" style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }} aria-hidden />
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]"
              style={{ color: "rgba(255,76,76,0.8)" }}
            >
              <LogOut className="w-5 h-5 shrink-0" style={{ fill: "rgba(255,76,76,0.8)" }} stroke="rgba(255,76,76,0.8)" />
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
