"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarProfileCard } from "./SidebarProfileCard";

interface SidebarProps {
  collapsed?: boolean;
}

const NAV_ITEMS: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/inicio",
    label: "Inicio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/curso",
    label: "Curso",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    href: "/sesiones",
    label: "Sesiones",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    href: "/tareas",
    label: "Tareas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: "/comunidad",
    label: "Comunidad",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/mi-colega",
    label: "Colega",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: "/mentores",
    label: "Mentores",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    href: "/conocimiento",
    label: "Conocimiento",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
  {
    href: "/laboratorio",
    label: "Laboratorio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-4 7h14l-4-7V3" />
      </svg>
    ),
  },
  {
    href: "/portafolio",
    label: "Portafolio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    href: "/retos",
    label: "Retos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    href: "/egresados",
    label: "Egresados",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    href: "/certificado",
    label: "Certificado",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    href: "/soporte",
    label: "Soporte",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: "/mi-perfil",
    label: "Perfil",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function SidebarItem({
  item,
  collapsed,
  active,
}: {
  item: (typeof NAV_ITEMS)[0];
  collapsed: boolean;
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={item.href}
        style={{
          width: collapsed ? 44 : "calc(100% - 16px)",
          minHeight: 44,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 10,
          padding: collapsed ? 0 : "10px 14px",
          margin: collapsed ? 0 : "2px 8px",
          textDecoration: "none",
          background: active
            ? "linear-gradient(135deg, #1428d4, #0a0f8a)"
            : "#e8eaf0",
          boxShadow: active
            ? "4px 4px 10px rgba(10,15,138,0.3), -2px -2px 6px rgba(255,255,255,0.5)"
            : hovered
              ? "3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff"
              : "3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff",
          transition: "all 0.15s ease",
        }}
        aria-current={active ? "page" : undefined}
      >
        <span style={{ color: active ? "white" : "#4a5580", display: "flex", alignItems: "center", flexShrink: 0 }}>
          {item.icon}
        </span>
        {!collapsed && (
          <span
            style={{
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              color: active ? "white" : "#4a5580",
              fontFamily: "'Raleway', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.label}
          </span>
        )}
      </Link>
      {collapsed && hovered && (
        <div
          style={{
            position: "absolute",
            left: 58,
            top: "50%",
            transform: "translateY(-50%)",
            background: "#0a0f8a",
            color: "white",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            zIndex: 100,
            fontFamily: "var(--font-heading)",
            boxShadow: "4px 4px 12px rgba(10,15,138,0.3)",
            pointerEvents: "none",
          }}
        >
          {item.label}
          <div
            style={{
              position: "absolute",
              left: -5,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "5px solid #0a0f8a",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function Sidebar({ collapsed = true }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [cohortName, setCohortName] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<{ id: string; fechaFin: string } | null>(null);
  const [challengeDaysLeft, setChallengeDaysLeft] = useState(0);
  const router = useRouter();

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
    if (!activeChallenge?.fechaFin) return;
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
        setUser(data.uid ? { id: data.uid, email: data.email ?? undefined } : null);
        setRole(data.role ?? null);
      })
      .catch(() => { if (!cancelled) setUser(null); });
    return () => { cancelled = true; };
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
    return () => { cancelled = true; };
  }, [role]);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  };

  const filteredNavItems = NAV_ITEMS.filter(
    (item) => !(item.href === "/laboratorio" && !user)
  );

  return (
    <aside
      aria-label="Navegación principal"
      style={{
        width: collapsed ? 64 : 180,
        minWidth: collapsed ? 64 : 180,
        background: "#e8eaf0",
        boxShadow: "4px 0 14px #c2c8d6, -1px 0 4px #ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: collapsed ? "center" : "flex-start",
        padding: "12px 0",
        gap: 4,
        transition: "width 0.2s ease",
        overflowX: "hidden",
        zIndex: 10,
      }}
    >
      <Link
        href="/inicio"
        aria-label="Política Digital - Inicio"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 10,
          padding: collapsed ? "0 12px" : "0 16px",
          marginBottom: 16,
          textDecoration: "none",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            flexShrink: 0,
            background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
          }}
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <span style={{ color: "#0a0f8a", fontFamily: "'Space Mono', monospace", fontSize: 10, lineHeight: 1.2, letterSpacing: "0.05em" }}>
              POLÍTICA DIGITAL
            </span>
            <span style={{ color: "#8892b0", fontSize: 9, lineHeight: 1.2, display: "block" }}>
              Innovación Pública
            </span>
          </div>
        )}
      </Link>
      {!collapsed && cohortName && (
        <span
          style={{
            background: "#e8eaf0",
            color: "#4a5580",
            fontSize: 9,
            borderRadius: 20,
            padding: "3px 10px",
            boxShadow: "inset 2px 2px 4px #c2c8d6, inset -2px -2px 4px #ffffff",
            marginBottom: 8,
            marginLeft: 16,
            display: "inline-block",
            maxWidth: "calc(100% - 32px)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={cohortName}
        >
          Grupo
        </span>
      )}

      <nav className="flex flex-col gap-2 flex-1 px-2 w-full" role="navigation" aria-label="Menú principal" style={{ paddingLeft: collapsed ? 0 : 8, paddingRight: collapsed ? 0 : 8 }}>
        {filteredNavItems.map((item) => {
          const isActive =
            mounted &&
            (pathname === item.href || (item.href !== "/inicio" && pathname?.startsWith(item.href)));
          return (
            <SidebarItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={!!isActive}
            />
          );
        })}
        {activeChallenge && (
          <Link
            href={`/retos/${activeChallenge.id}`}
            title="Reto activo de grupo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "10px" : "12px 16px",
              borderRadius: 12,
              minHeight: 44,
              marginTop: 8,
              background: "#e8eaf0",
              color: "#4a5580",
              fontFamily: "var(--font-heading)",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
              textDecoration: "none",
              width: collapsed ? 44 : "calc(100% - 16px)",
              marginLeft: collapsed ? 0 : 8,
            }}
          >
            <span style={{ flexShrink: 0 }} aria-hidden>🏆</span>
            {!collapsed && (
              <>
                <span className="flex-1 min-w-0">Reto activo</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#00e5a0", color: "#0a1628", padding: "2px 8px", borderRadius: 20 }}>
                  {challengeDaysLeft} días
                </span>
              </>
            )}
          </Link>
        )}
        {(role === "admin" || role === "mentor") && (
          <>
            <div style={{ borderTop: "1px solid rgba(194,200,214,0.35)", marginTop: 12, paddingTop: 8, width: "100%" }} />
            {!collapsed && (
              <>
                <Link href="/admin" style={{ fontSize: 12, fontWeight: 600, color: "#4a5580", padding: "8px 12px", display: "block" }}>Admin</Link>
                <Link href="/admin/cursos" style={{ fontSize: 12, fontWeight: 600, color: "#4a5580", padding: "8px 12px", display: "block" }}>Cursos (admin)</Link>
                {role === "admin" && (
                  <Link href="/admin/cohortes" style={{ fontSize: 12, fontWeight: 600, color: "#4a5580", padding: "8px 12px", display: "block" }}>Grupos</Link>
                )}
                <Link href="/panel/contenido" style={{ fontSize: 12, fontWeight: 600, color: "#4a5580", padding: "8px 12px", display: "block" }}>Panel contenido</Link>
                <Link href="/panel/comunicacion" style={{ fontSize: 12, fontWeight: 600, color: "#4a5580", padding: "8px 12px", display: "block" }}>Comunicación</Link>
                <Link href="/admin/notificaciones" style={{ fontSize: 12, fontWeight: 600, color: "#4a5580", padding: "8px 12px", display: "block" }}>Notificaciones</Link>
              </>
            )}
          </>
        )}
      </nav>

      <div style={{ borderTop: "1px solid rgba(194,200,214,0.35)", paddingTop: 12, paddingLeft: collapsed ? 0 : 16, paddingRight: collapsed ? 0 : 16, paddingBottom: 12, width: "100%", display: "flex", flexDirection: "column", alignItems: collapsed ? "center" : "stretch", gap: 8 }}>
        {!collapsed && <SidebarProfileCard user={user} onSignOut={handleSignOut} showSignOutButton={false} />}
        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "center",
              gap: 8,
              padding: collapsed ? 10 : "10px 16px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: "#e8eaf0",
              color: "#b91c1c",
              fontFamily: "var(--font-heading)",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
              width: collapsed ? 44 : "100%",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && "Cerrar sesión"}
          </button>
        )}
      </div>
    </aside>
  );
}
