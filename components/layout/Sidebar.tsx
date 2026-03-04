"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Video,
  CheckSquare,
  Users,
  Award,
  HelpCircle,
  User,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";

const nav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/cursos", label: "Curso", icon: BookOpen },
  { href: "/sesiones", label: "Sesiones en vivo", icon: Video },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/comunidad", label: "Comunidad", icon: Users },
  { href: "/certificado", label: "Certificado", icon: Award },
  { href: "/soporte", label: "Soporte", icon: HelpCircle },
  { href: "/perfil", label: "Mi perfil", icon: User },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const client = createClient();
    setSupabase(client);
    client.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = client.auth.onAuthStateChange(() => {
      client.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !user) {
      setRole(null);
      return;
    }
    supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => {
      setRole(data?.role ?? null);
    });
  }, [supabase, user]);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <aside
      className="w-64 min-h-screen flex flex-col text-[18px] sidebar-elevation"
      aria-label="Navegación principal"
    >
      <div className="p-5 pb-4 border-b border-[var(--line)]">
        <Link href="/" className="flex items-center gap-2 text-[var(--ink)] font-semibold text-lg" aria-label="Precisar - Inicio">
          <Image
            src="/logo-precisar.png"
            alt="Precisar"
            width={220}
            height={56}
            className="h-14 w-auto min-w-[200px] object-contain object-left"
            priority
          />
        </Link>
      </div>

      <nav className="p-3 flex flex-col gap-1 flex-1">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl min-h-[48px] transition-all duration-200
                ${isActive
                  ? "bg-white text-[var(--primary)] font-medium elevation-1"
                  : "text-[var(--ink-muted)] hover:bg-white/70 hover:text-[var(--ink)] hover-elevation-1"
                }
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cream-warm)]
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {(role === "admin" || role === "mentor") && (
          <>
            <div className="my-2 border-t border-[var(--line)]" />
            <Link
              href="/panel/contenido"
              className="flex items-center gap-3 px-4 py-3 rounded-xl min-h-[48px] text-[var(--primary)] font-medium hover:bg-white/70 transition-all duration-200"
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              Panel de contenido
            </Link>
            <Link
              href="/panel/comunicacion"
              className="flex items-center gap-3 px-4 py-3 rounded-xl min-h-[48px] text-[var(--primary)] font-medium hover:bg-white/70 transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              Centro de Comunicación
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 pt-2 border-t border-[var(--line)]">
        {supabase && user ? (
          <>
            <p className="px-4 py-2 text-[var(--ink-muted)] text-sm truncate" title={user.email}>
              {user.email}
            </p>
            <button
              type="button"
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--ink)] hover:bg-white/70 transition-all duration-200 min-h-[48px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              Cerrar sesión
            </button>
          </>
        ) : supabase ? (
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl min-h-[48px] text-[var(--primary)] font-medium hover:bg-white/70 transition-all duration-200"
          >
            Iniciar sesión
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
