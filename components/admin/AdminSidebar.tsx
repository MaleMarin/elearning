"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  Library,
  ListChecks,
  Users,
  UsersRound,
  Award,
  MessageSquare,
  BarChart3,
  ClipboardList,
  ShieldCheck,
  Target,
  Key,
  Lightbulb,
  Route,
  LayoutDashboard,
  LogOut,
  FileEdit,
  Bookmark,
} from "lucide-react";

const SIDEBAR_BG = "#1428d4";
const SIDEBAR_WIDTH = 220;

const SECTIONS = [
  {
    title: "CONTENIDO",
    items: [
      { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
      { href: "/admin/banco-preguntas", label: "Banco de preguntas", icon: Library },
      { href: "/admin/propuestas", label: "Propuestas", icon: FileEdit },
      { href: "/admin/glosario", label: "Glosario", icon: Bookmark },
    ],
  },
  {
    title: "ALUMNOS",
    items: [
      { href: "/admin/alumnos", label: "Todos los alumnos", icon: Users },
      { href: "/admin/cohortes", label: "Cohortes", icon: UsersRound },
      { href: "/admin/reglas", label: "Reglas de inscripción", icon: ListChecks },
      { href: "/admin/rutas", label: "Rutas de aprendizaje", icon: Route },
      { href: "/admin/certificados", label: "Certificados", icon: Award },
    ],
  },
  {
    title: "COMUNICACIÓN",
    items: [
      { href: "/admin/notificaciones", label: "Notificaciones", icon: MessageSquare },
    ],
  },
  {
    title: "ANÁLISIS",
    items: [
      { href: "/admin/necesidades", label: "Necesidades de aprendizaje", icon: Lightbulb },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/evaluaciones", label: "Evaluaciones", icon: ClipboardList },
      { href: "/admin/moderacion", label: "Moderación", icon: ShieldCheck },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { href: "/admin/competencias", label: "Competencias SPC", icon: Target },
      { href: "/admin/api-keys", label: "API keys", icon: Key },
      { href: "/admin/auditoria", label: "Auditoría", icon: FileText },
    ],
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className="flex-shrink-0 flex flex-col min-h-screen text-white"
      style={{
        width: SIDEBAR_WIDTH,
        background: SIDEBAR_BG,
        fontFamily: "var(--font)",
      }}
      aria-label="Navegación administrador"
    >
      <div className="py-5 px-4 border-b border-white/10 flex flex-col items-start gap-1 shrink-0">
        <Link
          href="/admin"
          className="flex items-center justify-start w-full no-underline hover:opacity-90 transition-opacity"
          aria-label="Admin — Política Digital"
        >
          <Image
            src="/politica-digita-logo-head.png"
            alt="Política Digital"
            width={180}
            height={50}
            className="h-10 w-auto max-w-[180px] object-contain object-left brightness-0 invert opacity-95"
            priority
          />
        </Link>
        <span className="text-xs font-medium text-white/70 tracking-wide mt-1">Panel de administración</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6" role="navigation">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            pathname === "/admin" ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" aria-hidden />
          <span className="font-medium">Dashboard</span>
        </Link>

        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (String(item.href) !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/inicio"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 text-sm font-medium mb-2"
        >
          ← Volver al inicio
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
