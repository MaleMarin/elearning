"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";

const STANDALONE_PATHS = ["/login", "/no-inscrito"];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = pathname ? STANDALONE_PATHS.includes(pathname) : false;

  if (standalone) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 relative z-10">{children}</main>
      <RightPanel />
    </div>
  );
}
