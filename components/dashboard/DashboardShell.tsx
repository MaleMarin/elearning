"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/hooks/useTheme";
import { AssistantFab } from "@/components/assistant/AssistantFab";
import InactivityGuard from "@/components/auth/InactivityGuard";

const f = (n: number) => Math.round(n * 1.3);

export type DashboardTheme = {
  bg: string;
  elevated: string;
  elevatedSm: string;
  elevatedLg: string;
  inset: string;
  insetSm: string;
  sidebarLeft: string;
  sidebarRight: string;
  text: string;
  muted: string;
  muted2: string;
  border: string;
  border2: string;
};

const NM_LIGHT: DashboardTheme = {
  bg: "#e8eaf0",
  elevated: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
  elevatedSm: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
  elevatedLg: "8px 8px 18px #c2c8d6, -8px -8px 18px #ffffff",
  inset: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
  insetSm: "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff",
  sidebarLeft: "5px 0 16px #c2c8d6, 1px 0 4px #ffffff",
  sidebarRight: "-4px 0 14px #c2c8d6, -1px 0 4px #ffffff",
  text: "#0a0f8a",
  muted: "#8892b0",
  muted2: "#4a5580",
  border: "rgba(194,200,214,0.25)",
  border2: "rgba(194,200,214,0.3)",
};

const NM_DARK: DashboardTheme = {
  bg: "#1a1f2e",
  elevated: "6px 6px 14px rgba(0,0,0,0.4), -6px -6px 14px rgba(255,255,255,0.03)",
  elevatedSm: "4px 4px 10px rgba(0,0,0,0.35), -4px -4px 10px rgba(255,255,255,0.03)",
  elevatedLg: "8px 8px 18px rgba(0,0,0,0.45), -8px -8px 18px rgba(255,255,255,0.04)",
  inset: "inset 3px 3px 8px rgba(0,0,0,0.35), inset -3px -3px 8px rgba(255,255,255,0.03)",
  insetSm: "inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.03)",
  sidebarLeft: "5px 0 16px rgba(0,0,0,0.4), 1px 0 4px rgba(255,255,255,0.02)",
  sidebarRight: "-4px 0 14px rgba(0,0,0,0.35), -1px 0 4px rgba(255,255,255,0.02)",
  text: "#e2e8f0",
  muted: "#94a3b8",
  muted2: "#a8b4c4",
  border: "rgba(255,255,255,0.08)",
  border2: "rgba(255,255,255,0.1)",
};

const IcoGrid = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcoBook = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoCalendar = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoCheck = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IcoUsers = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoMsg = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IcoLab = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoUser = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoLogout = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoHelp = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoLayers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const IcoPortfolio = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoKnowledge = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M12 5a7 7 0 0 0-7 7c0 2.5 1.5 4 3 5l4-4 4 4c1.5-1 3-2.5 3-5a7 7 0 0 0-7-7z"/></svg>;
const IcoRetos = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;

const NAV_ITEMS: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/inicio", label: "Inicio", icon: <IcoGrid /> },
  { href: "/curso", label: "Mi Curso", icon: <IcoBook /> },
  { href: "/sesiones-en-vivo", label: "Sesiones", icon: <IcoCalendar /> },
  { href: "/tareas", label: "Tareas", icon: <IcoCheck /> },
  { href: "/comunidad", label: "Comunidad", icon: <IcoUsers /> },
  { href: "/mi-colega", label: "Mi Colega", icon: <IcoMsg /> },
  { href: "/laboratorio", label: "Laboratorio", icon: <IcoLab /> },
  { href: "/portafolio", label: "Portafolio", icon: <IcoPortfolio /> },
  { href: "/conocimiento", label: "Conocimiento", icon: <IcoKnowledge /> },
  { href: "/retos", label: "Retos", icon: <IcoRetos /> },
];

function SidebarNavSquare({
  href,
  label,
  icon,
  active,
  theme,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  theme: DashboardTheme;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-current={active ? "page" : undefined}
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 46,
        height: 46,
        borderRadius: 13,
        border: "none",
        cursor: "pointer",
        background: active ? "rgba(20,40,212,0.06)" : theme.bg,
        color: active ? "#1428d4" : theme.muted,
        boxShadow: active ? theme.insetSm : theme.elevatedSm,
        transition: "all 0.18s ease",
        textDecoration: "none",
      }}
    >
      {icon}
    </Link>
  );
}

