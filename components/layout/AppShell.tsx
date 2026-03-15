"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { RightRail } from "./RightRail";
import { AssistantFab } from "@/components/assistant/AssistantFab";
import HowItWorksButton from "@/components/ui/HowItWorksButton";
import { registerOnlineSync } from "@/lib/offline/sync-manager";

export interface AppShellProps {
  children: React.ReactNode;
}

const SEGMENT_LABELS: Record<string, string> = {
  inicio: "Inicio",
  curso: "Mi curso",
  lecciones: "Lección",
  "sesiones-en-vivo": "Sesiones en vivo",
  tareas: "Tareas",
  comunidad: "Comunidad",
  "mi-colega": "Mi colega",
  mentores: "Mentores",
  egresados: "Egresados",
  certificado: "Certificado",
  laboratorio: "El Laboratorio",
  simulador: "Simulador de Política Pública",
  soporte: "Soporte",
  "mi-perfil": "Mi perfil",
  admin: "Admin",
  cursos: "Cursos",
  cohortes: "Grupos",
  felicidades: "Felicidades",
  "panel": "Panel",
  contenido: "Contenido",
  comunicacion: "Comunicación",
};

function generateBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || segments[0] === "inicio") {
    return [{ label: "Inicio" }];
  }
  const crumbs: { label: string; href?: string }[] = [{ label: "Inicio", href: "/inicio" }];
  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    const seg = segments[i];
    const isLast = i === segments.length - 1;
    const isLessonId = seg && i > 0 && segments[i - 1] === "lecciones" && !SEGMENT_LABELS[seg];
    const isSimuladorId = seg && i > 0 && segments[i - 1] === "simulador";
    const label = isLessonId ? "Lección" : isSimuladorId ? "Simulación" : (SEGMENT_LABELS[seg] ?? seg);
    crumbs.push({
      label,
      href: isLast ? undefined : acc,
    });
  }
  return crumbs;
}

/**
 * Layout principal de la plataforma: sidebar izquierda, contenido central, panel derecho.
 * Incluye topbar con migas de pan y el FAB del asistente.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  useEffect(() => {
    const unregister = registerOnlineSync();
    return unregister;
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: "#f0f2f5" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="flex-shrink-0 border-b border-[var(--line)] px-4 py-3 sm:px-6 flex items-center justify-between gap-3"
          style={{ background: "#f0f2f5" }}
          aria-label="Migas de navegación"
        >
          <nav className="flex items-center gap-1.5 text-sm text-[var(--ink-muted)] min-w-0 flex-1">
            <div className="hidden sm:flex sm:items-center sm:gap-1.5 flex-wrap">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-[var(--line)]" aria-hidden>›</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-[var(--ink)] no-underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[var(--ink)] font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
            <span className="sm:hidden text-[var(--ink)] font-medium">
              {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Inicio"}
            </span>
          </nav>
        </header>
        <main
          className="flex-1 flex justify-center px-0 py-0 relative z-10 min-w-0"
          role="main"
          id="main-content"
          style={{
            background: "#f0f2f5",
            ...(pathname === "/inicio" && { overflow: "hidden", padding: 0 }),
          }}
        >
          <div className="w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
      {pathname !== "/inicio" && <RightRail />}
      <AssistantFab />
      <HowItWorksButton />
    </div>
  );
}
