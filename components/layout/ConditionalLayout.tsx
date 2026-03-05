"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";

const STANDALONE_PATHS = ["/login", "/registro", "/no-inscrito"];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = pathname ? STANDALONE_PATHS.includes(pathname) : false;

  if (standalone) {
    return <div className="min-h-screen">{children}</div>;
  }

  return <AppShell>{children}</AppShell>;
}