export interface DashboardShellProps {
  children: React.ReactNode;
  /** Panel derecho opcional (solo en /inicio). */
  rightPanel?: React.ReactNode;
  /** Título secundario bajo "Política Digital" (ej. "Módulo 3 · Ciberseguridad"). */
  subtitle?: string;
}

export function DashboardShell({ children, rightPanel, subtitle }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const NM = isDark ? NM_DARK : NM_LIGHT;

  const handleCerrarSesion = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: NM.bg,
        fontFamily: "var(--font-heading)",
        color: NM.text,
      }}
    >
      <aside
        className="flex flex-col items-center py-5 flex-shrink-0 relative z-10"
        style={{ width: 72, background: NM.bg, boxShadow: NM.sidebarLeft }}
        aria-label="Navegación principal"
      >
        <div
          className="flex items-center justify-center mb-6 flex-shrink-0"
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
            boxShadow: "5px 5px 12px #c2c8d6, -3px -3px 8px #ffffff",
          }}
          aria-hidden
        >
          <IcoLayers />
        </div>
        <nav className="flex flex-col gap-2 items-center w-full" role="navigation">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/inicio" && pathname?.startsWith(item.href));
            return (
              <SidebarNavSquare
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={active}
                theme={NM}
              />
            );
          })}
        </nav>
        <div className="flex-1" />
        <div className="flex flex-col gap-2 w-full items-center">
          <SidebarNavSquare
            href="/mi-perfil"
            label="Mi perfil"
            icon={<IcoUser />}
            active={pathname === "/mi-perfil" || pathname?.startsWith("/mi-perfil")}
            theme={NM}
          />
          <button
            type="button"
            onClick={handleCerrarSesion}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              border: "none",
              cursor: "pointer",
              background: NM.bg,
              color: NM.muted,
              boxShadow: NM.elevatedSm,
              transition: "all 0.18s ease",
            }}
          >
            <IcoLogout />
          </button>
        </div>
      </aside>

      <main
        className="flex-1 overflow-y-auto min-w-0 flex flex-col"
        style={{ padding: "18px 16px" }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: NM.text,
                letterSpacing: "-0.3px",
                lineHeight: 1.2,
              }}
            >
              Política Digital
            </h1>
            <p
              style={{
                fontSize: 11,
                color: NM.muted,
                marginTop: 2,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {subtitle ?? "// Dashboard"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={isDark ? "Usar modo claro" : "Usar modo oscuro"}
              aria-label={isDark ? "Usar modo claro" : "Usar modo oscuro"}
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: f(10),
                fontWeight: 700,
                background: NM.bg,
                color: NM.muted2,
                boxShadow: NM.insetSm,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <button
              type="button"
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: f(10),
                fontWeight: 700,
                background: NM.bg,
                color: NM.muted2,
                boxShadow: NM.insetSm,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <IcoHelp />
              ¿Cómo funciona?
            </button>
            <div
              style={{
                background: NM.bg,
                borderRadius: 10,
                padding: "6px 11px",
                boxShadow: NM.insetSm,
                fontSize: f(10),
                color: NM.muted2,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {new Date().toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div
              className="flex items-center gap-1"
              style={{
                fontSize: f(10),
                color: NM.muted,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  background: "#00e5a0",
                  borderRadius: "50%",
                  display: "block",
                  boxShadow: "0 0 5px rgba(0,229,160,0.8)",
                  animation: "pulse 2s infinite",
                }}
              />
              En línea
            </div>
          </div>
        </div>

        {children}
      </main>

      {rightPanel != null && (
        <aside
          className="flex-shrink-0 overflow-y-auto"
          style={{
            width: 360,
            marginTop: 16,
            padding: "18px 16px",
            background: NM.bg,
            borderRadius: 20,
            boxShadow: isDark
              ? "8px 8px 18px rgba(0,0,0,0.4), -8px -8px 18px rgba(255,255,255,0.03)"
              : "8px 8px 18px #c2c8d6, -8px -8px 18px #ffffff, -2px 0 12px rgba(194,200,214,0.4)",
          }}
        >
          {rightPanel}
        </aside>
      )}

      <AssistantFab />
      <InactivityGuard />
    </div>
  );
}
