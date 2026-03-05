"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
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
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarProfileCard } from "./SidebarProfileCard";

const NAV_ITEMS = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/curso", label: "Curso", icon: BookOpen },
  { href: "/sesiones-en-vivo", label: "Sesiones en vivo", icon: Video },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/comunidad", label: "Comunidad", icon: Users },
  { href: "/certificado", label: "Certificado", icon: Award },
  { href: "/soporte", label: "Soporte", icon: HelpCircle },
  { href: "/mi-perfil", label: "Mi perfil", icon: User },
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

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      router.push("/inicio");
      router.refresh();
    }
  };

  return (
    <aside
      className="w-64 min-h-screen flex flex-col text-[18px] sidebar-elevation"
      aria-label="Navegación principal"
    >
      <div className="px-4 pt-6 pb-5 border-b border-[var(--canvas-sidebar-border)] flex items-center justify-center sm:justify-start">
        <Link
          href="/inicio"
          className="flex items-center gap-2 text-[var(--ink)] font-semibold text-lg no-underline hover:text-[var(--ink)]"
          aria-label="Precisar - Inicio"
        >
          <Image
            src="/logo-precisar.png"
            alt="Precisar"
            width={180}
            height={48}
            className="h-12 w-auto max-w-[180px] object-contain object-left"
            priority
          />
        </Link>
      </div>

      <nav className="px-3 py-6 flex flex-col gap-2 flex-1" role="navigation" aria-label="Menú principal">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/inicio" && pathname.startsWith(item.href));
          return (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive}
            />
          );
        })}
        {(role === "admin" || role === "mentor") && (
          <>
            <div className="my-3 border-t border-[var(--canvas-sidebar-border)]" />
            <SidebarNavItem href="/admin" label="Admin" icon={LayoutDashboard} />
            <SidebarNavItem href="/admin/cursos" label="Cursos (admin)" icon={BookOpen} />
            {role === "admin" && (
              <SidebarNavItem href="/admin/cohortes" label="Cohortes e invitaciones" icon={Users} />
            )}
            <SidebarNavItem href="/panel/contenido" label="Panel de contenido" icon={LayoutDashboard} />
            <SidebarNavItem href="/panel/comunicacion" label="Centro de Comunicación" icon={MessageSquare} />
          </>
        )}
      </nav>

      <div className="p-4 pt-4 border-t border-[var(--canvas-sidebar-border)]">
        <SidebarProfileCard user={user} onSignOut={handleSignOut} />
      </div>
    </aside>
  );
}
