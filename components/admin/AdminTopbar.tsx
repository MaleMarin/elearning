"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronRight, User } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  cursos: "Cursos",
  curso: "Curso",
  cohortes: "Cohortes",
  alumnos: "Alumnos",
  certificados: "Certificados",
  notificaciones: "Notificaciones",
  analytics: "Analytics",
  evaluaciones: "Evaluaciones",
  moderacion: "Moderación",
  competencias: "Competencias",
  "api-keys": "API Keys",
  auditoria: "Auditoría",
  "banco-preguntas": "Banco de preguntas",
  importar: "Importar",
  modulos: "Módulos",
  contenido: "Contenido",
  leccion: "Lección",
  lecciones: "Lecciones",
  retos: "Retos",
  seguridad: "Seguridad",
  conocimiento: "Conocimiento",
  quizzes: "Quizzes",
  talleres: "Talleres",
  calificaciones: "Calificaciones",
  propuestas: "Propuestas",
  roleplay: "Roleplay",
  simulaciones: "Simulaciones",
  "escape-rooms": "Escape rooms",
  glosario: "Glosario",
  mentores: "Mentores",
  generar: "Generar",
};

function generateBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || segments[0] !== "admin") {
    return [{ label: "Admin", href: "/admin" }];
  }
  const crumbs: { label: string; href?: string }[] = [{ label: "Admin", href: "/admin" }];
  let acc = "/admin";
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    const isId = /^[a-z0-9-]{20,}$/i.test(seg) || (seg.length >= 10 && !SEGMENT_LABELS[seg]);
    const label = isId ? (i === 1 ? "Detalle" : "Editar") : (SEGMENT_LABELS[seg] ?? seg);
    crumbs.push({
      label,
      href: isLast ? undefined : acc,
    });
  }
  return crumbs;
}

export function AdminTopbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string | null } | null>(null);
  const breadcrumbs = generateBreadcrumbs(pathname ?? "");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setUser({ email: data.email ?? null });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 min-h-[42px]"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-shadow-out-sm)",
      }}
    >
      <nav aria-label="Migas de pan" className="flex items-center gap-1 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1 shrink-0">
            {i > 0 && <ChevronRight className="w-4 h-4 text-[var(--texto-sub)]" aria-hidden />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-[var(--texto-sub)] hover:text-[var(--azul)] truncate max-w-[120px] sm:max-w-none"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--ink)] truncate">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(0, 229, 160, 0.12)",
            color: "var(--acento-dark)",
            border: "0.5px solid rgba(0, 229, 160, 0.3)",
          }}
        >
          Admin
        </span>
        {user?.email && (
          <span className="flex items-center gap-2 text-sm text-[var(--texto-sub)]" title={user.email}>
            <User className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline truncate max-w-[140px]">{user.email}</span>
          </span>
        )}
      </div>
    </header>
  );
}
