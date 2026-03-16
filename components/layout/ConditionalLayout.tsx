"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";
import { AdminShell } from "@/components/admin/AdminShell";

const STANDALONE_PATHS = ["/login", "/registro", "/no-inscrito", "/inicio", "/mi-perfil", "/pendientes", "/portafolio", "/conocimiento", "/retos", "/privacidad", "/laboratorio/escape"];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = pathname ? STANDALONE_PATHS.includes(pathname) : false;
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (standalone) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (isAdmin) {
    return <AdminShell>{children}</AdminShell>;
  }

  return <AppShell>{children}</AppShell>;
}
